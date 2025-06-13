import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';

const InventoryFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    stockLevel: '',
    ...initialFilters
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange?.(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFiltersChange]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      category: '',
      stockLevel: ''
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.searchTerm || filters.category || filters.stockLevel;

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'office-supplies', label: 'Office Supplies' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'books', label: 'Books' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'consumables', label: 'Consumables' }
  ];

  const stockLevelOptions = [
    { value: '', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.searchTerm}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          options={categoryOptions}
          placeholder="Filter by category"
        />

        {/* Stock Level Filter */}
        <Select
          value={filters.stockLevel}
          onChange={(e) => handleInputChange('stockLevel', e.target.value)}
          options={stockLevelOptions}
          placeholder="Filter by stock level"
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{filters.searchTerm}"
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Category: {categoryOptions.find(opt => opt.value === filters.category)?.label}
              </span>
            )}
            {filters.stockLevel && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Stock: {stockLevelOptions.find(opt => opt.value === filters.stockLevel)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryFilters;