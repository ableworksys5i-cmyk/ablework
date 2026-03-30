const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route groups
app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/jobs', jobRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AbleWork API running...");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});