type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'failed' | 'cancelled'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = statusColors[status as OrderStatus] || 'bg-gray-100 text-gray-700 border-gray-200'
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors} ${className}`}>
      {status}
    </span>
  )
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        Out of stock
      </span>
    )
  }
  
  if (stock < 5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        {stock} left
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      {stock} in stock
    </span>
  )
}
