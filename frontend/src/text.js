/* import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Folder from './Folder'; // Adjust the path if needed

const FolderTree = () => {
  const [folders, setFolders] = useState([]); // State to manage folder structure

  const fetchFolderStructure = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/folders/structure'); // Ensure this endpoint is correct
      console.log("Fetched Folder Structure:", response.data); // Debugging line
      setFolders(response.data); // Set the fetched folder structure
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    }
  };

  const handleAdd = async (path, name, type) => {
    try {
      if (type === 'folder') {
        await axios.post('http://localhost:5000/api/folders/create', { folderPath: path, folderName: name });
      } else {
        await axios.post('http://localhost:5000/api/files/create', { folderPath: path, fileName: name });
      }
      fetchFolderStructure(); // Refresh the folder structure after adding
    } catch (error) {
      console.error('Error adding file/folder:', error);
    }
  };
  

  const handleDeleteFolder = async (path) => {
    try {
      await axios.post('http://localhost:5000/api/folders/delete', { folderPath: path });
      fetchFolderStructure(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleDeleteFile = async (folderPath, fileName) => {
    try {
      await axios.delete('http://localhost:5000/api/files/delete', { data: { folderPath, fileName } });
      fetchFolderStructure(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRename = async (oldPath, oldName, newName) => {
    try {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('\\')); // Get the parent path
      await axios.post('http://localhost:5000/api/folders/rename', {
        folderPath: parentPath,
        oldName: oldName,
        newName: newName,
      });
      fetchFolderStructure(); // Refresh after renaming
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };
  

  useEffect(() => {
    fetchFolderStructure(); // Fetch folder structure on component mount
  }, []);

  return (
    <div>
      {folders.map((folder) => (
        <Folder
          key={folder.path}
          folder={folder}
          onAdd={handleAdd}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
          onRename={handleRename}
        />
      ))}
    </div>
  );
};

export default FolderTree;
import React, { useState } from 'react'; 
import '../style.css';

const Folder = ({ folder, onAdd, onDeleteFolder, onRename, onDeleteFile }) => {
  const [isExpanded, setIsExpanded] = useState(folder.expanded || false);
  const [showAdd, setShowAdd] = useState(false);
  const [inputName, setInputName] = useState('');
  const [type, setType] = useState('folder'); // Default type is folder
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAdd = (event) => {
    event.preventDefault();
    if (inputName.trim() === '') {
      return; // Don't allow empty names
    }
    onAdd(folder.path, inputName, type); // Call onAdd with folder path, name, and type
    setInputName(''); // Clear input after adding
    setShowAdd(false); // Hide add input after submission
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div className='container'>
        {folder.subFolders.length > 0 && (
          <button className='button' onClick={handleToggleExpand}>
            {isExpanded ? '▼' : '►'}
          </button>
        )}
        
        <span className='folder-name'>{folder.name}</span>
        <button className='button' onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+'}
        </button>
        {folder.path !== 'app' && (
          <button className='button' onClick={() => onDeleteFolder(folder.path)}>
            -
          </button>
        )}
        <button
          className='button'
          onClick={() => {
            setIsRenaming(true);
            setRenameInput(folder.name);
          }}
        >
          Rename
        </button>
      </div>

      {isRenaming && (
        <div>
          <input
            type="text"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            placeholder="Enter new name"
          />
          <button onClick={() => onRename(folder.path, folder.name, renameInput)}>Submit</button>
          <button onClick={() => setIsRenaming(false)}>Cancel</button>
        </div>
      )}

      {showAdd && (
        <div>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder={`Enter ${type} name`}
          />
          <select onChange={(e) => setType(e.target.value)} value={type}>
            <option value="file">File</option>
            <option value="folder">Folder</option>
          </select>
          <button onClick={handleAdd}>Add {type}</button>
          <button onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      {isExpanded && (
        <div>
          {folder.subFolders.map((subFolder) => (
            <Folder
              key={subFolder.path}
              folder={subFolder}
              onAdd={onAdd}
              onDeleteFolder={onDeleteFolder}
              onRename={onRename}
              onDeleteFile={onDeleteFile} 
            />
          ))}

          {folder.files.map((file) => {
            const isNewFile = file.includes("new"); // Example condition for newly created files
            
            return (
              <div key={file} style={{ color: 'white' }}>
                {file}
                {isNewFile && (
                  <>
                    <button onClick={() => onDeleteFile(folder.path, file)}>-</button>
                    <button onClick={() => {
                      setIsRenaming(true);
                      setRenameInput(file);
                    }}>Rename</button>
                    {isRenaming && renameInput === file && (
                      <div>
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          placeholder="Enter new name"
                        />
                        <button onClick={() => onRename(folder.path, file, renameInput)}>Submit</button>
                        <button onClick={() => setIsRenaming(false)}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Folder;


const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/structure', (req, res) => {
  const baseDir = path.join(__dirname, 'app'); // Base directory

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
  const { folderPath } = req.query; // Get folderPath from query parameters

  if (!folderPath) {
    return res.status(400).json({ error: 'Folder path is required' });
  }

  const baseDir = path.join(__dirname, 'app'); // Adjust base directory as necessary
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

  console.log('Renaming folder from:', oldFolderPath, 'to:', newFolderPath); // Debugging log

  // Verify that the old folder exists
  if (!fs.existsSync(oldFolderPath)) {
    console.error('Old folder does not exist:', oldFolderPath);
    return res.status(404).json({ error: 'Old folder does not exist' });
  }

  // Ensure the new name doesn't already exist
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

// Delete a folder
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

  const baseDir = path.join(__dirname, 'app'); // Your app's root directory
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

module.exports = router; */