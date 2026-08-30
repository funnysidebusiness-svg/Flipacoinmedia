// src/pages/Creators.jsx
import React, { useMemo, useState } from "react";
import "../styles.css";
import creatorsData from "../data/creators.json"; // import JSON

// ---------- Helpers ----------
const nf = new Intl.NumberFormat();
const formatFollowers = (n) => nf.format(n || 0);

// ---------- Creator Card ----------
function CreatorCard({ creator }) {
  return (
    <div className="creatorcard">
      <img src={creator.image} alt={creator.name} loading="lazy" />
      <h2>{creator.name}</h2>
      <div className="creatorsmeta">
        <span className="badge">{creator.genre}</span>
        <span className="badge">{creator.location}</span>
        <span className="badge">{creator.gender}</span>
      </div>
      <div className="creatorcounts">
        <a
          href={creator.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="creatorcounts-box"
        >
          Instagram <strong>{formatFollowers(creator.instagramFollowers)}</strong>
        </a>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function CreatorsPage() {
  const [genderFilter, setGenderFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [followerRangeFilter, setFollowerRangeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // derive filter options
  const { genders, genres, locations, ranges } = useMemo(() => {
    const gdr = new Set();
    const gen = new Set();
    const loc = new Set();
    const rng = new Set();
    creatorsData.forEach((c) => {
      if (c.gender) gdr.add(c.gender);
      if (c.genre) gen.add(c.genre);
      if (c.location) loc.add(c.location);
      if (c.followerRange) rng.add(c.followerRange);
    });
    return {
      genders: [...gdr].sort(),
      genres: [...gen].sort(),
      locations: [...loc].sort(),
      ranges: [...rng].sort((a, b) => a.localeCompare(b)),
    };
  }, []);

  // apply filters, search, and auto-sort by Instagram followers
  const filtered = useMemo(() => {
    return creatorsData
      .filter((c) => {
        if (genderFilter && c.gender !== genderFilter) return false;
        if (genreFilter && c.genre !== genreFilter) return false;
        if (locationFilter && c.location !== locationFilter) return false;
        if (followerRangeFilter && c.followerRange !== followerRangeFilter) return false;

        // search by name, genre, location
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const match =
            c.name.toLowerCase().includes(q) ||
            c.genre.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => (b.instagramFollowers || 0) - (a.instagramFollowers || 0));
  }, [
    genderFilter,
    genreFilter,
    locationFilter,
    followerRangeFilter,
    searchQuery,
  ]);

  const resetFilters = () => {
    setGenderFilter("");
    setGenreFilter("");
    setLocationFilter("");
    setFollowerRangeFilter("");
    setSearchQuery("");
  };

  return (
    <div className="container">
      <h1 className="page-title">Creators</h1>

    

      <div className="filter-bar">
          {/* Search Bar */}
     <input
  type="text"
  className="search-input"
  placeholder="Search by name..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="">Any Gender</option>
          {genders.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        <select
          value={followerRangeFilter}
          onChange={(e) => setFollowerRangeFilter(e.target.value)}
        >
          <option value="">All Follower Ranges</option>
          {ranges.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <button className="btn" onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div className="creators-count">
        Showing <strong>{filtered.length}</strong> creators
      </div>

      <div className="grid">
        {filtered.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
        {filtered.length === 0 && (
          <div className="grid-empty">No creators match your search or filters.</div>
        )}
      </div>
    </div>
  );
}
