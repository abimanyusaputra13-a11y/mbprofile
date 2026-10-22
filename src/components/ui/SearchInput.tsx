import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  id = 'academic-search-input',
  value,
  onChange,
  placeholder = 'Cari materi, kode kuliah, atau topik...',
  className = '',
  ariaLabel = 'Pencarian sumber daya akademik',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center">
        <Search className="size-4" />
      </div>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-neutral-300 rounded-full text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition p-1 rounded-full cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
};
