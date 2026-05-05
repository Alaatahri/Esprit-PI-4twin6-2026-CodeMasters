import React, { useState, useEffect } from 'react';
import { adminMarketplaceService, Product, Order, Review, Stats } from '../services/adminMarketplaceService';

const AdminMarketplaceSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ nom: '', description: '', prix: 0, stock: 0, categorie: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, reviewsData, statsData] = await Promise.all([
        adminMarketplaceService.getProducts(),
        adminMarketplaceService.getOrders(),
        adminMarketplaceService.getAllReviews(),
        adminMarketplaceService.getStats(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await adminMarketplaceService.updateProduct(editingProduct._id, productForm);
      } else {
        await adminMarketplaceService.createProduct({ ...productForm, vendeurId: 'admin' });
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ nom: '', description: '', prix: 0, stock: 0, categorie: '' });
      await loadAllData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      await adminMarketplaceService.deleteProduct(id);
      await loadAllData();
    }
  };

  const handleUpdateOrderStatus = async (id: string, statut: string) => {
    await adminMarketplaceService.updateOrderStatus(id, statut);
    await loadAllData();
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Supprimer cet avis ?')) {
      await adminMarketplaceService.deleteReview(id);
      await loadAllData();
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Administration Marketplace</h1>

      {/* Statistiques */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Commandes</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalCommandes}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Produits</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalProduits}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Avis</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAvis}</p>
          </div>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Chiffre d'affaires</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.chiffreAffaires.toLocaleString()} TND</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button onClick={() => setActiveTab('products')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === 'products' ? '#667eea' : 'transparent', color: activeTab === 'products' ? 'white' : '#64748b', borderRadius: '8px 8px 0 0', cursor: 'pointer' }}>
          Produits
        </button>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === 'orders' ? '#667eea' : 'transparent', color: activeTab === 'orders' ? 'white' : '#64748b', borderRadius: '8px 8px 0 0', cursor: 'pointer' }}>
          Commandes
        </button>
        <button onClick={() => setActiveTab('reviews')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: activeTab === 'reviews' ? '#667eea' : 'transparent', color: activeTab === 'reviews' ? 'white' : '#64748b', borderRadius: '8px 8px 0 0', cursor: 'pointer' }}>
          Avis
        </button>
      </div>

      {/* Produits */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Liste des produits</h2>
            <button onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ nom: '', description: '', prix: 0, stock: 0, categorie: '' }); }} style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              + Ajouter un produit
            </button>
          </div>

          {showProductForm && (
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <h3>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</h3>
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="text" placeholder="Nom" value={productForm.nom} onChange={(e) => setProductForm({ ...productForm, nom: e.target.value })} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} rows={2} />
                <input type="number" placeholder="Prix" value={productForm.prix} onChange={(e) => setProductForm({ ...productForm, prix: parseFloat(e.target.value) })} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="text" placeholder="Catégorie" value={productForm.categorie} onChange={(e) => setProductForm({ ...productForm, categorie: e.target.value })} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowProductForm(false)} style={{ padding: '0.5rem 1rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                  <button onClick={handleSaveProduct} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nom</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Prix</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Stock</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Catégorie</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>{p.nom}</td>
                  <td style={{ padding: '0.75rem' }}>{p.prix} TND</td>
                  <td style={{ padding: '0.75rem' }}>{p.stock}</td>
                  <td style={{ padding: '0.75rem' }}>{p.categorie}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => { setEditingProduct(p); setProductForm(p); setShowProductForm(true); }} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Modifier</button>
                    <button onClick={() => handleDeleteProduct(p._id)} style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Commandes */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Liste des commandes</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>#{o._id.slice(-8)}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(o.date_commande).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>{o.montant_total.toLocaleString()} TND</td>
                  <td style={{ padding: '0.75rem' }}>
                    <select value={o.statut} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)} style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option>En attente</option>
                      <option>Payée</option>
                      <option>En préparation</option>
                      <option>En livraison</option>
                      <option>Livrée</option>
                      <option>Annulée</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => alert(JSON.stringify(o.items, null, 2))} style={{ padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Avis */}
      {activeTab === 'reviews' && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Liste des avis</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Client</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Note</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Commentaire</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem' }}>{r.clientId.slice(-8)}</td>
                  <td style={{ padding: '0.75rem' }}>{r.type}</td>
                  <td style={{ padding: '0.75rem' }}>{r.note}/5</td>
                  <td style={{ padding: '0.75rem', maxWidth: '300px' }}>{r.commentaire?.substring(0, 100)}...</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(r.date_avis).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleDeleteReview(r._id)} style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMarketplaceSimple;