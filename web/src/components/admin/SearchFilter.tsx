interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: Array<{
    label: string
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string; count?: number }>
  }>
  sortOptions?: Array<{ value: string; label: string }>
  sortValue?: string
  onSortChange?: (value: string) => void
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  sortOptions = [],
  sortValue,
  onSortChange,
}: SearchFilterProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Custom Filters */}
        {filters.map((filter, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <label className="text-sm text-gray-500">{filter.label}:</label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} {opt.count !== undefined && `(${opt.count})`}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Sort */}
        {sortOptions.length > 0 && sortValue && onSortChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Sort:</label>
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
