const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/structure', (req, res) => {
  const baseDir = path.join(__dirname, 'app'); 

  function readDirRecursive(dirPath) {
    return fs.readdirSync(dirPath, { withFileTypes: true }).map((dirent) => {
      const res = {
        name: dirent.name,
        path: path.join(dirPath, dirent.name),
        files: [],
        subFolders: []
      };

      if (dirent.isDirectory()) {
        res.subFolders = readDirRecursive(path.join(dirPath, dirent.name));
      } else {
        res.files.push(dirent.name);
      }

      return res;
    });
  }

  try {
    const structure = readDirRecursive(baseDir);
    const root = {
      name: 'app',
      path: baseDir,
      files: [],
      subFolders: structure,
      expanded: true,
    };
    res.status(200).json([root]);
  } catch (error) {
    console.error('Error reading directory structure:', error);
    res.status(500).json({ error: 'Error reading directory structure' });
  }
});
// Route for creating a folder
router.post('/create', (req, res) => {
  const { folderPath, folderName } = req.body;

  if (!folderName) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const baseDir = path.join(__dirname, 'app');
  const newFolderPath = path.resolve(baseDir, folderPath || '', folderName);

  console.log('Creating folder at:', newFolderPath);

  fs.mkdir(newFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating folder:', err);
      return res.status(500).json({ error: `Error creating folder: ${err.message}` });
    }
    res.status(200).json({ message: 'Folder created successfully', newFolderPath });
  });
});
// List files and folders in a specific directory
router.get('/list', (req, res) => {
  const { folderPath } = req.query; 

  if (!folderPath) {
    return res.status(400).json({ error: 'Folder path is required' });
  }

  const baseDir = path.join(__dirname, 'app'); 
  const targetDir = path.resolve(baseDir, folderPath);

  fs.readdir(targetDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Unable to list files' });
    }

    const result = files.map(dirent => ({
      name: dirent.name,
      isDirectory: dirent.isDirectory(),
    }));

    res.status(200).json(result);
  });
});



router.post('/rename', (req, res) => {
  const { folderPath, oldName, newName } = req.body;

  if (!folderPath || !oldName || !newName) {
    return res.status(400).json({ error: 'Folder path, old name, and new name are required' });
  }

  const baseDir = path.join(__dirname, 'app');
  const oldFolderPath = path.resolve(baseDir, folderPath, oldName);
  const newFolderPath = path.resolve(baseDir, folderPath, newName);

  console.log('Renaming folder from:', oldFolderPath, 'to:', newFolderPath);

  if (!fs.existsSync(oldFolderPath)) {
    console.error('Old folder does not exist:', oldFolderPath);
    return res.status(404).json({ error: 'Old folder does not exist' });
  }

  if (fs.existsSync(newFolderPath)) {
    console.error('A folder with the new name already exists:', newFolderPath);
    return res.status(409).json({ error: 'A folder with the new name already exists' });
  }

  fs.rename(oldFolderPath, newFolderPath, (err) => {
    if (err) {
      console.error('Error renaming folder:', err);
      return res.status(500).json({ error: `Error renaming folder: ${err.message}` });
    }
    res.status(200).json({ message: 'Folder renamed successfully' });
  });
});

// Route for deleting a folder
router.post('/delete', (req, res) => {
  const { folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({ error: 'Folder path is required' });
  }

  const baseDir = path.join(__dirname, 'app');
  const folderToDelete = path.resolve(baseDir, folderPath);

  console.log('Deleting folder at:', folderToDelete);

  fs.access(folderToDelete, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: `Folder not found: ${folderToDelete}` });
    }

    fs.rm(folderToDelete, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error deleting folder:', err);
        return res.status(500).json({ error: `Error deleting folder: ${err.message}` });
      }
      res.status(200).json({ message: 'Folder deleted successfully' });
    });
  });
});

module.exports = router;