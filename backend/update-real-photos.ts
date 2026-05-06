import { connect } from 'mongoose';

// Map of product keywords to their exact image URLs
const productPhotos: Record<string, string> = {
  'ciment portland cpj45': '/uploads/ciment_1778035522629.png',
  'ciment portland cpj 42.5': '/uploads/ciment_1778035522629.png',
  'briques rouges 20x10x5': '/uploads/briques_1778035536280.png',
  'briques rouges — palette': '/uploads/briques_1778035536280.png',
  'acier': '/uploads/acier_1778035631533.png',
  'sable': '/uploads/sable_1778035745329.png',
  'gravier': '/uploads/gravier_1778035957660.png',
  'carrelage': 'https://loremflickr.com/1200/900/ceramic,tiles,floor/all',
  'peinture': 'https://loremflickr.com/1200/900/white,paint,bucket/all',
  'tuyau': 'https://loremflickr.com/1200/900/pvc,pipes/all',
  'mortier': 'https://loremflickr.com/1200/900/cement,mortar,bag/all',
  'plaque': 'https://loremflickr.com/1200/900/drywall,gypsum/all',
  'isolant': 'https://loremflickr.com/1200/900/fiberglass,insulation,roll/all',
  'tôle': 'https://loremflickr.com/1200/900/corrugated,steel,roof/all',
  'treillis': 'https://loremflickr.com/1200/900/steel,mesh,wire/all'
};

async function run() {
  console.log('Connecting to DB...');
  const db = await connect('mongodb://localhost:27017/bmp-tn');
  
  // 1. UPDATE PRODUCTS
  const products = await db.connection.collection('produits').find({}).toArray();
  for (const p of products) {
    const nom = p.nom.toLowerCase();
    let matchedUrl = null;
    
    for (const [key, url] of Object.entries(productPhotos)) {
      if (nom.includes(key)) {
        matchedUrl = url;
        break;
      }
    }
    
    if (matchedUrl) {
      // Append a timestamp to loremflickr URLs to bypass browser cache
      if (matchedUrl.includes('loremflickr')) {
         matchedUrl += '?lock=' + Math.floor(Math.random() * 10000);
      }
      await db.connection.collection('produits').updateOne(
        { _id: p._id },
        { $set: { image_url: matchedUrl } }
      );
      console.log(`Updated product: ${p.nom} -> ${matchedUrl}`);
    } else {
      console.log(`Skipped product: ${p.nom}`);
    }
  }

  console.log('Real Photos updated successfully!');
  process.exit(0);
}

run().catch(console.error);
