# IntelliHire AI - Resume Extraction & Profile System

## 📋 Complete Extraction Flow

### **What Happens When You Upload a Resume:**

1. **File Upload** (Resume Page)
   - User selects PDF or TXT file
   - Clicks "Process Content" button
   - File is sent to backend `/api/resume/upload`

2. **Text Extraction** (Backend - `parser.js`)
   - PDF files: Uses `pdf-parse` library to extract raw text
   - TXT files: Reads directly
   - Extracts up to 15,000 characters

3. **AI Profile Analysis** (Backend - `extractProfileData()`)
   - Sends extracted text to Google Gemini AI
   - AI analyzes and structures the data into JSON format
   - Extracts ALL the following fields:

### ✅ **Extracted Fields (Comprehensive List)**

#### **Personal Information**
- ✅ **Name** - Full name from resume
- ✅ **Current Role** - Job title or desired position
- ✅ **Professional Summary** - 2-3 sentence career overview

#### **Contact Details**
- ✅ **Email** - Email address
- ✅ **Phone** - Phone number with country code
- ✅ **Location** - City, State, Country
- ✅ **LinkedIn** - LinkedIn profile URL (clickable)
- ✅ **GitHub** - GitHub profile URL (clickable)
- ✅ **Portfolio** - Personal website URL

#### **Skills**
- ✅ **All Technical Skills** - Programming languages, frameworks, tools
- ✅ **Databases** - MongoDB, PostgreSQL, MySQL, etc.
- ✅ **Cloud Platforms** - AWS, Azure, GCP
- ✅ **DevOps Tools** - Docker, Kubernetes, CI/CD
- Shown as **indigo-colored tags**
- **Add/Edit/Delete** individual skills

#### **Experience**
For each job:
- ✅ **Job Title** - Position name
- ✅ **Company Name** - Employer
- ✅ **Duration** - Start date - End date or "Present"
- ✅ **Location** - City, Country (if mentioned)
- ✅ **Description** - Key responsibilities and achievements
- **Add/Edit/Delete** individual entries

#### **Education**
For each degree:
- ✅ **Degree Name** - e.g., "B.Tech in Computer Science"
- ✅ **Institution** - University/College name
- ✅ **Year** - Graduation year or duration
- ✅ **Grade** - GPA/Percentage (if mentioned)
- **Add/Edit/Delete** individual entries

#### **Projects**
For each project:
- ✅ **Title** - Project name
- ✅ **Description** - Detailed description
- ✅ **Tech Stack** - Technologies used (shown as colored tags)
- ✅ **Link** - GitHub/Demo URL (if mentioned)
- **Add/Edit/Delete** individual entries

#### **Internships**
For each internship:
- ✅ **Role/Position** - Internship title
- ✅ **Company Name** - Organization
- ✅ **Duration** - Start - End date
- ✅ **Location** - City (if mentioned)
- ✅ **Description** - Work done and learnings
- **Add/Edit/Delete** individual entries

#### **Certifications**
For each certification:
- ✅ **Name** - Certification title
- ✅ **Issuer** - Issuing organization
- ✅ **Date** - Issue date
- **Add/Edit/Delete** individual entries

#### **Languages**
- ✅ **Language** with proficiency level
- Example: "English - Fluent", "Spanish - Intermediate"
- Shown as **green-colored tags**
- **Add/Edit/Delete** individual languages

#### **Hobbies & Interests**
- ✅ **All hobbies** mentioned in resume
- Shown as **pink-colored tags**
- **Add/Edit/Delete** individual hobbies

---

## 🎯 **Where Extracted Data Appears:**

### **1. Resume Page - "Extracted Insights" Section**
- **Location**: Right panel after upload
- **Features**:
  - View all extracted data organized by category
  - Each section has an icon for easy identification
  - Click "Edit" button to modify any field
  - Click "+" to add new items to any section
  - Click "X" or trash icon to delete items
  - Click "Save" to persist changes
  - "View Raw Extracted Text" toggle at bottom

### **2. Profile Page**
- **Location**: Click "Profile" in sidebar
- **Features**:
  - All extracted data pre-populated
  - Edit mode with Save/Edit toggle
  - Add/Delete functionality for all array fields
  - Password change section
  - Updates saved to database

---

## 💾 **Data Storage:**

1. **MongoDB User Collection**:
   ```javascript
   {
     name: "John Doe",           // Updated from resume
     email: "john@example.com",  // From account
     profile: {
       name: "John Doe",
       role: "Full Stack Developer",
       summary: "...",
       skills: [...],
       experience: [...],
       education: [...],
       projects: [...],
       internships: [...],
       certifications: [...],
       contact: {...},
       languages: [...],
       hobbies: [...]
     },
     resumeText: "raw extracted text..."
   }
   ```

2. **Redis Cache**:
   - Key: `resume:{userId}`
   - Value: Raw extracted text
   - Used for fast job matching

---

## 🔄 **Complete User Flow:**

```
1. Upload Resume (PDF/TXT)
   ↓
2. Backend extracts text
   ↓
3. Gemini AI analyzes text
   ↓
4. Structured JSON created with ALL fields
   ↓
5. Saved to MongoDB + Redis
   ↓
6. "Extracted Insights" panel shows all data
   ↓
7. User can Edit/Add/Delete any field
   ↓
8. Click "Save" to update
   ↓
9. Profile page also shows all data
   ↓
10. Data used for AI job matching
```

---

## 🚀 **How to Test:**

1. **Sign In** to your account
2. Go to **Resume** page
3. **Upload** a PDF or TXT resume
4. Wait for processing (AI extraction takes 5-10 seconds)
5. **"Extracted Insights"** panel will populate with ALL fields
6. Check backend console logs to see extraction summary:
   ```
   Updated profile for user 123abc {
     hasName: true,
     hasSkills: true,
     hasExperience: true,
     hasEducation: true,
     hasProjects: true,
     hasInternships: true,
     hasCertifications: true,
     hasLanguages: true,
     hasHobbies: true
   }
   ```
7. Click **"Edit"** to modify any field
8. Click **"+"** to add new items
9. Click **"Save"** to persist changes
10. Go to **Profile** page to see all data there too

---

## 🎨 **Visual Features:**

- **Color-coded tags**:
  - Skills: Indigo
  - Languages: Green
  - Hobbies: Pink
  - Tech Stack: Primary blue

- **Icons for each section**:
  - User icon for Personal Info
  - Mail icon for Contact
  - Code icon for Skills
  - Briefcase icon for Experience
  - Graduation cap for Education
  - Award icon for Certifications/Internships
  - Globe icon for Languages
  - Heart icon for Hobbies

- **Interactive elements**:
  - Clickable LinkedIn/GitHub links
  - Editable input fields
  - Add/Delete buttons
  - Smooth transitions

---

## ✅ **Verification Checklist:**

After uploading resume, verify these are extracted:

- [ ] Name appears in "Extracted Insights"
- [ ] Role/Title is shown
- [ ] Professional summary is displayed
- [ ] Email, phone, location extracted
- [ ] LinkedIn and GitHub links (if in resume)
- [ ] All skills shown as tags
- [ ] Work experience with company, title, dates
- [ ] Education with degree, institution, year
- [ ] Projects with descriptions
- [ ] Internships listed
- [ ] Certifications shown
- [ ] Languages with proficiency
- [ ] Hobbies/interests listed
- [ ] Data appears in Profile page
- [ ] Edit mode works
- [ ] Add/Delete functions work
- [ ] Save persists changes

---

## 🔧 **Troubleshooting:**

**If fields are missing:**
1. Check backend console for extraction logs
2. Verify GEMINI_API_KEY is valid
3. Ensure resume has clear formatting
4. Check if AI extraction succeeded (logs show "Profile extracted: Yes")

**If extraction fails:**
- Falls back to basic regex extraction
- Will extract: email, phone, common skills
- Re-upload with better formatted resume

---

**The system is fully operational and extracts ALL fields automatically!** 🎉
