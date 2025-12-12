const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Serve player photos
router.get('/players/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../IPL_Player_Photos', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Player photo not found' });
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', getContentType(filename));
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send file
  res.sendFile(filePath);
});

// Serve player videos
router.get('/videos/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../Player Video', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Player video not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    // Support video streaming with range requests
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Serve team logos
router.get('/logos/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../Logos', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Team logo not found' });
  }
  
  res.setHeader('Content-Type', getContentType(filename));
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.sendFile(filePath);
});

// Serve team videos
router.get('/team-videos/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../Team videos', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Team video not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// List available media files
router.get('/list/:type', (req, res) => {
  const { type } = req.params;
  let dirPath;
  
  switch (type) {
    case 'players':
      dirPath = path.join(__dirname, '../../IPL_Player_Photos');
      break;
    case 'videos':
      dirPath = path.join(__dirname, '../../Player Video');
      break;
    case 'logos':
      dirPath = path.join(__dirname, '../../Logos');
      break;
    case 'team-videos':
      dirPath = path.join(__dirname, '../../Team videos');
      break;
    default:
      return res.status(400).json({ error: 'Invalid media type' });
  }
  
  if (!fs.existsSync(dirPath)) {
    return res.json({ files: [] });
  }
  
  try {
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        if (type === 'videos' || type === 'team-videos') {
          return ['.mp4', '.avi', '.mov', '.webm'].includes(ext);
        } else {
          return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
        }
      })
      .map(file => ({
        name: file,
        url: `/static/${type}/${file}`,
        size: fs.statSync(path.join(dirPath, file)).size
      }));
    
    res.json({ files, count: files.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Helper function to get content type
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

module.exports = router;