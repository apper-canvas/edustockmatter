import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import inventoryService from '../services/api/inventoryService';

const StockIndicator = ({ current, minimum }) => {
  const percentage = (current / minimum) * 100;
  let color = 'bg-success';
  if (percentage <= 100) color = 'bg-error';
  else if (percentage <= 150) color = 'bg-warning';
  
  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-surface-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-sm text-surface-600">{current}</span>
    </div>
  );
};

const ItemModal = ({ isOpen, onClose, item, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,
    location: '',
    unit: 'pieces'
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        minStock: 0,
        location: '',
        unit: 'pieces'
      });
    }
  }, [item, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim() || !formData.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">
              {item ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Select category</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Teaching Materials">Teaching Materials</option>
                <option value="Technology">Technology</option>
                <option value="Furniture">Furniture</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Sports Equipment">Sports Equipment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 101, Storage A"
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="pieces">Pieces</option>
                <option value="boxes">Boxes</option>
                <option value="reams">Reams</option>
                <option value="sets">Sets</option>
                <option value="units">Units</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {item ? 'Update' : 'Add'} Item
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (formData) => {
    try {
      if (editingItem) {
        const updatedItem = await inventoryService.update(editingItem.id, formData);
        setInventory(prev => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
        toast.success('Item updated successfully');
      } else {
        const newItem = await inventoryService.create(formData);
        setInventory(prev => [...prev, newItem]);
        toast.success('Item added successfully');
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await inventoryService.delete(id);
      setInventory(prev => prev.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStock = !stockFilter || 
      (stockFilter === 'low' && item.quantity <= item.minStock) ||
      (stockFilter === 'normal' && item.quantity > item.minStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [...new Set(inventory.map(item => item.category))];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-surface-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-surface-200">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-surface-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-surface-200 text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Inventory</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <button
            onClick={loadInventory}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-heading font-bold text-surface-900">Inventory Management</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Add Item</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Search</label>
            <div className="relative">
              <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Stock Level</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Items</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStockFilter('');
              }}
              className="w-full px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Package" size={48} className="text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              {inventory.length === 0 ? 'No items in inventory' : 'No items match your filters'}
            </h3>
            <p className="text-surface-600 mb-4">
              {inventory.length === 0 ? 'Add your first item to get started' : 'Try adjusting your search criteria'}
            </p>
            {inventory.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add First Item
              </motion.button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Item Name</th>
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Category</th>
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Stock Level</th>
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Unit</th>
                  <th className="text-left py-4 px-6 font-medium text-surface-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-surface-900">{item.name}</div>
                      <div className="text-sm text-surface-600">
                        Updated {new Date(item.lastUpdated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-surface-700">{item.category}</td>
                    <td className="py-4 px-6">
                      <StockIndicator current={item.quantity} minimum={item.minStock} />
                      <div className="text-xs text-surface-500 mt-1">
                        Min: {item.minStock}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-surface-700">{item.location}</td>
                    <td className="py-4 px-6 text-surface-700">{item.unit}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setModalOpen(true);
                          }}
                          className="p-2 text-info hover:bg-info/10 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Inventory;