const { MongoClient, ObjectId } = require('mongodb');

async function seedVehicles() {
  const uri = "mongodb://127.0.0.1:27017/marketplace"; // Update with your DB name
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('marketplace');
    const vehicles = db.collection('vehicles');

    // Nettoyer les véhicules existants
    await vehicles.deleteMany({});

    const data = [
      {
        _id: new ObjectId(),
        type: "Camion Plateau",
        immatriculation: "216 TUN 1234",
        chauffeur: "Ahmed Ben Ali",
        telephone: "+216 98 123 456",
        disponible: true,
        capacite_kg: 5000,
        position: { lat: 36.8065, lng: 10.1815 },
        ville: "Tunis"
      },
      {
        _id: new ObjectId(),
        type: "Fourgonnette",
        immatriculation: "216 TUN 5678",
        chauffeur: "Sami Mansour",
        telephone: "+216 22 444 555",
        disponible: true,
        capacite_kg: 1500,
        position: { lat: 35.8256, lng: 10.6084 },
        ville: "Sousse"
      },
      {
        _id: new ObjectId(),
        type: "Semi-remorque",
        immatriculation: "216 TUN 9012",
        chauffeur: "Mohamed Dridi",
        telephone: "+216 55 777 888",
        disponible: true,
        capacite_kg: 25000,
        position: { lat: 34.7406, lng: 10.7603 },
        ville: "Sfax"
      }
    ];

    const result = await vehicles.insertMany(data);
    console.log(`${result.insertedCount} véhicules insérés avec succès.`);
    
    // Afficher un ID pour le test si besoin
    console.log("Exemple d'ID valide:", result.insertedIds[0]);

  } finally {
    await client.close();
  }
}

seedVehicles().catch(console.error);
