const { MongoClient, ObjectId } = require('mongodb');

async function seedDrivers() {
  const uri = "mongodb://127.0.0.1:27017/bmp-database"; 
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("bmp-database");
    const usersColl = db.collection("users");
    const vehiclesColl = db.collection("vehicles");

    const drivers = [
      {
        nom: "Sami Trabelsi",
        email: "sami@bmp.tn",
        telephone: "+216 50 333 444",
        role: "livreur",
        vehicleId: "69d595fd34a7035249daf138"
      },
      {
        nom: "Nabil Gharbi",
        email: "nabil@bmp.tn",
        telephone: "+216 50 444 555",
        role: "livreur",
        vehicleId: "69d595fd34a7035249daf139"
      },
      {
        nom: "Hichem Mansouri",
        email: "hichem@bmp.tn",
        telephone: "+216 50 555 666",
        role: "livreur",
        vehicleId: "69d595fd34a7035249daf13a"
      },
      {
        nom: "Walid Khelifi",
        email: "walid@bmp.tn",
        telephone: "+216 50 666 777",
        role: "livreur",
        vehicleId: "69d595fd34a7035249daf13b"
      },
      {
        nom: "Foued Jendoubi",
        email: "foued@bmp.tn",
        telephone: "+216 50 777 888",
        role: "livreur",
        vehicleId: "69d595fd34a7035249daf13c"
      }
    ];

    const defaultPassword = "livreur123";

    for (const d of drivers) {
      // 1. Créer ou mettre à jour l'utilisateur
      const existingUser = await usersColl.findOne({ email: d.email });
      let userId;
      
      if (!existingUser) {
        const result = await usersColl.insertOne({
          nom: d.nom,
          email: d.email,
          telephone: d.telephone,
          role: "livreur",
          mot_de_passe: defaultPassword, // Utilisation du texte brut car c'est ce que le backend attend actuellement
          createdAt: new Date(),
          updatedAt: new Date()
        });
        userId = result.insertedId;
        console.log(`Utilisateur créé: ${d.nom} (${userId})`);
      } else {
        userId = existingUser._id;
        await usersColl.updateOne({ _id: userId }, { $set: { role: "livreur" } });
        console.log(`Utilisateur mis à jour: ${d.nom}`);
      }

      // 2. Mettre à jour le véhicule avec l'userId
      try {
        const vId = new ObjectId(d.vehicleId);
        await vehiclesColl.updateOne(
          { _id: vId },
          { 
            $set: { 
              userId: userId.toString(),
              chauffeur_nom: d.nom,
              chauffeur_telephone: d.telephone
            } 
          }
        );
        console.log(`Véhicule ${d.vehicleId} lié à ${d.nom}`);
      } catch (e) {
        console.error(`Erreur lien véhicule ${d.vehicleId}: ${e.message}`);
      }
    }

    console.log("Seeding des livreurs terminé !");
  } finally {
    await client.close();
  }
}

seedDrivers();
