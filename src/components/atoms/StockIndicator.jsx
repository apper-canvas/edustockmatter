import React from 'react'

export function StockIndicator({ 
  currentStock = 0, 
  minStock = 10, 
  maxStock = 100,
  showText = true,
  size = 'md' 
}) {
  const getStockLevel = () => {
    if (currentStock === 0) return 'out'
    if (currentStock <= minStock) return 'low'
    if (currentStock <= minStock * 2) return 'medium'
    return 'good'
  }

  const getStockColor = (level) => {
    switch (level) {
      case 'out':
        return 'bg-red-500'
      case 'low':
        return 'bg-red-400'
      case 'medium':
        return 'bg-yellow-400'
      case 'good':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStockText = (level) => {
    switch (level) {
      case 'out':
        return 'Out of Stock'
      case 'low':
        return 'Low Stock'
      case 'medium':
        return 'Medium Stock'
      case 'good':
        return 'Good Stock'
      default:
        return 'Unknown'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2'
      case 'lg':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  }

  const stockLevel = getStockLevel()
  const stockColor = getStockColor(stockLevel)
  const stockText = getStockText(stockLevel)

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`rounded-full ${stockColor} ${getSizeClasses()}`}
        title={`${stockText}: ${currentStock} units`}
      />
      {showText && (
        <span className={`text-sm ${
          stockLevel === 'out' || stockLevel === 'low' 
            ? 'text-red-600' 
            : stockLevel === 'medium' 
            ? 'text-yellow-600' 
            : 'text-green-600'
        }`}>
          {currentStock} units
        </span>
      )}
    </div>
  )
}

export default StockIndicator