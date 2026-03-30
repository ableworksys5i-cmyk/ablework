import { useEffect, useState } from "react";
import {
  getApplicant,
  getStats,
  getJobs,
  getJobsByCategory,
  getNearbyJobs,
  getApplications,
  applyJob,
  updateApplicant,
  uploadApplicantResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
  archiveApplication,
  withdrawApplication
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import JobSearch from "../components/applicant/JobSearch";
import NearbyJobs from "../components/applicant/NearbyJobs";

function ApplicantDashboard() {
  const { user } = useAuth();

  const [applicant, setApplicant] = useState(null);
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    experience: ""
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [manualLocation, setManualLocation] = useState({ latitude: "", longitude: "" });
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [jobsByCategory, setJobsByCategory] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    notifications: true,
    locationPermission: true,
    newPassword: "",
    confirmPassword: ""
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [customResume, setCustomResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    disability_type: "",
    skills: "",
    education: "",
    preferred_job: ""
  });

  useEffect(() => {
    if (!user || !user.user_id) {
      setLoading(false);
      return;
    }
    loadData();
    detectUserLocation();
  }, [user]);

  const loadData = async () => {
    try {
      const applicantData = await getApplicant(user.user_id);
      if (!applicantData || !applicantData.name) {
        setApplicant(null);
        setLoading(false);
        return;
      }
      setApplicant(applicantData);

      const statsData = await getStats(user.user_id);
      if (statsData) setStats(statsData);

      const jobsData = await getJobs(user.user_id);
      if (jobsData) setJobs(jobsData);

      const categoryJobsData = await getJobsByCategory(categoryFilter || "");
      if (categoryJobsData) setJobsByCategory(categoryJobsData);

      const applicationsData = await getApplications(user.user_id);
      if (applicationsData) setApplications(applicationsData);

      const savedJobsData = await getSavedJobs(user.user_id);
      if (savedJobsData) setSavedJobs(savedJobsData);

      setNotifications([
        { id: 1, type: "application", message: "Your application for Software Developer has been reviewed", date: "2024-03-28" },
        { id: 2, type: "job", message: "New job matching your skills: Data Analyst", date: "2024-03-27" },
        { id: 3, type: "interview", message: "Interview scheduled for Web Developer position", date: "2024-03-26" }
      ]);
    } catch (err) {
      console.log("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = () => {
    if (navigator.geolocation && settings.locationPermission) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          try {
            const nearby = await getNearbyJobs(latitude, longitude);
            setNearbyJobs(nearby || []);
          } catch (err) {
            console.error("Failed to load nearby jobs:", err);
            setNearbyJobs([]);
          }
        },
        (error) => {
          console.log("Location detection failed:", error);
          setUserLocation({ latitude: null, longitude: null });
          // Don't automatically fetch nearby jobs on error - let user input manually
        }
      );
    }
  };

  const handleManualLocationSearch = async () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Please enter valid latitude (-90 to 90) and longitude (-180 to 180) coordinates.");
      return;
    }

    setUserLocation({ latitude: lat, longitude: lng });
    try {
      const nearby = await getNearbyJobs(lat, lng);
      setNearbyJobs(nearby || []);
    } catch (err) {
      console.error("Failed to load nearby jobs:", err);
      setNearbyJobs([]);
      alert("Failed to load nearby jobs. Please try again.");
    }
  };


  const handleApply = async (job_id) => {
    try {
      await applyJob({ user_id: user.user_id, job_id });
      alert("Applied successfully!");
      loadData();
    } catch (err) {
      console.log(err);
    }
  };

  const handleApplyWithDetails = async () => {
    if (!selectedJob) return;
    try {
      const applicationData = {
        user_id: user.user_id,
        job_id: selectedJob.job_id,
        cover_letter: coverLetter,
        custom_resume: customResume
      };
      await applyJob(applicationData);
      alert("Application submitted successfully!");
      setShowApplyModal(false);
      setCoverLetter("");
      setCustomResume(null);
      loadData();
    } catch (err) {
      console.log(err);
      alert("Application failed. Please try again.");
    }
  };

  const handleWithdrawApplication = async (application_id) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    
    try {
      await withdrawApplication(application_id);
      alert("Application withdrawn successfully!");
      loadData();
    } catch (err) {
      console.log(err);
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetailsModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCustomResume(file);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleResumeFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      alert("Please select a resume file to upload.");
      return;
    }
    try {
      await uploadApplicantResume(user.user_id, resumeFile);
      alert("Resume uploaded successfully.");
      setResumeFile(null);
      loadData();
    } catch (err) {
      console.error("Resume upload failed", err);
      alert("Failed to upload resume. Please try again.");
    }
  };

  const handleSaveJob = async (job_id) => {
    try {
      await saveJob(user.user_id, job_id);
      alert("Job saved successfully!");
      loadData(); // Refresh saved jobs
    } catch (err) {
      console.error("Save job failed", err);
      alert("Failed to save job. Please try again.");
    }
  };

  const handleUnsaveJob = async (job_id) => {
    try {
      await unsaveJob(user.user_id, job_id);
      alert("Job unsaved successfully!");
      loadData(); // Refresh saved jobs
    } catch (err) {
      console.error("Unsave job failed", err);
      alert("Failed to unsave job. Please try again.");
    }
  };

  const handleArchiveApplication = async (application_id, action) => {
    try {
      await archiveApplication(user.user_id, application_id, action);
      alert(`Application ${action}d successfully!`);
      loadData(); // Refresh applications
    } catch (err) {
      console.error("Archive application failed", err);
      alert(`Failed to ${action} application. Please try again.`);
    }
  };

  const openEditProfileModal = () => {
    setEditFormData({
      name: applicant.name || "",
      email: applicant.email || "",
      disability_type: applicant.disability_type || "",
      skills: applicant.skills || "",
      education: applicant.education || "",
      preferred_job: applicant.preferred_job || ""
    });
    setShowEditProfileModal(true);
  };

  const handleEditProfile = async () => {
    try {
      const updatePayload = { ...editFormData };
      const result = await updateApplicant(user.user_id, updatePayload);
      if (result.message === "Profile updated successfully") {
        alert("Profile updated successfully!");
        setShowEditProfileModal(false);
        loadData();
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.log(err);
      alert("Error updating profile. Please try again.");
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === "locationPermission" && value) {
      detectUserLocation();
    }
  };

  useEffect(() => {
    const loadCategoryJobs = async () => {
      try {
        const categoryJobsData = await getJobsByCategory(categoryFilter || "");
        setJobsByCategory(categoryJobsData || []);
      } catch (err) {
        console.error("Failed to load category jobs:", err);
        setJobsByCategory([]);
      }
    };

    loadCategoryJobs();
  }, [categoryFilter]);

  const jobCategories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean)));

  if (loading) return <h2>Loading...</h2>;
  if (!user || !user.user_id) return <h2>Please login first</h2>;
  if (!applicant) return <h2>No applicant data found</h2>;

  const profileCompletion = stats.profile_completion || 0;

  const profileChecklist = [
    { label: "Name and email set", done: applicant.name && applicant.email },
    { label: "Disability type provided", done: applicant.disability_type },
    { label: "Skills provided", done: applicant.skills },
    { label: "Education details provided", done: applicant.education },
    { label: "Preferred job provided", done: applicant.preferred_job },
    { label: "Resume uploaded", done: applicant.pwd_verification }
  ];

  // Navigation tabs (without Profile)
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "jobs", label: "Find Jobs", icon: "🔍" },
    { id: "nearby", label: "Nearby Jobs", icon: "📍" },
    { id: "saved", label: "Saved Jobs", icon: "💾" },
    { id: "applications", label: "Applications", icon: "📄" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Top Navigation Tabs - Hidden when in Profile view */}
      {activeTab !== "profile" && (
        <div style={{
          backgroundColor: "navy",
          padding: "15px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", maxWidth: "1400px", margin: "0 auto" }}>
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: activeTab === tab.id ? "2px solid #fff" : "1px solid transparent",
                  backgroundColor: activeTab === tab.id ? "#e3f2fd" : "transparent",
                  color: activeTab === tab.id ? "#000" : "#fff",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: activeTab === tab.id ? "bold" : "normal"
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", maxWidth: "1400px", margin: "0 auto", padding: "20px", gap: "25px" }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "25px" }}>📊 Dashboard Overview</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e0f7fa", textAlign: "center" }}>
                  <h3>📄 Total Applications</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.applications || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0", textAlign: "center" }}>
                  <h3>📅 Applied Today</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.today_applications || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f3e5f5", textAlign: "center" }}>
                  <h3>💾 Saved Jobs</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.saved_jobs || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e8f5e8", textAlign: "center" }}>
                  <h3>✅ Profile Complete</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{profileCompletion}%</p>
                </div>
              </div>

              <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", marginBottom: "30px", backgroundColor: "#f9f9f9" }}>
                <h3>🚀 Quick Actions</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                  <button onClick={() => setActiveTab("jobs")} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    🔍 Find Jobs
                  </button>
                  <button onClick={() => setActiveTab("nearby")} style={{ padding: "10px 20px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    📍 Nearby Jobs
                  </button>
                </div>
              </div>

              <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff" }}>
                <h3>📈 Recent Activity</h3>
                <div style={{ marginTop: "15px" }}>
                  {applications.slice(0, 3).map((app, index) => (
                    <div key={index} style={{ padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                      <span>Applied to: {app.title}</span>
                      <span style={{ color: app.status === "pending" ? "#ffc107" : app.status === "reviewed" ? "#007bff" : "#28a745" }}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                  {applications.length === 0 && <p>No recent activity</p>}
                </div>
              </div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <JobSearch
              jobs={jobs}
              filters={filters}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onApply={openApplyModal}
              onSaveJob={handleSaveJob}
              savedJobs={savedJobs}
            />
          )}

          {/* Nearby Jobs Tab */}
          {activeTab === "nearby" && (
            <NearbyJobs
              jobs={nearbyJobs}
              userLocation={userLocation.latitude && userLocation.longitude ? `${userLocation.latitude}, ${userLocation.longitude}` : "Location not available"}
              onApply={openApplyModal}
              onSaveJob={handleSaveJob}
              savedJobs={savedJobs}
            />
          )}

          {/* Saved Jobs Tab */}
          {activeTab === "saved" && (
            <div>
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>💾 Saved Jobs</h2>
              {savedJobs.length === 0 ? (
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "40px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
                  <h3>No saved jobs yet</h3>
                  <p>Save jobs you're interested in to view them later!</p>
                  <button onClick={() => setActiveTab("jobs")} style={{ marginTop: "15px", padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    🔍 Find Jobs
                  </button>
                </div>
              ) : (
                savedJobs.map(job => (
                  <div key={job.job_id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "15px", backgroundColor: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 10px 0" }}>{job.job_title}</h4>
                        <p style={{ margin: "5px 0", color: "#666" }}>{job.location}</p>
                        <p style={{ margin: "5px 0" }}>{job.job_description}</p>
                        <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                          <span>📂 {job.job_category}</span>
                          <span>💰 ${job.salary || "N/A"}</span>
                          <span>📅 Saved {new Date(job.saved_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <button
                          onClick={() => openApplyModal(job)}
                          style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          📤 Apply Now
                        </button>
                        <button
                          onClick={() => handleUnsaveJob(job.job_id)}
                          style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          🗑️ Unsave
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div>
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>📄 Application Tracking</h2>
              {applications.length === 0 ? (
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "40px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
                  <h3>No applications yet</h3>
                  <p>Start applying to jobs to track your applications here!</p>
                  <button onClick={() => setActiveTab("jobs")} style={{ marginTop: "15px", padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    🔍 Find Jobs
                  </button>
                </div>
              ) : (
                applications.map((app, index) => (
                  <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", marginBottom: "15px", backgroundColor: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0" }}>{app.title}</h4>
                        <p style={{ margin: "5px 0", color: "#666" }}>{app.company} • Applied on {app.applied_date}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                          backgroundColor:
                            app.status === "pending" ? "#ffc107" :
                            app.status === "reviewed" ? "#007bff" :
                            app.status === "interview" ? "#17a2b8" :
                            app.status === "accepted" ? "#28a745" : "#dc3545"
                        }}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => viewApplicationDetails(app)}
                        style={{ padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        👁️ View Details
                      </button>
                      {app.status === "pending" && (
                        <button 
                          onClick={() => handleWithdrawApplication(app.application_id)}
                          style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          ❌ Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
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
                        <p style={{ margin: "0 0 5px 0" }}>
                          {notification.type === "application" && "📄 "}
                          {notification.type === "job" && "💼 "}
                          {notification.type === "interview" && "🎯 "}
                          {notification.message}
                        </p>
                        <small style={{ color: "#666" }}>{notification.date}</small>
                      </div>
                      <button style={{ padding: "4px 8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>⚙️ Settings</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                {/* Password Change */}
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
                  <h3>🔒 Change Password</h3>
                  <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
                    <input type="password" placeholder="Current Password" style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={settings.newPassword}
                      onChange={e => updateSettings("newPassword", e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={settings.confirmPassword}
                      onChange={e => updateSettings("confirmPassword", e.target.value)}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                    />
                    <button style={{ padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
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
                        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Receive updates about your applications</p>
                      </div>
                      <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                        <input
                          type="checkbox"
                          checked={settings.notifications}
                          onChange={e => updateSettings("notifications", e.target.checked)}
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
                        <h4 style={{ margin: "0 0 5px 0" }}>Location Services</h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>Allow access to location for nearby jobs</p>
                      </div>
                      <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                        <input
                          type="checkbox"
                          checked={settings.locationPermission}
                          onChange={e => updateSettings("locationPermission", e.target.checked)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: "absolute",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: settings.locationPermission ? "#28a745" : "#ccc",
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
                            transform: settings.locationPermission ? "translateX(26px)" : "translateX(0px)"
                          }}></span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab - Full view with no navigation */}
          {activeTab === "profile" && (
            <div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "25px" }}>👤 Profile Management</h2>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px", border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f1f8ff" }}>
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: "#007bff", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>
                  {applicant.name ? applicant.name.split(" ").map(n => n[0]).join("").toUpperCase() : "A"}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{applicant.name || "Untitled"}</h3>
                  <p style={{ margin: "4px 0", color: "#333" }}><b>Preferred Job:</b> {applicant.preferred_job || "Not set"}</p>
                  <p style={{ margin: "4px 0", color: "#333" }}><b>Disability Type:</b> {applicant.disability_type || "Not set"}</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={openEditProfileModal}
                    style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9" }}>
                  <h3>Personal Information</h3>
                  <div style={{ display: "grid", gap: "12px", marginTop: "15px" }}>
                    <div><b>Name:</b> {applicant.name || "-"}</div>
                    <div><b>Email:</b> {applicant.email || "-"}</div>
                    <div><b>Disability Type:</b> {applicant.disability_type || "-"}</div>
                    <div><b>Skills:</b> {applicant.skills || "-"}</div>
                    <div><b>Education:</b> {applicant.education || "-"}</div>
                  </div>
                </div>

                <div>
                  <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", marginBottom: "20px", backgroundColor: "#e8f5e8" }}>
                    <h3>📊 Profile Completion</h3>
                    <div style={{ marginTop: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span>Progress</span>
                        <span>{profileCompletion}%</span>
                      </div>
                      <div style={{ width: "100%", height: "18px", backgroundColor: "#ddd", borderRadius: "9px" }}>
                        <div style={{ width: `${profileCompletion}%`, height: "100%", backgroundColor: "#28a745", borderRadius: "9px" }} />
                      </div>
                      <ul style={{ marginTop: "15px", paddingLeft: "18px" }}>
                        {profileChecklist.map((item, index) => (
                          <li key={index} style={{ color: item.done ? "#28a745" : "#dc3545", marginBottom: "5px" }}>
                            {item.done ? "✓" : "✗"} {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0" }}>
                    <h3>📄 Resume Management</h3>
                    <div style={{ marginTop: "15px" }}>
                      <p><b>Current Resume:</b> {applicant.pwd_verification ? "Uploaded" : "Not uploaded"}</p>
                      <input type="file" accept=".pdf" onChange={handleResumeFile} style={{ marginTop: "10px" }} />
                      {resumeFile && <p style={{ marginTop: "8px", color: "#28a745" }}>Ready to upload: {resumeFile.name}</p>}
                      <button onClick={handleResumeUpload} style={{ marginTop: "10px", padding: "8px 16px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" }}>📤 Upload Resume</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Profile Card (Hidden in full profile view) */}
        {activeTab !== "profile" && (
          <div style={{
            width: "320px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            height: "fit-content",
            position: "sticky",
            top: "100px"
          }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                onClick={() => setActiveTab("profile")}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  margin: "0 auto 15px",
                  cursor: "pointer",
                  border: "4px solid #e3f2fd"
                }}
                title="Click to open full profile"
              >
                {applicant.name ? applicant.name.split(" ").map(n => n[0]).join("").toUpperCase() : "A"}
              </div>
              <h3 style={{ margin: "0 0 8px 0" }}>{applicant.name || "Applicant"}</h3>
              <p style={{ color: "#666", margin: "0" }}>{applicant.preferred_job || "No preferred job set"}</p>
            </div>

            <div style={{ marginTop: "20px", fontSize: "14.5px", lineHeight: "1.6" }}>
              <div><strong>Email:</strong> {applicant.email || "-"}</div>
              <div><strong>Disability:</strong> {applicant.disability_type || "-"}</div>
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              style={{
                marginTop: "30px",
                width: "100%",
                padding: "14px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px"
              }}
            >
              ✏️ View / Edit Full Profile
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
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
            <h3>📤 Apply for: {selectedJob.title}</h3>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div>
                <label><b>Cover Letter (Optional)</b></label>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position..."
                  rows={4}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", resize: "vertical" }}
                />
              </div>
              <div>
                <label><b>Custom Resume (Optional)</b></label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
                {customResume && <p style={{ marginTop: "5px", color: "#28a745" }}>✓ {customResume.name}</p>}
              </div>
            </div>
            <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowApplyModal(false)}
                style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyWithDetails}
                style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                📤 Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationDetailsModal && selectedApplication && (
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
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>📄 Application Details</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#007bff" }}>{selectedApplication.title}</h3>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Company:</strong> {selectedApplication.company}
              </p>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Applied Date:</strong> {selectedApplication.applied_date}
              </p>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Status:</strong> 
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor:
                    selectedApplication.status === "pending" ? "#ffc107" :
                    selectedApplication.status === "reviewed" ? "#007bff" :
                    selectedApplication.status === "interview" ? "#17a2b8" :
                    selectedApplication.status === "accepted" ? "#28a745" : "#dc3545",
                  marginLeft: "8px"
                }}>
                  {selectedApplication.status.toUpperCase()}
                </span>
              </p>
            </div>

            {selectedApplication.description && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Job Description</h4>
                <p style={{ color: "#555", lineHeight: "1.5" }}>{selectedApplication.description}</p>
              </div>
            )}

            <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowApplicationDetailsModal(false)}
                style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Close
              </button>
              {selectedApplication.status === "pending" && (
                <button
                  onClick={() => {
                    setShowApplicationDetailsModal(false);
                    handleWithdrawApplication(selectedApplication.application_id);
                  }}
                  style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  ❌ Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
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
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h3>✏️ Edit Profile</h3>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label><b>Name</b></label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label><b>Email</b></label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={e => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
              <div>
                <label><b>Disability Type</b></label>
                <select
                  value={editFormData.disability_type}
                  onChange={e => setEditFormData(prev => ({ ...prev, disability_type: e.target.value }))}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                >
                  <option value="">Select disability type</option>
                  <option value="Physical Disability">Physical Disability</option>
                  <option value="Visual Impairment">Visual Impairment</option>
                  <option value="Hearing Impairment">Hearing Impairment</option>
                  <option value="Cognitive Disability">Cognitive Disability</option>
                  <option value="Mental Health Disability">Mental Health Disability</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label><b>Skills</b></label>
                <textarea
                  value={editFormData.skills}
                  onChange={e => setEditFormData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="List your skills (e.g., JavaScript, Python, Communication)"
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", resize: "vertical" }}
                />
              </div>
              <div>
                <label><b>Education</b></label>
                <textarea
                  value={editFormData.education}
                  onChange={e => setEditFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="Your educational background"
                  rows={3}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", resize: "vertical" }}
                />
              </div>
              <div>
                <label><b>Preferred Job</b></label>
                <input
                  type="text"
                  value={editFormData.preferred_job}
                  onChange={e => setEditFormData(prev => ({ ...prev, preferred_job: e.target.value }))}
                  placeholder="e.g., Software Developer, Data Analyst"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                />
              </div>
              <p style={{ marginTop: "10px", color: "#333" }}>Location is managed separately and not editable here.</p>
            </div>
            <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantDashboard;