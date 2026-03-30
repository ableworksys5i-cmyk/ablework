import React from 'react';

function AnalyticsModal({ isOpen, onClose, analytics, timeRange, onTimeRangeChange }) {
  if (!isOpen) return null;

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "1000px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0 }}>📊 Detailed Analytics</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>

        {/* Time Range Selector */}
        <div style={{ marginBottom: "30px" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Time Range:</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {timeRanges.map(range => (
              <button
                key={range.value}
                onClick={() => onTimeRangeChange(range.value)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: timeRange === range.value ? "#007bff" : "#f8f9fa",
                  color: timeRange === range.value ? "white" : "#333",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {/* Application Trends */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>📈 Application Trends</h3>
            <div style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>This period:</span>
                <span style={{ fontWeight: "bold", color: "#28a745" }}>+{analytics.applicationGrowth}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Total applications:</span>
                <span style={{ fontWeight: "bold" }}>{analytics.totalApplications}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Average per day:</span>
                <span style={{ fontWeight: "bold" }}>{analytics.avgApplicationsPerDay}</span>
              </div>
            </div>
          </div>

          {/* Job Performance */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>💼 Job Performance</h3>
            <div style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Most popular job:</span>
                <span style={{ fontWeight: "bold" }}>{analytics.topJob}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Average time to hire:</span>
                <span style={{ fontWeight: "bold" }}>{analytics.avgTimeToHire} days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Fill rate:</span>
                <span style={{ fontWeight: "bold", color: "#28a745" }}>{analytics.fillRate}%</span>
              </div>
            </div>
          </div>

          {/* Candidate Quality */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>👥 Candidate Quality</h3>
            <div style={{ display: "grid", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Average experience:</span>
                <span style={{ fontWeight: "bold" }}>{analytics.avgExperience} years</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Skills match rate:</span>
                <span style={{ fontWeight: "bold", color: "#007bff" }}>{analytics.skillsMatchRate}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Qualified candidates:</span>
                <span style={{ fontWeight: "bold", color: "#28a745" }}>{analytics.qualifiedCandidates}%</span>
              </div>
            </div>
          </div>

          {/* Hiring Funnel */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>🎯 Hiring Funnel</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {analytics.funnel.map((stage, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{stage.name}:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "100px",
                      height: "8px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${stage.percentage}%`,
                        height: "100%",
                        backgroundColor: stage.color,
                        borderRadius: "4px"
                      }}></div>
                    </div>
                    <span style={{ fontWeight: "bold", minWidth: "40px" }}>{stage.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>🛠️ Top Skills in Demand</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {analytics.topSkills.map((skill, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{skill.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "80px",
                      height: "6px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "3px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${skill.percentage}%`,
                        height: "100%",
                        backgroundColor: "#007bff",
                        borderRadius: "3px"
                      }}></div>
                    </div>
                    <span style={{ fontWeight: "bold", minWidth: "30px" }}>{skill.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0" }}>🌍 Geographic Distribution</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {analytics.locations.map((location, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{location.city}, {location.state}</span>
                  <span style={{ fontWeight: "bold" }}>{location.count} applications</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsModal;