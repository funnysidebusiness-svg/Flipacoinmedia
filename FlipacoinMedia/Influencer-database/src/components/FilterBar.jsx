export default function FilterBar({ genres, locations, filter, setFilter, sortKey, setSortKey, query, setQuery }) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        aria-label="Search by name"
      />

      <select
        value={filter.genre}
        onChange={(e) => setFilter({ ...filter, genre: e.target.value })}
        aria-label="Filter by genre"
      >
        <option value="">All Genres</option>
        {genres.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>

      <select
        value={filter.location}
        onChange={(e) => setFilter({ ...filter, location: e.target.value })}
        aria-label="Filter by location"
      >
        <option value="">All Locations</option>
        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>

      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
        aria-label="Sort"
      >
        <option value="totalDesc">Sort: Total followers (high→low)</option>
        <option value="totalAsc">Sort: Total followers (low→high)</option>
        <option value="igDesc">Sort: Instagram (high→low)</option>
        <option value="ytDesc">Sort: YouTube (high→low)</option>
        <option value="nameAsc">Sort: Name (A→Z)</option>
        <option value="nameDesc">Sort: Name (Z→A)</option>
      </select>
    </div>
  );
}
