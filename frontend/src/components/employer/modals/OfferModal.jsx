import React from 'react';

const OfferModal = ({
  selectedApplicant,
  offerForm,
  setOfferForm,
  setShowOfferModal,
  handleSendJobOffer
}) => {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "30px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto"
      }}>
        <h3>💼 Send Job Offer - {selectedApplicant.applicant_name}</h3>
        <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Offered Salary:</label>
            <input
              type="number"
              value={offerForm.offer_salary}
              onChange={e => setOfferForm({...offerForm, offer_salary: e.target.value})}
              placeholder="e.g., 50000"
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Benefits:</label>
            <textarea
              value={offerForm.offer_benefits}
              onChange={e => setOfferForm({...offerForm, offer_benefits: e.target.value})}
              placeholder="List benefits (health insurance, 401k, vacation days, etc.)"
              rows={2}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Expected Joining Date:</label>
            <input
              type="date"
              value={offerForm.joining_date}
              onChange={e => setOfferForm({...offerForm, joining_date: e.target.value})}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Additional Offer Details:</label>
            <textarea
              value={offerForm.offer_letter}
              onChange={e => setOfferForm({...offerForm, offer_letter: e.target.value})}
              placeholder="Add any additional offer details or terms..."
              rows={3}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              setShowOfferModal(false);
              setOfferForm({
                offer_salary: "",
                offer_benefits: "",
                joining_date: "",
                offer_letter: ""
              });
            }}
            style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSendJobOffer}
            style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            💼 Send Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;