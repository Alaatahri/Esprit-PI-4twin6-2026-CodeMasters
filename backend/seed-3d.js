const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/bmp-tn');
  console.log('Connected to MongoDB');

  const ProduitSchema = new mongoose.Schema({
    nom: String,
    description: String,
    prix: Number,
    stock: Number,
    image_url: String,
    categorie: String,
    vendeurId: mongoose.Schema.Types.ObjectId,
    emplacement: {
      ville: String,
      adresse: String,
      lat: Number,
      lng: Number
    },
    poids_kg: Number,
    model3d_url: String
  }, { timestamps: true });

  const Produit = mongoose.model('Produit', ProduitSchema);

  const vendeurId = '69e78200aca20c125616b2b1';

  const products = [
    {
      nom: 'Ciment Portland 3D',
      description: 'Ciment de haute qualité, visualisable en 3D pour inspection détaillée.',
      prix: 15.5,
      stock: 500,
      image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
      categorie: 'Gros Oeuvre',
      vendeurId: new mongoose.Types.ObjectId(vendeurId),
      emplacement: {
        ville: 'Tunis',
        adresse: 'Port de Radès',
        lat: 36.8,
        lng: 10.3
      },
      poids_kg: 50,
      model3d_url: '/models/cement_bag.glb'
    },
    {
      nom: 'Brique Alvéolée 3D',
      description: 'Brique de construction standard avec vue 360 interactive.',
      prix: 0.95,
      stock: 10000,
      image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
      categorie: 'Gros Oeuvre',
      vendeurId: new mongoose.Types.ObjectId(vendeurId),
      emplacement: {
        ville: 'Sousse',
        adresse: 'Zone Industrielle Sousse',
        lat: 35.8,
        lng: 10.6
      },
      poids_kg: 2,
      model3d_url: '/models/bricks.glb'
    }
  ];

  for (const product of products) {
    const existing = await Produit.findOne({ nom: product.nom });
    if (existing) {
      console.log(`Product ${product.nom} already exists, updating...`);
      await Produit.updateOne({ nom: product.nom }, product);
    } else {
      console.log(`Creating product ${product.nom}...`);
      await Produit.create(product);
    }
  }

  console.log('Seeding completed');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
