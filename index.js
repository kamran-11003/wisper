const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(mp4|mov|avi|wmv)$/)) {
            return cb(new Error('Only video files are allowed!'));
        }
        cb(null, true);
    }
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const videoPath = req.file.path;
        
        // Call the Python script to transcribe the video
        exec(`python transcribe.py "${videoPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error during transcription: ${error.message}`);
                return res.status(500).send('Error during transcription');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }

            try {
                // Parse the JSON output from the Python script
                const result = JSON.parse(stdout);
                
                // Check if the result contains an error
                if (result.error) {
                    console.error('Transcription error:', result.error);
                    return res.status(500).send(result.error);
                }
                
                // Save transcript data to a file
                const transcriptPath = path.join('uploads', path.basename(videoPath, path.extname(videoPath)) + '.json');
                fs.writeFileSync(transcriptPath, JSON.stringify(result, null, 2));

                res.render('player', {
                    videoPath: `/uploads/${path.basename(videoPath)}`,
                    transcriptData: result
                });
            } catch (parseError) {
                console.error('Error parsing transcription data:', parseError);
                res.status(500).send('Error processing transcription data');
            }
        });
    } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).send('Error processing video');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
