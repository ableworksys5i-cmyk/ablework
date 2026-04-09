# Verify and Update Required Skills & Company Website

## Status Check

The columns `company_website` (in employers table) and `required_skills` (in jobs table) exist in the database but may contain NULL values for existing records.

### Why This Happens

- **Old Records**: Before the migration columns were added, existing employer and job records were created without these fields. They remain NULL.
- **Empty Forms**: If the forms weren't filled in when creating new records, the fields save as NULL.

## Solution

### Option 1: Update Existing Records (Recommended)

#### For Company Website:
1. Go to **Employer Dashboard**
2. Click **Edit Profile**
3. Fill in the **Company Website** field
4. Click **Save**

#### For Job Required Skills:
1. Go to **Employer Dashboard** → **Job Postings**
2. Click **Edit** on any job
3. Fill in the **Required Skills** field (comma-separated, e.g., "React, SQL, communication")
4. Click **Save**

### Option 2: Bulk Update via Database

If you have many old records, you can update them directly:

```sql
-- Add sample website to existing employers that don't have one
UPDATE employers 
SET company_website = CONCAT('https://www.', LOWER(REPLACE(company_name, ' ', '')), '.com')
WHERE company_website IS NULL OR company_website = '';

-- Add sample skills to existing jobs that don't have them
UPDATE jobs 
SET required_skills = 'Communication, Problem Solving, Teamwork'
WHERE required_skills IS NULL OR required_skills = '';
```

## Verification

To verify the data is being saved:

1. **After updating a profile**: Refresh the page and check if the website appears
2. **After editing a job**: Refresh and verify skills appear in the job details
3. **For new entries**: The fields should auto-populate when you create new jobs/profiles if you fill them in

## Testing New Entries

When creating **new jobs**, make sure to:
- Fill in all required fields (Title, Description, Requirements)
- Add a Location (using map or manual entry)
- Fill in **Required Skills** (optional but recommended)
- Save the job

When creating **new employer profiles**, make sure to:
- Fill in Company Name, Address, Contact Number
- Fill in **Company Website** (optional but recommended)
- Complete registration

---

**Note**: The columns were added via the migration file `backend/migrations/add_company_website_and_required_skills.sql`. If you haven't run it, execute it against your database first.
