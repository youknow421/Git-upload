interface StatCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: string
  trendUp?: boolean
  highlight?: boolean
}

export function StatCard({ title, value, icon, trend, trendUp, highlight }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-5 transition-shadow hover:shadow-md ${
      highlight ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      {trend && (
        <p className={`text-xs mt-2 font-medium ${
          trendUp ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend}
        </p>
      )}
    </div>
  )
}
