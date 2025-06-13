import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { inventoryService } from '@/services/api/inventoryService';
import InventoryTable from '@/components/organisms/InventoryTable';
import InventoryFilters from '@/components/organisms/InventoryFilters';
import ItemModal from '@/components/molecules/ItemModal';
import Button from '@/components/atoms/Button';
import { Plus, RefreshCw } from 'lucide-react';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Load inventory data
  useEffect(() => {
    loadInventory();
  }, []);

  // Apply filters when items or filters change
  useEffect(() => {
    applyFilters();
  }, [items, filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getItems();
      setItems(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      toast.error('Failed to load inventory items');
      console.error('Inventory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => {
        const stock = item.quantity || 0;
        const minStock = item.minStock || 0;
        
        switch (filters.status) {
          case 'in-stock':
            return stock > minStock;
          case 'low-stock':
            return stock > 0 && stock <= minStock;
          case 'out-of-stock':
            return stock === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy] || '';
      let bValue = b[filters.sortBy] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryService.deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (err) {
      toast.error('Failed to delete item');
      console.error('Delete error:', err);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      let savedItem;
      
      if (selectedItem) {
        // Update existing item
        savedItem = await inventoryService.updateItem(selectedItem.id, itemData);
        setItems(prev => prev.map(item => 
          item.id === selectedItem.id ? savedItem : item
        ));
        toast.success('Item updated successfully');
      } else {
        // Create new item
        savedItem = await inventoryService.createItem(itemData);
        setItems(prev => [...prev, savedItem]);
        toast.success('Item created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      toast.error(`Failed to ${selectedItem ? 'update' : 'create'} item`);
      console.error('Save error:', err);
    }
  };

  const handleRefresh = () => {
    loadInventory();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">
            Manage your inventory items and track stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        itemCount={filteredItems.length}
        totalCount={items.length}
      />

      {/* Inventory Table */}
      <InventoryTable
        items={filteredItems}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        loading={loading}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveItem}
        item={selectedItem}
        title={selectedItem ? 'Edit Item' : 'Add New Item'}
      />
    </motion.div>
  );
};

export default InventoryPage;