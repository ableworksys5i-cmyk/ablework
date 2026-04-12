import { useEffect, useState } from "react";
import "./EmployerDashboard.css";
import { useAuth } from "../context/AuthContext";
import {
  getEmployer,
  getEmployerJobs,
  createEmployerJob,
  updateEmployerJob,
  getEmployerApplications,
  getEmployerNotifications,
  updatePwdVerificationStatus,
  updateEmployer,
  uploadEmployerLogo,
  updateApplicationStatus,
  scheduleInterview,
  sendJobOffer,
  updateEmployerPassword,
  API_URL
} from "../api/api";

// Import modular components
import DashboardOverview from "../components/employer/DashboardOverview";
import CompanyProfile from "../components/employer/CompanyProfile";
import JobPostings from "../components/employer/JobPostings";
import ApplicantsManagement from "../components/employer/ApplicantsManagement";
import Notifications from "../components/employer/Notifications";
import Settings from "../components/employer/Settings";

// Import modals
import JobModal from "../components/employer/modals/JobModal";
import ApplicantModal from "../components/employer/modals/ApplicantModal";
import InterviewModal from "../components/employer/modals/InterviewModal";
import OfferModal from "../components/employer/modals/OfferModal";
import { io } from 'socket.io-client';

function EmployerDashboard() {
  const { user, logout } = useAuth();

  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("employerActiveTab");
    return savedTab || "dashboard";
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    newPassword: "",
    confirmPassword: ""
  });

  // Profile popup and tab state
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    username: "",
    company_name: "",
    company_address: "",
    contact_number: "",
    company_website: ""
  });

  // Interview scheduling state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: "",
    interview_time: "",
    interview_type: "video",
    notes: ""
  });

  // Job offer state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    offer_salary: "",
    offer_benefits: "",
    joining_date: "",
    offer_letter: ""
  });

  // Logo upload state
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Job posting form
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    required_skills: "",
    salary: "",
    location: "",
    latitude: "",
    longitude: "",
    job_type: "full-time",
    category: "technology"
  });

  useEffect(() => {
    if (!user || !user.user_id) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem("employerActiveTab", activeTab);
  }, [activeTab]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const socketUrl = 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Employer: Connected to server', newSocket.id));
    newSocket.on('connect_error', (err) => console.error('Employer socket connect_error:', err));
    newSocket.on('disconnect', (reason) => console.log('Employer: Disconnected from server', reason));

    newSocket.on('applicationSubmitted', (data) => {
      console.log('New application submitted:', data);
      fetchApplications();
    });

    newSocket.on('applicationStatusUpdated', (data) => {
      console.log('Application status updated:', data);
      fetchApplications();
    });

    newSocket.on('jobUpdated', (data) => {
      console.log('Job updated:', data);
      // If employer is viewing their own jobs, refresh job list
      loadData();
    });

    const pollId = setInterval(() => {
      console.log('Employer dashboard polling for updates');
      loadData();
      fetchApplications();
    }, 30000); // refresh every 30 seconds

    return () => {
      clearInterval(pollId);
      newSocket.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const employerData = await getEmployer(user.user_id);
      setEmployer({
        ...employerData,
        description: employerData.description || "",
        logo: employerData.logo || null,
        company_website: employerData.company_website || ""
      });

      const jobsData = await getEmployerJobs(user.user_id);
      setJobs(jobsData.map(job => ({
        job_id: job.job_id,
        title: job.title || job.job_title,
        description: job.description || job.job_description,
        requirements: job.requirements || "",
        required_skills: job.required_skills || "",
        location: job.location,
        salary: job.salary || 0,
        job_type: job.job_type || "full-time",
        category: job.category || job.job_category || "technology",
        status: job.status || "active",
        posted_date: job.created_at ? job.created_at.split("T")[0] : "",
        applicants_count: job.applicants_count || 0
      })));

      const applicationsData = await getEmployerApplications(user.user_id);
      setApplicants(applicationsData.map(app => ({
        application_id: app.application_id,
        job_id: app.job_id,
        applicant_id: app.applicant_id,
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        job_title: app.job_title,
        applied_date: app.applied_at?.split("T")[0] || "",
        pwd_verification: app.pwd_verification || "",
        pwd_verification_status: app.pwd_verification_status || "pending",
        match_score: app.match_score || 0,
        distance: app.distance || 0,
        experience: app.experience || "",
        skills: app.skills || "",
        education: app.education || "",
        status: app.status || "pending",
        cover_letter: app.cover_letter || "",
        custom_resume: app.custom_resume || "",
        interview_details: app.interview_date ? {
          interview_date: app.interview_date,
          interview_time: app.interview_time,
          interview_type: app.interview_type,
          notes: app.interview_notes
        } : null,
        disability_type: app.disability_type || ""
      })));

      // Get real notifications from backend
      const notificationsData = await getEmployerNotifications(user.user_id);
      setNotifications(notificationsData.map(notif => ({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        date: notif.date?.split("T")[0] || new Date().toISOString().split("T")[0]
      })));

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  // Fetch function for real-time updates
  const fetchApplications = async () => {
    try {
      const applicationsData = await getEmployerApplications(user.user_id);
      setApplicants(applicationsData.map(app => ({
        application_id: app.application_id,
        job_id: app.job_id,
        applicant_id: app.applicant_id,
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        job_title: app.job_title,
        applied_date: app.applied_at?.split("T")[0] || "",
        pwd_verification: app.pwd_verification || "",
        pwd_verification_status: app.pwd_verification_status || "pending",
        match_score: app.match_score || 0,
        distance: app.distance || 0,
        experience: app.experience || "",
        skills: app.skills || "",
        education: app.education || "",
        status: app.status || "pending",
        cover_letter: app.cover_letter || "",
        custom_resume: app.custom_resume || "",
        interview_details: app.interview_date ? {
          interview_date: app.interview_date,
          interview_time: app.interview_time,
          interview_type: app.interview_type,
          notes: app.interview_notes
        } : null,
        disability_type: app.disability_type || ""
      })));
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleCreateJob = async () => {
    try {
      console.log("=== BEFORE SENDING JOB ===");
      console.log("jobForm.required_skills:", jobForm.required_skills);
      console.log("Type:", typeof jobForm.required_skills);
      console.log("=== END ===");

      const newJobPayload = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements,
        required_skills: jobForm.required_skills,
        location: jobForm.location,
        latitude: jobForm.latitude || null,
        longitude: jobForm.longitude || null,
        category: jobForm.category,
        status: jobForm.status || "active",
        salary: jobForm.salary || null,
        job_type: jobForm.job_type || "full-time"
      };

      console.log("Full payload being sent to backend:", JSON.stringify(newJobPayload, null, 2));

      if (jobForm.id) {
        // Update existing job
        const result = await updateEmployerJob(user.user_id, jobForm.id, newJobPayload);
        if (result && result.message) {
          alert(result.message);
        } else {
          alert("Job updated successfully!");
        }
      } else {
        // Create new job
        const result = await createEmployerJob(user.user_id, newJobPayload);
        if (result && result.message) {
          alert(result.message);
        } else {
          alert("Job posted successfully!");
        }
      }

      await loadData();

      setJobForm({
        title: "",
        description: "",
        requirements: "",
        required_skills: "",
        salary: "",
        location: "",
        latitude: "",
        longitude: "",
        job_type: "full-time",
        category: "technology",
        status: "active"
      });
      setShowJobModal(false);
    } catch (error) {
      console.error("Job operation error", error);
      alert("Failed to save job. Please try again.");
    }
  };

  const handleToggleJobStatus = async (job) => {
    const newStatus = job.status === "active" ? "archived" : "active";

    try {
      await updateEmployerJob(user.user_id, job.job_id, {
        title: job.title,
        description: job.description,
        requirements: job.requirements || "",
        required_skills: job.required_skills || "",
        location: job.location,
        latitude: job.latitude || null,
        longitude: job.longitude || null,
        category: job.category,
        status: newStatus,
        salary: job.salary || null,
        job_type: job.job_type || "full-time"
      });

      setJobs((prevJobs) => prevJobs.map((j) =>
        j.job_id === job.job_id ? { ...j, status: newStatus } : j
      ));
    } catch (error) {
      console.error("Toggle job status error", error);
      alert("Failed to update job status. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setProfileForm({
      email: employer.email || "",
      username: employer.username || "",
      company_name: employer.company_name || "",
      company_address: employer.company_address || "",
      contact_number: employer.contact_number || "",
      company_website: employer.company_website || ""
    });
    setShowEditProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateEmployer(user.user_id, profileForm);
      await loadData();
      setShowEditProfileModal(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file);
    console.log("File details:", {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
        return;
      }

      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert("File size must be less than 2MB.");
        return;
      }

      setSelectedLogo(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("Preview created");
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedLogo) {
      alert("Please select a logo file first.");
      return;
    }

    if (!user || !user.user_id) {
      alert("User not logged in properly. Please log in again.");
      return;
    }

    console.log("Uploading logo for user:", user);
    console.log("User ID:", user?.user_id);
    console.log("Employer data:", employer);
    console.log("Selected logo:", selectedLogo);

    try {
      await uploadEmployerLogo(user.user_id, selectedLogo);
      await loadData(); 
      setSelectedLogo(null);
      setLogoPreview(null);
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Upload logo error", error);
      alert("Failed to upload logo. Please try again. Error: " + error.message);
    }
  };

  const handleApplicantAction = async (applicationId, action) => {
    try {
      await updateApplicationStatus(applicationId, action);
      await loadData();

      if (action === "shortlisted") {
        alert("Applicant shortlisted successfully! You can now schedule an interview.");
      } else if (action === "rejected") {
        alert("Applicant rejected.");
      } else if (action === "accepted") {
        alert("Applicant accepted!");
      } else if (action === "interviewed") {
        alert("Interview status updated.");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update applicant status. Please try again.");
    }
  };

  const handleOpenInterviewModal = (applicant) => {
    setSelectedApplicant(applicant);
    setShowInterviewModal(true);
  };

  const handlePwdVerificationAction = async (applicantId, action) => {
    try {
      await updatePwdVerificationStatus(user.user_id, applicantId, action);
      await loadData();
      
      if (action === "approved") {
        alert("PWD verification approved successfully!");
      } else if (action === "rejected") {
        alert("PWD verification rejected.");
      }
    } catch (error) {
      console.error("Error updating PWD verification status:", error);
      alert("Failed to update PWD verification status. Please try again.");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplicant) return;
    
    try {
      await scheduleInterview(selectedApplicant.application_id, {
        interview_date: interviewForm.interview_date,
        interview_time: interviewForm.interview_time,
        interview_type: interviewForm.interview_type,
        notes: interviewForm.notes
      });
      
      await loadData();
      setShowInterviewModal(false);
      setInterviewForm({
        interview_date: "",
        interview_time: "",
        interview_type: "video",
        notes: ""
      });
      alert("Interview scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview. Please try again.");
    }
  };

  const handleSendJobOffer = async () => {
    if (!selectedApplicant) return;
    
    try {
      await sendJobOffer(selectedApplicant.application_id, {
        offer_salary: offerForm.offer_salary,
        offer_benefits: offerForm.offer_benefits,
        joining_date: offerForm.joining_date,
        offer_letter: offerForm.offer_letter
      });
      
      await loadData();
      setShowOfferModal(false);
      setOfferForm({
        offer_salary: "",
        offer_benefits: "",
        joining_date: "",
        offer_letter: ""
      });
      alert("Job offer sent successfully!");
    } catch (error) {
      console.error("Error sending job offer:", error);
      alert("Failed to send job offer. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!settings.newPassword || settings.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      await updateEmployerPassword(user.user_id, {
        new_password: settings.newPassword,
        confirm_password: settings.confirmPassword
      });
      
      setSettings({
        ...settings,
        newPassword: "",
        confirmPassword: ""
      });
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password. Please try again.");
    }
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const openApplicantModal = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantModal(true);
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <h2>Loading...</h2>;
  if (!user || !user.user_id) return <h2>Please login first</h2>;
  if (!employer) return <h2>No employer data found</h2>;

  return (
    <div className="employer-dashboard-container">
      {/* Top Header with Profile Icon */}
      <div className="employer-dashboard-header">
        <div>
          <h1>ABLEWORK Employer</h1>
          
        </div>
        <div className="dashboard-profile-action">
          <button
            type="button"
            className="profile-icon-btn"
            onClick={() => setShowProfilePopup(prev => !prev)}
          >
            {employer?.company_name ? employer.company_name.charAt(0).toUpperCase() : "E"}
          </button>
          {showProfilePopup && (
            <div className="profile-popup-card">
              <p className="profile-popup-name"><strong>{employer?.company_name || "Company"}</strong></p>
              <p className="profile-popup-email">{employer?.email || user?.email || "No email found"}</p>
              <button
                type="button"
                className="profile-popup-edit-btn"
                onClick={() => {
                  setShowProfileModal(true);
                  setShowProfilePopup(false);
                }}
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="profile-popup-logout-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    window.location.href = "/";
                  }
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
          {/* Side Bar */}
      <div className="employer-dashboard-content">
        <aside className="employer-dashboard-sidebar">
          <div className="employer-dashboard-nav">
            {[
              { id: "dashboard", label: "Dashboard"},
              { id: "jobs", label: "Job Postings"},
              { id: "applicants", label: "Applicants"},
              { id: "notifications", label: "Notifications"},
              { id: "settings", label: "Settings"}
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowProfilePopup(false);
                }}
                className={activeTab === tab.id ? "active" : ""}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="employer-dashboard-main">

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <DashboardOverview
          employer={employer}
          jobs={jobs}
          applicants={applicants}
          setShowJobModal={setShowJobModal}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Job Postings Tab */}
      {activeTab === "jobs" && (
        <JobPostings
          jobs={jobs}
          setShowJobModal={setShowJobModal}
          setSelectedJob={setSelectedJob}
          setActiveTab={setActiveTab}
          setJobForm={setJobForm}
          onStatusToggle={handleToggleJobStatus}
        />
      )}

      {/* Applicants Tab */}
      {activeTab === "applicants" && (
        <ApplicantsManagement
          applicants={applicants}
          selectedJob={selectedJob}
          onClearFilter={() => setSelectedJob(null)}
          onViewApplicant={openApplicantModal}
          onApplicantAction={handleApplicantAction}
          onScheduleInterview={handleOpenInterviewModal}
          onPwdVerificationAction={handlePwdVerificationAction}
        />
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Notifications
          notifications={notifications}
          handleDeleteNotification={handleDeleteNotification}
        />
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <Settings
          settings={settings}
          updateSettings={updateSettings}
          handleChangePassword={handleChangePassword}
        />
      )}

      {/* Job Creation Modal */}
      {showJobModal && (
        <JobModal
          jobForm={jobForm}
          setJobForm={setJobForm}
          setShowJobModal={setShowJobModal}
          handleCreateJob={handleCreateJob}
        />
      )}

      {/* Employer Profile Edit Modal */}
      {showProfileModal && (
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
            width: "95%",
            maxWidth: "800px",
            backgroundColor: "#fff",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.16)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Company Profile Management</h3>
              <button onClick={() => setShowProfileModal(false)} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            <CompanyProfile
              employer={employer}
              logoPreview={logoPreview}
              selectedLogo={selectedLogo}
              onEditProfile={handleEditProfile}
              onLogoFileChange={handleLogoFileChange}
              onUploadLogo={handleUploadLogo}
            />
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
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1100
        }}>
          <div style={{
            width: "95%",
            maxWidth: "520px",
            backgroundColor: "#fff",
            borderRadius: "14px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.16)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Edit Company Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} style={{ fontSize: "24px", background: "none", border: "none", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <input
                type="text"
                name="company_name"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Company Name"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="text"
                name="company_address"
                value={profileForm.company_address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Company Address"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="text"
                name="company_website"
                value={profileForm.company_website}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Company Website"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="text"
                name="contact_number"
                value={profileForm.contact_number}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Contact Number"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Email"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <input
                type="text"
                name="username"
                value={profileForm.username}
                onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                placeholder="Username"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {showApplicantModal && selectedApplicant && (
        <ApplicantModal
          selectedApplicant={selectedApplicant}
          setShowApplicantModal={setShowApplicantModal}
          handleApplicantAction={handleApplicantAction}
          setSelectedApplicant={setSelectedApplicant}
          setShowInterviewModal={setShowInterviewModal}
          setShowOfferModal={setShowOfferModal}
        />
      )}

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedApplicant && (
        <InterviewModal
          selectedApplicant={selectedApplicant}
          interviewForm={interviewForm}
          setInterviewForm={setInterviewForm}
          setShowInterviewModal={setShowInterviewModal}
          handleScheduleInterview={handleScheduleInterview}
        />
      )}

      {/* Job Offer Modal */}
      {showOfferModal && selectedApplicant && (
        <OfferModal
          selectedApplicant={selectedApplicant}
          offerForm={offerForm}
          setOfferForm={setOfferForm}
          setShowOfferModal={setShowOfferModal}
          handleSendJobOffer={handleSendJobOffer}
        />
      )}

        </main>
      </div>
    </div>
  );
}

export default EmployerDashboard;