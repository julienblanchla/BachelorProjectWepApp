import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DATA_URL = 'http://153.109.22.167:8088/multi-sensor/properties/nordicCount';
const DATA_URL_MBIENT = 'http://153.109.22.167:8088/multi-sensor/properties/mbientCount';
const POLL_INTERVAL = 1000;

// Create necessary folders if they don't exist
const sessionsDir = path.join(process.cwd(), 'sessions');
const profilePicturesDir = path.join(process.cwd(), 'Profil_Picture');

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir);
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicturesDir); // Store in Profil_Picture folder
  },
  filename: function (req, file, cb) {
    // Generate unique filename: patientId_timestamp.extension
    const patientId = req.body.patientId || 'patient_' + Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${patientId}_${Date.now()}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from Public folder
app.use(express.static('Public'));

// Serve asset files (images)
app.use('/assets', express.static('assets'));

// Serve CSS files from style folder
app.use('/style', express.static('style'));

// Serve CSV files from sessions folder
app.use('/sessions', express.static(sessionsDir));

// Serve profile pictures from Profil_Picture folder
app.use('/profile-pictures', express.static(profilePicturesDir));

// Routes for different pages
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'Public' });
});

app.get('/dashboard', (req, res) => {
  res.sendFile('index.html', { root: 'Public' });
});

app.get('/chart', (req, res) => {
  res.sendFile('chart.html', { root: 'Public' });
});

app.get('/sensors', (req, res) => {
  res.sendFile('sensors.html', { root: 'Public' });
});

app.get('/motion', (req, res) => {
  res.sendFile('motion.html', { root: 'Public' });
});

// Route for patients page
app.get('/patients', (req, res) => {
  res.sendFile('patients.html', { root: 'Public' });
});

// Add route for patient exercises
app.get('/exercises/:patientId', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'exercises.html'));
});

// Add route for exercise execution
app.get('/exercise/:exerciseType/:patientId', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Public', 'exerciseType.html'));
});

// Photo upload routes for patients
app.post('/api/patients/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const photoUrl = `/profile-pictures/${req.file.filename}`;
    
    res.json({
      success: true,
      photoUrl: photoUrl,
      filename: req.file.filename,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Photo upload error:', error);
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

// Route to handle base64 photo uploads (alternative method)
app.post('/api/patients/upload-photo-base64', (req, res) => {
  try {
    const { photoData, patientId } = req.body;
    
    if (!photoData) {
      return res.status(400).json({ error: 'No photo data provided' });
    }

    // Extract base64 data and file type
    const matches = photoData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid photo data format' });
    }

    const fileType = matches[1];
    const base64Data = matches[2];
    
    // Generate filename
    const filename = `${patientId || 'patient_' + Date.now()}_${Date.now()}.${fileType}`;
    const filePath = path.join(profilePicturesDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    const photoUrl = `/profile-pictures/${filename}`;
    
    res.json({
      success: true,
      photoUrl: photoUrl,
      filename: filename,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Base64 photo upload error:', error);
    res.status(500).json({ error: 'Error uploading photo' });
  }
});

// Route to delete a patient photo
app.delete('/api/patients/delete-photo/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(profilePicturesDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'Photo not found' });
    }
  } catch (error) {
    console.error('❌ Photo deletion error:', error);
    res.status(500).json({ error: 'Error deleting photo' });
  }
});

// Route to list available assets
app.get('/api/assets', (req, res) => {
  try {
    const assetsDir = path.join(process.cwd(), 'assets');
    const files = fs.readdirSync(assetsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        name: file.replace('.png', ''),
        url: `/assets/${file}`
      }));
    
    res.json(files);
  } catch (error) {
    console.error('❌ Asset listing error:', error);
    res.status(500).json({ error: 'Error listing assets' });
  }
});

// Proxy route to bypass CORS for Nordic sensor
app.get('/api/sensor-data', async (req, res) => {
  try {
    const response = await fetch(DATA_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let data = await response.json();
    
    // If data is a JSON string, parse it again
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New proxy route for Mbient sensor
app.get('/api/sensor-data-mbient', async (req, res) => {
  try {
    const response = await fetch(DATA_URL_MBIENT);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let data = await response.json();
    
    // If data is a JSON string, parse it again
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Combined sensor data endpoint
app.get('/api/sensor-data-combined', async (req, res) => {
  try {
    const [nordicResponse, mbientResponse] = await Promise.all([
      fetch(DATA_URL),
      fetch(DATA_URL_MBIENT)
    ]);
    
    let nordicData = null;
    let mbientData = null;
    
    if (nordicResponse.ok) {
      nordicData = await nordicResponse.json();
      if (typeof nordicData === 'string') {
        nordicData = JSON.parse(nordicData);
      }
    }
    
    if (mbientResponse.ok) {
      mbientData = await mbientResponse.json();
      if (typeof mbientData === 'string') {
        mbientData = JSON.parse(mbientData);
      }
    }
    
    res.json({
      nordic: nordicData,
      mbient: mbientData
    });
  } catch (error) {
    console.error('Combined sensor data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new recording session
app.post('/api/sessions/start', (req, res) => {
  const sessionId = `session_${Date.now()}`;
  const sessionFile = path.join(sessionsDir, `${sessionId}.csv`);
  
  // CSV headers
  const csvHeaders = 'Timestamp,Accel_X,Accel_Y,Accel_Z,Temperature,Humidity,CO2,TVOC,Temperature_Alert,Humidity_Alert,Air_Quality_Alert,Motion_Alert\n';
  
  try {
    fs.writeFileSync(sessionFile, csvHeaders);
    
    res.json({
      sessionId,
      message: 'Recording session created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating session' });
  }
});

// Route to create a new exercise recording session with custom naming
app.post('/api/sessions/start-exercise', (req, res) => {
  const { sessionId, patientId, exerciseType, patientName } = req.body;
  
  // Use provided sessionId or generate one
  const finalSessionId = sessionId || `exercise_${Date.now()}`;
  const sessionFile = path.join(sessionsDir, `${finalSessionId}.csv`);
  
  // Enhanced CSV headers for exercise sessions
  const csvHeaders = 'Timestamp,Patient_ID,Patient_Name,Exercise_Type,Accel_X,Accel_Y,Accel_Z,Temperature,Humidity,CO2,TVOC,Temperature_Alert,Humidity_Alert,Air_Quality_Alert,Motion_Alert\n';
  
  try {
    fs.writeFileSync(sessionFile, csvHeaders);
    
    // Store session metadata
    const sessionMeta = {
      sessionId: finalSessionId,
      patientId: patientId,
      patientName: patientName,
      exerciseType: exerciseType,
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    res.json({
      sessionId: finalSessionId,
      message: 'Exercise recording session created successfully',
      metadata: sessionMeta
    });
  } catch (error) {
    console.error('❌ Error creating exercise session:', error);
    res.status(500).json({ error: 'Error creating exercise session' });
  }
});

// Modified route to record data in an exercise session
app.post('/api/sessions/:sessionId/record', async (req, res) => {
  const { sessionId } = req.params;
  const sessionFile = path.join(sessionsDir, `${sessionId}.csv`);
  
  try {
    // Get sensor data
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let data = await response.json();
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    // Extract patient info and exercise type from sessionId if possible
    const sessionParts = sessionId.split('_');
    let patientInfo = '';
    let exerciseType = '';
    
    if (sessionParts.length >= 3) {
      patientInfo = sessionParts.slice(0, -2).join('_'); // Everything except date and exercise
      exerciseType = sessionParts[sessionParts.length - 1]; // Last part is exercise type
    }
    
    // Format data for CSV with exercise information
    const csvRow = [
      new Date().toISOString(),
      patientInfo || 'Unknown',
      exerciseType || 'Unknown',
      data.accelerometer?.x || 0,
      data.accelerometer?.y || 0,
      data.accelerometer?.z || 0,
      data.temperature || 0,
      data.humidity || 0,
      data.air_quality?.CO2 || 0,
      data.air_quality?.TVOC || 0,
      `"${data.motionalert || ''}"`
    ].join(',') + '\n';
    
    // Add row to CSV file
    fs.appendFileSync(sessionFile, csvRow);
    
    res.json({ 
      success: true, 
      message: 'Exercise data recorded',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Exercise recording error:', error);
    res.status(500).json({ error: 'Exercise recording error' });
  }
});

// Route to stop a session and get the file
app.post('/api/sessions/:sessionId/stop', (req, res) => {
  const { sessionId } = req.params;
  const sessionFile = path.join(sessionsDir, `${sessionId}.csv`);
  
  if (fs.existsSync(sessionFile)) {
    res.json({
      success: true,
      message: 'Session stopped successfully',
      downloadUrl: `/sessions/${sessionId}.csv`,
      sessionId
    });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Route to list available sessions
app.get('/api/sessions', (req, res) => {
  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => {
        const stats = fs.statSync(path.join(sessionsDir, file));
        return {
          filename: file,
          sessionId: file.replace('.csv', ''),
          created: stats.birthtime,
          size: stats.size,
          downloadUrl: `/sessions/${file}`
        };
      })
      .sort((a, b) => b.created - a.created);
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error listing sessions' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  // Data polling for both sensors
  const timer = setInterval(async () => {
    try {
      const [nordicResponse, mbientResponse] = await Promise.all([
        fetch(DATA_URL),
        fetch(DATA_URL_MBIENT)
      ]);
      
      let nordicData = null;
      let mbientData = null;
      
      if (nordicResponse.ok) {
        nordicData = await nordicResponse.json();
      }
      
      if (mbientResponse.ok) {
        mbientData = await mbientResponse.json();
      }
      
      // Send combined data to client
      socket.emit('sensorData', {
        nordic: nordicData,
        mbient: mbientData
      });
      
    } catch (error) {
      // Silent error handling
    }
  }, POLL_INTERVAL);

  // Clean up interval on disconnect
  socket.on('disconnect', () => {
    clearInterval(timer);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log(`📊 Complete Dashboard: http://localhost:${PORT}/`);
  console.log(`📈 Chart Only: http://localhost:${PORT}/chart`);
  console.log(`🌡️ Sensors Only: http://localhost:${PORT}/sensors`);
  console.log(`🏃 Motion Only: http://localhost:${PORT}/motion`);
});