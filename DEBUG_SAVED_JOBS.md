# Saved Jobs Debugging Guide

## Problem
When you save a job, it displays in the saved jobs section immediately, but when you reload the page, it disappears.

## Root Cause Investigation

I've added comprehensive logging and debug endpoints to help trace exactly where the problem occurs.

### Debug Endpoints

#### 1. Check User/Applicant Relationship
**Endpoint:** `GET /api/applicant/:user_id/debug`

This endpoint checks:
- ✓ If the user exists in the `users` table
- ✓ If an applicant record exists for that user
- ✓ The applicant_id associated with the user
- ✓ How many saved jobs exist for that applicant

**How to use:**
1. Open your browser's developer console (F12)
2. Note your logged-in user_id (from token or local storage)
3. Visit: `http://localhost:5000/api/applicant/YOUR_USER_ID/debug`
4. Check the response and send the output

**Expected Response:**
```json
{
  "user_found": true,
  "applicant_found": true,
  "applicant_id": 10,
  "saved_jobs_count": 8
}
```

**If you see "applicant_found": false** → This means the applicant record wasn't created during registration!

---

### Detailed Logging Points

All API requests now log detailed information to the terminal where your backend is running:

#### When Saving a Job (POST)
```
=== SAVE JOB REQUEST ===
User ID: 5 | Job ID: 1
✓ Applicant found - ID: 10
✓ Job saved successfully
=== END SAVE JOB REQUEST ===
```

#### When Loading Saved Jobs (GET)
```
=== GET SAVED JOBS REQUEST ===
User ID: 5
✓ Applicant found - ID: 10
✓ Returned 8 jobs
=== END SAVED JOBS REQUEST ===
```

#### When Loading Profile (GET)
```
=== GET APPLICANT PROFILE ===
User ID: 5
✓ Applicant found - ID: 10
```

---

## Testing Steps

### Step 1: Register as a new applicant
1. Go to register page
2. Fill out the form (wait for "✓ Location captured" message)
3. Click Register
4. **Check terminal output** - look for applicant profile or debug logs

### Step 2: Get Your User ID
1. After login, open browser console (F12)
2. Check if localStorage or sessionStorage has your user_id
3. Or check the login response in Network tab

### Step 3: Test the Debug Endpoint
1. Replace `YOUR_USER_ID` and visit: `http://localhost:5000/api/applicant/YOUR_USER_ID/debug`
2. **Report the response** - this tells us if the applicant record exists

### Step 4: Save a Job
1. Find a job and click "Save Job"
2. **Check browser console** for: `=== SAVED JOBS DEBUG ===` output
3. **Check terminal** for: `=== SAVE JOB REQUEST ===` output
4. Verify the applicant_id is the same in both places

### Step 5: Reload the Page
1. Press F5 to reload
2. **Check browser console** for: `=== SAVED JOBS DEBUG ===` output
3. **Check terminal** for: `=== GET SAVED JOBS REQUEST ===` output
4. Compare the applicant_id values

---

## Common Issues & Solutions

### Issue: "Applicant not found" on debug endpoint
**Cause:** Applicant record wasn't created during registration
**Solution:** Check the registration endpoint in backend/routes/authRoutes.js - the applicant insert may be failing silently

### Issue: Different applicant_id when saving vs. loading
**Cause:** User_id mismatch or role confusion
**Solution:** Verify the login is maintaining the same user_id throughout the session

### Issue: 0 saved jobs count but we saved a job
**Cause:** Job was saved but database query isn't seeing it
**Solution:** Check for database query errors in the terminal logs

### Issue: All endpoints work but jobs still disappear
**Cause:** Frontend state management issue
**Solution:** Check browser console for any errors in loadData() or state updates

---

## Where to Report Issues

When you run the tests above, please share:

1. **Output from debug endpoint** (Step 3)
2. **Browser console output** showing `=== SAVED JOBS DEBUG ===` logs
3. **Terminal output** showing the backend logs with ✓/❌ indicators
4. **Steps to reproduce** (register → save → reload)

This information will pinpoint exactly where the data loss occurs!
