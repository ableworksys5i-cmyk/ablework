const API_URL = "http://localhost:3000";

export { API_URL };

//API register function
export const registerUser = async (data) => {

const response = await fetch(`${API_URL}/api/auth/register`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(data)
});

return response.json();

};

//API login function
export const loginUser = async (data) => {

const response = await fetch(`${API_URL}/api/auth/login`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(data)
});
return response.json();
};

// Verify Email
export const verifyEmail = async (data) => {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Resend Verification Code
export const resendVerificationCode = async (data) => {
  const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Forgot Password
export const forgotPassword = async (data) => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Verify Reset Code
export const verifyResetCode = async (data) => {
  const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Reset Password
export const resetPassword = async (data) => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

//API get applicant details
export const getApplicant = async (user_id) => {

const response = await fetch(`${API_URL}/api/applicant/${user_id}`);

return response.json();

};

export const uploadProfilePicture = async (user_id, profilePicFile) => {
  const formData = new FormData();
  formData.append("profile_picture", profilePicFile);
  
  console.log("🌐 API: Preparing to upload profile picture for user", user_id);
  console.log("📦 FormData contents:", formData.get("profile_picture"));
  console.log("🔗 API URL:", `${API_URL}/api/applicant/${user_id}/profile-picture`);
  
  try {
    const response = await fetch(`${API_URL}/api/applicant/${user_id}/profile-picture`, {
      method: "POST",
      body: formData
    });
    
    console.log("📡 API: Fetch response status:", response.status);
    console.log("📡 API: Fetch response ok:", response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API: Raw error response:", errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { message: errorText };
      }
      console.error("❌ API: Parsed error response:", error);
      throw new Error(error.message || "Upload failed");
    }
    
    const result = await response.json();
    console.log("✅ API: Upload successful, result:", result);
    return result;
  } catch (fetchError) {
    console.error("💥 API: Fetch error:", fetchError);
    throw fetchError;
  }
};

export const getStats = async (user_id) => {
  const response = await fetch(`${API_URL}/api/applicant/stats/${user_id}`);
  return response.json();
};

export const getJobs = async (user_id) => {
  const response = await fetch(`${API_URL}/api/jobs/recommended/${user_id}`);
  return response.json();
};

export const getJobsByCategory = async (category) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`${API_URL}/api/jobs/category${query}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get jobs by category failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const getNearbyJobs = async (user_id, latitude, longitude, radiusKm) => {
  let query = "";
  if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
    const params = [`lat=${encodeURIComponent(latitude)}`, `lng=${encodeURIComponent(longitude)}`];
    if (radiusKm !== undefined && radiusKm !== null) {
      params.push(`radius_km=${encodeURIComponent(radiusKm)}`);
    }
    query = `?${params.join("&")}`;
  } else if (user_id) {
    const params = [`user_id=${encodeURIComponent(user_id)}`];
    if (radiusKm !== undefined && radiusKm !== null) {
      params.push(`radius_km=${encodeURIComponent(radiusKm)}`);
    }
    query = `?${params.join("&")}`;
  } else {
    throw new Error("API get nearby jobs requires user_id or latitude/longitude");
  }

  const response = await fetch(`${API_URL}/api/jobs/nearby${query}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get nearby jobs failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const getGeofences = async (employer_id) => {
  const response = await fetch(`${API_URL}/api/geofences?employer_id=${encodeURIComponent(employer_id)}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get geofences failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const createGeofence = async (employer_id, data) => {
  const response = await fetch(`${API_URL}/api/geofences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ employer_id, ...data })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API create geofence failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const deleteGeofence = async (employer_id, geofence_id) => {
  const response = await fetch(`${API_URL}/api/geofences/${encodeURIComponent(geofence_id)}?employer_id=${encodeURIComponent(employer_id)}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API delete geofence failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const getSmartMatchedJobs = async (user_id) => {
  const response = await fetch(`${API_URL}/api/jobs/smart-matched?user_id=${encodeURIComponent(user_id)}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get smart matched jobs failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const getApplications = async (user_id) => {
  const response = await fetch(`${API_URL}/api/applications/${user_id}`);
  return response.json();
};

export const uploadApplicationResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  const response = await fetch(`${API_URL}/api/applications/upload-resume`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API upload application resume failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const applyJob = async (data) => {
  const response = await fetch(`${API_URL}/api/applications/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const withdrawApplication = async (application_id) => {
  const response = await fetch(`${API_URL}/api/applications/${application_id}/withdraw`, {
    method: "DELETE"
  });
  return response.json();
};

export const getEmployer = async (user_id) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}`);
  return response.json();
};

export const getEmployerJobs = async (user_id) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/jobs`);
  return response.json();
};

export const createEmployerJob = async (user_id, data) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const body = await response.json();
  if (!response.ok) {
    const errMsg = body && body.error ? body.error : `Failed to create job (${response.status})`;
    throw new Error(errMsg);
  }

  return body;
};

export const updateEmployerJob = async (user_id, job_id, data) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/jobs/${job_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const body = await response.json();
  if (!response.ok) {
    const errMsg = body && body.error ? body.error : `Failed to update job (${response.status})`;
    throw new Error(errMsg);
  }

  return body;
};

export const getEmployerApplications = async (user_id) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/applications`);
  return response.json();
};

export const getEmployerNotifications = async (user_id) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/notifications`);
  return response.json();
};

export const getApplicantNotifications = async (user_id) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/notifications`);
  return response.json();
};

export const updatePwdVerificationStatus = async (user_id, applicant_id, status) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/applicants/${applicant_id}/pwd-verification`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};

export const updateEmployer = async (user_id, data) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API update employer failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const uploadEmployerLogo = async (user_id, file) => {
  console.log("API uploadEmployerLogo called with:", { user_id, file });

  const formData = new FormData();
  formData.append("logo_file", file);

  console.log("FormData created, making request to:", `${API_URL}/api/employer/${user_id}/logo`);

  const response = await fetch(`${API_URL}/api/employer/${user_id}/logo`, {
    method: "POST",
    body: formData
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error response body:", errorBody);
    throw new Error(`API upload logo failed: ${response.status} ${errorBody}`);
  }

  const result = await response.json();
  console.log("Success response:", result);
  return result;
};

export const updateApplicant = async (user_id, data) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API update applicant failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const uploadApplicantResume = async (user_id, file) => {
  const formData = new FormData();
  formData.append("resume_file", file);

  const response = await fetch(`${API_URL}/api/applicant/${user_id}/resume`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API upload resume failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API update application status failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Save a job for applicant
export const saveJob = async (applicant_id, job_id) => {
  const response = await fetch(`${API_URL}/api/applicant/saved-jobs/${applicant_id}/${job_id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API save job failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Unsave a job for applicant
export const unsaveJob = async (applicant_id, job_id) => {
  const response = await fetch(`${API_URL}/api/applicant/saved-jobs/${applicant_id}/${job_id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API unsave job failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Get saved jobs for applicant
export const getSavedJobs = async (applicant_id) => {
  const response = await fetch(`${API_URL}/api/applicant/saved-jobs/${applicant_id}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get saved jobs failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Archive or restore an application
export const archiveApplication = async (user_id, application_id, action) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/applications/${application_id}/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API archive application failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Schedule interview
export const scheduleInterview = async (applicationId, data) => {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API schedule interview failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Send job offer
export const sendJobOffer = async (applicationId, data) => {
  const response = await fetch(`${API_URL}/api/applications/${applicationId}/offer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API send job offer failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Update employer password
export const updateEmployerPassword = async (user_id, data) => {
  const response = await fetch(`${API_URL}/api/employer/${user_id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API update password failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

export const updateApplicantPassword = async (user_id, data) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API update password failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};