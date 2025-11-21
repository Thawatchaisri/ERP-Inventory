import React, { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Edit2, AlertTriangle, X } from 'lucide-react';
import { Product, ProductStatus } from '../types';
import * as api from '../services/mockDb';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  // Selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Error Handling
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ sku: '', name: '', category: '', price: 0, cost: 0, stock: 0 });
  const [adjustmentQty, setAdjustmentQty] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- Product Create/Update Handlers ---

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ sku: '', name: '', category: '', price: 0, cost: 0, stock: 0 });
    setError(null);
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({ 
      sku: product.sku, 
      name: product.name, 
      category: product.category, 
      price: product.price, 
      cost: product.cost, 
      stock: product.stock 
    });
    setError(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEditing && selectedProduct) {
        // Update existing product
        await api.updateProduct(selectedProduct.id, {
          name: formData.name,
          category: formData.category,
          price: formData.price,
          cost: formData.cost,
          // Note: Stock and SKU are not updated here usually. Stock via adjustment, SKU is fixed.
        });
      } else {
        // Add new product
        await api.addProduct({
          ...formData,
          status: ProductStatus.Active
        });
      }
      setShowProductModal(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Stock Adjustment Handler ---

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentQty(0);
    setError(null);
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError(null);
    try {
      await api.adjustStock(selectedProduct.id, adjustmentQty);
      setShowAdjustModal(false);
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500">Manage product catalog and stock levels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by SKU or Name..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{product.sku}</td>
                    <td className="px-6 py-4 text-slate-800 font-semibold">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{product.category}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${product.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">${product.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-800">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => openAdjustModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Stock Adjustment"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditing ? 'Edit Product' : 'New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded flex items-center text-sm">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU {isEditing ? '(Read-only)' : <span className="text-red-500">*</span>}</label>
                  <input 
                    required 
                    disabled={isEditing}
                    type="text" 
                    className={`w-full border rounded-lg px-3 py-2 ${isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                    value={formData.sku} 
                    onChange={e => setFormData({...formData, sku: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" 
                    value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                  <input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" 
                    value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    disabled={isEditing} // Stock is only editable via adjustment when editing
                    className={`w-full border rounded-lg px-3 py-2 ${isEditing ? 'bg-slate-100 text-slate-500' : ''}`}
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                  />
                  {isEditing && <p className="text-xs text-slate-400 mt-1">Use stock adjustment to change quantity.</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  {isEditing ? 'Update Details' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-2 text-slate-800">Stock Adjustment</h3>
            <p className="text-sm text-slate-500 mb-4">Adjusting stock for: <span className="font-medium text-slate-800">{selectedProduct.name}</span></p>
            <div className="bg-slate-50 p-3 rounded-lg mb-4 flex justify-between items-center border border-slate-100">
               <span className="text-sm text-slate-500">Current on hand:</span>
               <span className="font-mono text-lg font-bold text-slate-800">{selectedProduct.stock}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded flex items-center text-sm">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" /> {error}
              </div>
            )}
            
            <form onSubmit={handleAdjustStock}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Quantity (+/-)</label>
              <input 
                required 
                type="number" 
                className="w-full border rounded-lg px-3 py-2 mb-2 font-mono text-lg" 
                value={adjustmentQty} 
                onChange={e => setAdjustmentQty(parseInt(e.target.value))}
                placeholder="0" 
              />
              <p className="text-xs text-slate-400 mb-6">
                 Enter <span className="text-emerald-600 font-bold">+10</span> to add stock, or <span className="text-red-500 font-bold">-5</span> to remove stock.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};