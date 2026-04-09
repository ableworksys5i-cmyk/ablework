# Saved Jobs Issue - Root Cause Analysis Framework

## The Problem
```
User Action Timeline:
1. Register as applicant → Success
2. Log in → Success  
3. Save a job → Job appears in UI immediately ✓
4. Reload page (F5) → Job DISAPPEARS from UI ✗
5. Database still has the saved job data ✓
```

**Question:** If the job is in the database and the API queries work when tested manually, where is the data being lost?

---

## The Investigation Layers

```
┌─────────────────────────────────────────────────────────┐
│  USER SEES THIS (Frontend UI)                           │
│  ✓ Job appears after save                              │
│  ✗ Job disappears after reload                         │
│  (This is the symptom)                                 │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│  FRONTEND STATE MANAGEMENT                              │
│  savedJobs array in React state                         │
│  - When loaded: setSavedJobs(data)                      │
│  - When saved: optimistic update                        │
│  - When reloaded: calls getSavedJobs(user_id)          │
│  (This is where visual bugs happen)                     │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│  FRONTEND API CALLS                                     │
│  axios/fetch to /api/applicant/:user_id/saved-jobs     │
│  - Includes user_id in URL                             │
│  - Receives JSON array of jobs                         │
│  (This is where request/response issues appear)        │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│  BACKEND API ENDPOINTS (NEWLY ENHANCED LOGGING)         │
│  router.get("/:user_id/saved-jobs") - GET saved jobs   │
│  router.post("/:user_id/saved-jobs/:job_id") - SAVE    │
│  router.delete("/:user_id/saved-jobs/:job_id") - DEL   │
│  router.get("/:user_id/debug") - NEW DEBUG ENDPOINT    │
│  (This is where lookups and queries happen)            │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│  DATABASE OPERATIONS                                    │
│  Table: applicants (user_id → applicant_id mapping)    │
│  Table: applicant_saved_jobs (saves the actual links)  │
│  Table: jobs (job details)                             │
│  (This is the source of truth - data IS here)          │
└─────────────────────────────────────────────────────────┘
```

---

## Root Cause Scenarios

Based on the investigation layers above, the data loss can occur at one of these points:

### Scenario 1: Database Layer ✓ (VERIFIED WORKING)
```
Database → API should return saved jobs
Status: ✓ Tested and working - database has the data
```

### Scenario 2: Backend API ← Focus Here
```
GET /api/applicant/5/saved-jobs
├─ Step 1: Receive user_id = 5
├─ Step 2: Query applicants table for applicant_id from user_id
│          Query: SELECT applicant_id FROM applicants WHERE user_id = 5
│          Expected Result: applicant_id = 10
│          Possible Failure: "No applicant found"
├─ Step 3: Query saved jobs using applicant_id
│          Query: SELECT jobs... WHERE applicant_id = 10
│          Expected Result: 1+ jobs
│          Possible Failure: "0 jobs returned"
└─ Step 4: Return JSON to frontend

Detection: Backend logs will show ✓ or ❌ at each step
```

### Scenario 3: Frontend API Call ← Focus Here
```
Frontend sends: /api/applicant/5/saved-jobs
├─ Does frontend have correct user_id? 
│  (Could be null, wrong value, or session expired)
├─ Does API call actually execute?
│  (CORS error? Network error? Timeout?)
└─ Does frontend handle response correctly?
   (Null check? Array validation? Error handling?)

Detection: Browser console will show error or received data
```

### Scenario 4: Frontend State Management ← Focus Here
```
API returns data: [job1, job2, ...]
├─ Is data actually an array?
│  Frontend checks: Array.isArray(data)
├─ Is data passed to setState?
│  Frontend calls: setSavedJobs(data)
└─ Does React re-render with new state?
   Component receives updatedJobs and renders them

Detection: Browser console logs will show data type and length
```

---

## The Debug Logs Tell This Story

### On SAVE (these logs should appear):

**Browser Console:**
```javascript
console.log("=== SAVED JOBS DEBUG ===");
console.log("User ID:", 5);
console.log("Saved jobs fetched:", [newJobObject]);
console.log("Is Array:", true);
console.log("Length:", 1);
// ✓ This proves the save operation worked
```

**Backend Terminal:**
```javascript
console.log("=== SAVE JOB REQUEST ===");
console.log("User ID: 5 | Job ID: 1");
console.log("✓ Applicant found - ID: 10");
console.log("✓ Job saved successfully");
// ✓ This proves the applicant mapping works and insert succeeded
```

**UI Result:** Job appears in "Saved Jobs" section ✓

---

### On RELOAD (compare these logs):

**Browser Console (Reload):**
```javascript
// This is the CRITICAL check
console.log("Length:", ???);  // Should be 1, might be 0

// If it's 0, the problem is in one of:
// - Backend returned empty array (check backend logs)
// - Frontend didn't receive data (check network tab)
// - Frontend API failed silently (check error catch block)
```

**Backend Terminal (Reload):**
```javascript
console.log("=== GET SAVED JOBS REQUEST ===");
console.log("User ID: 5");
console.log("✓ Applicant found - ID: 10");  // If this says ❌, user_id mismatch!
console.log("✓ Returned 1 jobs");            // If this says 0, data not in DB
// These prove whether backend can retrieve the data
```

**UI Result:** Job appears OR disappears depending on data flow

---

## The Question Tree

Use this to pinpoint the exact issue:

```
Q1: After reload, do you see Length: 0 in browser console?
├─ YES → Go to Q2
└─ NO (see Length: 1) → Issue found! Job loads correctly
                        (unless UI still doesn't show it)

Q2: Does backend terminal show "Returned 0 jobs"?
├─ YES → Go to Q3 (data not in database)
└─ NO (shows "Returned 1 jobs") → Frontend issue (Q6)

Q3: Does backend terminal show "❌ Applicant not found"?
├─ YES → Applicant lookup failed! Go to Q4
└─ NO (shows ✓ Applicant found) → Data lost between save and reload

Q4: Is the User ID different in save vs reload?
├─ YES → User session/auth issue
│        Check: Are you really logged in after reload?
│        Solution: Fix auth context persistence
└─ NO (same user_id) → Applicant record creation issue
                        Check: Was applicant created in registration?
                        Solution: Debug registration flow

Q5: When you saved the job, did backend show "✓ Job saved"?
├─ NO → Save operation failed silently
│       Check: Are there errors in backend logs?
│       Solution: Check save endpoint for errors
└─ YES → Job was definitely saved to database
          So why isn't it in applicant_saved_jobs table?
          Check: Is it saved to wrong applicant_id?

Q6: Does browser console show an error in catch block?
├─ YES → API call failed
│        Error message: ___________________
│        Solution: Fix the API error
└─ NO → API succeeded but returned wrong data
         Check: Is response.ok true? (check Network tab)
         Solution: Verify API response format
```

---

## The Key Insight

The fact that:
- ✓ Jobs save successfully (appear in UI immediately)
- ✓ Database has the saved job records (verified via SQL)
- ✓ Backend query works when tested manually (returned correct data)
- ✗ Jobs don't appear after reload

**Suggests the problem is ONE of these:**

1. **User ID Mismatch** (Most Common)
   ```
   Save: User ID 5 → Applicant ID 10 → Job saved for Applicant 10
   Reload: User ID 6 (or null!) → Applicant ID ??? → Query wrong applicant
   ```
   **Check:** Frontend console "User ID" before/after reload

2. **Applicant Record Not Created** (Second Common)
   ```
   Registration completes but applicant insert fails silently
   Save: Tries to lookup applicant_id from user_id → NOT FOUND
   But somehow... job save succeeded? (shouldn't be possible)
   ```
   **Check:** Debug endpoint - is applicant_found false?

3. **Frontend State Not Updated** (Less Common)
   ```
   Backend returns data successfully
   But Frontend setState doesn't work (null data? parsing error?)
   React never re-renders with the loaded data
   ```
   **Check:** Browser console "Length" value

4. **Session Expiration** (Possible)
   ```
   Save happens before session expires → Works
   Reload after session expires → user_id becomes null/invalid
   API request still goes to server but with no user_id
   ```
   **Check:** Is user.user_id defined in console logs?

---

## Your Investigation Path

### Step 1: Establish Baseline
```bash
# Run this command with your user_id
curl http://localhost:5000/api/applicant/YOUR_USER_ID/debug

# Expected: applicant_found: true
# If: applicant_found: false → Issue is applicant record
```

### Step 2: Test Save Operation
- Save a job
- Check console: `User ID: ___`
- Check backend: `✓ Applicant found - ID: ___`
- Note both numbers

### Step 3: Test Reload Operation
- Reload page (F5)
- Check console: `User ID: ___` (should match Step 2)
- Check console: `Length: ___` (should be 1, not 0)
- Check backend: `✓ Applicant found - ID: ___` (should match Step 2)

### Step 4: Compare the Data
```
SAVE:
  User ID: 5
  Applicant ID: 10
  Action: ✓ Job saved successfully

RELOAD:
  User ID: 5 (same? or different?)
  Applicant ID: 10 (same? or different?)
  Results: Length: 1 (or 0?)
```

### Step 5: Report Your Findings

**If User ID matches and Length is still 0:**
- Problem: Backend returns 0 jobs
- Possible cause: Job saved to wrong applicant_id or DB constraint
- Next: Check database directly with SQL

**If User ID doesn't match:**
- Problem: User session lost on reload  
- Possible cause: Auth context not persisting
- Next: Check localStorage/sessionStorage preservation

**If Applicant not found on reload:**
- Problem: Applicant record missing
- Possible cause: Registration failure
- Next: Re-run registration and monitor logs

---

## The Success Criteria

When fixed correctly, you'll see:

```
=== SAVE OPERATION ===
User ID: 5
✓ Applicant found - ID: 10
✓ Job saved successfully
Length in UI: 1 ✓

=== RELOAD OPERATION ===
User ID: 5  (SAME!)
✓ Applicant found - ID: 10  (SAME!)
✓ Returned 1 jobs
Length in UI: 1 ✓

=== RESULT ===
Job persists after reload ✓
```

The logs are now in place. Your next action: Run through the quick debug guide and share the console/terminal output!
