interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ query, onQueryChange, placeholder }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="search-input" className="sr-only">
        Search media
      </label>
      <input
        id="search-input"
        type="search"
        className="search-input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder ?? 'Search...'}
        aria-label="Search photos and videos"
        autoComplete="off"
      />
    </div>
  );
}
