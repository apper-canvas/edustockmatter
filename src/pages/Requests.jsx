import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import requestService from '../services/api/requestService';
import inventoryService from '../services/api/inventoryService';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-warning text-white', label: 'Pending' },
    approved: { color: 'bg-info text-white', label: 'Approved' },
    rejected: { color: 'bg-error text-white', label: 'Rejected' },
    fulfilled: { color: 'bg-success text-white', label: 'Fulfilled' }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: { color: 'bg-surface-400 text-white', label: 'Low' },
    medium: { color: 'bg-warning text-white', label: 'Medium' },
    high: { color: 'bg-error text-white', label: 'High' }
  };
  
  const config = priorityConfig[priority] || priorityConfig.medium;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const RequestModal = ({ isOpen, onClose, onSave }) => {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '',
    requestedBy: '',
    quantity: 1,
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      setFormData({
        itemId: '',
        requestedBy: '',
        quantity: 1,
        priority: 'medium',
        notes: ''
      });
    }
  }, [isOpen]);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      toast.error('Failed to load inventory items');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.requestedBy.trim()) {
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
            <h3 className="text-lg font-semibold text-surface-900">Create New Request</h3>
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
                Item *
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">Select an item</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.category} (Available: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Requested By *
              </label>
              <input
                type="text"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details or special instructions..."
                rows={3}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
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
                Create Request
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsData, inventoryData] = await Promise.all([
        requestService.getAll(),
        inventoryService.getAll()
      ]);
      setRequests(requestsData);
      setInventory(inventoryData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (formData) => {
    try {
      const newRequest = await requestService.create(formData);
      setRequests(prev => [newRequest, ...prev]);
      setModalOpen(false);
      toast.success('Request created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create request');
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const updatedRequest = await requestService.update(requestId, { status: newStatus });
      setRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      // If fulfilling a request, update inventory
      if (newStatus === 'fulfilled') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const item = inventory.find(i => i.id === request.itemId);
          if (item && item.quantity >= request.quantity) {
            await inventoryService.update(item.id, {
              ...item,
              quantity: item.quantity - request.quantity
            });
            // Reload inventory to reflect changes
            const updatedInventory = await inventoryService.getAll();
            setInventory(updatedInventory);
          }
        }
      }
      
      toast.success(`Request ${newStatus} successfully`);
    } catch (err) {
      toast.error(err.message || 'Failed to update request');
    }
  };

  const getItemName = (itemId) => {
    const item = inventory.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

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
                <div className="h-20 bg-surface-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Requests</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <button
            onClick={loadData}
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
        <h1 className="text-2xl font-heading font-bold text-surface-900">Request Management</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>Create Request</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="w-full px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="FileText" size={48} className="text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              {requests.length === 0 ? 'No requests yet' : 'No requests match your filters'}
            </h3>
            <p className="text-surface-600 mb-4">
              {requests.length === 0 ? 'Create your first request to get started' : 'Try adjusting your filter criteria'}
            </p>
            {requests.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create First Request
              </motion.button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-200">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-surface-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-surface-900 truncate">
                        {getItemName(request.itemId)}
                      </h3>
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-surface-600">
                      <div>
                        <span className="font-medium">Request ID:</span> #{request.id.slice(-8)}
                      </div>
                      <div>
                        <span className="font-medium">Requested by:</span> {request.requestedBy}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {request.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      {request.notes && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(request.id, 'approved')}
                        className="px-3 py-1 bg-info text-white rounded-lg hover:bg-info/90 transition-colors text-sm"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="px-3 py-1 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm"
                      >
                        Reject
                      </motion.button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusChange(request.id, 'fulfilled')}
                      className="px-3 py-1 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm"
                    >
                      Mark Fulfilled
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <RequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateRequest}
      />
    </div>
  );
};

export default Requests;