const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Initialize Express app
const app = express();
const port = 5000;

// Ensure the uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up Multer for file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Store in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});
const upload = multer({ storage });

// Create the transcription endpoint
app.post('/transcribe', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = path.join(uploadsDir, req.file.filename);

  // Check if the uploaded file is an MP4
  if (path.extname(req.file.filename).toLowerCase() !== '.mp4') {
    return res.status(400).json({ error: 'Please upload an MP4 file.' });
  }

  // Call the Python script to transcribe the video
  exec(`python transcribe.py "${filePath}"`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: `Transcription failed: ${stderr || err.message}` });
    }

    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    // Send the transcription result
    res.json({ transcription: stdout.trim() });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
