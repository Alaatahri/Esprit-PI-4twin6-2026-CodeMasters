import { marketplaceAPI } from './marketplace-api';

export interface Driver {
  _id: string;
  nom: string;
  telephone: string;
  note: number;
  vehicule: {
    type: string;
    capacite_tonnes: number;
    immatriculation: string;
  };
  position_actuelle: { lat: number; lng: number };
  distance_km: number;
  prix_livraison: number;
  temps_arrivee_min: number;
  disponible: boolean;
  photo?: string;
  nombre_courses: number;
  prix_par_km: number;
}

class DeliveryService {
  // Prix par km pour chaque type de véhicule
  private readonly PRIX_PAR_KM: Record<string, number> = {
    "Utilitaire": 2.0,
    "Camion Benne": 2.5,
    "Camion Toupie": 2.2,
    "Camion Plateau": 2.3,
    "Camion Remorque": 2.8,
    "Fourgonnette": 1.8,
    "Semi-remorque": 3.0
  };

  async getNearbyDrivers(
    pickupLat: number, 
    pickupLng: number, 
    dropoffLat: number, 
    dropoffLng: number,
    poidsTotal: number
  ): Promise<Driver[]> {
    try {
      // Récupérer les vrais véhicules de la base de données
      const realVehicles = await marketplaceAPI.getVehicles();
      
      const totalDistance = this.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
      
      const drivers: Driver[] = realVehicles.map((v: any) => ({
        _id: v._id,
        nom: v.chauffeur || "Chauffeur",
        telephone: v.telephone || "+216 00 000 000",
        note: v.note_moyenne || 4.5,
        vehicule: {
          type: v.type,
          capacite_tonnes: (v.capacite_kg || 1500) / 1000,
          immatriculation: v.immatriculation
        },
        position_actuelle: v.position || { lat: pickupLat, lng: pickupLng },
        distance_km: 0,
        prix_livraison: 0,
        temps_arrivee_min: 0,
        disponible: v.disponible,
        nombre_courses: v.nombre_courses || 10,
        prix_par_km: this.PRIX_PAR_KM[v.type] || 2.0
      }));

      // Calculer les distances et prix pour chaque véhicule réel
      for (const driver of drivers) {
        const distanceToPickup = this.calculateDistance(
          driver.position_actuelle.lat,
          driver.position_actuelle.lng,
          pickupLat,
          pickupLng
        );
        
        const totalDist = distanceToPickup + totalDistance;
        driver.distance_km = parseFloat(totalDist.toFixed(1));
        
        // Prix = prix au km × distance totale
        driver.prix_livraison = Math.round(driver.prix_par_km * totalDist);
        
        // Temps estimé
        driver.temps_arrivee_min = Math.round(distanceToPickup * 2) + 5;
        
        // Vérifier capacité
        if (poidsTotal > (driver.vehicule.capacite_tonnes * 1000)) {
          driver.disponible = false;
        }
      }

      // Trier par prix
      drivers.sort((a, b) => a.prix_livraison - b.prix_livraison);
      
      // Si on n'a pas de véhicules réels, on utilise des fallbacks (avec des IDs Mongo valides)
      if (drivers.length === 0) {
        return this.getMockDrivers(pickupLat, pickupLng, totalDistance, poidsTotal);
      }

      return drivers;
    } catch (error) {
      console.error('Erreur getNearbyDrivers:', error);
      const totalDistance = this.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
      return this.getMockDrivers(pickupLat, pickupLng, totalDistance, poidsTotal);
    }
  }

  private getMockDrivers(pickupLat: number, pickupLng: number, totalDistance: number, poidsTotal: number): Driver[] {
    // Générer des IDs Mongo valides pour les mocks au cas où la DB est vide
    const mockIds = [
      "69f14308b3428a97bbb641d1",
      "69f14308b3428a97bbb641d2",
      "69f14308b3428a97bbb641d3"
    ];

    return mockIds.map((id, index) => {
      const type = ["Utilitaire", "Camion Plateau", "Fourgonnette"][index];
      const prix_km = this.PRIX_PAR_KM[type];
      const dist = totalDistance + 2;
      return {
        _id: id,
        nom: ["Ahmed", "Sami", "Karim"][index],
        telephone: "+216 99 000 000",
        note: 4.5 + index * 0.1,
        vehicule: {
          type: type,
          capacite_tonnes: [3.5, 15, 1.5][index],
          immatriculation: `TN-${100 + index}-ABC`
        },
        position_actuelle: { lat: pickupLat, lng: pickupLng },
        distance_km: parseFloat(dist.toFixed(1)),
        prix_livraison: Math.round(prix_km * dist),
        temps_arrivee_min: 15,
        disponible: true,
        nombre_courses: 50,
        prix_par_km: prix_km
      };
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const deliveryService = new DeliveryService();