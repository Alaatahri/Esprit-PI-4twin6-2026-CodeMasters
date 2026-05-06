import { connect } from 'mongoose';

const productPhotos: Record<string, string> = {
  'ciment': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&h=900&q=80',
  'brique': 'https://images.unsplash.com/photo-1585257032906-8b2ab3b54439?auto=format&fit=crop&w=1200&h=900&q=80',
  'acier': 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=1200&h=900&q=80',
  'treillis': 'https://images.unsplash.com/photo-1511216113906-8f57bb83b73a?auto=format&fit=crop&w=1200&h=900&q=80',
  'sable': 'https://images.unsplash.com/photo-1501198642738-a5afbc70c634?auto=format&fit=crop&w=1200&h=900&q=80',
  'gravier': 'https://images.unsplash.com/photo-1518174548483-e020295eb13f?auto=format&fit=crop&w=1200&h=900&q=80',
  'carrelage': 'https://images.unsplash.com/photo-1505303681467-93cff120f2b3?auto=format&fit=crop&w=1200&h=900&q=80',
  'peinture': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&h=900&q=80',
  'tuyau': 'https://images.unsplash.com/photo-1521207869611-37d363297ee4?auto=format&fit=crop&w=1200&h=900&q=80',
  'mortier': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&h=900&q=80',
  'plaque': 'https://images.unsplash.com/photo-1601597110547-78516f198ce4?auto=format&fit=crop&w=1200&h=900&q=80',
  'isolant': 'https://images.unsplash.com/photo-1605810757754-52dcb8077553?auto=format&fit=crop&w=1200&h=900&q=80',
  'tôle': 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&h=900&q=80',
};

const maleAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
];

const femaleAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
];

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
      await db.connection.collection('produits').updateOne(
        { _id: p._id },
        { $set: { image_url: matchedUrl } }
      );
      console.log(`Updated product: ${p.nom}`);
    } else {
      // Fallback construction image
      await db.connection.collection('produits').updateOne(
        { _id: p._id },
        { $set: { image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&h=900&q=80' } }
      );
    }
  }

  // 2. UPDATE PROFILES
  const users = await db.connection.collection('users').find({}).toArray();
  let mIndex = 0;
  let fIndex = 0;

  for (const u of users) {
    const nameStr = (u.nom + ' ' + (u.prenom || '')).toLowerCase();
    const isFemale = nameStr.includes('sara') || nameStr.includes('leila') || nameStr.includes('fatma') || nameStr.includes('ines') || nameStr.includes('mariem') || nameStr.includes('nour');
    
    let avatarUrl = '';
    if (isFemale) {
      avatarUrl = femaleAvatars[fIndex % femaleAvatars.length];
      fIndex++;
    } else {
      avatarUrl = maleAvatars[mIndex % maleAvatars.length];
      mIndex++;
    }

    await db.connection.collection('users').updateOne(
      { _id: u._id },
      { $set: { avatarUrl: avatarUrl } }
    );
    console.log(`Updated user avatar: ${u.nom} (${isFemale ? 'F' : 'M'}) -> ${avatarUrl}`);
  }

  console.log('HQ Photos updated successfully!');
  process.exit(0);
}

run().catch(console.error);
