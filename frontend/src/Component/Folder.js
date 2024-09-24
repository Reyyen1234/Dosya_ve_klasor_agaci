import React, { useState } from 'react'; 
import '../style.css';

const Folder = ({ folder, onAdd, onDeleteFolder, onRename, onDeleteFile }) => {
  const [isExpanded, setIsExpanded] = useState(folder.expanded || false);
  const [showAdd, setShowAdd] = useState(false);
  const [inputName, setInputName] = useState('');
  const [type, setType] = useState('folder'); 
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAdd = (event) => {
    event.preventDefault();
    if (inputName.trim() === '') {
      return; 
    }
    onAdd(folder.path, inputName, type); 
    setInputName(''); 
    setShowAdd(false); 
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
            const isNewFile = file.includes("new"); 
            
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
