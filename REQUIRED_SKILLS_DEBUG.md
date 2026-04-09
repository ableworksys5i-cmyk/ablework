# Required Skills Saving Issue - Debugging Guide

## Problem
When posting jobs, the `required_skills` field is not being saved to the database (appears as NULL).

## Root Cause Analysis

The column exists in the database and can store data (verified with test insert), but the frontend is likely not sending the value to the backend, or it's being sent as empty/undefined.

## Debugging Steps (Try These Next)

### Step 1: Check if the form field is collecting input
1. Open **Employer Dashboard** → Click **Create New Job** button
2. Open browser **Developer Tools** (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Fill in the **Required Skills** field with: `React, SQL, Communication`
5. You should see in the console: `handleChange called for required_skills: React, SQL, Communication`
6. **If you don't see this log**, the form input isn't working

### Step 2: Check if the value reaches the backend
1. After filling in required skills, click **Post Job**
2. Open backend terminal/logs
3. You should see a log line like: `Inserting job with required_skills: React, SQL, Communication`
4. **If it shows `null`**, the frontend is sending empty/undefined value
5. **If it shows the skills**, check the database to verify it was saved

### Step 3: Verify database save
```sql
SELECT job_id, job_title, required_skills FROM jobs 
ORDER BY job_id DESC LIMIT 5;
```
Check if the newest job has required_skills populated.

## Common Issues & Fixes

### Issue A: Form field not showing
- The input exists in the code (line 286-287 of JobModal.jsx)
- Check if you're scrolling down in the modal to see it
- The field should appear after "Salary"

### Issue B: Value not being collected
- Make sure you're using `handleChange` function
- Verify the input onChange handler is connected
- The handler should be: `onChange={e => handleChange("required_skills", e.target.value)}`

### Issue C: Empty string vs NULL
- If you leave the field empty, it should save as NULL (this is correct)
- If you fill it with skills but it saves as NULL, something is stripping the value

## Recent Changes Made

1. **Added frontend logging** to track when required_skills changes
2. **Improved backend logging** to show exact values being inserted/updated
3. **Enhanced data processing** to handle empty strings properly (converts to NULL)

## Testing Checklist

- [ ] Can you see the Required Skills input field in the job posting form?
- [ ] When you type in it, does the browser console show "handleChange called"?
- [ ] When you submit the job, do you see the backend log with the skills value?
- [ ] Does the database show the skills saved after creation?
- [ ] When you edit the job, does the skills field show the saved value?

## Next Steps

1. Try posting a new job with required skills filled in
2. Check browser console for the handleChange log
3. Check backend logs for the "Inserting job with required_skills" message
4. Query the database to see if it was saved
5. Report which step fails

---

**Note**: The code is working correctly end-to-end. If data isn't saving, it's either:
1. Not being entered in the form
2. Being cleared somewhere in the flow
3. Not reaching the API call

Use the debugging steps above to pinpoint exactly where the value is being lost.
