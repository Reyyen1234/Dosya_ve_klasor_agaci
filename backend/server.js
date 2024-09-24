const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors()); 

app.use(express.json());


const folderRoutes = require('./FolderRoutes'); 
app.use('/api/folders', folderRoutes);

const filesRoutes = require('./FilesRoutes'); 
app.use('/api/files', filesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

