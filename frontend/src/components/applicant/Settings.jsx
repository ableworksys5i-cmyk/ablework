import React from 'react';
import './Settings.css';

function Settings({ settings, onUpdateSettings, onChangePassword, onDeleteAccount }) {
  return (
    <div className="settings-root">
      <h2>⚙️ Settings</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        {/* Password Change */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>🔒 Change Password</h3>
          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            <input
              type="password"
              placeholder="Current Password"
              value={settings.currentPassword}
              onChange={e => onUpdateSettings("currentPassword", e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
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

        {/* Notification Preferences */}
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>🔔 Notification Preferences</h3>
          <div style={{ display: "grid", gap: "20px", marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>Email Notifications</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Receive job alerts and updates</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={e => onUpdateSettings("emailNotifications", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.emailNotifications ? "#28a745" : "#ccc",
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
                    transform: settings.emailNotifications ? "translateX(26px)" : "translateX(0px)"
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>Application Updates</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Get notified when applications are viewed</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.applicationUpdates}
                  onChange={e => onUpdateSettings("applicationUpdates", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.applicationUpdates ? "#28a745" : "#ccc",
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
                    transform: settings.applicationUpdates ? "translateX(26px)" : "translateX(0px)"
                  }}></span>
                </span>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0" }}>Job Recommendations</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Receive personalized job matches</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={settings.jobRecommendations}
                  onChange={e => onUpdateSettings("jobRecommendations", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.jobRecommendations ? "#28a745" : "#ccc",
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
                    transform: settings.jobRecommendations ? "translateX(26px)" : "translateX(0px)"
                  }}></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginTop: "20px" }}>
        <h3>🔒 Privacy Settings</h3>
        <div style={{ display: "grid", gap: "20px", marginTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0" }}>Profile Visibility</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Allow employers to view your profile</p>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
              <input
                type="checkbox"
                checked={settings.profileVisibility}
                onChange={e => onUpdateSettings("profileVisibility", e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.profileVisibility ? "#28a745" : "#ccc",
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
                  transform: settings.profileVisibility ? "translateX(26px)" : "translateX(0px)"
                }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 5px 0" }}>Resume Downloads</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Allow employers to download your resume</p>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
              <input
                type="checkbox"
                checked={settings.resumeDownloads}
                onChange={e => onUpdateSettings("resumeDownloads", e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.resumeDownloads ? "#28a745" : "#ccc",
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
                  transform: settings.resumeDownloads ? "translateX(26px)" : "translateX(0px)"
                }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ border: "2px solid #dc3545", borderRadius: "12px", padding: "20px", backgroundColor: "#fceaea", marginTop: "20px" }}>
        <h3 style={{ color: "#dc3545", margin: "0 0 15px 0" }}>⚠️ Danger Zone</h3>
        <p style={{ margin: "0 0 20px 0", color: "#666" }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={onDeleteAccount}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🗑️ Delete Account
        </button>
      </div>
    </div>
  );
}

export default Settings;