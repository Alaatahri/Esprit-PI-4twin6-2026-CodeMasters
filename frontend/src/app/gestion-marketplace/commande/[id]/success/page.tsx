'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Printer, Download, QrCode, 
  Package, Truck, User, MapPin, Calendar,
  ArrowRight, Mail, Phone, Globe, Info, CreditCard
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { marketplaceAPI, Order } from '@/lib/marketplace-api';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const orderData = await marketplaceAPI.getOrder(params.id as string);
      setOrder(orderData);

      try {
        const deliveryData = await marketplaceAPI.getLivraisonByOrder(params.id as string);
        setDelivery(deliveryData);
        
        if (orderData.vehicleId) {
          const vehicleData = await marketplaceAPI.getVehicleById(orderData.vehicleId);
          setVehicle(vehicleData);
        }
      } catch (e) {
        console.warn('Livraison non trouvée pour cette commande');
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 border-t-amber-400 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Commande non trouvée</h1>
          <Link href="/gestion-marketplace" className="text-amber-400">Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  const isHalfPaid = order.mode_paiement === '50/50' || order.mode_paiement === 'half';
  const amountPaid = isHalfPaid ? order.montant_total / 2 : order.montant_total;

  const qrData = JSON.stringify({
    orderId: order._id,
    amount: order.montant_total,
    paid: amountPaid,
    status: order.statut,
    items: order.items.map(i => ({ n: i.produitNom, q: i.quantite }))
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 print:bg-white print:from-white print:to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl print:max-w-none print:p-0">
        
        {/* Header - Hidden in Print (Custom print header below) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Merci pour votre confiance !</h1>
              <p className="text-gray-400 text-sm">Commande #{order._id.substring(order._id.length - 8).toUpperCase()} confirmée</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer Facture
            </button>
            <button 
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-gray-900 font-bold hover:bg-amber-400 transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Générer Reçu
            </button>
          </div>
        </div>

        {/* FACTURE / RECEIPT CONTENT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print-section bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl print:bg-white print:border-gray-200 print:text-black print:shadow-none print:rounded-none"
        >
          {/* Print Header (Only visible when printing) */}
          <div className="hidden print:flex justify-between items-start p-8 border-b-2 border-gray-100">
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="BMP.tn Logo" className="w-16 h-16 object-contain" />
              <div>
                <div className="text-3xl font-black text-amber-500 mb-0">BMP.tn</div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Marketplace B2B Construction</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>📍 Zone Industrielle, Tunis, Tunisie</p>
              <p>📞 +216 71 000 000</p>
              <p>✉️ contact@bmp.tn</p>
              <p>🌐 www.bmp.tn</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Order Info Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-amber-400 print:text-amber-600">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Informations Client</h3>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-50 print:border-gray-200">
                  <p className="text-white print:text-black font-semibold">Client Marketplace</p>
                  <p className="text-gray-400 print:text-gray-600 text-sm mt-1">ID: {order.clientId}</p>
                </div>
              </div>

              <div className="space-y-4 text-right print:text-left">
                <div className="flex items-center gap-3 justify-end print:justify-start text-emerald-400 print:text-emerald-600">
                  <Package className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Détails Commande</h3>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-50 print:border-gray-200">
                  <p className="text-white print:text-black font-semibold">N° {order._id.toUpperCase()}</p>
                  <p className="text-gray-400 print:text-gray-600 text-sm mt-1">Date: {new Date(order.date_commande).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            {/* Table des produits */}
            <div className="overflow-hidden rounded-2xl border border-white/10 print:border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-white/10 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 print:text-gray-600 uppercase">Produit</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 print:text-gray-600 uppercase text-center">Quantité</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 print:text-gray-600 uppercase text-right">Prix Unitaire</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 print:text-gray-600 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 print:divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item._id} className="text-white print:text-black">
                      <td className="px-6 py-4">
                        <p className="font-medium">{item.produitNom || 'Produit'}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.produitId}</p>
                      </td>
                      <td className="px-6 py-4 text-center">{item.quantite}</td>
                      <td className="px-6 py-4 text-right">{item.prix.toFixed(2)} TND</td>
                      <td className="px-6 py-4 text-right font-bold text-amber-400 print:text-amber-600">
                        {(item.prix * item.quantite).toFixed(2)} TND
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux et Paiement */}
            <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t border-white/10 print:border-gray-100">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 text-blue-400 print:text-blue-600">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">État du Paiement</h3>
                </div>
                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 print:bg-blue-50 print:border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-300 print:text-blue-700">Mode de paiement:</span>
                    <span className="text-sm font-bold text-white print:text-blue-900 px-2 py-0.5 rounded-lg bg-blue-500/20">
                      {order.mode_paiement === '50/50' ? '50% Immédiat / 50% Livraison' : '100% Règlement Complet'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300 print:text-blue-700">Montant payé:</span>
                    <span className="text-lg font-black text-blue-400 print:text-blue-800">{amountPaid.toFixed(2)} TND</span>
                  </div>
                  {isHalfPaid && (
                    <div className="mt-3 pt-3 border-t border-blue-500/20 text-[10px] text-blue-400/60 flex items-center gap-1 italic">
                      <Info className="w-3 h-3" />
                      Reste à payer à la livraison: {(order.montant_total - amountPaid).toFixed(2)} TND
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-gray-400 print:text-gray-600">
                  <span>Sous-total produits</span>
                  <span>{(order.montant_total - (order.prix_livraison || 0)).toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-gray-400 print:text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Service de livraison
                  </span>
                  <span>{(order.prix_livraison || 0).toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/10 print:border-gray-200">
                  <span className="text-lg font-bold text-white print:text-black">TOTAL TTC</span>
                  <span className="text-2xl font-black text-amber-500 print:text-amber-600">{order.montant_total.toFixed(2)} TND</span>
                </div>
              </div>
            </div>

            {/* Livraison & QR Code */}
            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-400 print:text-purple-600">
                  <Truck className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Informations de Livraison</h3>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 print:bg-gray-50 print:border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-white print:text-black">{delivery?.adresse_livraison || 'Tunis, Tunisie'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-white print:text-black italic text-xs">Temps prévu: 45 - 60 minutes</span>
                  </div>
                  {vehicle && (
                    <div className="flex items-center gap-3 text-sm border-t border-white/5 pt-2 mt-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                        {vehicle.chauffeur?.substring(0, 2) || 'L'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white print:text-black">Livreur: {vehicle.chauffeur || 'Non assigné'}</p>
                        <p className="text-[10px] text-gray-500">Véhicule: {vehicle.type} ({vehicle.immatriculation})</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Section (Receipt) */}
              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-xl border border-white/10 print:border-gray-200">
                <p className="text-gray-900 font-black text-xs mb-4 uppercase tracking-tighter">Vérification QR Code / Reçu</p>
                <div className="p-3 bg-white rounded-2xl border-4 border-gray-50">
                  <QRCodeSVG 
                    value={qrData} 
                    size={160} 
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-4 text-center max-w-[200px]">
                  Scannez pour vérifier l'authenticité de ce paiement et les détails de la livraison.
                </p>
              </div>
            </div>
          </div>

          {/* Footer print note */}
          <div className="p-8 bg-black/20 print:bg-gray-50 border-t border-white/10 print:border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 print:text-gray-400">
              Cette facture est générée électroniquement par BMP.tn. <br className="print:hidden" />
              Merci pour votre achat sur la première marketplace de construction en Tunisie.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons Bottom */}
        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <Link 
            href="/gestion-marketplace"
            className="px-8 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Retour à l'accueil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>

      {/* MODAL REÇU / QR CODE */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative"
          >
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <Info className="w-5 h-5 rotate-45" />
            </button>

            <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <QrCode className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-2">Reçu de Paiement</h2>
            <p className="text-gray-500 text-sm mb-8">Scannez ce code pour vérifier votre commande</p>

            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 mb-8 flex justify-center">
              <QRCodeSVG 
                value={qrData} 
                size={200} 
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Commande</span>
                <span className="text-gray-900 font-bold">#{order._id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Montant payé</span>
                <span className="text-emerald-600 font-black">{amountPaid.toFixed(2)} TND</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl"
            >
              Imprimer le reçu
            </button>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-section, .print-section *, .modal-print, .modal-print * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .print-section table {
            border-collapse: collapse;
          }
          .print-section th, .print-section td {
            border-bottom: 1px solid #eee !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
