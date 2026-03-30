import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getEmployer,
  getEmployerJobs,
  createEmployerJob,
  updateEmployerJob,
  getEmployerApplications,
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
import SmartMatching from "../components/employer/SmartMatching";
import Analytics from "../components/employer/Analytics";
import Notifications from "../components/employer/Notifications";
import Settings from "../components/employer/Settings";

// Import modals
import JobModal from "../components/employer/modals/JobModal";
import ApplicantModal from "../components/employer/modals/ApplicantModal";
import InterviewModal from "../components/employer/modals/InterviewModal";
import OfferModal from "../components/employer/modals/OfferModal";
import AnalyticsModal from "../components/employer/modals/AnalyticsModal";

function EmployerDashboard() {
  const { user } = useAuth();

  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState("dashboard");
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

  // Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    username: "",
    company_name: "",
    company_address: "",
    contact_number: ""
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
    salary: "",
    location: "",
    latitude: "",
    longitude: "",
    job_radius: 10,
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

  const loadData = async () => {
    try {
      const employerData = await getEmployer(user.user_id);
      setEmployer({
        ...employerData,
        description: employerData.description || "",
        logo: employerData.logo || null
      });

      const jobsData = await getEmployerJobs(user.user_id);
      setJobs(jobsData.map(job => ({
        job_id: job.job_id,
        title: job.title || job.job_title,
        description: job.description || job.job_description,
        location: job.location,
        salary: job.salary || 0,
        job_type: job.job_type || "full-time",
        category: job.category || job.job_category || "technology",
        job_radius: job.job_radius || 10,
        status: job.status || "active",
        posted_date: job.created_at ? job.created_at.split("T")[0] : "",
        applicants_count: job.applicants_count || 0
      })));

      const applicationsData = await getEmployerApplications(user.user_id);
      setApplicants(applicationsData.map(app => ({
        application_id: app.application_id,
        job_id: app.job_id,
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        job_title: app.job_title,
        applied_date: app.applied_at?.split("T")[0] || "",
        match_score: app.match_score || 0,
        distance: app.distance || 0,
        experience: app.experience || "",
        skills: app.skills || "",
        education: app.education || "",
        status: app.status || "pending",
        cover_letter: app.cover_letter || "",
        resume: app.resume || ""
      })));

      setAnalytics({
        total_applicants: applicationsData.length,
        active_jobs: jobsData.length,
        job_views: 0,
        average_match_score: applicationsData.length ? Math.round(applicationsData.reduce((acc, item) => acc + (item.match_score || 0), 0) / applicationsData.length) : 0,
        hiring_rate: 0,
        new_applicants_today: 0
      });

      // Create notifications based on applications
      const notificationsList = [];
      let notificationId = 1;

      // Add notifications for recent applications (last 7 days)
      const recentApplications = applicationsData.filter(app => {
        const appliedDate = new Date(app.applied_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appliedDate >= weekAgo;
      });

      recentApplications.forEach(app => {
        notificationsList.push({
          id: notificationId++,
          type: "application",
          message: `New application from ${app.applicant_name} for ${app.job_title}`,
          date: app.applied_at?.split("T")[0] || new Date().toISOString().split("T")[0]
        });
      });

      // Add some default notifications if no recent applications
      if (notificationsList.length === 0) {
        notificationsList.push({
          id: notificationId++,
          type: "info",
          message: "Welcome to your employer dashboard!",
          date: new Date().toISOString().split("T")[0]
        });
      }

      setNotifications(notificationsList);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      const newJobPayload = {
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        latitude: jobForm.latitude || null,
        longitude: jobForm.longitude || null,
        category: jobForm.category,
        status: jobForm.status || "active"
      };

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
        salary: "",
        location: "",
        latitude: "",
        longitude: "",
        job_radius: 10,
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
        location: job.location,
        latitude: job.latitude || null,
        longitude: job.longitude || null,
        category: job.category,
        status: newStatus
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
      contact_number: employer.contact_number || ""
    });
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateEmployer(user.user_id, profileForm);
      await loadData();
      setShowProfileModal(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedLogo(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedLogo) {
      alert("Please select a logo file first.");
      return;
    }

    try {
      await uploadEmployerLogo(user.user_id, selectedLogo);
      await loadData(); // Refresh data to show new logo
      setSelectedLogo(null);
      setLogoPreview(null);
      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Upload logo error", error);
      alert("Failed to upload logo. Please try again.");
    }
  };

  const handleApplicantAction = async (applicationId, action) => {
    try {
      await updateApplicationStatus(applicationId, action);
      await loadData();
      
      // Show appropriate message
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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <aside style={{ width: "240px", backgroundColor: "#f8f9fa", borderRight: "1px solid #ddd", padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>🏢 Employer</h2>
          <p style={{ margin: "5px 0 0", color: "#666" }}>{employer?.company_name || "Your Company"}</p>
        </div>
        {[
          { id: "dashboard", label: "Dashboard", icon: "📊" },
          { id: "profile", label: "Company Profile", icon: "🏢" },
          { id: "jobs", label: "Job Postings", icon: "📢" },
          { id: "applicants", label: "Applicants", icon: "👥" },
          { id: "matching", label: "Smart Matching", icon: "🧠" },
          { id: "analytics", label: "Analytics", icon: "📊" },
          { id: "notifications", label: "Notifications", icon: "🔔" },
          { id: "settings", label: "Settings", icon: "⚙️" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              marginBottom: "8px",
              borderRadius: "6px",
              border: activeTab === tab.id ? "2px solid #007bff" : "1px solid #ddd",
              backgroundColor: activeTab === tab.id ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "bold" : "normal"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, padding: "20px", maxWidth: "1200px", margin: "auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", textAlign: "center" }}>🏢 Employer Dashboard</h1>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <DashboardOverview
          analytics={analytics}
          notifications={notifications}
          setActiveTab={setActiveTab}
          setShowJobModal={setShowJobModal}
        />
      )}

      {/* Company Profile Tab */}
      {activeTab === "profile" && (
        <CompanyProfile
          employer={employer}
          logoPreview={logoPreview}
          selectedLogo={selectedLogo}
          handleEditProfile={handleEditProfile}
          handleLogoFileChange={handleLogoFileChange}
          handleUploadLogo={handleUploadLogo}
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
          setSelectedJob={setSelectedJob}
          openApplicantModal={openApplicantModal}
          handleApplicantAction={handleApplicantAction}
          setSelectedApplicant={setSelectedApplicant}
          setShowInterviewModal={setShowInterviewModal}
          setShowOfferModal={setShowOfferModal}
        />
      )}

      {/* Smart Matching Tab */}
      {activeTab === "matching" && (
        <SmartMatching
          applicants={applicants}
          openApplicantModal={openApplicantModal}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <Analytics
          analytics={analytics}
          applicants={applicants}
          jobs={jobs}
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
  );
}

export default EmployerDashboard;