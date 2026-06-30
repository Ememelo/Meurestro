import React, { useState, useEffect, useRef } from 'react'

const SearchableSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Selecione uma opção...',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  // Find currently selected option
  const selectedOption = options.find(opt => opt.value === value)

  // When selection changes or dropdown opens/closes, update search text
  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedOption ? selectedOption.label : '')
    }
  }, [value, isOpen, selectedOption])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    (opt.label || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (option) => {
    onChange(option.value)
    setSearch(option.label)
    setIsOpen(false)
  }

  const handleFocus = () => {
    setIsOpen(true)
    setSearch('') // Clear search on focus to allow typing
  }

  const handleBlur = () => {
    // Delay to let click event register on option
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 200)
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
      />
      
      {/* Dropdown list indicator icon */}
      <span className="absolute right-3 top-2.5 pointer-events-none text-slate-400 text-[10px]">
        {isOpen ? '▲' : '▼'}
      </span>

      {/* Options Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-50">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 text-center">
              Nenhuma opção encontrada
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-all ${
                  opt.value === value 
                    ? 'bg-amber-500 text-white font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
