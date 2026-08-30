import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import InvoiceBuilder from "../components/InvoiceBuilder";

export default function CreatorLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedInCreator, setLoggedInCreator] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);

  // ================= LOGIN =================
  const handleCreatorLogin = async () => {
    if (!name || !password) {
      setError("Enter username and password");
      return;
    }

    try {
      const q = query(
        collection(db, "creators"),
        where("name", "==", name),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid credentials");
        return;
      }

      const creator = querySnapshot.docs[0].data();
      setLoggedInCreator(creator.name);
      setError("");

    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  // ================= FETCH CAMPAIGNS =================
useEffect(() => {
  if (!loggedInCreator) return;

  const fetchCampaigns = async () => {
    try {
      const q = query(
        collection(db, "campaigns"),
        where("creator", "==", loggedInCreator)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // console.log("Campaigns fetched:", data); // ✅ DEBUG HERE

      setCampaigns(data);

    } catch (err) {
      console.error("Error loading campaigns:", err);
    }
  };

  fetchCampaigns();
}, [loggedInCreator]);


  // ================= LOGOUT =================
  const handleLogout = () => {
    setLoggedInCreator(null);
    setName("");
    setPassword("");
    setCampaigns([]);
  };


  // ================= LOGIN SCREEN =================
  if (!loggedInCreator) {
    return (
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <h2 style={{ marginBottom: 16 }}>Creator Login</h2>

          <input
            style={styles.input}
            placeholder="Enter username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.loginBtn} onClick={handleCreatorLogin}>
            Login
          </button>

          {error && <div style={styles.error}>{error}</div>}

          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

// ================= DASHBOARD =================
const liveCampaigns = campaigns.filter(c => c.col !== "done");
const completedCampaigns = campaigns.filter(c => c.col === "done");


const calculateNet = (amount, profit) => {
  const a = Number(amount || 0);
  const p = Number(profit || 0);
  return a - p;
};
const getPaymentStatus = (campaign) => {
  if (campaign.col === "done") {
    return {
      text: "Completed",
      style: styles.badgeCompleted
    };
  }

  return {
    text: "Pending From The Client",
    style: styles.meta
  };
};
return (
  
  <div style={styles.wrapper}>
  <style>
      {`
        @media (max-width: 768px) {

          .main-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 30px;
          }

          .header-buttons {
            width: 100%;
            flex-direction: column !important;
          }

          .header-buttons button {
            width: 100%;
          }
        }
      `}
    </style>
    {/* HEADER */}
    
   <div style={styles.header} className="main-header">
      
      <div style={styles.profile}>
        <div style={styles.avatar}>{loggedInCreator[0]}</div>
        <div>
          <div style={styles.welcome}>Welcome Back,</div>
          <h2 style={styles.name}>{loggedInCreator}</h2>
        </div>
      </div>
      {/* <button style={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button> */}

       <div style={{ display: "flex", gap: 10 }} className="header-buttons">
  <button
    style={styles.invoiceBtn}
    onClick={() => setShowInvoiceBuilder(true)}
  >
    Invoice Builder
  </button>

  <button style={styles.logoutBtn} onClick={handleLogout}>
    Logout
  </button>
</div>
    </div>

    {/* LIVE CAMPAIGNS */}
    
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Live Campaigns</h3>
        <div style={styles.counter}>{liveCampaigns.length}</div>
      </div>
 
      <div style={styles.grid}>
        {liveCampaigns.map(c => (
          <div key={c.id} style={styles.cardLive}>
            <div style={styles.cardTop}>
           
              <img
                  src={c.brandImage}
                alt="brand"
                style={styles.brandImage}
              />
              <div>
                <div style={styles.brand}>{c.brand}</div>
                <div style={styles.statusLive}>{c.campaignLocked}</div>
              </div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.metric}>
                <span style={styles.label}>Net Earnings:</span>
                <span style={styles.value}>
                  ₹{calculateNet(c.amount, c.profit).toLocaleString()}
                </span>
              </div>

              <div style={styles.metric}>
                <span style={styles.label}> Go Live Date:</span>
                   <span style={styles.meta}>
                  {c.goLive || "N/A"}
                </span>
             
              </div>
               <div style={styles.metric}>
  <span style={styles.label}>Payment Status</span>
  <span style={getPaymentStatus(c).style}>
    {getPaymentStatus(c).text}
  </span>
</div>
            </div>
          </div>
        ))}
      
      </div>
    </div>

    {/* COMPLETED CAMPAIGNS */}
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Completed Campaigns:</h3>
        <div style={styles.counterGreen}>{completedCampaigns.length}</div>
      </div>

      <div style={styles.grid}>
{completedCampaigns.map(c => (
  <div key={c.id} style={styles.cardCompleted}>
    <div style={styles.cardTop}>
      <img
        src={c.brandImage}
        alt="brand"
        style={styles.brandImage}
      />
      <div>
        <div style={styles.brand}>{c.brand}</div>
        <div style={styles.badgeCompleted}>
          Completed
        </div>
      </div>
    </div>

    <div style={styles.cardBody}>
      <div style={styles.metric}>
        <span style={styles.label}>Net Earnings:</span>
        <span style={styles.valueGreen}>
          ₹{calculateNet(c.amount, c.profit).toLocaleString()}
        </span>
      </div>

      <div style={styles.metric}>
        <span style={styles.label}>Go Live Date:</span>
        <span style={styles.meta}>
          {c.goLive || "N/A"}
        </span>
      </div>

      <div style={styles.metric}>
        <span style={styles.label}>Payment Status:</span>
        <span style={styles.meta}>
          Received
        </span>
      </div>
    </div>
  </div>
))}
      </div>
    </div>
{showInvoiceBuilder && (
  <InvoiceBuilder
    creatorName={loggedInCreator}
    onClose={() => setShowInvoiceBuilder(false)}
  />
)}
  </div>
);
}

// ================= STYLES =================
const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#eef2ff,#f8fafc)", padding: 20 },
  pageDashboard: { minHeight: "100vh", background: "linear-gradient(135deg,#eef2ff,#f8fafc)", padding: "40px 24px", maxWidth: 1100, margin: "0 auto" },
  headerGlass: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderRadius: 18, marginBottom: 28, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  // avatar: { width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 },
  // welcome: { fontSize: 12, color: "#6b7280" },
  creator: { margin: 0, fontSize: 20, color: "#6366f1" },
  loginBox: { background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", width: 340, textAlign: "center" },
  input: { width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14 },
  loginBtn: { width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 15 },
  backBtn: { marginTop: 12, background: "transparent", border: "none", color: "#6366f1", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  // logoutBtn: { padding: "10px 16px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 },
  error: { color: "#ef4444", marginTop: 8, fontSize: 13 },
  sectionCard: { background: "#ffffffcc", borderRadius: 20, padding: 22, marginBottom: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" },
  // sectionTitle: { fontSize: 18, fontWeight: 700, color: "#6366f1" },
  wrapper: {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  padding: "50px 30px",
  maxWidth: 1200,
  margin: "0 auto"
},
header: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 50
},
profile: {
  display: "flex",
  alignItems: "center",
  gap: 15
},
avatar: {
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 20
},
welcome: {
  fontSize: 16,
  color: "purple",
  fontWeight: 700,
},
name: {
  margin: 0,
  color: "#111827"
},
section: {
  marginBottom: 60
},
sectionHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25
},
sectionTitle: {
  fontSize: 20,
  fontWeight: 700,
  color: "#1f2937"
},
counter: {
  background: "#6366f1",
  color: "#fff",
  borderRadius: 20,
  padding: "5px 14px",
  fontWeight: 600
},
counterGreen: {
  background: "#10b981",
  color: "#fff",
  borderRadius: 20,
  padding: "5px 14px",
  fontWeight: 600
},
grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 25
},
cardLive: {
  background: "#ffffff",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 15px 35px rgba(99,102,241,0.15)",
  transition: "0.2s ease"
},
cardCompleted: {
  background: "#ffffff",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 15px 35px rgba(99,102,241,0.15)",
  transition: "0.2s ease"
},
cardTop: {
  display: "flex",
  alignItems: "center",
  gap: 15,
  marginBottom: 18
},
brandImage: {
  width: 50,
  height: 50,
  borderRadius: "50%",
  objectFit: "cover"
},
brand: {
  fontWeight: 700,
  fontSize: 16
},
statusLive: {
  fontSize: 12,
  color: "#f59e0b"
},
statusDone: {
  fontSize: 12,
  color: "#16a34a"
},
cardBody: {
  display: "flex",
  flexDirection: "column",
  gap: 10
},
metric: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
},
label: {
  fontSize: 13,
  color: "purple",
  fontWeight: 700,
},
value: {
  fontWeight: 700,
  color: "darkgreen"
},
valueGreen: {
  fontWeight: 700,
  color: "#006400"
},
meta: {
  fontSize: 13,
  color: "#6b7280"
},
logoutBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
},
badgeCompleted: {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  display: "inline-block"
},

badgePending: {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  display: "inline-block"
},

invoiceBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  background: "#10b981",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
},
};