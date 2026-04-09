# Resume Upload Fix - Implementation Summary

## Problem Identified
Applications were storing `[object Object]` in the `custom_resume` field instead of actual filenames. This occurred because:
1. Frontend was sending File objects in JSON request body
2. JSON.stringify() on File objects produces `[object Object]`
3. Database received this string instead of actual filename
4. Employer couldn't access resume files

## Solution Implemented

### 1. Backend Changes

#### New Endpoint: POST /api/applications/upload-resume
**File:** [backend/routes/applicationRoutes.js](backend/routes/applicationRoutes.js)

- Added multer middleware for file upload handling
- Configured to store resumes in `/backend/uploads/resumes/`
- Filename format: `{timestamp}-{random}.{extension}`
- Only accepts PDF files
- Returns JSON response: `{ filename: "1234567890-123456789.pdf" }`

**Route Configuration:**
```javascript
router.post("/upload-resume", resumeUpload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ filename: req.file.filename });
});
```

#### Existing Endpoint: POST /api/applications/apply
**File:** [backend/controllers/applicationController.js](backend/controllers/applicationController.js)

- No changes needed - already accepts `custom_resume` as string parameter
- Stores filename string directly in database

### 2. Frontend Changes

#### New API Function: uploadApplicationResume()
**File:** [frontend/src/api/api.js](frontend/src/api/api.js)

```javascript
export const uploadApplicationResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  const response = await fetch(`${API_URL}/api/applications/upload-resume`, {
    method: "POST",
    body: formData
  });
  return response.json();
};
```

#### Updated Handler: handleApplyWithDetails()
**File:** [frontend/src/pages/ApplicantDashboard.jsx](frontend/src/pages/ApplicantDashboard.jsx)

Process:
1. User selects resume file (stored in state as File object)
2. User clicks "Apply" button
3. If resume selected:
   - Call `uploadApplicationResume(customResume)` 
   - Upload file to `/api/applications/upload-resume`
   - Receive `{ filename: "..." }` response
   - Store filename in `resumeFilename` variable
4. Create application data with filename (not File object)
5. Call `applyJob(applicationData)` with filename string
6. Backend stores filename in database

## Data Flow

```
User selects PDF file in frontend
     ↓
File stored as File object in state (customResume)
     ↓
User clicks "Apply"
     ↓
handleApplyWithDetails() called
     ↓
uploadApplicationResume(File) → FormData upload
     ↓
Backend: /upload-resume endpoint with multer
     ↓
File saved to /uploads/resumes/1234567890-123456789.pdf
     ↓
Frontend receives: { filename: "1234567890-123456789.pdf" }
     ↓
Application data created: { applicant_id, job_id, cover_letter, custom_resume: "1234567890-123456789.pdf" }
     ↓
applyJob(applicationData) sends JSON to /apply endpoint
     ↓
Backend stores in database: applications.custom_resume = "1234567890-123456789.pdf"
     ↓
Employer can access resume at: /uploads/resumes/1234567890-123456789.pdf
```

## Files Created/Modified

### Created:
- `/backend/uploads/resumes/` - Directory for application resumes

### Modified:
1. **[backend/routes/applicationRoutes.js](backend/routes/applicationRoutes.js)**
   - Added multer configuration
   - Added POST /upload-resume endpoint

2. **[frontend/src/api/api.js](frontend/src/api/api.js)**
   - Added uploadApplicationResume() function

3. **[frontend/src/pages/ApplicantDashboard.jsx](frontend/src/pages/ApplicantDashboard.jsx)**
   - Imported uploadApplicationResume
   - Updated handleApplyWithDetails() to upload resume first, then apply

## Testing

### Test Case 1: Apply Without Resume
1. Applicant opens job details modal
2. Fills in cover letter only
3. Clicks "Apply"
4. Expected: Application created with custom_resume = NULL

### Test Case 2: Apply With Resume
1. Applicant opens job details modal
2. Selects PDF resume file
3. Fills in cover letter
4. Clicks "Apply"
5. Expected:
   - Resume file uploaded to backend/uploads/resumes/
   - Application created with custom_resume = filename
   - Employer sees resume filename and can download it

### Verification Steps
1. Submit application with resume
2. Query database: `SELECT application_id, custom_resume FROM applications;`
3. Expected: custom_resume should be filename (e.g., "1705123456-987654321.pdf"), NOT "[object Object]"
4. Check file exists: `ls -la backend/uploads/resumes/`
5. Verify employer dashboard shows resume link correctly

## Key Benefits

✅ Resumes now stored as actual filenames in database
✅ File upload handled separately from application submission
✅ Graceful fallback if upload fails (application proceeds without resume)
✅ Maintains existing application controller logic
✅ Works with existing employer dashboard resume display

## Browser Compatibility

- Modern browsers with FormData and fetch API
- Works with all modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies added
