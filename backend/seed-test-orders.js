const { MongoClient, ObjectId } = require('mongodb');

async function seedTestOrders() {
  const uri = "mongodb://127.0.0.1:27017/bmp-database"; 
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("bmp-database");
    
    const clientId = new ObjectId("69e78200aca20c125616b2b1");
    const driverId = new ObjectId("69f14c4fc4726085041cded9");

    const vehiclesColl = db.collection("vehicles");
    const produitsColl = db.collection("produits");
    const commandesColl = db.collection("commandes");
    const commandeItemsColl = db.collection("commande_items");
    const livraisonsColl = db.collection("livraisons");

    // 1. S'assurer que le livreur a un véhicule
    let vehicle = await vehiclesColl.findOne({ userId: driverId.toString() });
    if (!vehicle) {
      await vehiclesColl.insertOne({
        nom: "Camion Benne 20t",
        type: "camion_remorque",
        capacite_tonnes: 20,
        prix_km: 2.5,
        prix_base: 50,
        disponible: true,
        chauffeur: "rezgui livreur",
        immatriculation: "TN-999-LIV",
        userId: driverId.toString(),
        position_actuelle: { lat: 36.8065, lng: 10.1815 }
      });
      console.log("Véhicule créé pour le livreur test");
    }

    // 2. Trouver ou créer un produit
    let product = await produitsColl.findOne({});
    if (!product) {
      const pRes = await produitsColl.insertOne({
        nom: "Ciment Haute Qualité",
        description: "Ciment pour structures porteuses",
        prix: 15.5,
        stock: 500,
        categorie: "Gros Oeuvre",
        vendeurId: clientId,
        emplacement: {
          ville: "Tunis",
          adresse: "Zone Industrielle Megrine",
          lat: 36.77,
          lng: 10.22
        },
        poids_kg: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      product = { _id: pRes.insertedId, prix: 15.5 };
      console.log("Produit de test créé");
    }

    const testOrders = [
      {
        titre: "Livraison de Ciment - Chantier Carthage",
        adresse: "Avenue de l'Indépendance, Carthage, Tunis",
        items: [{ productId: product._id, quantite: 50, prix: product.prix }]
      },
      {
        titre: "Livraison de Briques - Chantier Marsa",
        adresse: "Rue du Stade, La Marsa, Tunis",
        items: [{ productId: product._id, quantite: 100, prix: product.prix }]
      },
      {
        titre: "Livraison de Sable - Chantier Ennasr",
        adresse: "Avenue Hedi Nouira, Ennasr 2, Tunis",
        items: [{ productId: product._id, quantite: 20, prix: product.prix }]
      }
    ];

    for (const order of testOrders) {
      const total = order.items.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
      
      const cmdResult = await commandesColl.insertOne({
        clientId: clientId,
        date: new Date(),
        statut: "En préparation",
        total: total,
        paymentStatus: "paid",
        adresseLivraison: order.adresse,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const commandeId = cmdResult.insertedId;

      await commandeItemsColl.insertMany(order.items.map(item => ({
        commandeId: commandeId,
        productId: item.productId,
        quantite: item.quantite,
        prixUnitaire: item.prix,
        total: item.prix * item.quantite
      })));

      await livraisonsColl.insertOne({
        commandeId: commandeId,
        statut: "En préparation",
        adresse_livraison: order.adresse,
        coordonnees: { lat: 36.8 + Math.random() * 0.05, lng: 10.1 + Math.random() * 0.05 },
        historique_position: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Commande créée: ${order.titre} (${commandeId})`);
    }

    console.log("Seeding des commandes de test terminé !");
  } finally {
    await client.close();
  }
}

seedTestOrders();
