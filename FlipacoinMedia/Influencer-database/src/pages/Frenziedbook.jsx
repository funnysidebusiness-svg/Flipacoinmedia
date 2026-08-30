import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  // deleteDoc, 
  doc,
  onSnapshot  
} from "firebase/firestore";
import { db } from "../../src/firebase";
import { auth } from "../../src/firebase"; // adjust path if needed
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";


// ---------- Modal Component ----------
function Modal({ title, children, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3>{title}</h3>

          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FrenziedBookPage() {
  // ---------- Login ----------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [userEmail, setUserEmail] = useState("");

const handleLogin = async () => {
  if (!username || !password) {
    setLoginError("Enter email and password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);

    setUserEmail(userCredential.user.email); // ✅ store email
    setLoginError("");
    setLoggedIn(true);
  } catch (err) {
    console.error("Login error:", err);
    setLoginError("Invalid email or password");
  }
};

  // ---------- Dashboard States ----------
  const [creators, setCreators] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [brands, setBrands] = useState([]);
  const [board, setBoard] = useState({ upcoming: [], ongoing: [], pending: [], done: [] });

  const columns = ["upcoming", "ongoing", "pending", "done"];
  const [form, setForm] = useState({ creator: "", agency: "", brand: "", amount: "", profitInput: "", goLive: "", terms: "" });
  const [editingCard, setEditingCard] = useState(null);

  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

const [newCreator, setNewCreator] = useState({
  name: "",
  gender: "",
  genre: "",
  location: "",
  instagramFollowers: "",
  instagramUrl: "",
  contact: "",
  showOnHomepage: "no"
});
  const [newAgency, setNewAgency] = useState({ name: "", address: "", pocName: "", pocPhone: "" });
  const [newBrand, setNewBrand] = useState({ name: "", type: "", agency: "", pocName: "", pocPhone: "" });

  // const [monthFilter, setMonthFilter] = useState("all");
  // const [yearFilter, setYearFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const navigate = useNavigate();
  const handleCreatorLogin = () => {
  navigate("/creator-login");
};

const [editingCreator, setEditingCreator] = useState(null);
const [editingAgency, setEditingAgency] = useState(null);
const [editingBrand, setEditingBrand] = useState(null);

const [showEditCreator, setShowEditCreator] = useState(false);
const [showEditAgency, setShowEditAgency] = useState(false);
const [showEditBrand, setShowEditBrand] = useState(false);
const hideFinancialSummary = userEmail === "flipacointest@gmail.com";

const today = new Date();

const [monthFilter, setMonthFilter] = useState(
  today.getMonth().toString()
);

const [yearFilter, setYearFilter] = useState(
  today.getFullYear().toString()
);

const followers = Number(newCreator.instagramFollowers);
const followerRange = getFollowerRange(followers);

const [creatorSearch, setCreatorSearch] = useState("");
const [showCreatorSuggestions, setShowCreatorSuggestions] = useState(false);

const [editCreatorSearch, setEditCreatorSearch] = useState("");
const [showEditCreatorSuggestions, setShowEditCreatorSuggestions] = useState(false);

function getFollowerRange(followers) {
  if (followers < 50000) return "0-50K";
  if (followers < 100000) return "50K-100K";
  if (followers < 500000) return "100K-500K";
  if (followers < 1000000) return "500K-1M";
  return "1M+";
}

  // ---------- Load JSON Data ----------
const handleLogout = async () => {
  try {
    await signOut(auth);
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setUserEmail(""); // reset
  } catch (err) {
    console.error("Logout error:", err);
  }
};

useEffect(() => {
  if (!loggedIn) return; // only subscribe if logged in

  const unsubCampaigns = onSnapshot(
    collection(db, "campaigns"),
    (snapshot) => {
      const campaignsFromDB = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const newBoard = { upcoming: [], ongoing: [], pending: [], done: [] };
      campaignsFromDB.forEach(c => {
        const col = c.col || "upcoming";
        newBoard[col].push(c);
      });
      setBoard(newBoard);
    },
    (error) => console.error("Firestore campaigns error:", error)
  );

  const unsubCreators = onSnapshot(collection(db, "creators"), snapshot => {
    setCreators(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  const unsubBrands = onSnapshot(collection(db, "brands"), snapshot => {
    setBrands(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  const unsubAgencies = onSnapshot(collection(db, "agencies"), snapshot => {
    setAgencies(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  return () => {
    unsubCampaigns();
    unsubCreators();
    unsubBrands();
    unsubAgencies();
  };
}, [loggedIn]);

  // ---------- Helpers ----------

  const addCreator = async (name) => {
  if (!name) return;

  try {
    await addDoc(collection(db, "creators"), {
      name,
      createdAt: new Date()
    });

    console.log("✅ Creator added");
  } catch (error) {
    console.error("❌ Error adding creator:", error.message);
  }
};

const addBrand = async (name) => {
  if (!name) return;

  try {
    await addDoc(collection(db, "brands"), {
      name,
      createdAt: new Date()
    });

    console.log("✅ Brand added");
  } catch (error) {
    console.error("❌ Error adding brand:", error.message);
  }
};

const addAgency = async (name) => {
  if (!name) return;

  try {
    await addDoc(collection(db, "agencies"), {
      name,
      createdAt: new Date()
    });

    console.log("✅ Agency added");
  } catch (error) {
    console.error("❌ Error adding agency:", error.message);
  }
};
  const getDaysSinceLive = (goLive) => {
  if (!goLive) return null;

  const today = new Date();
  const liveDate = new Date(goLive);

  const diffTime = today - liveDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? diffDays : null;
};
  const calculateProfit = (amount, profitInput) => {
    if (!amount || !profitInput) return 0;
    if (profitInput.includes("%")) return Math.round((amount * parseFloat(profitInput)) / 100);
    return Number(profitInput);
  };

const addCampaign = async () => {
  console.log("🚀 Add button clicked");
  if (!form.creator || !form.amount || !form.brand) return;

  const profit = calculateProfit(Number(form.amount), form.profitInput);

  // 🔥 Generate brand image path automatically
  const formattedBrand = form.brand
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const brandImagePath = `/brand-images/${formattedBrand}.png`;

  try {
    if (editingCard) {
      // UPDATE
      const docRef = doc(db, "campaigns", editingCard.id);

      await updateDoc(docRef, {
        ...form,
        profit,
        brandImage: brandImagePath
      });

      console.log("✅ Campaign updated");

    } else {
      // CREATE
      await addDoc(collection(db, "campaigns"), {
        ...form,
        profit,
        brandImage: brandImagePath, // 🔥 AUTO ADDED
        col: "upcoming",
        createdAt: new Date()
      });

      console.log("✅ Campaign added");
    }

    setEditingCard(null);
    setForm({
      creator: "",
      agency: "",
      brand: "",
      amount: "",
      profitInput: "",
      goLive: "",
      terms: ""
    });

  } catch (error) {
    console.error("❌ Error saving campaign:", error.message);
  }
};
// DELETE BUTTON
// const deleteCard = async (col, id) => {
//   try {
//     await deleteDoc(doc(db, "campaigns", id));

//     setBoard(p => ({
//       ...p,
//       [col]: p[col].filter(c => c.id !== id)
//     }));

//     console.log("🗑 Campaign deleted");

//   } catch (error) {
//     console.error("❌ Delete error:", error.message);
//   }
// };

const moveCard = async (fromCol, index, dir) => {
  const toIndex = columns.indexOf(fromCol) + dir;
  if (toIndex < 0 || toIndex >= columns.length) return;

  const toCol = columns[toIndex];
  const moved = board[fromCol][index];

  // Determine updates based on destination column
  const updates = { col: toCol };

  if (toCol === "upcoming") {
    updates.campaignLocked = "Awaiting from client";
    updates.paymentStatus = "Pending";
  }
  if (toCol === "ongoing") {
    updates.campaignLocked = "Campaign production under progress";
    updates.paymentStatus = "Pending";
  }
  if (toCol === "pending") {
    updates.campaignLocked = "Campaign live";
    updates.paymentStatus = "Pending";
  }
  if (toCol === "done") {
    updates.campaignLocked = "Campaign completed";
    updates.paymentStatus = "Payment received";
  }

  try {
    // Update Firestore document
    await updateDoc(doc(db, "campaigns", moved.id), updates);

    // Update local state without duplicates
    setBoard(p => {
      const updated = { ...p };

      // Remove card from all columns first
      for (const col of columns) {
        updated[col] = updated[col].filter(c => c.id !== moved.id);
      }

      // Add card to the new column with updates
      updated[toCol] = [...updated[toCol], { ...moved, ...updates }];

      return updated;
    });
  } catch (error) {
    console.error("❌ Move error:", error.message);
  }
};

//   setBoard(p => {
//     const updated = { ...p };
//     updated[fromCol] = updated[fromCol].filter((_, i) => i !== index);
//     updated[toCol] = [...updated[toCol], updatedCard];
//     return updated;
//   });
// };
 const getFilteredBoard = () => {
  return Object.fromEntries(
    Object.entries(board).map(([col, cards]) => [
      col,
      cards.filter(c => {
        const cardDate = new Date(c.goLive); // parse goLive

        const monthMatch = monthFilter === "all" || cardDate.getMonth() === parseInt(monthFilter);
        const yearMatch = yearFilter === "all" || cardDate.getFullYear() === parseInt(yearFilter);

        return (
          monthMatch &&
          yearMatch &&
          (creatorFilter === "all" || c.creator === creatorFilter) &&
          (agencyFilter === "all" || c.agency === agencyFilter) &&
          (brandFilter === "all" || c.brand === brandFilter)
        );
      })
    ])
  );
};


  const filteredBoard = getFilteredBoard();

 const doneGroupedByYearMonth = filteredBoard.done.reduce((acc, card) => {

  if (!card.goLive) return acc;

  const date = new Date(card.goLive);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (!acc[year]) acc[year] = {};
  if (!acc[year][month]) acc[year][month] = [];

  acc[year][month].push(card);

  return acc;

}, {});

  const totalRevenue = Object.values(filteredBoard).flat().reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalProfit = Object.values(filteredBoard).flat().reduce((sum, c) => sum + Number(c.profit || 0), 0);
  const totalCampaigns = Object.values(filteredBoard).flat().length;

const Card = ({ card, col, index }) => (
  <div style={styles.card}>
    
    {/* BADGES */}
    {col === "done" && (
      <span style={styles.completedTag}>Completed</span>
    )}

    {col === "pending" &&
      getDaysSinceLive(card.goLive) !== null && (
        <span style={styles.pendingDaysTag}>
          Overdue by {getDaysSinceLive(card.goLive)} Days
        </span>
      )}

    {/* MAIN CONTENT */}
    <div style={styles.cardContent}>
      
      {/* LEFT SIDE */}
      <div style={styles.cardLeft}>
        <div style={styles.cardTitle}>{card.creator}</div>
        <div style={styles.meta}>Agency: {card.agency}</div>
        <div style={styles.meta}>Brand: {card.brand}</div>
        <div style={styles.meta}>Live Date: {card.goLive}</div>

        {!hideFinancialSummary && (
          <>
            <div style={styles.meta}>Revenue: ₹{card.amount}</div>
            <div style={styles.meta}>Profit: ₹{card.profit}</div>
          </>
        )}

        <div style={styles.meta}>
          Campaign Locked: {card.campaignLocked || "Awaiting from client"}
        </div>

        <div style={styles.meta}>
          Payment Status: {card.paymentStatus || "Pending"}
        </div>
      </div>

      {/* RIGHT SIDE (Brand Logo) */}
      {card.brandImage && (
        <div style={styles.logoWrapper}>
          <img
            src={card.brandImage}
            alt="brand"
            style={styles.brandImage}
          />
        </div>
      )}
    </div>

    {/* ACTIONS */}
<div style={styles.actions}>
  {col !== "upcoming" && (
    <button
      style={styles.navBtn}
      onClick={() => moveCard(col, index, -1)}
    >
      ←
    </button>
  )}

  {col !== "done" && (
    <button
      style={styles.nextBtn}
      onClick={() => moveCard(col, index, 1)}
    >
      →
    </button>
  )}

{/* Edit button. Enable/Disable it.  */}
  {/* <button
    style={styles.editBtn}
    onClick={() => {
      setEditingCard(card);
      setForm({
        creator: card.creator,
        agency: card.agency,
        brand: card.brand,
        amount: card.amount,
        profitInput: card.profit,
        goLive: card.goLive,
        terms: card.terms || ""
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
    Edit
  </button> */}
</div>
  </div>
);

const Column = ({ title, colKey }) => {

  if (colKey !== "done") {
    return (
      <div style={styles.column}>
        <h3>{title}</h3>
        {filteredBoard[colKey].map((c, i) => (
          <Card key={c.id} card={c} col={colKey} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.column}>
      <h3>{title}</h3>

      {Object.entries(doneGroupedByYearMonth)
        .sort((a, b) => b[0] - a[0]) // newest year first
        .map(([year, months]) => (

          <details key={year} style={styles.yearGroup}>
            <summary style={styles.yearSummary}>
              {year}
            </summary>

            {Object.entries(months)
              .sort((a, b) => b[0] - a[0]) // newest month first
              .map(([month, cards]) => {

                const label = new Date(year, month).toLocaleString("default", {
                  month: "long"
                });

                return (
                  <details key={month} style={styles.monthGroup}>
                    <summary style={styles.monthSummary}>
                      {label} ({cards.length})
                    </summary>

                    {cards.map((c, i) => (
                      <Card key={c.id} card={c} col={colKey} index={i} />
                    ))}

                  </details>
                );
              })}

          </details>

        ))}

    </div>
  );
};

  // ---------- Render ----------
   const [showTeamLogin, setShowTeamLogin] = useState(false);

if (!loggedIn) {
  return (
    <div
      style={{
        ...styles.page,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "42px 44px",
          borderRadius: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          width: 380,
          maxWidth: "92%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: 28,
            fontSize: 30,
            fontWeight: 700,
            color: "#ef4444",
            letterSpacing: -0.5,
          }}
        >
          Login
        </h2>

        {/* Login Options */}
        {!showTeamLogin ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              style={{ ...styles.addBtn, padding: "13px", fontSize: 15, borderRadius: 12 }}
              onClick={() => setShowTeamLogin(true)}
            >
              Login as Team Member
            </button>

            <button
              style={{
                ...styles.addBtn,
                background: "linear-gradient(135deg,#6c5ce7,#7c3aed)",
                padding: "13px",
                fontSize: 15,
                borderRadius: 12,
              }}
              onClick={handleCreatorLogin}
            >
              Login as Creator
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              style={{ ...styles.addBtn, padding: "13px", fontSize: 15, borderRadius: 12 }}
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              style={{
                border: "none",
                background: "transparent",
                color: "#6366f1",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 4,
                fontSize: 14,
              }}
              onClick={() => setShowTeamLogin(false)}
            >
              ← Back to options
            </button>
          </div>
        )}

        {loginError && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {loginError}
          </div>
        )}
      </div>
    </div>
  );
}


  // ---------- Full Dashboard ----------
  return (
    <div style={styles.page}>
      {/* ================= Revenue Dashboard ================= */}
      <section style={styles.revenueWrap}>
      
        <h2 style={styles.sectionTitle}>Revenue Dashboard</h2>
        <div style={styles.filtersRow}>
       <select
  style={styles.input}
  value={monthFilter}
  onChange={e => setMonthFilter(e.target.value)}
>
  <option value="all">All Months</option>
  {[...Array(12)].map((_, i) => (
    <option key={i} value={i.toString()}>
      {new Date(0, i).toLocaleString("default", { month: "long" })}
    </option>
  ))}
</select>
          <select
  style={styles.input}
  value={yearFilter}
  onChange={e => setYearFilter(e.target.value)}
>
  <option value="all">All Years</option>
  {[2024, 2025, 2026, 2027].map(y => (
    <option key={y} value={y.toString()}>
      {y}
    </option>
  ))}
</select>
<div style={{ position: "relative", width: "100%" }}>
  <input
    style={styles.input}
    placeholder="Search Creator"
    value={creatorSearch}
  onChange={(e) => {
  const value = e.target.value;

  setCreatorSearch(value);
  setShowCreatorSuggestions(true);

  // reset creator filter if cleared
  if (value === "") {
    setCreatorFilter("all");
  }
}}
  />

  {showCreatorSuggestions && creatorSearch && (
    <div style={styles.suggestionBox}>
      {creators
        .filter(c =>
          c.name.toLowerCase().includes(creatorSearch.toLowerCase())
        )
        .map(c => (
          <div
            key={c.id}
            style={styles.suggestionItem}
            onClick={() => {
              // setForm(f => ({ ...f, creator: c.name }));
              setCreatorSearch(c.name);
              setCreatorFilter(c.name);  
              setShowCreatorSuggestions(false);
            }}
          >
            {c.name}
          </div>
        ))}
    </div>
  )}
</div>
          <select style={styles.input} value={agencyFilter} onChange={e => setAgencyFilter(e.target.value)}>
            <option value='all'>All Agencies</option>
            {agencies.map((a) => (
  <option key={a.id} value={a.name}>
    {a.name}
  </option>
))}
          </select>
          <select style={styles.input} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value='all'>All Brands</option>
            {brands.map((b) => (
  <option key={b.id} value={b.name}>
    {b.name}
  </option>
))}
          </select>
        </div>

        {/* ================= Summary Cards ================= */}
        <div style={styles.summaryRow}>
       {!hideFinancialSummary && (
  <>
    <div style={styles.summaryCard}>
      <div style={styles.summaryTitle}>Total Revenue</div>
      <div style={styles.summaryValue}>₹{totalRevenue.toLocaleString()}</div>
    </div>

    <div style={styles.summaryCard}>
      <div style={styles.summaryTitle}>Total Profit</div>
      <div style={styles.summaryValue}>₹{totalProfit.toLocaleString()}</div>
    </div>
  </>
)}

          <div style={styles.summaryCard}>
            <div style={styles.summaryTitle}>Campaigns</div>
            <div style={styles.summaryValue}>{totalCampaigns}</div>
          </div>
        </div>
      </section>

      {/* ================= Campaign Manager ================= */}
      <section style={styles.manager}>
        <h2 style={styles.sectionTitle}>Campaign Manager</h2>
        <div style={styles.formRow}>
          <select style={styles.input} value={form.creator} onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}>
            <option value=''>Creator</option>
            {creators.map((c) => (
  <option key={c.id} value={c.name}>
    {c.name}
  </option>
))}
          </select>
          <select style={styles.input} value={form.agency} onChange={e => setForm(f => ({ ...f, agency: e.target.value }))}>
            <option value=''>Agency</option>
      {agencies.map((a) => (
  <option key={a.id} value={a.name}>
    {a.name}
  </option>
))}
          </select>
          <select style={styles.input} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
            <option value=''>Brand</option>
            {brands.map((b) => (
  <option key={b.id} value={b.name}>
    {b.name}
  </option>
))}
          </select>
          <input style={styles.input} placeholder='Amount' value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <input style={styles.input} placeholder='Profit % or ₹' value={form.profitInput} onChange={e => setForm(f => ({ ...f, profitInput: e.target.value }))} />
          <input style={styles.input} type='date' value={form.goLive} onChange={e => setForm(f => ({ ...f, goLive: e.target.value }))} />
          <input style={styles.input} placeholder='Payment terms' value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} />
          <button style={styles.addBtn} onClick={addCampaign}>{editingCard ? 'Update' : 'Add'}</button>
        </div>
        <div style={styles.board}>
         <Column title={<span style={styles.columnTitle}>Upcoming Campaign</span>} colKey='upcoming' />
          <Column title={<span style={styles.columnTitle}>Ongoing Campaign</span>} colKey='ongoing' />
          <Column title={<span style={styles.columnTitle}>Campaign live/Payment Pending</span>} colKey='pending' />
          <Column title={<span style={styles.columnTitle}>Campaign Completed</span>} colKey='done' />
        </div>
      </section>

      {/* ================= Onboard Section ================= */}
      <section style={styles.onboardCentered}>
        <h2 style={styles.sectionTitle}>Onboard</h2>
        <div style={styles.onboardBtnsCentered}>
          <button style={styles.onboardBtn} onClick={() => setShowAgencyModal(true)}>Add Agency</button>
          <button style={styles.onboardBtn} onClick={() => setShowCreatorModal(true)}>Add Creator</button>
          <button style={styles.onboardBtn} onClick={() => setShowBrandModal(true)}>Add Brand</button>
        </div>
      </section>

      {/* ================= Modals ================= */}
 {showCreatorModal && (
<Modal title="Add Creator" onClose={() => setShowCreatorModal(false)}>

  {/* Form Fields FIRST */}
  <input
    style={styles.input}
    placeholder="Name"
    value={newCreator.name}
    onChange={e => setNewCreator({ ...newCreator, name: e.target.value })}
  />
<div style={styles.toggleRow}>
  <span style={{ fontWeight: 600 }}>Show on Homepage?</span>

  <div
    style={{
      ...styles.switch,
      justifyContent:
        newCreator.showOnHomepage === "yes"
          ? "flex-end"
          : "flex-start",
      background:
        newCreator.showOnHomepage === "yes"
          ? "#6366f1"
          : "#d1d5db"
    }}
    onClick={() =>
      setNewCreator({
        ...newCreator,
        showOnHomepage:
          newCreator.showOnHomepage === "yes" ? "no" : "yes"
      })
    }
  >
    <div style={styles.toggleCircle}></div>
  </div>

  <span style={{ fontWeight: 600 }}>
    {newCreator.showOnHomepage === "yes" ? "Yes" : "No"}
  </span>
</div>
<select
  style={styles.input}
  value={newCreator.gender}
  onChange={(e) =>
    setNewCreator({
      ...newCreator,
      gender: e.target.value
    })
  }
>
  <option value="">Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select>
<select
  style={styles.input}
  value={newCreator.genre}
  onChange={(e) =>
    setNewCreator({
      ...newCreator,
      genre: e.target.value
    })
  }
>
  <option value="">Select Genre</option>
  <option value="Fashion, Beauty & Lifestyle">Fashion, Beauty & Lifestyle</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Tech">Tech</option>
  <option value="Fitness">Fitness</option>
  <option value="Comedy">Comedy</option>
  <option value="Food">Food</option>
  <option value="Travel">Travel</option>
</select>
  <input
    style={styles.input}
    placeholder="Location"
    value={newCreator.location}
    onChange={e => setNewCreator({ ...newCreator, location: e.target.value })}
  />

  <input
    style={styles.input}
    placeholder="Contact"
    value={newCreator.contact}
    onChange={e => setNewCreator({ ...newCreator, contact: e.target.value })}
  />
<input
  type="number"
  placeholder="Instagram Followers"
  value={newCreator.instagramFollowers}
  onChange={(e) =>
    setNewCreator({
      ...newCreator,
      instagramFollowers: e.target.value
    })
  }
  style={styles.input}
/>

  {/* Edit Toggle Button BELOW Inputs */}
  <button
    style={styles.editToggleBtn}
    onClick={() => setShowEditCreator(!showEditCreator)}
  >
    {showEditCreator ? "Cancel Editing" : "Edit Existing Creator"}
  </button>

  {/* Dropdown appears when editing */}
{showEditCreator && (
  <div style={{ position: "relative" }}>
    
    <input
      style={styles.input}
      placeholder="Search Creator to Edit"
      value={editCreatorSearch}
      onChange={(e) => {
        setEditCreatorSearch(e.target.value);
        setShowEditCreatorSuggestions(true);
      }}
    />

    {showEditCreatorSuggestions && editCreatorSearch && (
      <div style={styles.suggestionBox}>
        {creators
          .filter((c) =>
            c.name.toLowerCase().includes(editCreatorSearch.toLowerCase())
          )
          .map((c) => (
            <div
              key={c.id}
              style={styles.suggestionItem}
              onClick={() => {
                setEditingCreator(c);

                setNewCreator({
                  name: c.name || "",
                  location: c.location || "",
                  contact: c.contact || "",
                  gender: c.gender || "",
                  genre: c.genre || "",
                  instagramFollowers: c.instagramFollowers || "",
                  showOnHomepage: c.showOnHomepage || "no"
                });

                setEditCreatorSearch(c.name);
                setShowEditCreatorSuggestions(false);
              }}
            >
              {c.name}
            </div>
          ))}
      </div>
    )}

  </div>
)}

  {/* Save Button */}
<button
  style={styles.addBtn}
  onClick={async () => {

    if (!newCreator.name) return;

    // 🔥 Generate creator image path automatically
    const formattedCreator = newCreator.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const creatorImagePath = `/creator-images/${formattedCreator}.jpg`;

    if (editingCreator) {
    await updateDoc(doc(db, "creators", editingCreator.id), {
  name: newCreator.name,
  location: newCreator.location,
  contact: newCreator.contact,
  gender: newCreator.gender,
  genre: newCreator.genre,
  instagramFollowers: followers,
  followerRange: followerRange,
  creatorImage: creatorImagePath,
  showOnHomepage: newCreator.showOnHomepage
});
    } else {


await addDoc(collection(db, "creators"), {
  name: newCreator.name,
  location: newCreator.location,
  contact: newCreator.contact,
  gender: newCreator.gender,
  genre: newCreator.genre,
  instagramFollowers: followers,
  followerRange: followerRange,
  creatorImage: creatorImagePath,
  showOnHomepage: newCreator.showOnHomepage,
  createdAt: new Date()
});
    }

    setEditingCreator(null);
    setShowEditCreator(false);
    setNewCreator({ name: "", location: "", contact: "", gender: "", genre: "", instagramFollowers: "", showOnHomepage: "no" });
    setShowCreatorModal(false);
  }}
>
  {editingCreator ? "Update Creator" : "Save Creator"}
</button>

</Modal>
)}
  {showAgencyModal && (
  <Modal title="Add Agency" onClose={() => setShowAgencyModal(false)}>

    {/* Form Fields */}
    <input
      style={styles.input}
      placeholder="Agency Name"
      value={newAgency.name}
      onChange={e => setNewAgency({ ...newAgency, name: e.target.value })}
    />

    <input
      style={styles.input}
      placeholder="Address"
      value={newAgency.address}
      onChange={e => setNewAgency({ ...newAgency, address: e.target.value })}
    />

    <input
      style={styles.input}
      placeholder="POC Name"
      value={newAgency.pocName}
      onChange={e => setNewAgency({ ...newAgency, pocName: e.target.value })}
    />

    <input
      style={styles.input}
      placeholder="POC Phone"
      value={newAgency.pocPhone}
      onChange={e => setNewAgency({ ...newAgency, pocPhone: e.target.value })}
    />

    {/* Edit Toggle Button */}
    <button
      style={styles.editToggleBtn}
      onClick={() => setShowEditAgency(!showEditAgency)}
    >
      {showEditAgency ? "Cancel Editing" : "Edit Existing Agency"}
    </button>

    {/* Dropdown */}
    {showEditAgency && (
      <select
        style={styles.input}
        onChange={(e) => {
          const selected = agencies.find(a => a.id === e.target.value);
          if (!selected) return;

          setEditingAgency(selected);
          setNewAgency({
            name: selected.name || "",
            address: selected.address || "",
            pocName: selected.pocName || "",
            pocPhone: selected.pocPhone || ""
          });
        }}
      >
        <option value="">Select Agency</option>
        {agencies.map(a => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    )}

    {/* Save Button */}
    <button
      style={styles.addBtn}
      onClick={async () => {
        if (editingAgency) {
          await updateDoc(doc(db, "agencies", editingAgency.id), {
            ...newAgency
          });
        } else {
          await addDoc(collection(db, "agencies"), {
            ...newAgency,
            createdAt: new Date()
          });
        }

        setEditingAgency(null);
        setShowEditAgency(false);
        setNewAgency({
          name: "",
          address: "",
          pocName: "",
          pocPhone: ""
        });
        setShowAgencyModal(false);
      }}
    >
      {editingAgency ? "Update Agency" : "Save Agency"}
    </button>

  </Modal>
)}
    {showBrandModal && (
  <Modal title="Add Brand" onClose={() => setShowBrandModal(false)}>

    {/* Form Fields */}
    <input
      style={styles.input}
      placeholder="Brand Name"
      value={newBrand.name}
      onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
    />

    <input
      style={styles.input}
      placeholder="Brand Type"
      value={newBrand.type}
      onChange={e => setNewBrand({ ...newBrand, type: e.target.value })}
    />

    <select
      style={styles.input}
      value={newBrand.agency}
      onChange={e =>
        setNewBrand({ ...newBrand, agency: e.target.value })
      }
    >
      <option value="">Select Agency</option>
      {agencies.map(a => (
        <option key={a.id} value={a.name}>
          {a.name}
        </option>
      ))}
    </select>

    <input
      style={styles.input}
      placeholder="POC Name"
      value={newBrand.pocName}
      onChange={e => setNewBrand({ ...newBrand, pocName: e.target.value })}
    />

    <input
      style={styles.input}
      placeholder="POC Phone"
      value={newBrand.pocPhone}
      onChange={e => setNewBrand({ ...newBrand, pocPhone: e.target.value })}
    />

    {/* Edit Toggle Button */}
    <button
      style={styles.editToggleBtn}
      onClick={() => setShowEditBrand(!showEditBrand)}
    >
      {showEditBrand ? "Cancel Editing" : "Edit Existing Brand"}
    </button>

    {/* Dropdown */}
    {showEditBrand && (
      <select
        style={styles.input}
        onChange={(e) => {
          const selected = brands.find(b => b.id === e.target.value);
          if (!selected) return;

          setEditingBrand(selected);
          setNewBrand({
            name: selected.name || "",
            type: selected.type || "",
            agency: selected.agency || "",
            pocName: selected.pocName || "",
            pocPhone: selected.pocPhone || ""
          });
        }}
      >
        <option value="">Select Brand</option>
        {brands.map(b => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    )}

    {/* Save Button */}
    <button
      style={styles.addBtn}
      onClick={async () => {
        if (editingBrand) {
          await updateDoc(doc(db, "brands", editingBrand.id), {
            ...newBrand
          });
        } else {
          await addDoc(collection(db, "brands"), {
            ...newBrand,
            createdAt: new Date()
          });
        }

        setEditingBrand(null);
        setShowEditBrand(false);
        setNewBrand({
          name: "",
          type: "",
          agency: "",
          pocName: "",
          pocPhone: ""
        });
        setShowBrandModal(false);
      }}
    >
      {editingBrand ? "Update Brand" : "Save Brand"}
    </button>

  </Modal>
)}
    </div>
  );
}

// ---------- Styles ----------
const styles = {
  page: { padding: 24, background: "linear-gradient(135deg,#eef2ff,#f8fafc)", minHeight: "100vh" },
  sectionTitle: { fontSize: 22, fontWeight: 700, marginBottom: 16 },
  revenueWrap: { marginBottom: 40 },
  filtersRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  manager: { marginBottom: 40 },
  formRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 },
  input: { padding: 10, borderRadius: 8, border: "1px solid #ddd", marginBottom: 8, width: "100%" },
  addBtn: { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", width: "100%" },
  board: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 },
  column: { background: "#ffffffcc", padding: 12, borderRadius: 12, minHeight: 0 },
  card: { position: "relative", background: "#fff", padding: 12, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 10 },
  completedTag: { position: "absolute", top: 12, left: 8, background: "#16a34a", color: "#fff", fontSize: 11, padding: "2px 6px", borderRadius: 999 },
  cardTitle: { fontWeight: 600, color:"#6366f1" },
  meta: { fontSize: 12, color: "#555" },
  actions: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" },
  navBtn: { background: "#eee", border: "none", padding: "4px 8px", borderRadius: 6, cursor: "pointer" },
  nextBtn: { background: "#6366f1", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer" },
  editBtn: { background: "#f59e0b", color: "#fff", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer" },
  // delete: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer" },
  onboardCentered: { marginTop: 30, textAlign: "center" },
  onboardBtnsCentered: { display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" },
  onboardBtn: { padding: 12, borderRadius: 10, border: "none", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: 600 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: "#fff", borderRadius: 16, width: 360, maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #eee" },
  modalContent: { padding: 20, display: "flex", flexDirection: "column", gap: 10 },
  closeBtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18 },
  monthGroup: { marginBottom: 10, background: "#f1f5f9", borderRadius: 8, padding: 6 },
  monthSummary: { cursor: "pointer", fontWeight: 600, padding: 6, color: "#008478" },
  summaryRow: { display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", justifyContent: "space-between" },
  summaryCard: { flex: "1 1 150px", borderRadius: 16, padding: 24, textAlign: "center", color: "#fff", background: "linear-gradient(15deg, #6366f1, #6366f1)" },
  summaryTitle: { fontSize: 14, fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  summaryValue: { fontSize: 26, fontWeight: 700 },
//   columnTitle: {color: "#008478"}
  pendingDaysTag: {position: "absolute",top: 10,left: 8,background: "#ef4444", color: "#fff",fontSize: 10,padding: "3px 7px",borderRadius: 999,fontWeight: 600}, 
  editToggleBtn: {
  backgroundColor: "#111827",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  marginBottom: 12
},
cardContent: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginTop: 20,
  marginBottom: 10     // pushes content below badge
},

cardLeft: {
  flex: 1
},

logoWrapper: {
  minWidth: 60,
  display: "flex",
  justifyContent: "flex-end"
},

brandImage: {
  width: 35,
  height: 35,
  // objectFit: "contain",
  borderRadius: 20
},
suggestionBox: {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  maxHeight: 180,
  overflowY: "auto",
  zIndex: 100
},

suggestionItem: {
  padding: 10,
  cursor: "pointer",
  borderBottom: "1px solid #eee"
},

yearGroup: {
  marginBottom: 12,
  background: "#e2e8f0",
  borderRadius: 10,
  padding: 6
},

yearSummary: {
  cursor: "pointer",
  fontWeight: 700,
  padding: 8,
  color: "#1e293b",
  fontSize: 14
},

modalTitle: {
  fontSize: "20px",
  fontWeight: 700,
  marginBottom: 18
},

formGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12
},

toggleRow: {
  marginTop: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
},

modalActions: {
  marginTop: 20,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10
},

saveBtn: {
  background: "#111",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer"
},

cancelBtn: {
  background: "#eee",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer"
},

switch: {
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: 46,
  height: 24,
  borderRadius: 24,
  background: "#d1d5db",
  cursor: "pointer",
  padding: 3,
  transition: "0.2s"
},

slider: {
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "100%",
  borderRadius: 24,
  transition: "0.2s"
},

toggleCircle: {
  width: 18,
  height: 18,
  background: "#fff",
  borderRadius: "50%",
  transition: "0.2s"
}};
