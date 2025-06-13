import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from './ApperIcon';
import inventoryService from '../services/api/inventoryService';
import requestService from '../services/api/requestService';

const DashboardCard = ({ title, value, icon, color, trend, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg p-6 shadow-sm border border-surface-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-surface-600">{title}</p>
        <p className="text-2xl font-bold text-surface-900 mt-2">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <ApperIcon 
              name={trend > 0 ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={trend > 0 ? "text-success" : "text-error"}
            />
            <span className={`text-sm ml-1 ${trend > 0 ? "text-success" : "text-error"}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <ApperIcon name={icon} size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

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

const MainFeature = () => {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [inventoryData, requestsData] = await Promise.all([
          inventoryService.getAll(),
          requestService.getAll()
        ]);
        setInventory(inventoryData);
        setRequests(requestsData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Dashboard Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
              <div className="animate-pulse">
                <div className="h-4 bg-surface-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-surface-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-surface-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-surface-200 rounded w-1/3"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-surface-200 rounded"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-surface-200 rounded w-1/3"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-surface-200 rounded"></div>
              ))}
            </div>
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
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-surface-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const recentActivity = requests.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Items"
          value={totalItems}
          icon="Package"
          color="bg-primary"
          trend={5}
        />
        <DashboardCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          icon="AlertTriangle"
          color="bg-warning"
          trend={-12}
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests.length}
          icon="Clock"
          color="bg-info"
          trend={8}
        />
        <DashboardCard
          title="Total Requests"
          value={requests.length}
          icon="FileText"
          color="bg-secondary"
          trend={15}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200">
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">Low Stock Alerts</h3>
              <ApperIcon name="AlertTriangle" size={20} className="text-warning" />
            </div>
          </div>
          <div className="p-6">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
                <p className="text-surface-600">All items are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-900 truncate">{item.name}</p>
                      <p className="text-sm text-surface-600">{item.category} • {item.location}</p>
                    </div>
                    <div className="ml-4">
                      <StockIndicator current={item.quantity} minimum={item.minStock} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200">
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900">Recent Activity</h3>
              <ApperIcon name="Activity" size={20} className="text-info" />
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Clock" size={48} className="text-surface-300 mx-auto mb-4" />
                <p className="text-surface-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 hover:bg-surface-50 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-surface-900 truncate">
                        Request #{request.id.slice(-6)}
                      </p>
                      <p className="text-sm text-surface-600">
                        by {request.requestedBy} • Qty: {request.quantity}
                      </p>
                    </div>
                    <div className="ml-4">
                      <StatusBadge status={request.status} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <ApperIcon name="Plus" size={20} className="text-primary" />
            <span className="font-medium text-surface-900">Add New Item</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <ApperIcon name="FileText" size={20} className="text-secondary" />
            <span className="font-medium text-surface-900">Create Request</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <ApperIcon name="BarChart3" size={20} className="text-accent" />
            <span className="font-medium text-surface-900">Generate Report</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;