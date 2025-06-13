import React, { useState, useEffect } from 'react';
import { Card } from '@/components/molecules/Card';
import { Badge } from '@/components/atoms/Badge';
import { StockIndicator } from '@/components/atoms/StockIndicator';
import { inventoryService } from '@/services/api/inventoryService';
import { requestService } from '@/services/api/requestService';
import { userService } from '@/services/api/userService';
import { Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    pendingRequests: 0,
    totalUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data concurrently
        const [inventory, requests, users] = await Promise.all([
          inventoryService.getAll(),
          requestService.getAll(),
          userService.getAll()
        ]);

        // Calculate statistics
        const lowStock = inventory.filter(item => item.quantity <= item.minimum_stock);
        const pending = requests.filter(req => req.status === 'pending');

        setStats({
          totalItems: inventory.length,
          lowStockItems: lowStock.length,
          pendingRequests: pending.length,
          totalUsers: users.length
        });

        // Set recent data
        setRecentRequests(requests.slice(0, 5));
        setLowStockItems(lowStock.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
            <div className="space-y-3">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{request.item_name}</p>
                      <p className="text-xs text-gray-600">Qty: {request.quantity}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        request.status === 'approved' ? 'success' :
                        request.status === 'pending' ? 'warning' : 'error'
                      }>
                        {request.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent requests</p>
              )}
            </div>
          </div>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <StockIndicator 
                        current={item.quantity} 
                        minimum={item.minimum_stock} 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity} / {item.minimum_stock} min
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">All items well stocked</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;