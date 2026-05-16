import { type FC, useCallback, useState } from 'react'

interface SearchInputProps {
  onSearch: (q: string) => void
  placeholder?: string
}

export const SearchInput: FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'BUSCAR organismo, empresa, RUT...',
}) => {
  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value
      setValue(q)
      onSearch(q)
    },
    [onSearch]
  )

  return (
    <div className="search-input-wrapper">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input mono-data"
        aria-label="Buscar"
      />
      
    </div>
  )
}