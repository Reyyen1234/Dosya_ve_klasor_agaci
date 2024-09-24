import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Folder from './Folder'; 

const FolderTree = () => {
  const [folders, setFolders] = useState([]); 

  const fetchFolderStructure = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/folders/structure'); 
      console.log("Fetched Folder Structure:", response.data); 
      setFolders(response.data); 
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
      fetchFolderStructure(); 
    } catch (error) {
      console.error('Error adding file/folder:', error);
    }
  };
  

  const handleDeleteFolder = async (path) => {
    try {
      await axios.post('http://localhost:5000/api/folders/delete', { folderPath: path });
      fetchFolderStructure(); 
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleDeleteFile = async (folderPath, fileName) => {
    try {
      await axios.delete('http://localhost:5000/api/files/delete', { data: { folderPath, fileName } });
      fetchFolderStructure(); 
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRename = async (oldPath, oldName, newName) => {
    try {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('\\')); 
      await axios.post('http://localhost:5000/api/folders/rename', {
        folderPath: parentPath,
        oldName: oldName,
        newName: newName,
      });
      fetchFolderStructure(); 
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };
  

  useEffect(() => {
    fetchFolderStructure(); 
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
