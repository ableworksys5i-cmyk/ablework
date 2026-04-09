# Debugging: Why `required_skills` and `company_website` are NULL

## Root Cause Analysis

The columns `company_website` and `required_skills` exist in your database, but existing records have NULL values. This is expected and normal.

### Why?

1. **Database Migrations Retroactive**: When you add new columns to an existing table, all existing rows automatically get NULL for those new columns (unless you specify a DEFAULT value).

2. **Old Records**: Any employer or job created before the migration was run will have NULL for these fields.

3. **Empty Forms**: If users don't fill in these optional fields when creating new records, they also save as NULL.

## How to Fix

### Step 1: Verify the Backend is Receiving Data

Added debug logging to track data flow:

**For Job Creation/Update:**
```
Backend logs will show: `=== CREATE JOB === required_skills: ... (type: string) === END ===`
```

**For Employer Profile Update:**
```
Backend logs will show: `=== UPDATE PROFILE === company_website: ... (type: string) === END ===`
```

### Step 2: Test with New Records

1. **Create a new job** with required skills:
   - Go to Employer Dashboard → Job Postings
   - Click "Add New Job"
   - Fill in: Title, Description, Requirements, **Required Skills** (e.g., "React, SQL, Communication")
   - Fill in Location on the map
   - Click Save
   - Check the server logs for the debug output
   - Refresh and verify it was saved

2. **Update your profile** with website:
   - Go to Employer Dashboard → Edit Profile
   - Fill in the **Company Website** field
   - Click Save
   - Check the server logs for the debug output
   - Refresh and verify it was saved

### Step 3: Update Existing Records

For records created before these fields existed, employers must manually update them:

#### Via UI (Recommended):
- Edit the job/profile as described above
- Fill in the missing fields
- Save

#### Via Database (For Bulk Updates):

```sql
-- Update all employers with a placeholder website based on company name
UPDATE employers 
SET company_website = CONCAT('https://www.', 
    LOWER(REPLACE(REPLACE(company_name, ' ', '-'), '.', '')), 
    '.com')
WHERE company_website IS NULL OR company_website = '';

-- Update all jobs with placeholder skills
UPDATE jobs 
SET required_skills = 'Communication, Problem Solving, Team Collaboration'
WHERE required_skills IS NULL OR required_skills = '';
```

## Troubleshooting

If data still isn't being saved:

1. **Check the logs:**
   - Run the server: `node server.js`
   - Perform the action (create job or update profile)
   - Look for the `=== CREATE JOB ===` or `=== UPDATE PROFILE ===` debug messages
   - Verify the value is actually being received

2. **Check the frontend form:**
   - Ensure the form field is being filled
   - Open browser console (F12) → Network tab
   - Perform the action and inspect the request body to see if the field is included

3. **Verify the database:**
   - After saving, query directly:
   ```sql
   SELECT job_id, job_title, required_skills FROM jobs WHERE job_id = [ID_YOU_CREATED];
   SELECT employer_id, company_name, company_website FROM employers WHERE employer_id = [ID_YOU_UPDATED];
   ```

## Prevention for Future Records

- Always fill in these fields when creating jobs and employer profiles
- The system is now set up to properly save them if provided
- Empty fields will correctly save as NULL (not "null" string)
