# Smart Job Matching Feature - Quick Start Guide

## What is Smart Job Matching?

Smart Job Matching recommends jobs to applicants based on **two key factors**:

### 1. **Skills Alignment** 🎯
- System checks applicant's skills (entered in profile)
- Compares with required skills for each job
- Shows match percentage (0-100%)
- Minimum 30% match required to appear in recommendations

### 2. **Location Proximity** 📍
- System uses applicant's auto-detected location
- Shows distance to each job in kilometers
- Includes only jobs within 50km radius
- Highlights jobs very close (within 10km) with special badge

---

## How to Use Smart Matches

### Step 1: Update Your Profile
For best results, ensure your profile has:
- ✅ **Skills** - List your main skills separated by commas
  - Example: "JavaScript, React, Node.js, MongoDB"
- ✅ **Location** - Automatically captured during registration
  - Can be updated in Settings

### Step 2: View Smart Matches
1. Go to **Applicant Dashboard**
2. Click on **"Smart Matches" (🎯)** tab
3. See recommended jobs sorted by compatibility

### Step 3: Understand Match Quality

Each job shows a colored badge indicating match quality:

| Badge Color | Match Quality | Percentage | Meaning |
|-------------|--------------|-----------|---------|
| 🟢 Green | Excellent Match | 80%+ | Great fit! |
| 🔵 Blue | Good Match | 60-79% | Strong fit |
| 🟠 Orange | Decent Match | 40-59% | Possible fit |
| 🔴 Red | Fair Match | 30-39% | Some alignment |

### Step 4: Check Skill Matches
- **Green ✓ Skills** - Your skills match the job requirement
- **Gray Skills** - Job requires these, but you need to learn them
- Use this to identify skill gaps

### Step 5: Apply or Save
- **Apply Now** - Submit your application immediately
- **Save** - Save for later review

---

## Example

### Scenario: You're a React Developer

**Your Profile:**
- Skills: "JavaScript, React, CSS, HTML"
- Location: San Francisco (37.7749, -122.4194)

**Smart Matches Returned:**
1. **React Developer @ TechCorp** (15km away)
   - Match: 100% (4/4 skills match)
   - Distance: 15km away (📍 Very Close)
   - Status: ✅ Excellent Match

2. **Full Stack Developer @ StartupX** (32km away)
   - Match: 75% (3/4 skills match - needs Node.js)
   - Distance: 32km away
   - Status: ✅ Good Match

3. **Frontend Engineer @ CloudInc** (8km away)
   - Match: 50% (2/4 skills match - needs Vue, needs TypeScript)
   - Distance: 8km away (📍 Very Close)
   - Status: ⚠️ Decent Match

**Not Shown:**
- Backend Developer @ CompanyY (60km away) - Too far
- Data Scientist @ Lab (Python, R) - Only 10% skill match

---

## Smart Matching Algorithm

```
For Each Active Job:
  1. Calculate skill match percentage
     = (your matching skills / job required skills) × 100
  
  2. Check distance from your location to job
  
  3. Create match score
     = skill_percentage + (distance ≤ 50km ? 50 : 0)
  
  4. Filter
     - Include if skill match ≥ 30% AND distance ≤ 50km
  
  5. Sort
     - Higher match scores first
```

---

## Tips for Better Matches

### 1. **Complete Your Skills Profile**
- Add all relevant technical skills
- Include soft skills (Communication, Leadership, etc.)
- Add certifications and specializations
- Be specific: "JavaScript" not "Coding"

### 2. **Keep Location Current**
- System auto-detects during registration
- Update in Settings if you move
- Jobs outside 50km won't appear (even with perfect skills)

### 3. **Review Your Education**
- Include your highest education level
- Add relevant certifications
- This helps employers understand your background

### 4. **Check Regularly**
- New jobs are added daily
- New matches appear as they're posted
- Check Smart Matches regularly for new opportunities

### 5. **Learn New Skills**
- If you see consistent skill gaps, learn them
- This will improve your match percentage
- More matches = More opportunities

---

## Difference from Other Features

### Smart Matches vs. Nearby Jobs
| Feature | Smart Matches | Nearby Jobs |
|---------|--------------|------------|
| Based on | Skills + Location | Location only |
| Distance | ≤ 50km | ≤ 25km |
| Ranking | By skill match % | By distance |
| Filter | Skills must match 30%+ | No skill filter |
| Best for | Finding relevant jobs | Exploring local options |

### Smart Matches vs. Job Search
| Feature | Smart Matches | Job Search |
|---------|--------------|-----------|
| Finding | Passive (recommended) | Active (you search) |
| Updates | Automatic new matches | Manual search |
| Criteria | Auto-matched | Your filters |
| Sorting | By compatibility | By relevance |

---

## Troubleshooting

### No Smart Matches Appearing?
1. ❌ **Problem**: No skills in profile
   - **Solution**: Go to Settings → Profile → Add skills

2. ❌ **Problem**: All jobs too far away
   - **Solution**: Check location is correctly set
   - Go to Settings → Location → Verify/Update

3. ❌ **Problem**: Skills don't match any jobs
   - **Solution**: Look for jobs in different industries
   - Add more diverse skills to your profile

### Match Percentage Seems Wrong?
- The system does **partial matching**
- "JavaScript" might not match "JS" (case-sensitive)
- Try to match exact terms with job postings
- Verify skills are separated by commas

### Can't Find Specific Job?
- It might be outside 50km radius
- Skills might match < 30%
- Try **Job Search** or **Nearby Jobs** tabs instead

---

## FAQ

**Q: Why aren't all nearby jobs shown?**
A: Smart Matches only shows jobs where your skills match at least 30% of requirements. This ensures quality matches.

**Q: Can I change the 50km radius?**
A: Currently fixed at 50km. In future versions, this will be customizable.

**Q: How often are matches updated?**
A: When new jobs are posted, new matches appear instantly.

**Q: What if my location isn't detected correctly?**
A: Update your location manually in Settings. The system will use that instead.

**Q: Does applying to one job affect my matches?**
A: No. Your matches are based only on skills and location, not your application history.

**Q: Can I see jobs outside my skill area?**
A: Use **Job Search** or **Nearby Jobs** tabs. Smart Matches is specifically for skill-aligned jobs.

---

## Summary

Smart Job Matching helps you find the right jobs by:
✅ Matching jobs to YOUR skills
✅ Filtering by YOUR location
✅ Showing compatibility scores
✅ Highlighting skill matches
✅ Saving you time
✅ Improving application quality

Start using Smart Matches today to find your perfect job! 🎯
