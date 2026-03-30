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

//API get applicant details
export const getApplicant = async (user_id) => {

const response = await fetch(`${API_URL}/api/applicant/${user_id}`);

return response.json();

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

export const getNearbyJobs = async (latitude, longitude) => {
  const response = await fetch(`${API_URL}/api/jobs/nearby?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API get nearby jobs failed: ${response.status} ${errorBody}`);
  }
  return response.json();
};

export const getApplications = async (user_id) => {
  const response = await fetch(`${API_URL}/api/applications/${user_id}`);
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
  const formData = new FormData();
  formData.append("logo_file", file);

  const response = await fetch(`${API_URL}/api/employer/${user_id}/logo`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API upload logo failed: ${response.status} ${errorBody}`);
  }

  return response.json();
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
export const saveJob = async (user_id, job_id) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/saved-jobs/${job_id}`, {
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
export const unsaveJob = async (user_id, job_id) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/saved-jobs/${job_id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API unsave job failed: ${response.status} ${errorBody}`);
  }

  return response.json();
};

// Get saved jobs for applicant
export const getSavedJobs = async (user_id) => {
  const response = await fetch(`${API_URL}/api/applicant/${user_id}/saved-jobs`);

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