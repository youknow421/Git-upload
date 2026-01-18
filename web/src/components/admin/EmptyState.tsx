interface EmptyStateProps {
  title: string
  description: string
  icon?: string
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      {icon && <div className="text-4xl mb-3 opacity-40">{icon}</div>}
      <p className="text-gray-900 font-medium">{title}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-indigo-600 mx-auto"></div>
      <p className="mt-4 text-sm text-gray-500">{message}</p>
    </div>
  )
}
