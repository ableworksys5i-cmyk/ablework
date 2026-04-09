import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApplicantDashboard.css";
import {
  getApplicant,
  getStats,
  getJobs,
  getJobsByCategory,
  getNearbyJobs,
  getApplications,
  applyJob,
  uploadApplicationResume,
  updateApplicant,
  uploadApplicantResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
  archiveApplication,
  withdrawApplication,
  getSmartMatchedJobs,
  getApplicantNotifications,
  updateApplicantPassword,
  uploadProfilePicture,
  API_URL
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import JobSearch from "../components/applicant/JobSearch";
import NearbyJobs from "../components/applicant/NearbyJobs";
import JobDetailsModal from "../components/applicant/modals/JobDetailsModal";
import { io } from 'socket.io-client';

function ApplicantDashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("applicantActiveTab");
    return savedTab || "dashboard";
  });
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: ""
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [manualLocation, setManualLocation] = useState({ latitude: "", longitude: "" });
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [smartMatchedJobs, setSmartMatchedJobs] = useState([]);
  const [jobsByCategory, setJobsByCategory] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [applicationView, setApplicationView] = useState("all");
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("applicantSettings");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            notifications: parsed.notifications ?? true,
            locationPermission: parsed.locationPermission ?? true,
            newPassword: "",
            confirmPassword: ""
          };
        } catch {
          
        }
      }
    }
    return {
      notifications: true,
      locationPermission: true,
      newPassword: "",
      confirmPassword: ""
    };
  });
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [settingsModal, setSettingsModal] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [customResume, setCustomResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    disability_type: "",
    skills: "",
    education: "",
    preferred_job: "",
    profile_picture: ""
  });
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || !user.user_id) {
      setLoading(false);
      return;
    }
    loadData();
    detectUserLocation();
  }, [user]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const socketUrl = 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Applicant: Connected to server', newSocket.id));
    newSocket.on('connect_error', (err) => console.error('Applicant socket connect_error:', err));
    newSocket.on('disconnect', (reason) => console.log('Applicant: Disconnected from server', reason));

    newSocket.on('jobPosted', (data) => {
      console.log('New job posted:', data);
      fetchJobs();
      fetchNearbyJobs();
      fetchSmartMatchedJobs();
    });

    newSocket.on('applicationSubmitted', (data) => {
      console.log('New application submitted:', data);
      fetchApplications();
    });

    newSocket.on('jobUpdated', (data) => {
      console.log('Job updated:', data);
      fetchJobs();
      fetchNearbyJobs();
      fetchSmartMatchedJobs();
    });

    const pollId = setInterval(() => {
      console.log('Applicant dashboard polling for updates');
      fetchJobs();
      fetchNearbyJobs();
      fetchSmartMatchedJobs();
      fetchApplications();
    }, 30000); // refresh every 30 seconds

    return () => {
      clearInterval(pollId);
      newSocket.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      // Ensure applicant_id is available - fetch if missing
      let applicantId = user.applicant_id;
      if (!applicantId && user.role === "applicant") {
        console.log("⚠️ applicant_id missing from auth context, fetching from profile...");
        const profileData = await getApplicant(user.user_id);
        if (profileData && profileData.applicant_id) {
          applicantId = profileData.applicant_id;
          console.log("✓ Got applicant_id from profile:", applicantId);
        }
      }

      const applicantData = await getApplicant(user.user_id);
      if (!applicantData || !applicantData.name) {
        setApplicant(null);
        setLoading(false);
        return;
      }
      console.log("🔄 loadData: Fetched applicant data:", applicantData);
      console.log("🖼️ loadData: Profile picture:", applicantData.profile_picture);
      setApplicant(applicantData);

      const statsData = await getStats(user.user_id);
      if (statsData) setStats(statsData);

      const jobsData = await getJobs(user.user_id);
      if (jobsData) {
        console.log("ApplicantDashboard - Jobs fetched:", jobsData.length, jobsData.slice(0, 2));
        setJobs(jobsData);
      }

      const categoryJobsData = await getJobsByCategory(categoryFilter || "");
      if (categoryJobsData) setJobsByCategory(categoryJobsData);

      const applicationsData = await getApplications(user.user_id);
      if (applicationsData) {
        setApplications(applicationsData.map(app => ({
          ...app,
          id: app.application_id || app.id,
          jobTitle: app.title || app.job_title || app.jobTitle,
          company: app.company || app.company_name || app.company,
          appliedDate: app.applied_date || app.appliedDate,
          interviewDetails: (app.interview_date || app.interview_time || app.interview_type || app.interview_notes) ? {
            date: app.interview_date,
            time: app.interview_time,
            type: app.interview_type,
            notes: app.interview_notes
          } : null
        })));
      }

      try {
        // Use applicant_id for saved jobs - use the fallback applicantId if we fetched it
        let savedJobsApplicantId = user.applicant_id || applicantId;
        if (savedJobsApplicantId) {
          const savedJobsData = await getSavedJobs(savedJobsApplicantId);
          console.log("=== SAVED JOBS DEBUG ===");
          console.log("Applicant ID:", savedJobsApplicantId);
          console.log("Saved jobs fetched:", savedJobsData);
          console.log("Type:", typeof savedJobsData);
          console.log("Is Array:", Array.isArray(savedJobsData));
          console.log("Length:", savedJobsData?.length);
          if (Array.isArray(savedJobsData)) {
            setSavedJobs(savedJobsData);
            console.log("Saved jobs set to state:", savedJobsData.length);
          } else {
            setSavedJobs([]);
            console.log("Saved jobs not array, set to empty");
          }
        } else {
          console.log("⚠️ Applicant ID not available, skipping saved jobs load");
          setSavedJobs([]);
        }
      } catch (savedJobsErr) {
        console.error("Error loading saved jobs:", savedJobsErr);
        console.error("Full error:", JSON.stringify(savedJobsErr, null, 2));
        setSavedJobs([]);
      }

      // Load smart matched jobs based on skills and location
      try {
        const smartMatchedJobsData = await getSmartMatchedJobs(user.user_id);
        if (smartMatchedJobsData) setSmartMatchedJobs(smartMatchedJobsData);
      } catch (smartMatchErr) {
        console.log("Error loading smart matched jobs:", smartMatchErr);
        setSmartMatchedJobs([]);
      }

      // Load notifications from backend
      try {
        const notificationsData = await getApplicantNotifications(user.user_id);
        setNotifications(notificationsData.map(notif => ({
          id: notif.id,
          type: notif.type,
          message: notif.message,
          date: notif.date?.split("T")[0] || new Date().toISOString().split("T")[0]
        })));
      } catch (notifErr) {
        console.log("Error loading notifications:", notifErr);
        setNotifications([]);
      }
    } catch (err) {
      console.log("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch functions for real-time updates
  const fetchJobs = async () => {
    try {
      const jobsData = await getJobs(user.user_id);
      if (jobsData) {
        setJobs(jobsData);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchNearbyJobs = async () => {
    try {
      if (userLocation.latitude && userLocation.longitude) {
        const nearby = await getNearbyJobs(user.user_id, userLocation.latitude, userLocation.longitude);
        setNearbyJobs(nearby || []);
      } else {
        const nearby = await getNearbyJobs(user.user_id);
        setNearbyJobs(nearby || []);
      }
    } catch (err) {
      console.error("Error fetching nearby jobs:", err);
    }
  };

  const fetchSmartMatchedJobs = async () => {
    try {
      const smartMatchedJobsData = await getSmartMatchedJobs(user.user_id);
      if (smartMatchedJobsData) setSmartMatchedJobs(smartMatchedJobsData);
    } catch (err) {
      console.error("Error fetching smart matched jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsData = await getApplications(user.user_id);
      if (applicationsData) {
        setApplications(applicationsData.map(app => ({
          ...app,
          id: app.application_id || app.id,
          jobTitle: app.title || app.job_title || app.jobTitle,
          company: app.company || app.company_name || app.company,
          appliedDate: app.applied_date || app.appliedDate,
          interviewDetails: (app.interview_date || app.interview_time || app.interview_type || app.interview_notes) ? {
            date: app.interview_date,
            time: app.interview_time,
            type: app.interview_type,
            notes: app.interview_notes
          } : null
        })));
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const detectUserLocation = async () => {
    if (!user || !user.user_id) {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("📍 User location detected:", { latitude, longitude });
          setUserLocation({ latitude, longitude });
          try {
            console.log("🔍 Fetching nearby jobs for user_id:", user.user_id, "at", latitude, longitude);
            const nearby = await getNearbyJobs(user.user_id, latitude, longitude);
            console.log("✅ Nearby jobs fetched:", nearby?.length || 0, "jobs");
            console.log("📋 Nearby jobs data:", nearby);
            setNearbyJobs(nearby || []);
          } catch (err) {
            console.error("❌ Failed to load nearby jobs with browser coords:", err);
            setNearbyJobs([]);
          }
        },
        async (error) => {
          console.log("❌ Location detection failed:", error);
          setUserLocation({ latitude: null, longitude: null });
          try {
            console.log("🔄 Falling back to backend user location for nearby jobs");
            const nearby = await getNearbyJobs(user.user_id);
            console.log("✅ Nearby jobs fetched with fallback:", nearby?.length || 0, "jobs");
            console.log("📋 Nearby jobs data:", nearby);
            setNearbyJobs(nearby || []);
          } catch (fallbackErr) {
            console.error("❌ Failed to load nearby jobs from fallback user location:", fallbackErr);
            setNearbyJobs([]);
          }
        }
      );
    } else {
      console.log("⚠️ Geolocation not available, fetching by user ID fallback.");
      try {
        const nearby = await getNearbyJobs(user.user_id);
        console.log("✅ Nearby jobs fetched with user-id fallback:", nearby?.length || 0, "jobs");
        console.log("📋 Nearby jobs data:", nearby);
        setNearbyJobs(nearby || []);
      } catch (err) {
        console.error("❌ Failed to load nearby jobs via fallback user location:", err);
        setNearbyJobs([]);
      }
    }
  };

  const handleManualLocationSearch = async () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Please enter valid latitude (-90 to 90) and longitude (-180 to 180) coordinates.");
      return;
    }

    console.log("🔍 Manual location search:", { lat, lng });
    setUserLocation({ latitude: lat, longitude: lng });
    try {
      console.log("🔍 Fetching nearby jobs for user_id:", user.user_id, "at", lat, lng);
      const nearby = await getNearbyJobs(user.user_id, lat, lng);
      console.log("✅ Nearby jobs fetched:", nearby?.length || 0, "jobs");
      console.log("📋 Nearby jobs data:", nearby);
      setNearbyJobs(nearby || []);
    } catch (err) {
      console.error("❌ Failed to load nearby jobs:", err);
      setNearbyJobs([]);
      alert("Failed to load nearby jobs. Please try again.");
    }
  };


  const handleApply = async (job_id) => {
    try {
      if (!user.applicant_id) {
        alert("Loading your profile... please try again.");
        return;
      }
      await applyJob({ applicant_id: user.applicant_id, job_id });
      alert("Applied successfully!");
      loadData();
    } catch (err) {
      console.log(err);
      alert("Application failed. Please try again.");
    }
  };

  const handleApplyWithDetails = async () => {
    if (!selectedJob) return;
    if (!user.applicant_id) {
      alert("Loading your profile... please try again.");
      return;
    }
    try {
      const jobId = selectedJob.job_id || selectedJob.id;
      if (!jobId) {
        alert("Job ID not found. Please try again.");
        return;
      }

      let resumeFilename = null;
      
      // Upload resume file if provided
      if (customResume) {
        try {
          const uploadResponse = await uploadApplicationResume(customResume);
          if (uploadResponse.filename) {
            resumeFilename = uploadResponse.filename;
          } else {
            alert("Failed to upload resume. Proceeding without resume.");
          }
        } catch (uploadErr) {
          console.log("Resume upload error:", uploadErr);
          alert("Failed to upload resume. Proceeding without resume.");
        }
      }

      const applicationData = {
        applicant_id: user.applicant_id,
        job_id: jobId,
        cover_letter: coverLetter,
        custom_resume: resumeFilename
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

  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = file?.name?.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (file && (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension))) {
      setCustomResume(file);
    } else {
      alert("Please upload a PDF, DOC, or DOCX file only.");
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    console.log("📁 File selected:", file);
    if (file) {
      console.log("✅ File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      setSelectedProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("🖼️ Preview generated");
        setProfilePicPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("❌ No file selected");
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedProfilePic) {
      alert("Please select a picture first");
      return;
    }
    
    if (!user || !user.user_id) {
      alert("You must be logged in to upload a profile picture");
      console.error("❌ No user or user_id found:", user);
      return;
    }
    
    try {
      console.log("🚀 Starting profile picture upload for user:", user.user_id);
      console.log("👤 User object:", user);
      console.log("📁 File details:", {
        name: selectedProfilePic.name,
        size: selectedProfilePic.size,
        type: selectedProfilePic.type
      });
      
      const response = await uploadProfilePicture(user.user_id, selectedProfilePic);
      console.log("✅ Upload response received:", response);
      
      if (response.error) {
        console.error("❌ Upload failed with error:", response.error);
        alert("Upload failed: " + response.error);
        return;
      }
      
      console.log("🎉 Profile picture uploaded successfully!");
      alert("Profile picture uploaded successfully!");
      setSelectedProfilePic(null);
      setProfilePicPreview(null);
      console.log("🔄 Calling loadData() to refresh UI...");
      loadData();
    } catch (err) {
      console.error("💥 Profile picture upload failed with exception:", err);
      alert("Failed to upload profile picture: " + (err.message || err));
    }
  };

  const handleSaveJob = async (job_id) => {
    if (!user) {
      alert("Please log in to save jobs.");
      return;
    }

    let applicantId = user.applicant_id;
    
    // If applicant_id is missing, try to fetch it from profile
    if (!applicantId && user.role === "applicant") {
      try {
        const profileData = await getApplicant(user.user_id);
        if (profileData && profileData.applicant_id) {
          applicantId = profileData.applicant_id;
          console.log("✓ Fetched applicant_id from profile:", applicantId);
        }
      } catch (err) {
        console.error("Could not fetch applicant profile:", err);
      }
    }

    if (!applicantId) {
      console.error("applicant_id is missing from user object:", user);
      alert("Error: Unable to determine your applicant ID. Please refresh the page and try again.");
      return;
    }

    const resolvedJobId = job_id || (job_id === 0 ? 0 : null);
    if (!resolvedJobId) {
      alert("Invalid job ID. Unable to save.");
      return;
    }

    try {
      await saveJob(applicantId, resolvedJobId);

      // Update saved jobs state immediately so the UI reflects the change.
      const savedJob = jobs.find(j => j.job_id === resolvedJobId || j.id === resolvedJobId);
      if (savedJob) {
        setSavedJobs(prev => {
          const exists = prev.some(s => s.job_id === resolvedJobId || s.id === resolvedJobId);
          if (exists) return prev;
          return [{ ...savedJob, saved_at: new Date().toISOString() }, ...prev];
        });
      }

      alert("Job saved successfully!");
      loadData(); // Refresh saved jobs from backend
    } catch (err) {
      console.error("Save job failed", err);
      const message = err.message || "Unknown error";
      if (message.includes("409")) {
        alert("Job is already saved.");
      } else {
        alert(`Failed to save job. ${message}`);
      }
    }
  };

  const handleUnsaveJob = async (job_id) => {
    if (!user) {
      alert("Please log in to unsave jobs.");
      return;
    }

    let applicantId = user.applicant_id;
    
    // If applicant_id is missing, try to fetch it from profile
    if (!applicantId && user.role === "applicant") {
      try {
        const profileData = await getApplicant(user.user_id);
        if (profileData && profileData.applicant_id) {
          applicantId = profileData.applicant_id;
        }
      } catch (err) {
        console.error("Could not fetch applicant profile:", err);
      }
    }

    if (!applicantId) {
      alert("Error: Unable to determine your applicant ID. Please refresh the page and try again.");
      return;
    }

    try {
      await unsaveJob(applicantId, job_id);
      alert("Job unsaved successfully!");

      // Update saved jobs state quickly so UI feels responsive
      setSavedJobs(prev => prev.filter(job => job.job_id !== job_id && job.id !== job_id));

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
      preferred_job: applicant.preferred_job || "",
      profile_picture: applicant.profile_picture || ""
    });
    setSelectedProfilePic(null);
    setProfilePicPreview(applicant.profile_picture ? `${API_URL}/uploads/profile_pictures/${applicant.profile_picture}?t=${Date.now()}` : null);
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
    if (typeof window !== "undefined") {
      const store = {
        notifications: settings.notifications,
        locationPermission: settings.locationPermission
      };
      window.localStorage.setItem("applicantSettings", JSON.stringify(store));
    }
  }, [settings.notifications, settings.locationPermission]);

  const handleChangePassword = async () => {
    if (settings.newPassword !== settings.confirmPassword) {
      setSettingsStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (!settings.newPassword || settings.newPassword.length < 6) {
      setSettingsStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    try {
      await updateApplicantPassword(user.user_id, {
        new_password: settings.newPassword,
        confirm_password: settings.confirmPassword
      });
      setSettingsStatus({ type: "success", message: "Password updated successfully." });
      setSettings(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } catch (error) {
      const message = error?.message || "Failed to update password.";
      setSettingsStatus({ type: "error", message });
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

  // Save activeTab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("applicantActiveTab", activeTab);
  }, [activeTab]);

  const jobCategories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean)));
  const applicationStatuses = ["all", "pending", "shortlisted", "interview", "accepted", "rejected"];
  const statusLabelMap = {
    all: "All Applications",
    pending: "Pending",
    shortlisted: "Shortlisted",
    interview: "Interview",
    accepted: "Accepted",
    rejected: "Rejected"
  };
  const filteredApplications = applicationView === "all"
    ? applications
    : applications.filter(app => app.status === applicationView);

  if (loading) return <h2>Loading...</h2>;
  if (!user || !user.user_id) return <h2>Please login first</h2>;
  if (!applicant) return <h2>No applicant data found</h2>;

  const profileChecklist = [
    { label: "Name and email set", done: applicant.name && applicant.email },
    { label: "Disability type provided", done: applicant.disability_type },
    { label: "Skills provided", done: applicant.skills },
    { label: "Education details provided", done: applicant.education },
    { label: "Preferred job provided", done: applicant.preferred_job },
    { label: "Resume uploaded", done: applicant.pwd_verification }
  ];

  const profileCompletion = Math.min(100, Math.max(0, Math.round((profileChecklist.filter(item => item.done).length / profileChecklist.length) * 100)));

  // Navigation tabs (without Profile)
  const navTabs = [
    { id: "dashboard", label: "Dashboard"},
    { id: "jobs", label: "Find Jobs" },
    { id: "nearby", label: "Nearby Jobs"},
    { id: "saved", label: "Saved Jobs"},
    { id: "applications", label: "Applications"},
    { id: "notifications", label: "Notifications"},
    { id: "settings", label: "Settings"}
  ];

  return (
    <div className="applicant-dashboard-container">
      {/* Top Navigation Tabs - Hidden when in Profile view */}
      {activeTab !== "profile" && (
        <div className="applicant-dashboard-header">
          <div>
            <h1>ABLEWORK Dashboard</h1>
            <p>Your Path to Inclusive Employment</p>
          </div>
          <div className="dashboard-profile-action">
            <button
              type="button"
              className="profile-icon-btn"
              onClick={() => setShowProfilePopup(prev => !prev)}
            >
              {applicant?.profile_picture ? (
                <img 
                  src={`${API_URL}/uploads/profile_pictures/${applicant.profile_picture}?t=${Date.now()}`} 
                  alt="Profile" 
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                applicant?.name ? applicant.name.charAt(0).toUpperCase() : "A"
              )}
            </button>
            {showProfilePopup && (
              <div className="profile-popup-card">
                <p className="profile-popup-name"><strong>{applicant?.name || "Applicant"}</strong></p>
                <p className="profile-popup-email">{applicant?.email || user?.email || "No email found"}</p>
                <button
                  type="button"
                  className="profile-popup-edit-btn"
                  onClick={() => {
                    setActiveTab("profile");
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
                      navigate('/');
                    }
                    setShowProfilePopup(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== "profile" && (
        <div className="applicant-dashboard-nav">
          {navTabs.map(tab => (
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
      )}

      <div className="applicant-dashboard-content">
        {/* Main Content */}
        <div className="applicant-dashboard-main">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "25px" }}>Dashboard Overview</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e0f7fa", textAlign: "center" }}>
                  <h3>Total Applications</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.applications || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff3e0", textAlign: "center" }}>
                  <h3>Applied Today</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.today_applications || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f3e5f5", textAlign: "center" }}>
                  <h3>Saved Jobs</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.saved_jobs || 0}</p>
                </div>
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#e8f5e8", textAlign: "center" }}>
                  <h3>Profile Complete</h3>
                  <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{profileCompletion}%</p>
                </div>
              </div>

              <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", marginBottom: "30px", backgroundColor: "#f9f9f9" }}>
                <h3>Quick Actions</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "15px" }}>
                  <button onClick={() => setActiveTab("jobs")} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Find Jobs
                  </button>
                  <button onClick={() => setActiveTab("nearby")} style={{ padding: "10px 20px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Nearby Jobs
                  </button>
                </div>
              </div>

              <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#fff" }}>
                <h3>Recent Activity</h3>
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
              smartMatchedJobs={smartMatchedJobs}
              filters={filters}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onApply={openApplyModal}
              onSaveJob={handleSaveJob}
              onViewJob={openJobDetails}
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
              onViewJob={openJobDetails}
              savedJobs={savedJobs}
            />
          )}

          {/* Saved Jobs Tab */}
          {activeTab === "saved" && (
            <div>
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Saved Jobs</h2>
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
                        <h4 style={{ margin: "0 0 10px 0" }}>{job.title || job.job_title}</h4>
                        <p style={{ margin: "5px 0", color: "#666" }}><strong>Company:</strong> {job.company || job.company_name || "Unknown"}</p>
                        <p style={{ margin: "5px 0", color: "#666" }}><strong>Location:</strong> {job.location || "N/A"}</p>
                        <p style={{ margin: "5px 0" }}>{job.description || job.job_description}</p>
                        <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                          <span>{job.category || job.job_category}</span>
                          <span>${job.salary || "N/A"}</span>
                          <span>Saved {job.saved_at ? new Date(job.saved_at).toLocaleDateString() : "Unknown"}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <button
                          onClick={() => openJobDetails(job)}
                          style={{ padding: "8px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          View Job
                        </button>
                        <button
                          onClick={() => openApplyModal(job)}
                          style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={() => handleUnsaveJob(job.job_id)}
                          style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          Unsave
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
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Application Tracking</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "25px" }}>
                {applicationStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setApplicationView(status)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: applicationView === status ? "2px solid #0d47a1" : "1px solid #ccc",
                      backgroundColor: applicationView === status ? "#0d47a1" : "#f7f7f7",
                      color: applicationView === status ? "white" : "#333",
                      cursor: "pointer",
                      minWidth: "110px",
                      textAlign: "center"
                    }}
                  >
                    {statusLabelMap[status]}{status !== "all" ? ` (${applications.filter(app => app.status === status).length})` : ` (${applications.length})`}
                  </button>
                ))}
              </div>
              {filteredApplications.length === 0 ? (
                <div style={{ border: "2px solid #333", borderRadius: "12px", padding: "40px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
                  <h3>No {statusLabelMap[applicationView].toLowerCase()} found</h3>
                  <p>Try selecting a different application section or apply to new jobs.</p>
                  <button onClick={() => setActiveTab("jobs")} style={{ marginTop: "15px", padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    🔍 Find Jobs
                  </button>
                </div>
              ) : (
                filteredApplications.map((app, index) => (
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
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button 
                        onClick={() => viewApplicationDetails(app)}
                        style={{ padding: "6px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        View Details
                      </button>
                      {app.status === "pending" && (
                        <button 
                          onClick={() => handleWithdrawApplication(app.application_id)}
                          style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Withdraw
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
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Notifications</h2>
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
                          {notification.type === "job" && "💼 "}
                          {notification.type === "interview" && "🎯 "}
                          {notification.type === "welcome" && "👋 "}
                          {notification.type === "tip" && "💡 "}
                          {notification.title || notification.message}
                        </h4>
                        {notification.title && notification.message !== notification.title && (
                          <p style={{ margin: "0 0 5px 0", color: "#666" }}>{notification.message}</p>
                        )}
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
              <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}>Settings</h2>

              <div style={{ display: "grid", gap: "20px" }}>
                <div
                  onClick={() => setSettingsModal("account")}
                  style={{ cursor: "pointer", border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>Account</h3>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>View and edit your account details.</p>
                  </div>
                  
                </div>

                <div
                  onClick={() => setSettingsModal("security")}
                  style={{ cursor: "pointer", border: "2px solid #333", borderRadius: "12px", padding: "20px", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>Security & Password</h3>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>Change your password and keep your account secure.</p>
                  </div>
                </div>

                <div
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{ cursor: "pointer", border: "2px solid #dc3545", borderRadius: "12px", padding: "20px", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: "#dc3545" }}>Log Out</h3>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>Sign out of your ABLEWORK account securely.</p>
                  </div>
            
                </div>
              </div>

              {settingsModal && (
                <div
                  onClick={() => setSettingsModal(null)}
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "min(95%, 600px)", borderRadius: "16px", backgroundColor: "white", padding: "30px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h2 style={{ margin: 0 }}>{settingsModal === "account" ? "Account Details" : "Security"}</h2>
                      <button onClick={() => setSettingsModal(null)} style={{ border: "none", background: "transparent", fontSize: "24px", cursor: "pointer" }}>✕</button>
                    </div>

                    {settingsModal === "account" && (
                      <div style={{ display: "grid", gap: "18px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0" }}>Email address</h4>
                          <p style={{ margin: 0, color: "#666" }}>{applicant?.email || user?.email || "Not set"}</p>
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0" }}>Username</h4>
                          <p style={{ margin: 0, color: "#666" }}>{applicant?.username || "Not set"}</p>
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 6px 0" }}>Full name</h4>
                          <p style={{ margin: 0, color: "#666" }}>{applicant?.name || "Not set"}</p>
                        </div>
                        <button onClick={() => { setSettingsModal(null); setActiveTab("profile"); }} style={{ padding: "12px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Edit Profile</button>
                      </div>
                    )}

                    {settingsModal === "security" && (
                      <div style={{ display: "grid", gap: "16px" }}>
                        <input
                          type="password"
                          placeholder="New Password"
                          value={settings.newPassword}
                          onChange={e => updateSettings("newPassword", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={settings.confirmPassword}
                          onChange={e => updateSettings("confirmPassword", e.target.value)}
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                        <button onClick={handleChangePassword} style={{ padding: "12px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Change Password</button>
                        {settingsStatus && (
                          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: settingsStatus.type === "success" ? "#e8f5e9" : "#ffebee", color: settingsStatus.type === "success" ? "#2e7d32" : "#c62828", border: `1px solid ${settingsStatus.type === "success" ? "#4caf50" : "#f44336"}` }}>
                            {settingsStatus.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showLogoutConfirm && (
                <div
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: "min(95%, 420px)", borderRadius: "16px", backgroundColor: "white", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
                  >
                    <h2 style={{ margin: "0 0 16px 0" }}>Confirm Logout</h2>
                    <p style={{ margin: "0 0 24px 0", color: "#555" }}>Are you sure you want to sign out?</p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                      <button onClick={() => setShowLogoutConfirm(false)} style={{ padding: "10px 18px", backgroundColor: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => { setShowLogoutConfirm(false); setUser(null); window.location.href = "/"; }} style={{ padding: "10px 18px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Yes, log out</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab - Full view with no navigation */}
          {activeTab === "profile" && (
            <div>
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  marginBottom: "20px",
                  padding: "10px 18px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#333",
                  cursor: "pointer"
                }}
              >
                ← Back
              </button>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "15px" }}>Profile</h2>

              <div style={{ display: "grid", gap: "28px" }}>
                <div style={{ border: "2px solid #333", borderRadius: "16px", padding: "24px", backgroundColor: "#f1f8ff", display: "grid", gridTemplateColumns: "100px 1fr", gap: "24px", alignItems: "center" }}>
                  <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#007bff", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "2.4rem", fontWeight: "bold", overflow: "hidden" }}>
                    {applicant.profile_picture ? (
                      <img src={`${API_URL}/uploads/profile_pictures/${applicant.profile_picture}?t=${Date.now()}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      applicant.name ? applicant.name.split(" ").map(n => n[0]).join("").toUpperCase() : "A"
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 10px 0" }}>{applicant.name || "Untitled Applicant"}</h3>
                    <p style={{ margin: "4px 0", color: "#333" }}><strong>Email:</strong> {applicant.email || "Not set"}</p>
                    <p style={{ margin: "4px 0", color: "#333" }}><strong>Preferred Job:</strong> {applicant.preferred_job || "Not set"}</p>
                    <p style={{ margin: "4px 0", color: "#333" }}><strong>Disability Type:</strong> {applicant.disability_type || "Not set"}</p>
                    <p style={{ margin: "4px 0", color: "#333" }}><strong>Resume Status:</strong> {applicant.pwd_verification ? "Uploaded" : "Not uploaded"}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "30px" }}>
                  <div style={{ border: "2px solid #333", borderRadius: "16px", padding: "24px", backgroundColor: "#fff" }}>
                    <div style={{ display: "grid", gap: "14px" }}>
                      <div><strong>Name:</strong> {applicant.name || "-"}</div>
                      <div><strong>Email:</strong> {applicant.email || "-"}</div>
                      <div><strong>Disability Type:</strong> {applicant.disability_type || "-"}</div>
                      <div><strong>Skills:</strong> {applicant.skills || "-"}</div>
                      <div><strong>Education:</strong> {applicant.education || "-"}</div>
                      <div><strong>Preferred Job:</strong> {applicant.preferred_job || "-"}</div>
                      <div><strong>Resume Status:</strong> {applicant.pwd_verification ? "Uploaded" : "Not uploaded"}</div>
                    </div>
                    <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={openEditProfileModal}
                        style={{ padding: "12px 22px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  <div style={{ border: "2px solid #333", borderRadius: "16px", padding: "24px", backgroundColor: "#e8f5e8" }}>
                    <h3 style={{ margin: "0 0 18px 0" }}>Profile Completion</h3>
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span>Completion</span>
                        <span style={{ fontWeight: "700" }}>{profileCompletion}%</span>
                      </div>
                      <div style={{ width: "100%", height: "18px", backgroundColor: "#ddd", borderRadius: "9px" }}>
                        <div style={{ width: `${profileCompletion}%`, height: "100%", backgroundColor: "#28a745", borderRadius: "9px" }} />
                      </div>
                      <ul style={{ marginTop: "18px", paddingLeft: "18px" }}>
                        {profileChecklist.map((item, index) => (
                          <li key={index} style={{ color: item.done ? "#28a745" : "#dc3545", marginBottom: "8px" }}>
                            {item.done ? "✓" : "✗"} {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


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
            <h3>Apply for: {selectedJob.title || selectedJob.job_title || 'Position'}</h3>
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
                  accept=".pdf,.doc,.docx"
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
                Submit Application
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
            <h2 style={{ margin: "0 0 20px 0", color: "#333" }}>Application Details</h2>
            
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

            {selectedApplication.status === "interview" && selectedApplication.interviewDetails && (
              <div style={{ backgroundColor: "#e9f7fe", border: "1px solid #bee5eb", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>📅 Interview Details</h4>
                <p style={{ margin: "0 0 5px 0" }}><strong>Date:</strong> {selectedApplication.interviewDetails.date ? new Date(selectedApplication.interviewDetails.date).toLocaleDateString() : "TBD"}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Time:</strong> {selectedApplication.interviewDetails.time ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(`2000-01-01T${selectedApplication.interviewDetails.time}`)) : "TBD"}</p>
                <p style={{ margin: "0 0 5px 0" }}><strong>Type:</strong> {selectedApplication.interviewDetails.type || "TBD"}</p>
                {selectedApplication.interviewDetails.notes && (
                  <p style={{ margin: "10px 0 0 0", color: "#0c5460" }}><strong>Notes:</strong> {selectedApplication.interviewDetails.notes}</p>
                )}
              </div>
            )}

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
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetailsModal && selectedJob && (
        <JobDetailsModal
          isOpen={showJobDetailsModal}
          onClose={() => setShowJobDetailsModal(false)}
          job={selectedJob}
          onApply={(jobId) => {
            setShowJobDetailsModal(false);
            openApplyModal(selectedJob);
          }}
          onSaveJob={handleSaveJob}
          savedJobs={savedJobs}
        />
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
            <h3>Edit Profile</h3>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              {/* Profile Picture Section */}
              <div>
                <label><b>Profile Picture</b></label>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "2px solid #ddd"
                  }}>
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Profile Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "24px", color: "#666" }}>👤</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      style={{ marginBottom: "10px" }}
                    />
                    {selectedProfilePic && (
                      <button
                        onClick={handleUploadProfilePic}
                        style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Upload Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantDashboard;