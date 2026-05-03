import React, { useState, useEffect } from 'react';
import { adminMarketplaceService, Product, Order, Review, Stats } from '../services/adminMarketplaceService';
import './AdminMarketplace.css';

const AdminMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productForm, setProductForm] = useState({ 
    nom: '', description: '', prix: 0, stock: 0, categorie: '' 
  });

  useEffect(() => { loadAllData(); }, []);

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
    } catch (error) { console.error('Erreur:', error); }
    finally { setLoading(false); }
  };

  const handleSaveProduct = async () => {
    if (!productForm.nom || !productForm.description) { alert('Veuillez remplir tous les champs'); return; }
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
    } catch (error) { alert('Erreur lors de la sauvegarde'); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) { await adminMarketplaceService.deleteProduct(id); await loadAllData(); }
  };

  const handleUpdateOrderStatus = async (id: string, statut: string) => {
    await adminMarketplaceService.updateOrderStatus(id, statut);
    await loadAllData();
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Supprimer cet avis ?')) { await adminMarketplaceService.deleteReview(id); await loadAllData(); }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Livrée': return '#10b981';
      case 'En livraison': return '#f59e0b';
      case 'En préparation': return '#3b82f6';
      case 'Payée': return '#8b5cf6';
      case 'Annulée': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-marketplace">
      <h1>Administration Marketplace</h1>

      {/* Statistiques */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Commandes</h3>
            <div className="stat-number">{stats.totalCommandes}</div>
          </div>
          <div className="stat-card">
            <h3>Produits</h3>
            <div className="stat-number">{stats.totalProduits}</div>
          </div>
          <div className="stat-card">
            <h3>Avis</h3>
            <div className="stat-number">{stats.totalAvis}</div>
          </div>
          <div className="stat-card">
            <h3>Chiffre d'affaires</h3>
            <div className="stat-number ca">{stats.chiffreAffaires.toLocaleString()} TND</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Produits</button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Commandes</button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Avis</button>
      </div>

      {/* Onglet Produits */}
      {activeTab === 'products' && (
        <div>
          <div className="section-header">
            <h2>Liste des produits</h2>
            <button className="btn-primary" onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ nom: '', description: '', prix: 0, stock: 0, categorie: '' }); }}>+ Ajouter un produit</button>
          </div>

          {showProductForm && (
            <div className="product-form">
              <h3>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</h3>
              <div className="form-group">
                <input type="text" placeholder="Nom" value={productForm.nom} onChange={(e) => setProductForm({ ...productForm, nom: e.target.value })} />
                <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} />
                <div className="form-row">
                  <input type="number" placeholder="Prix (TND)" value={productForm.prix} onChange={(e) => setProductForm({ ...productForm, prix: parseFloat(e.target.value) })} />
                  <input type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })} />
                  <input type="text" placeholder="Catégorie" value={productForm.categorie} onChange={(e) => setProductForm({ ...productForm, categorie: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => setShowProductForm(false)}>Annuler</button>
                  <button className="btn-success" onClick={handleSaveProduct}>Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          <div className="data-table">
            <table>
              <thead>
                <tr><th>Nom</th><th>Prix</th><th>Stock</th><th>Catégorie</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.nom}</td>
                    <td>{p.prix} TND</td>
                    <td>{p.stock}</td>
                    <td>{p.categorie}</td>
                    <td>
                      <button className="btn-warning" onClick={() => { setEditingProduct(p); setProductForm(p); setShowProductForm(true); }}>Modifier</button>
                      <button className="btn-danger" onClick={() => handleDeleteProduct(p._id)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet Commandes */}
      {activeTab === 'orders' && (
        <div>
          <div className="section-header">
            <h2>Liste des commandes</h2>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>ID</th><th>Date</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>#{o._id.slice(-8)}</td>
                    <td>{new Date(o.date_commande).toLocaleDateString()}</td>
                    <td>{o.montant_total.toLocaleString()} TND</td>
                    <td>
                      <select className="status-select" value={o.statut} onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)} style={{ borderColor: getStatusColor(o.statut), color: getStatusColor(o.statut), background: `${getStatusColor(o.statut)}10` }}>
                        <option>En attente</option><option>Payée</option><option>En préparation</option><option>En livraison</option><option>Livrée</option><option>Annulée</option>
                      </select>
                    </td>
                    <td><button className="btn-info" onClick={() => setSelectedOrder(o)}>Détails</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet Avis */}
      {activeTab === 'reviews' && (
        <div>
          <div className="section-header">
            <h2>Liste des avis</h2>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Client</th><th>Type</th><th>Note</th><th>Commentaire</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id}>
                    <td>{r.clientId.slice(-8)}</td>
                    <td><span className="status-badge">{r.type}</span></td>
                    <td className="review-stars">{'⭐'.repeat(r.note)}{'☆'.repeat(5 - r.note)}</td>
                    <td>{r.commentaire?.substring(0, 100)}...</td>
                    <td>{new Date(r.date_avis).toLocaleDateString()}</td>
                    <td><button className="btn-danger" onClick={() => handleDeleteReview(r._id)}>Supprimer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Détails Commande */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Détails commande #{selectedOrder._id.slice(-8)}</h2>
            <p><strong>Date:</strong> {new Date(selectedOrder.date_commande).toLocaleString()}</p>
            <p><strong>Total:</strong> {selectedOrder.montant_total.toLocaleString()} TND</p>
            <p><strong>Statut:</strong> {selectedOrder.statut}</p>
            <h3>Articles:</h3>
            <table className="modal-table">
              <thead><tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Total</th></tr></thead>
              <tbody>
                {selectedOrder.items.map(item => (
                  <tr key={item._id}><td>{item.produitNom}</td><td>{item.quantite}</td><td>{item.prix} TND</td><td>{item.quantite * item.prix} TND</td></tr>
                ))}
              </tbody>
            </table>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setSelectedOrder(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketplace;