# Find Jobs - Smart Matching Filter

## Overview

The "Find Jobs" tab now displays **all jobs by default** with an option to enable **Smart Matching** as a filter.

## How It Works

### Default View (All Jobs)
- Shows all available jobs in the system
- Users can search and filter by:
  - Keywords (job title, company)
  - Location
  - Job type (full-time, part-time, contract, etc.)

### Smart Matching Mode (Optional Filter)
- Toggle the **🎯 Smart Matching** checkbox in the top right
- Shows only jobs that match the applicant's:
  - Skills (from their profile)
  - Location (from their geolocation or saved location)
- Still allows filtering by keywords, location, and job type

## User Interface

### Location: Find Jobs Tab
- **Title**: "🔍 Find Jobs" with toggle control
- **Toggle Button**: "🎯 Smart Matching" checkbox on the right
- **Info Banner**: Green banner appears when smart matching is enabled
  - Text: "Smart Matching is enabled. Showing jobs that match your skills and location."

### Filters (Always Available)
Regardless of mode:
- 🔍 Search Keywords
- 📍 Location
- 💼 Job Type
- Clear All button

## Feature Flow

1. **Applicant clicks "Find Jobs" tab**
   - See all available jobs by default

2. **Applicant can search/filter**
   - Use keyword search, location, or job type filters
   - Narrow down to specific jobs of interest

3. **Applicant can enable Smart Matching**
   - Click checkbox: "🎯 Smart Matching"
   - System filters to show only matching jobs
   - Green info banner confirms mode is active
   - Can still use filters to further narrow results

4. **Applicant can disable Smart Matching**
   - Uncheck the checkbox
   - Returns to showing all jobs

## Technical Details

### Frontend Changes
- **JobSearch Component**: Added `useSmartMatching` state and toggle control
- **Props**: Now receives `smartMatchedJobs` array from ApplicantDashboard
- **Logic**: 
  ```javascript
  const jobsToDisplay = useSmartMatching && smartMatchedJobs.length > 0 
    ? smartMatchedJobs 
    : jobs;
  ```

### Integration
- ApplicantDashboard passes `smartMatchedJobs` state to JobSearch component
- JobSearch component handles toggle and filtering
- All existing filters work with both modes

## Benefits

✅ **Default**: Users see all opportunities
✅ **Flexible**: Can switch between all jobs and smart matches
✅ **Discoverable**: Smart matching is obvious but not forced
✅ **Refined**: Can still use filters in both modes
✅ **User Control**: Users decide when to see smart matches

## Example Usage

**Scenario 1: Browse All Jobs**
1. Click "Find Jobs" tab
2. See all 50 jobs in the system
3. Type "Python" in search → see 8 Python jobs
4. Filter by "Remote" → see 3 remote Python jobs

**Scenario 2: See Smart Matches**
1. Click "Find Jobs" tab
2. Check "🎯 Smart Matching" 
3. See 12 jobs matching their skills & location
4. Type "startup" in search → see 2 startup jobs matching their profile
5. Uncheck to return to all jobs

## Notes

- Smart matching requires applicant profile to have skills entered
- If no smart matched jobs are available, checkbox will show but won't filter
- Filters apply to both modes (all jobs and smart matched jobs)
- Smart matching state resets when leaving the tab (page refresh or tab change)
