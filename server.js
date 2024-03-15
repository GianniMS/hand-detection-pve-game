import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express();
const port = 3000;

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'public' directory
app.use(express.static(join(__dirname, 'public')));

// Define route for serving index.html
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});