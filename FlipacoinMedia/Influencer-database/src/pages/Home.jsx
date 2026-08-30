// src/pages/Creators.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../styles.css";
import emailjs from "emailjs-com";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// ---------- Helpers ----------
const nf = new Intl.NumberFormat();
const formatFollowers = (n) => nf.format(n || 0);

// ---------- Creator Card ----------

function CreatorCard({ creator }) {
  const [flipped, setFlipped] = useState(false);

  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [deliverables, setDeliverables] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // 🔥 VALIDATION FUNCTIONS
  const validateMobile = (value) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian numbers
    return phoneRegex.test(value);
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  // const isValidMobile = (num) => /^[6-9]\d{9}$/.test(num);
  // const isValidEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  // 🔥 HANDLE SUBMIT
  const handleSubmit = async () => {
    let newErrors = {};

    if (!validateMobile(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!deliverables) {
      newErrors.deliverables = "Please enter deliverables";
    }

    setErrors(newErrors);

    // ❌ stop if errors
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const formData = {
        creator_name: creator.name,
        mobile,
        email,
        deliverables,
      };

      // ✅ SEND EMAIL
      await emailjs.send(
        "service_7kv8t2x", // Replace with your EmailJS Service ID
        "template_r80gh4c", // Replace with your EmailJS Template ID
        formData,
        "MM3_jxLHSqxjsz-oo",
      );

      // ✅ OPTIONAL: SAVE TO FIREBASE (if rules fixed)
      await addDoc(collection(db, "leads"), {
        creatorName: creator.name,
        mobile,
        email,
        deliverables,
        timestamp: serverTimestamp(),
      });

      setSuccess(true);

      // reset
      setMobile("");
      setEmail("");
      setDeliverables("");
      setErrors({});
      // setFlipped(false);
      setTimeout(() => {
        setSuccess(false);
        setFlipped(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`creatorcard flip-card ${flipped ? "flipped" : ""}`}>
      <div className="flip-inner">
        {/* 🔵 FRONT */}
        <div className="flip-front">
          <img
            src={creator.creatorImage || "/creator-images/default.png"}
            alt={creator.name}
            loading="lazy"
          />
{/* Brand Favourite */}
{["hemal soni", "sahil virwani", "prachi choudhary"].includes(
  creator.name?.toLowerCase()
) && (
  <div className="popular-badge">Brand Favourite ⭐</div>
)}

{/* Regional Superstar */}
{["mahi patel"].includes(creator.name?.toLowerCase()) && (
  <div className="regional-badge">Regional Superstar⚡️</div>
)}
          <h2>{creator.name}</h2>

          <div className="creatorsmeta">
            <span className="badge">{creator.genre}</span>
            <span className="badge">{creator.location}</span>
            {/* <span className="badge">{creator.gender}</span> */}
          </div>

          {/* 🔥 CLEAN INLINE ROW */}
          <div className="creatorcounts-row">
            <a
              href={creator.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="creatorcounts-box"
            >
              Instagram{" "}
              <strong>{formatFollowers(creator.instagramFollowers)}</strong>
            </a>
            {!flipped && (
              <button
                className="request-btn-inline"
                onClick={() => setFlipped(true)}
              >
                Request Commercials?
              </button>
            )}
          </div>
        </div>

        {/* 🟣 BACK */}
        <div className="flip-back">
          {success ? (
            <div className="success-state">
              <div className="success-icon">✅</div>
              <h3>Request Sent!</h3>
              <p>We’ll contact you soon</p>
            </div>
          ) : (
            <>
              <div className="form-header">
                <h3>Request Commercial For</h3>
                <p>{creator.name}</p>
              </div>

              <div className="form-fields">
                {/* 📱 MOBILE */}
                <div className="field-group">
                  <input
                    type="tel"
                    placeholder="📱 Mobile Number"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMobile(value);

                      setErrors((prev) => ({
                        ...prev,
                        mobile: validateMobile(value)
                          ? ""
                          : "Enter valid mobile number",
                      }));
                    }}
                    className={errors.mobile ? "input-error" : ""}
                  />
                  {errors.mobile && (
                    <span className="error-text">{errors.mobile}</span>
                  )}
                </div>

                {/* ✉️ EMAIL */}
                <div className="field-group">
                  <input
                    type="email"
                    placeholder="✉️ Email ID"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);

                      setErrors((prev) => ({
                        ...prev,
                        email: validateEmail(value) ? "" : "Enter valid email",
                      }));
                    }}
                    className={errors.email ? "input-error" : ""}
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                {/* 🎬 DELIVERABLES */}
                <div className="field-group">
                  <textarea
                    placeholder="🎬 Deliverables (Reel, Story, Post...)"
                    value={deliverables}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDeliverables(value);

                      setErrors((prev) => ({
                        ...prev,
                        deliverables: value ? "" : "Required field",
                      }));
                    }}
                    className={errors.deliverables ? "input-error" : ""}
                  />
                  {errors.deliverables && (
                    <span className="error-text">{errors.deliverables}</span>
                  )}
                </div>
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Send Request 🚀"}
              </button>

              <button className="back-btn" onClick={() => setFlipped(false)}>
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function CreatorsPage() {
  const [creatorsData, setCreatorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [genderFilter, setGenderFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [followerRangeFilter, setFollowerRangeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Fetch Firebase Data ----------
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const snapshot = await getDocs(collection(db, "creators"));

        const creators = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCreatorsData(creators);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // ---------- Create Filter Options ----------
  const { genders, genres, locations, ranges } = useMemo(() => {
    const gdr = new Set();
    const gen = new Set();
    const loc = new Set();
    const rng = new Set();

    creatorsData.forEach((c) => {
      if (c.gender) gdr.add(c.gender.trim());
      if (c.genre) gen.add(c.genre.trim());
      if (c.location) loc.add(c.location.trim());
      if (c.followerRange) rng.add(c.followerRange.trim());
    });

    return {
      genders: [...gdr].sort(),
      genres: [...gen].sort(),
      locations: [...loc].sort(),
      ranges: [...rng].sort((a, b) => a.localeCompare(b)),
    };
  }, [creatorsData]);

  // ---------- Filtering Logic ----------
  const filtered = useMemo(() => {
    return creatorsData
      .filter((c) => c.showOnHomepage === "yes") // homepage control
      .filter((c) => {
        const gender = c.gender?.trim().toLowerCase();
        const genre = c.genre?.trim().toLowerCase();
        const location = c.location?.trim().toLowerCase();
        const range = c.followerRange?.trim().toLowerCase();

        if (genderFilter && gender !== genderFilter.toLowerCase()) return false;
        if (genreFilter && genre !== genreFilter.toLowerCase()) return false;
        if (locationFilter && location !== locationFilter.toLowerCase())
          return false;
        if (followerRangeFilter && range !== followerRangeFilter.toLowerCase())
          return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();

          const match =
            c.name?.toLowerCase().includes(q) ||
            genre?.includes(q) ||
            location?.includes(q);

          if (!match) return false;
        }

        return true;
      })
      .sort(
        (a, b) => (b.instagramFollowers || 0) - (a.instagramFollowers || 0),
      );
  }, [
    creatorsData,
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

  if (loading) {
    return <div className="container">Loading creators...</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Creators</h1>

      {/* ---------- Filters ---------- */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">Any Gender</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={followerRangeFilter}
          onChange={(e) => setFollowerRangeFilter(e.target.value)}
        >
          <option value="">All Follower Ranges</option>
          {ranges.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button className="btn" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {/* ---------- Count ---------- */}
      <div className="creators-count">
        Showing <strong>{filtered.length}</strong> creators
      </div>

      {/* ---------- Grid ---------- */}
      <div className="grid">
        {filtered.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}

        {filtered.length === 0 && (
          <div className="grid-empty">
            No creators match your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
