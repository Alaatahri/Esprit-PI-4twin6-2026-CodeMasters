import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produit, ProduitDocument } from '../schemas/produit.schema';

@Injectable()
export class AIEstimationService {
  constructor(
    @InjectModel(Produit.name) private produitModel: Model<ProduitDocument>,
  ) {}

  // Règles de correspondance besoin -> produits
  private readonly besoinsProduits: Record<string, Array<{ produit: string; quantiteParUnite: number; condition: string }>> = {
    'mur': [
      { produit: 'brique', quantiteParUnite: 50, condition: 'par m²' },
      { produit: 'ciment', quantiteParUnite: 25, condition: 'par m²' },
      { produit: 'sable', quantiteParUnite: 0.05, condition: 'par m² (m³)' },
    ],
    'chape': [
      { produit: 'ciment', quantiteParUnite: 15, condition: 'par m²' },
      { produit: 'sable', quantiteParUnite: 0.03, condition: 'par m² (m³)' },
    ],
    'fondation': [
      { produit: 'ciment', quantiteParUnite: 35, condition: 'par m³' },
      { produit: 'gravier', quantiteParUnite: 0.8, condition: 'par m³' },
      { produit: 'fer_a_beton', quantiteParUnite: 80, condition: 'par m³ (kg)' },
    ],
    'toiture': [
      { produit: 'toles', quantiteParUnite: 1.1, condition: 'par m²' },
      { produit: 'chevrons', quantiteParUnite: 10, condition: 'par m² (m)' },
    ],
    'carrelage': [
      { produit: 'carrelage', quantiteParUnite: 1.05, condition: 'par m²' },
      { produit: 'colle_carrelage', quantiteParUnite: 4, condition: 'par m² (kg)' },
    ],
    'peinture': [
      { produit: 'peinture', quantiteParUnite: 0.2, condition: 'par m² (L)' },
      { produit: 'diluant', quantiteParUnite: 0.05, condition: 'par m² (L)' },
    ],
    'plomberie': [
      { produit: 'tuyau_pvc', quantiteParUnite: 5, condition: 'par pièce (m)' },
      { produit: 'raccord', quantiteParUnite: 8, condition: 'par pièce' },
    ],
    'electricite': [
      { produit: 'cable_electrique', quantiteParUnite: 15, condition: 'par pièce (m)' },
      { produit: 'prise', quantiteParUnite: 3, condition: 'par pièce' },
      { produit: 'interrupteur', quantiteParUnite: 2, condition: 'par pièce' },
    ],
  };

  // Prix unitaires par défaut (si produit non trouvé)
  private readonly prixParDefaut: Record<string, number> = {
    'ciment': 12.5,
    'brique': 0.85,
    'toles': 25,
    'peinture': 45,
    'carrelage': 42,
    'sable': 35,
    'gravier': 40,
    'fer_a_beton': 1.2,
    'colle_carrelage': 15,
    'diluant': 10,
    'tuyau_pvc': 8,
    'raccord': 2,
    'cable_electrique': 3,
    'prise': 5,
    'interrupteur': 4,
    'chevrons': 12,
  };

  async analyserBesoin(description: string, surface?: number, typeProjet?: string): Promise<any> {
    const motsCles = description.toLowerCase();
    const produitsIdentifies: Set<string> = new Set();
    const quantites: Record<string, number> = {};

    // Identifier les besoins
    for (const [besoin, produits] of Object.entries(this.besoinsProduits)) {
      if (motsCles.includes(besoin)) {
        for (const p of produits) {
          produitsIdentifies.add(p.produit);
          const unite = surface || 100; // Surface par défaut
          quantites[p.produit] = (quantites[p.produit] || 0) + p.quantiteParUnite * (unite / 10);
        }
      }
    }

    // Si type de projet spécifié
    if (typeProjet) {
      const projetMapping: Record<string, string[]> = {
        'construction': ['fondation', 'mur', 'toiture', 'electricite', 'plomberie'],
        'renovation': ['mur', 'carrelage', 'peinture', 'electricite'],
        'terrassement': ['fondation'],
        'finition': ['carrelage', 'peinture', 'plomberie', 'electricite']
      };
      
      const besoinsProjet = projetMapping[typeProjet] || [];
      for (const besoin of besoinsProjet) {
        const produits = this.besoinsProduits[besoin];
        if (produits) {
          for (const p of produits) {
            produitsIdentifies.add(p.produit);
            const unite = surface || 100;
            quantites[p.produit] = (quantites[p.produit] || 0) + p.quantiteParUnite * (unite / 10);
          }
        }
      }
    }

    // Récupérer les produits de la base
    const produitsRecommandes = [];
    let prixTotal = 0;

    for (const nomProduit of produitsIdentifies) {
      const produit = await this.produitModel.findOne({ 
        nom: { $regex: nomProduit, $options: 'i' } 
      }).exec();

      const quantite = Math.ceil(quantites[nomProduit] || 10);
      const prixUnitaire = produit?.prix || this.prixParDefaut[nomProduit] || 30;
      const prix = quantite * prixUnitaire;

      produitsRecommandes.push({
        produitId: produit?._id || null,
        nom: produit?.nom || nomProduit,
        quantite: quantite,
        prix_unitaire: prixUnitaire,
        prix_total: prix,
        description: `Recommandé pour votre projet`
      });
      
      prixTotal += prix;
    }

    return {
      produits_recommandes: produitsRecommandes,
      estimation: {
        prix_total: prixTotal,
        produits: produitsRecommandes,
        main_oeuvre: prixTotal * 0.3,
        frais_livraison: 50,
      },
      surface_estimee: surface || 100,
    };
  }

  async analyserImage(imageBase64: string): Promise<any> {
    // Simulation d'analyse d'image
    // Dans une vraie implémentation, utilisez une API comme Google Vision, Azure Computer Vision
    
    console.log('Analyse d\'image reçue (longueur:', imageBase64.length, 'caractères)');
    
    // Simulation de détection
    const detectionSimulee = {
      type_chantier: 'construction',
      surface_estimee: 120,
      elements_detectes: ['mur', 'fondation', 'toiture'],
      recommandations: [
        { produit: 'Ciment Portland', quantite: 120, confiance: 0.95 },
        { produit: 'Briques', quantite: 2500, confiance: 0.92 },
        { produit: 'Tôles galvanisées', quantite: 130, confiance: 0.88 }
      ]
    };

    // Rechercher les produits recommandés
    const produitsRecommandes = [];
    let prixTotal = 0;

    for (const rec of detectionSimulee.recommandations) {
      const produit = await this.produitModel.findOne({ 
        nom: { $regex: rec.produit.split(' ')[0], $options: 'i' } 
      }).exec();

      const quantite = rec.quantite;
      const prixUnitaire = produit?.prix || 30;
      const prix = quantite * prixUnitaire;

      produitsRecommandes.push({
        produitId: produit?._id || null,
        nom: produit?.nom || rec.produit,
        quantite: quantite,
        prix_unitaire: prixUnitaire,
        prix_total: prix,
        confiance: rec.confiance,
      });
      
      prixTotal += prix;
    }

    return {
      type_chantier: detectionSimulee.type_chantier,
      surface_estimee: detectionSimulee.surface_estimee,
      produits_recommandes: produitsRecommandes,
      estimation: {
        prix_total: prixTotal,
        produits: produitsRecommandes,
        main_oeuvre: prixTotal * 0.35,
        frais_livraison: 80,
      }
    };
  }
}