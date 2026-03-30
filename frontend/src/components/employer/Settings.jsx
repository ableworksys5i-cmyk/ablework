import React from 'react';

function Settings({ settings, onUpdateSettings, onChangePassword }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>⚙️ Settings</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Password Change */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>🔒 Change Password</h3>
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            <input
              type="password"
              placeholder="New Password"
              value={settings.newPassword}
              onChange={e => onUpdateSettings("newPassword", e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={settings.confirmPassword}
              onChange={e => onUpdateSettings("confirmPassword", e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <button
              onClick={onChangePassword}
              style={{ padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              🔄 Update Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>🎛️ Preferences</h3>
          <div style={{ display: "grid", gap: "20px", marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>Email Notifications</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Receive updates about applications</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={e => onUpdateSettings("notifications", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.notifications ? "#28a745" : "#ccc",
                  transition: ".4s",
                  borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute",
                    height: "18px",
                    width: "18px",
                    left: "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: ".4s",
                    borderRadius: "50%",
                    transform: settings.notifications ? "translateX(26px)" : "translateX(0px)"
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>Application Alerts</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Get notified of new applications</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={e => onUpdateSettings("emailAlerts", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.emailAlerts ? "#28a745" : "#ccc",
                  transition: ".4s",
                  borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute",
                    height: "18px",
                    width: "18px",
                    left: "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: ".4s",
                    borderRadius: "50%",
                    transform: settings.emailAlerts ? "translateX(26px)" : "translateX(0px)"
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;