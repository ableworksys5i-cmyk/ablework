# Saved Jobs Debug - Quick Start

## TL;DR - Run This Now

1. **Terminal 1 - Backend:**
   ```bash
   cd /Users/feliciteastodillo/vs\ code/ableworksystem/backend
   npm run dev
   ```
   Keep this open to see debug logs.

2. **Terminal 2 - Frontend:**
   ```bash
   cd /Users/feliciteastodillo/vs\ code/ableworksystem/frontend
   npm run dev
   ```

3. **Browser:**
   - Open `http://localhost:5173`
   - Open DevTools (F12)
   - Go to Console tab

4. **Register as new applicant**
   - Wait for "✓ Location captured" message
   - Fill form and submit
   - Check Terminal 1 for: `✓ Applicant record created for user_id: XX`

5. **Test saved jobs:**
   - Log in with your test account
   - Find a job and click "Save Job"
   - **Console should show:**
     ```
     === SAVED JOBS DEBUG ===
     User ID: YOUR_ID
     Length: 1
     ```
   - **Terminal 1 should show:**
     ```
     === SAVE JOB REQUEST ===
     ✓ Applicant found - ID: 10
     ✓ Job saved successfully
     ```

6. **Reload page (F5)**
   - **Console should show:**
     ```
     === SAVED JOBS DEBUG ===
     User ID: YOUR_ID
     Length: 1
     ```
   - **Terminal 1 should show:**
     ```
     === GET SAVED JOBS REQUEST ===
     ✓ Applicant found - ID: 10
     ✓ Returned 1 jobs
     ```

7. **If jobs disappear after reload:**
   - Check what you see in console (Length should be 1, not 0)
   - Check backend terminal (look for errors)
   - Go to browser and visit: `http://localhost:5000/api/applicant/YOUR_USER_ID/debug`
   - Share the response with the debug output

---

## What Each Debug Log Means

### Frontend Console Output

```
=== SAVED JOBS DEBUG ===
User ID: 5
Saved jobs fetched: Array(1)
Type: object
Is Array: true
Length: 1
Saved jobs set to state: 1
```

✓ **This is good** - it means the data came back from the backend

```
=== SAVED JOBS DEBUG ===
User ID: 5
Saved jobs fetched: []
Type: object
Is Array: true
Length: 0
Saved jobs set to state: 0
```

❌ **This is the problem** - backend returned empty array

---

### Backend Terminal Output

**When saving a job:**
```
=== SAVE JOB REQUEST ===
User ID: 5 | Job ID: 1
✓ Applicant found - ID: 10
✓ Job saved successfully
=== END SAVE JOB REQUEST ===
```

✓ **This is good** - job was inserted into database

```
=== SAVE JOB REQUEST ===
User ID: 5 | Job ID: 1
❌ Applicant not found for user_id: 5
```

❌ **This is bad** - no applicant record exists for this user

---

**When reloading:**
```
=== GET SAVED JOBS REQUEST ===
User ID: 5
✓ Applicant found - ID: 10
✓ Returned 1 jobs
=== END SAVED JOBS REQUEST ===
```

✓ **This is good** - data is in the database

```
=== GET SAVED JOBS REQUEST ===
User ID: 5
❌ Applicant not found for user_id: 5
```

❌ **This is bad** - applicant lookup failed (user_id mismatch or record missing)

---

### Debug Endpoint

Visit: `http://localhost:5000/api/applicant/YOUR_USER_ID/debug`

**Expected on first test (after registration, no saved jobs yet):**
```json
{
  "user_found": true,
  "applicant_found": true,
  "applicant_id": 10,
  "saved_jobs_count": 0
}
```

**After saving a job:**
```json
{
  "user_found": true,
  "applicant_found": true,
  "applicant_id": 10,
  "saved_jobs_count": 1
}
```

**If applicant record is missing:**
```json
{
  "user_found": true,
  "applicant_found": false
}
```

---

## Common Failures & What They Mean

| Symptom | Cause | Next Step |
|---------|-------|-----------|
| Debug endpoint shows `applicant_found: false` | Applicant record wasn't created during registration | Check backend logs during registration |
| `Length: 0` after reload but Terminal shows "Returned 1 jobs" | Frontend state update issue | Check browser console for errors |
| Console shows error like "API get saved jobs failed" | Backend request failed | Check backend terminal for the API error |
| User ID changes between save and reload | Auth context not persisting | Check if localStorage/session storage is working |
| Debug endpoint works but no saved jobs | Jobs not being saved to database | Check the SAVE operation logs |

---

## Screenshots Needed (Optional but Helpful)

1. **Browser console after hitting "Save Job"** showing:
   - `=== SAVED JOBS DEBUG ===` output
   - Any red error messages

2. **Backend terminal** showing:
   - `=== SAVE JOB REQUEST ===` output
   - `=== GET SAVED JOBS REQUEST ===` output

3. **Browser console after reload** showing whether Length went from 1 to 0

4. **Debug endpoint response** as shown above

---

## One-Liner Tests

**Check if applicant record exists:**
```bash
# In your database client, run:
SELECT applicant_id FROM applicants WHERE user_id = YOUR_USER_ID;
```

**Check if saved job exists in database:**
```bash
SELECT * FROM applicant_saved_jobs WHERE applicant_id = YOUR_APPLICANT_ID;
```

---

## Next Steps

1. Run through the Quick Start above
2. Take note of what you see
3. Compare against "Common Failures" table
4. Share output with debug information

**Most likely issue:** Applicant record not being created during registration (check for applicant_found: false)

**Second most likely:** User_id mismatch between save and reload (check if User ID stays the same in console logs)

**Third most likely:** Frontend state management not updating from API response (check browser console for errors)

Good luck! The debug logs should make it obvious where the break is happening.
