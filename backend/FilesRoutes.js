const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Route for creating a file
router.post('/create', (req, res) => {
  const { folderPath, fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const baseDir = path.join(__dirname, 'app'); 
  const newFilePath = path.resolve(baseDir, folderPath || '', fileName);

  fs.writeFile(newFilePath, '', (err) => {
    if (err) {
      return res.status(500).json({ error: `Error creating file: ${err.message}` });
    }
    res.status(200).json({ message: 'File created successfully', newFilePath });
  });
});
// Route for renaming a file
router.post('/rename', (req, res) => {
  const { folderPath, oldName, newName } = req.body;

  if (!folderPath || !oldName || !newName) {
    return res.status(400).json({ error: 'Folder path, old name, and new name are required' });
  }

  const baseDir = path.join(__dirname, 'app');
  const oldFilePath = path.resolve(baseDir, folderPath || '', oldName);
  const newFilePath = path.resolve(baseDir, folderPath || '', newName);

  console.log('Renaming from:', oldFilePath, 'to:', newFilePath); // Debugging log

  fs.access(oldFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: `File not found: ${oldFilePath}` });
    }

    fs.access(newFilePath, fs.constants.F_OK, (err) => {
      if (!err) {
        return res.status(400).json({ error: `File already exists: ${newFilePath}` });
      }

      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          return res.status(500).json({ error: `Error renaming file: ${err.message}` });
        }
        res.status(200).json({ message: 'File renamed successfully' });
      });
    });
  });
});


// Route for deleting a file
router.post('/delete', (req, res) => {
  const { folderPath, fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const baseDir = path.join(__dirname, 'app');
  const fileToDelete = path.resolve(baseDir, folderPath || '', fileName);

  fs.unlink(fileToDelete, (err) => {
    if (err) {
      return res.status(500).json({ error: `Error deleting file: ${err.message}` });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
});

module.exports = router;