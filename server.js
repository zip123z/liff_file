const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 3000;

// 設置文件存儲
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: file.size
    }));

    res.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      files 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed',
      error: error.message 
    });
  }
});

app.get('/api/files', (req, res) => {
  const uploadDir = 'uploads/';
  if (!fs.existsSync(uploadDir)) {
    return res.json([]);
  }

  const files = fs.readdirSync(uploadDir).map(file => ({
    name: file,
    url: `/uploads/${file}`,
    type: mime.lookup(file)
  }));
  
  res.json(files);
});

// 啟動服務
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
