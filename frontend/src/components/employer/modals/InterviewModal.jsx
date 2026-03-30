import React from 'react';

const InterviewModal = ({
  selectedApplicant,
  interviewForm,
  setInterviewForm,
  setShowInterviewModal,
  handleScheduleInterview
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
        <h3>📅 Schedule Interview - {selectedApplicant.applicant_name}</h3>
        <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Interview Date:</label>
            <input
              type="date"
              value={interviewForm.interview_date}
              onChange={e => setInterviewForm({...interviewForm, interview_date: e.target.value})}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Interview Time:</label>
            <input
              type="time"
              value={interviewForm.interview_time}
              onChange={e => setInterviewForm({...interviewForm, interview_time: e.target.value})}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Interview Type:</label>
            <select
              value={interviewForm.interview_type}
              onChange={e => setInterviewForm({...interviewForm, interview_type: e.target.value})}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Additional Notes:</label>
            <textarea
              value={interviewForm.notes}
              onChange={e => setInterviewForm({...interviewForm, notes: e.target.value})}
              placeholder="Add any notes about the interview..."
              rows={3}
              style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              setShowInterviewModal(false);
              setInterviewForm({
                interview_date: "",
                interview_time: "",
                interview_type: "video",
                notes: ""
              });
            }}
            style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleInterview}
            style={{ padding: "10px 20px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            📅 Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;