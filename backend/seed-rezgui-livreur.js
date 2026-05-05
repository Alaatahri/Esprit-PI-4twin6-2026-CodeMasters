const { MongoClient, ObjectId } = require('mongodb');

async function seedRezguiVehicle() {
  const uri = "mongodb://localhost:27017/bmp-tn";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('bmp-tn');
    const vehicles = db.collection('vehicles');

    const rezguiVehicle = {
      nom: "Camion Benne de Rezgui",
      type: "camion_benne",
      capacite_tonnes: 15,
      prix_km: 2.5,
      prix_base: 50,
      position_actuelle: { lat: 36.8065, lng: 10.1815 },
      disponible: true,
      userId: "69f14c4fc4726085041cded9",
      chauffeur_nom: "rezgui livreur",
      chauffeur_telephone: "+21693505604",
      immatriculation: "216 TUN 8282",
      note_moyenne: 4.8,
      nombre_courses: 0,
      statut_disponible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Vérifier si un véhicule existe déjà pour cet utilisateur
    const existing = await vehicles.findOne({ userId: "69f14c4fc4726085041cded9" });
    if (existing) {
      await vehicles.updateOne(
        { _id: existing._id },
        { $set: rezguiVehicle }
      );
      console.log("Véhicule mis à jour pour Rezgui.");
    } else {
      await vehicles.insertOne(rezguiVehicle);
      console.log("Nouveau véhicule inséré pour Rezgui.");
    }

  } finally {
    await client.close();
  }
}

seedRezguiVehicle().catch(console.error);
