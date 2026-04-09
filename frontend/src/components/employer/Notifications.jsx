import React from 'react';

function Notifications({ notifications, onDeleteNotification }) {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "40px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        notifications.map(notification => (
          <div key={notification.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "10px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                  {notification.type === "application" && "📄 "}
                  {notification.type === "reminder" && "⏰ "}
                  {notification.title || notification.message}
                </h4>
                {notification.title && notification.message !== notification.title && (
                  <p style={{ margin: "0 0 5px 0", color: "#666" }}>{notification.message}</p>
                )}
                <small style={{ color: "#666" }}>{notification.date}</small>
              </div>
              <button
                onClick={() => onDeleteNotification(notification.id)}
                style={{ padding: "4px 8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;