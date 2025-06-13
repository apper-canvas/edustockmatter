import React from 'react';
import DashboardContent from '@/components/organisms/DashboardContent';

const DashboardPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your inventory management dashboard</p>
      </div>
      <DashboardContent />
    </div>
  );
};

export default DashboardPage;