import React from 'react';
import './Notifications.css';

function Notifications({ notifications, onMarkAsRead, onDeleteNotification }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_update': return '📋';
      case 'interview_invite': return '📅';
      case 'job_match': return '🎯';
      case 'application_viewed': return '👀';
      case 'offer': return '🎉';
      case 'rejection': return '💭';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application_update': return '#007bff';
      case 'interview_invite': return '#28a745';
      case 'job_match': return '#ffc107';
      case 'application_viewed': return '#17a2b8';
      case 'offer': return '#28a745';
      case 'rejection': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="notifications-root">
      <h2>🔔 Notifications</h2>

      {/* Notification Stats */}
      <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 5px 0" }}>📬 Inbox Summary</h3>
            <p style={{ margin: 0, color: "#666" }}>
              {notifications.length} total notifications • {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => notifications.filter(n => !n.read).forEach(n => onMarkAsRead(n.id))}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: "grid", gap: "15px" }}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div
              key={index}
              style={{
                border: "2px solid #333",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: notification.read ? "#f9f9f9" : "#e7f3ff",
                borderLeft: `5px solid ${getNotificationColor(notification.type)}`,
                position: "relative"
              }}
            >
              {!notification.read && (
                <div style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#007bff",
                  borderRadius: "50%"
                }}></div>
              )}

              <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                <div style={{
                  fontSize: "2rem",
                  color: getNotificationColor(notification.type),
                  flexShrink: 0
                }}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1.2rem" }}>{notification.title}</h4>
                  <p style={{ margin: "0 0 10px 0", color: "#555", lineHeight: "1.5" }}>
                    {notification.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        📅 {new Date(notification.date).toLocaleDateString()} at {new Date(notification.date).toLocaleTimeString()}
                      </span>
                      {notification.jobTitle && (
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          💼 {notification.jobTitle}
                        </span>
                      )}
                      {notification.company && (
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          🏢 {notification.company}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification(notification.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons for specific notification types */}
              {notification.type === 'interview_invite' && notification.actions && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ✅ Accept Interview
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ❌ Decline
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      📅 Reschedule
                    </button>
                  </div>
                </div>
              )}

              {notification.type === 'job_match' && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      📤 Apply Now
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      💾 Save Job
                    </button>
                  </div>
                </div>
              )}

              {notification.type === 'offer' && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ✅ Accept Offer
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ❌ Decline Offer
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      💬 Negotiate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: "12px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>📭 No notifications yet</h3>
            <p style={{ margin: "0 0 20px 0", color: "#666" }}>
              When you apply to jobs or receive updates, they'll appear here.
            </p>
            <button
              style={{ padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
            >
              🔍 Start Job Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;