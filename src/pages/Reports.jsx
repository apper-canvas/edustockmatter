import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import ApperIcon from '../components/ApperIcon';
import inventoryService from '../services/api/inventoryService';
import requestService from '../services/api/requestService';

const MetricCard = ({ title, value, icon, color, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg p-6 shadow-sm border border-surface-200"
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

const Reports = () => {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

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
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-surface-200 rounded w-1/4 animate-pulse mb-6"></div>
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse">
              <div className="h-6 bg-surface-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-surface-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-surface-200">
            <div className="animate-pulse">
              <div className="h-6 bg-surface-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-surface-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Failed to Load Reports</h3>
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

  // Calculate metrics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * 10), 0); // Assuming $10 per unit
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const fulfilledRequests = requests.filter(req => req.status === 'fulfilled').length;

  // Category distribution
  const categoryData = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryChartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#0B6E99', '#44A08D', '#F97316', '#10B981', '#F59E0B', '#EF4444'],
    labels: Object.keys(categoryData),
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
      position: 'bottom'
    }
  };

  // Request status distribution
  const statusData = requests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#F59E0B', '#3B82F6', '#EF4444', '#10B981'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: Object.keys(statusData),
    },
    yaxis: {
      title: {
        text: 'Number of Requests'
      }
    },
    fill: {
      opacity: 1
    }
  };

  // Monthly request trend (last 6 months)
  const monthlyData = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyData[key] = 0;
  }

  requests.forEach(req => {
    const date = new Date(req.createdAt);
    const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (monthlyData.hasOwnProperty(key)) {
      monthlyData[key]++;
    }
  });

  const trendChartOptions = {
    chart: {
      type: 'line',
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#0B6E99'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: Object.keys(monthlyData)
    },
    yaxis: {
      title: {
        text: 'Number of Requests'
      }
    },
    markers: {
      size: 6
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-surface-900">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors flex items-center space-x-2"
          >
            <ApperIcon name="Download" size={16} />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon="Package"
          color="bg-primary"
          trend={8}
        />
        <MetricCard
          title="Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          icon="DollarSign"
          color="bg-success"
          trend={12}
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems}
          icon="AlertTriangle"
          color="bg-warning"
          trend={-5}
        />
        <MetricCard
          title="Pending Requests"
          value={pendingRequests}
          icon="Clock"
          color="bg-info"
          trend={-15}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Inventory by Category</h3>
            <ApperIcon name="PieChart" size={20} className="text-primary" />
          </div>
          {Object.keys(categoryData).length > 0 ? (
            <Chart
              options={categoryChartOptions}
              series={Object.values(categoryData)}
              type="donut"
              height={300}
            />
          ) : (
            <div className="text-center py-12">
              <ApperIcon name="PieChart" size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No inventory data available</p>
            </div>
          )}
        </div>

        {/* Request Status */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-surface-900">Request Status</h3>
            <ApperIcon name="BarChart3" size={20} className="text-primary" />
          </div>
          {Object.keys(statusData).length > 0 ? (
            <Chart
              options={statusChartOptions}
              series={[{
                name: 'Requests',
                data: Object.values(statusData)
              }]}
              type="bar"
              height={300}
            />
          ) : (
            <div className="text-center py-12">
              <ApperIcon name="BarChart3" size={48} className="text-surface-300 mx-auto mb-4" />
              <p className="text-surface-600">No request data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-surface-900">Request Trend (Last 6 Months)</h3>
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
        </div>
        <Chart
          options={trendChartOptions}
          series={[{
            name: 'Requests',
            data: Object.values(monthlyData)
          }]}
          type="line"
          height={300}
        />
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Top Categories by Quantity</h3>
          <div className="space-y-3">
            {Object.entries(categoryData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, quantity], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                >
                  <span className="font-medium text-surface-900">{category}</span>
                  <span className="text-primary font-semibold">{quantity}</span>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Activity Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Total Requests</span>
              <span className="font-semibold text-surface-900">{totalRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Fulfilled Requests</span>
              <span className="font-semibold text-success">{fulfilledRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Pending Requests</span>
              <span className="font-semibold text-warning">{pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-600">Fulfillment Rate</span>
              <span className="font-semibold text-primary">
                {totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;