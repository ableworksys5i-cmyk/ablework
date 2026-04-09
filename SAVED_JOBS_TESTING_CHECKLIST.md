# Saved Jobs Testing Checklist

## Overview
This checklist helps you systematically test the saved jobs feature and identify where data is being lost between save and reload.

---

## Phase 1: Setup & Preparation

- [ ] Backend is running: `npm run dev` (or `node server.js`) from `/backend` folder
- [ ] Frontend is running: `npm run dev` from `/frontend` folder  
- [ ] Both running on correct ports (backend: 5000, frontend: typically 5173)
- [ ] Open browser DevTools (F12)
- [ ] Open another terminal window to watch backend logs

---

## Phase 2: Registration Test

This phase verifies that the applicant record is created properly.

### 2.1 Start Fresh Registration
- [ ] Clear browser cache/cookies (Optional: use incognito mode)
- [ ] Navigate to Register page
- [ ] Choose "Applicant" role
- [ ] Fill out form:
  - [ ] Name
  - [ ] Username (something unique like: `testuser_[timestamp]`)
  - [ ] Email
  - [ ] Password
  - [ ] Other fields as needed

### 2.2 Check Location Capture
- [ ] **Before clicking Register**, check the form
- [ ] You should see: **✓ Location captured** (green text) or **⚠️ Location access denied** (orange text)
- [ ] If location denied, check your browser permissions and try again
- [ ] **Check backend terminal output** - look for:
  ```
  ✓ Applicant record created for user_id: XX
  ✓ User location saved for user_id: XX
  ```
  **OR**
  ```
  ℹ️ No location data provided for user_id: XX
  ```

### 2.3 Complete Registration
- [ ] Click "Register" button
- [ ] Wait for success message
- [ ] **Screenshot or note your username** - you'll need it for testing
- [ ] You should be redirected to dashboard or login

---

## Phase 3: Login & Identify User ID

### 3.1 Login to Application
- [ ] Navigate to Login page
- [ ] Enter your test username and password
- [ ] Click Login
- [ ] Wait for dashboard to load

### 3.2 Find Your User ID
Choose ONE of these methods:

**Method A: Browser DevTools**
1. [ ] Press F12 to open DevTools
2. [ ] Go to "Application" tab (or "Storage" in Firefox)
3. [ ] Expand "Local Storage"
4. [ ] Look for your domain
5. [ ] Search for `user_id` or `userId`
6. [ ] Copy the value

**Method B: Network Tab**
1. [ ] Open DevTools (F12)
2. [ ] Go to "Network" tab
3. [ ] During login, look for API calls to `/login` or `/auth/login`
4. [ ] Click on that request
5. [ ] Go to "Response" tab
6. [ ] Find `user_id` in the JSON response
7. [ ] Copy the value

**Method C: Debug Console**
1. [ ] Open DevTools Console (F12 → Console tab)
2. [ ] Paste this command:
   ```javascript
   console.log(localStorage)
   // or
   console.log(sessionStorage)
   ```
3. [ ] Look for `user_id` or `userId`

- [ ] **Note your User ID: ________________**

---

## Phase 4: Test Debug Endpoint

This verifies that the backend can find your applicant record.

### 4.1 Call Debug Endpoint
- [ ] Open a new tab
- [ ] Visit this URL (replace `YOUR_USER_ID` with your actual ID):
  ```
  http://localhost:5000/api/applicant/YOUR_USER_ID/debug
  ```

### 4.2 Check Response

**Expected Success Response:**
```json
{
  "user_found": true,
  "applicant_found": true,
  "applicant_id": 10,
  "saved_jobs_count": 0
}
```

**What to look for:**
- [ ] `"user_found": true` ✓
- [ ] `"applicant_found": true` ✓
- [ ] `"applicant_id"` has a number (note this ID)
- [ ] `"saved_jobs_count": 0` (should be 0 on first test)

**If you see "applicant_found": false:**
```json
{
  "user_found": true,
  "applicant_found": false
}
```
- [ ] **BLOCKER FOUND**: Applicant record not created during registration
- [ ] Check backend terminal for errors during registration
- [ ] Proceed to Phase 5 and report this issue

**If you see "user_found": false:**
- [ ] **BLOCKER FOUND**: User record not created
- [ ] Try logging in again
- [ ] Check if you're using the correct user_id

---

## Phase 5: Save a Job Test

### 5.1 Find a Job to Save
- [ ] Go back to the applicant dashboard
- [ ] Navigate to "Job Search" or equivalent section
- [ ] Find any job you want to save
- [ ] **Note the Job ID**: ________________ (if visible) or just note the job title

### 5.2 Open Browser Console
- [ ] Press F12
- [ ] Go to "Console" tab
- [ ] **Keep this window open** for the next steps
- [ ] Make sure backend terminal is visible

### 5.3 Save the Job
- [ ] Click "Save Job" button for the job
- [ ] **Immediately check browser console** for this output:
  ```
  === SAVED JOBS DEBUG ===
  User ID: YOUR_USER_ID
  Saved jobs fetched: [...]
  Type: object
  Is Array: true
  Length: 1
  Saved jobs set to state: 1
  ```

- [ ] **Check backend terminal** for this output:
  ```
  === SAVE JOB REQUEST ===
  User ID: YOUR_USER_ID | Job ID: 1
  ✓ Applicant found - ID: 10
  ✓ Job saved successfully
  === END SAVE JOB REQUEST ===
  ```

- [ ] **Verify in UI**: The job should appear in "Saved Jobs" section immediately

### 5.4 Confirm Job was Saved
- [ ] [ ] Navigate to "Saved Jobs" section
- [ ] [ ] Verify the job appears in the list
- [ ] [ ] UI shows the job with a "Remove" or "Unsave" button

---

## Phase 6: The Critical Reload Test

This is where the bug manifests. 

### 6.1 Prepare for Reload
- [ ] **Clear browser console** (right-click → Clear console, or Ctrl+L)
- [ ] **Keep backend terminal open and visible**
- [ ] Make sure you can see "Saved Jobs" section on screen

### 6.2 Reload the Page
- [ ] Press **F5** (or Cmd+R on Mac) to reload
- [ ] Wait for page to fully load
- [ ] **Watch for the debug output** in browser console

### 6.3 Check Browser Console
After reload, you should see:
```
=== SAVED JOBS DEBUG ===
User ID: YOUR_USER_ID
Saved jobs fetched: [...]
Type: object
Is Array: true
Length: 1
Saved jobs set to state: 1
```

**Look specifically for:**
- [ ] The "Length" should be 1 (not 0)
- [ ] If Length is 0 → **Data not being retrieved from backend**

### 6.4 Check Backend Terminal
After reload, you should see:
```
=== GET SAVED JOBS REQUEST ===
User ID: YOUR_USER_ID
✓ Applicant found - ID: 10
✓ Returned 1 jobs
=== END SAVED JOBS REQUEST ===
```

**Look specifically for:**
- [ ] "Applicant found" shows same ID as before (should be consistent)
- [ ] If "Applicant not found" → **Different user_id on reload**
- [ ] Job count should still be 1 (not 0)

### 6.5 Check Saved Jobs in UI
- [ ] Navigate to (or look at) "Saved Jobs" section
- [ ] [ ] Is the job still there? **YES / NO**
- [ ] If NO → **Visual bug confirmed**
- [ ] Note the job title/details for your report

---

## Phase 7: Report Your Findings

Compile all this information and share:

### What Worked:
- [ ] Registered as applicant
- [ ] Got user_id: ________________
- [ ] Debug endpoint shows applicant_found: true
- [ ] Saved a job successfully
- [ ] Job appeared in "Saved Jobs" UI immediately
- [ ] Backend logged successful save

### What Failed (Pick One):

**SCENARIO A: Jobs disappear after reload**
- [ ] Browser console shows `Length: 0` after reload
- [ ] Backend shows 0 jobs returned
- [ ] UI "Saved Jobs" section is empty
- **Root Cause**: Backend query not returning saved jobs

**SCENARIO B: Applicant lookup fails on reload**
- [ ] Backend shows "❌ Applicant not found" on reload
- [ ] User ID from console differs between save and reload
- **Root Cause**: User session not persisting correctly

**SCENARIO C: Debug endpoint shows applicant_found: false**
- [ ] Initial debug endpoint call showed no applicant
- [ ] Save still somehow worked
- **Root Cause**: Inconsistent applicant lookup logic

**SCENARIO D: Backend errors show in console**
- [ ] Error message: ________________
- **Root Cause**: API error (check error details)

### Data to Share:

1. **Your test setup:**
   - Browser (Chrome, Firefox, Safari, etc.): ________________
   - OS (Windows, Mac, Linux): ________________

2. **Console output (screenshot or paste):**
   ```
   === SAVED JOBS DEBUG ===
   [paste browser console output here]
   ```

3. **Terminal output (screenshot or paste):**
   ```
   === SAVE JOB REQUEST ===
   [paste backend terminal output here]
   
   === GET SAVED JOBS REQUEST ===
   [paste backend terminal output here]
   ```

4. **Debug endpoint response:**
   ```
   [paste the full JSON response from /api/applicant/YOUR_USER_ID/debug]
   ```

---

## Troubleshooting Tips

**If you don't see any console output:**
- [ ] Make sure backend/frontend both started correctly
- [ ] Check ports: backend on 5000, frontend on 5173
- [ ] Restart both servers
- [ ] Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)

**If console output is cut off:**
- [ ] Expand the console by dragging
- [ ] Copy-paste the full output
- [ ] Take multiple screenshots if needed

**If you get CORS errors:**
- [ ] This means frontend can't reach backend
- [ ] Check that both servers are running
- [ ] Check backend URL in `/frontend/src/api/api.js`

**If you forget your user_id:**
- [ ] Log in again
- [ ] Repeat Phase 3 to find it
- [ ] It should be the same across logins

---

## Success Criteria

When this is working correctly, you should see:

1. ✓ Register successfully with applicant record created
2. ✓ Debug endpoint confirms applicant_found: true
3. ✓ Save a job - backend logs successful save
4. ✓ Job appears in "Saved Jobs" UI
5. ✓ Reload page - browser console shows Length: 1
6. ✓ Backend logs return 1 saved job
7. ✓ Job still appears in "Saved Jobs" UI after reload
8. ✓ Saved jobs persist indefinitely across multiple reloads

If any of these fail, that's where we focus the fix!
