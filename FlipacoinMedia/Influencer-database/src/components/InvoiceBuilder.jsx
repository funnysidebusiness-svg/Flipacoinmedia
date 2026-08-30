import React, { useState, useEffect } from "react";
import {
  doc,
  runTransaction,
  setDoc,
  serverTimestamp,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import html2pdf from "html2pdf.js";

export default function InvoiceBuilder({ creatorName, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [creatorDocRef, setCreatorDocRef] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    creatorName: creatorName || "",
    creatorAddress: "",
    deliverables: "",
    quantity: 1,
    rate: "",
    campaignDate: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankPan: ""
  });

  const subtotal =
    Number(invoiceData.quantity || 0) *
    Number(invoiceData.rate || 0);

  const tax = 0;
  const total = subtotal + tax;

  // 🔥 FETCH CREATOR PROFILE BY name FIELD
  useEffect(() => {
    const fetchCreatorDetails = async () => {
      if (!creatorName) return;

      try {
        const q = query(
          collection(db, "creators"),
          where("name", "==", creatorName)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const creatorDoc = snapshot.docs[0];
          const data = creatorDoc.data();

          setCreatorDocRef(creatorDoc.ref);

          setInvoiceData(prev => ({
            ...prev,
            creatorAddress: data.address || "",
            bankName: data.bankDetails?.bankName || "",
            accountHolder: data.bankDetails?.accountHolder || "",
            accountNumber: data.bankDetails?.accountNumber || "",
            ifsc: data.bankDetails?.ifsc || "",
            bankPan: data.bankDetails?.pan || ""
          }));
        }
      } catch (error) {
        console.error("Error fetching creator:", error);
      }
    };

    fetchCreatorDetails();
  }, [creatorName]);

  // 🔥 INVOICE COUNTER
  const generateInvoiceNumber = async () => {
    const today = new Date();
    const todayString = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    const counterRef = doc(db, "counters", "invoiceCounter");

    return await runTransaction(db, async transaction => {
      const counterDoc = await transaction.get(counterRef);
      let newNumber = 1;

      if (counterDoc.exists()) {
        const data = counterDoc.data();
        if (data.date === todayString) {
          newNumber = data.lastNumber + 1;
        }
      }

      transaction.set(counterRef, {
        date: todayString,
        lastNumber: newNumber
      });

      return `${todayString}${String(newNumber).padStart(2, "0")}`;
    });
  };

  const handleGenerateInvoice = async () => {
    try {
      const newInvoiceNumber = await generateInvoiceNumber();

      const finalInvoiceData = {
        ...invoiceData,
        invoiceNumber: newInvoiceNumber,
        subtotal,
        tax,
        total,
        createdAt: serverTimestamp()
      };

      await setDoc(
        doc(db, "invoices", newInvoiceNumber),
        finalInvoiceData
      );

      // Save updated creator profile
      if (creatorDocRef) {
        await updateDoc(creatorDocRef, {
          address: invoiceData.creatorAddress,
          bankDetails: {
            bankName: invoiceData.bankName,
            accountHolder: invoiceData.accountHolder,
            accountNumber: invoiceData.accountNumber,
            ifsc: invoiceData.ifsc,
            pan: invoiceData.bankPan
          }
        });
      }

      setInvoiceData(finalInvoiceData);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Something went wrong.");
    }
  };

  const handleDownload = () => {
    const element = document.getElementById("print-area");

    const opt = {
      margin: 10,
      filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {!showPreview ? (
          <>
            <h2>Create Invoice</h2>

            {/* CREATOR NAME */}
            <h4 style={styles.formSectionTitle}>Creator</h4>
            <input
              style={styles.input}
              value={invoiceData.creatorName}
              readOnly
            />

            {/* CAMPAIGN DETAILS */}
 {/* CAMPAIGN DETAILS */}
<div style={styles.sectionCard}>
  <h4 style={styles.formSectionTitle}>Campaign Details</h4>

  <div style={styles.row}>
    
    {/* Deliverables - Full Width */}
    <div style={styles.colFull}>
      <input
        style={styles.input}
        placeholder="Deliverables (e.g. 2 Instagram Reels)"
        onChange={e =>
          setInvoiceData({
            ...invoiceData,
            deliverables: e.target.value
          })
        }
      />
    </div>

    {/* Quantity */}
    <div style={styles.colHalf}>
      <input
        style={styles.input}
        type="number"
        placeholder="Quantity"
        onChange={e =>
          setInvoiceData({
            ...invoiceData,
            quantity: e.target.value
          })
        }
      />
    </div>

    {/* Rate */}
    <div style={styles.colHalf}>
      <input
        style={styles.input}
        type="number"
        placeholder="Rate (₹)"
        onChange={e =>
          setInvoiceData({
            ...invoiceData,
            rate: e.target.value
          })
        }
      />
    </div>

    {/* Campaign Date - Full Width */}
    <div style={styles.colFull}>
      <input
        type="date"
        style={styles.input}
        onChange={e =>
          setInvoiceData({
            ...invoiceData,
            campaignDate: e.target.value
          })
        }
      />
    </div>

  </div>
</div>

            {/* FETCH BUTTON */}
            {!showDetails && (
              <button
                style={styles.primaryBtn}
                onClick={() => setShowDetails(true)}
              >
                Fetch Saved Details
              </button>
            )}

            {/* EXPANDABLE SECTION */}
            {showDetails && (
              <>
                <h4 style={styles.formSectionTitle}>
                  Saved Address & Bank Details
                </h4>

                <input
                  style={styles.input}
                  placeholder="Creator Address"
                  value={invoiceData.creatorAddress}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      creatorAddress: e.target.value
                    })
                  }
                />

                <input
                  style={styles.input}
                  placeholder="Bank Name"
                  value={invoiceData.bankName}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      bankName: e.target.value
                    })
                  }
                />

                <input
                  style={styles.input}
                  placeholder="Account Holder"
                  value={invoiceData.accountHolder}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      accountHolder: e.target.value
                    })
                  }
                />

                <input
                  style={styles.input}
                  placeholder="Account Number"
                  value={invoiceData.accountNumber}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      accountNumber: e.target.value
                    })
                  }
                />

                <input
                  style={styles.input}
                  placeholder="IFSC"
                  value={invoiceData.ifsc}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      ifsc: e.target.value
                    })
                  }
                />

                <input
                  style={styles.input}
                  placeholder="PAN"
                  value={invoiceData.bankPan}
                  disabled={!editMode}
                  onChange={e =>
                    setInvoiceData({
                      ...invoiceData,
                      bankPan: e.target.value
                    })
                  }
                />

                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Save Changes" : "Edit Details"}
                </button>
              </>
            )}

            <button
              style={styles.primaryBtn}
              onClick={handleGenerateInvoice}
            >
              Generate Invoice
            </button>

            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </>
        ) : (
          <>
              {/* KEEP YOUR EXISTING PREVIEW JSX HERE */}
            
           <div id="print-area" style={styles.invoiceContainer}>
              <div style={styles.invoiceBox}>
                <div style={styles.invoiceHeader}>
                  <div>
                    <h1 style={styles.invoiceTitle}>INVOICE</h1>
                    <p style={styles.invoiceNumber}>
                      #{invoiceData.invoiceNumber}
                    </p>
                  </div>

                  <div style={styles.dateBox}>
                    <p style={styles.address}>
                      <strong>Date</strong>
                    </p>
                    <p style={styles.address}>{invoiceData.campaignDate}</p>
                  </div>
                </div>

                <hr style={styles.divider} />

                <div style={styles.sectionRow}>
                  <div>
                    <h4 style={styles.sectionTitle}>From</h4>
                    <p style={styles.bold}>
                      {invoiceData.creatorName}
                    </p>
                    <p style={styles.address}>{invoiceData.creatorAddress}</p>
                  </div>

                  <div>
                    <h4 style={styles.sectionTitle}>Bill To</h4>
                    <p style={styles.bold}>
                      Frenzied Mind Entertainment Private Limited
                    </p>
                    <p style={styles.address}>401 B Guru Ganesh CHS, Mahatma Phule cross road, </p>
                    <p style={styles.address}>Mulund East, Mumbai,</p>
                    <p style={styles.address}>Maharashtra, India - 400081</p>
                    <p style={styles.address}>GSTIN: 27AADCF8680M1ZZ</p>
                    <p style={styles.address}>PAN: AADCF8680M</p>
                  </div>
                </div>

                <hr style={styles.divider} />

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Item</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Rate</th>
                      <th style={styles.th}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}>
                        {invoiceData.deliverables}
                      </td>
                      <td style={styles.td}>
                        {invoiceData.quantity}
                      </td>
                      <td style={styles.td}>
                        ₹{Number(invoiceData.rate).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        ₹{subtotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={styles.totalBox}>
                  <p>Subtotal: ₹{subtotal.toLocaleString()}</p>
                  <p>Tax (0%): ₹0</p>
                  <h2 style={styles.totalAmount}>
                    Total: ₹{total.toLocaleString()}
                  </h2>
                </div>

                <hr style={styles.divider} />

                <div style={styles.notes}>
                  <h4 style={styles.bold}>Bank Details</h4>
                  <p style={styles.address}>{invoiceData.bankName}</p>
                  <p style={styles.address}>Account Holder: {invoiceData.accountHolder}</p>
                  <p style={styles.address}>Account Number: {invoiceData.accountNumber}</p>
                  <p style={styles.address}>IFSC Code: {invoiceData.ifsc}</p>
                  <p style={styles.address}>PAN: {invoiceData.bankPan}</p>
                </div>
              </div>
            </div>

      <button
              style={styles.primaryBtn}
              onClick={handleDownload}
            >
              Download Invoice
            </button>

            <button
              style={styles.cancelBtn}
              onClick={() => setShowPreview(false)}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );

}
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000
  },

  modal: {
    background: "#ffffff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 900,
    maxHeight: "95vh",
    overflowY: "auto",
    padding: 40,
    boxShadow: "0 25px 60px rgba(0,0,0,0.15)"
  },

  formSectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 12,
    marginTop: 30,
    letterSpacing: 0.3
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 16,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s ease",
    background: "#f9fafb"
  },

  primaryBtn: {
    width: "100%",
    padding: 14,
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 20,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s ease"
  },

  cancelBtn: {
    width: "100%",
    padding: 12,
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    cursor: "pointer",
    marginTop: 10,
    fontSize: 14
  },

  sectionCard: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #f1f5f9",
    marginBottom: 20
  },

  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap"
  },

  colHalf: {
    flex: "1 1 48%"
  },

  colFull: {
    flex: "1 1 100%"
  },

  /* ---------------- INVOICE PREVIEW ---------------- */

  invoiceContainer: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 40
  },

  invoiceBox: {
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    color: "#111827",
    fontSize: 13,
    lineHeight: 1.6
  },

  invoiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },

  invoiceTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: 1
  },

  invoiceNumber: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280"
  },

  dateBox: {
    textAlign: "right",
    fontSize: 13,
    color: "#6b7280"
  },

  divider: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #e5e7eb"
  },

  sectionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 40,
    flexWrap: "wrap"
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
  },

  th: {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: 13,
    fontWeight: 600,
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb"
  },

  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13
  },

  totalBox: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 14
  },

  totalAmount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 600
  },

  notes: {
    marginTop: 30,
    fontSize: 13,
    color: "#374151"
  },

  address: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4
},

bold: {
  fontSize: 13,
  color: "#374151",
  marginBottom: 4,
  marginTop: 0,
  fontWeight: 600,
}
};