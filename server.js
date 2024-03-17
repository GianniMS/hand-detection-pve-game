import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import knn from 'knear';
import fs from 'fs';

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

// Load the KNN model
const k = 3;
const machine = new knn.kNear(k);

// Read the JSON file synchronously
const jsonData = fs.readFileSync('public/training_data.json');
const newData = JSON.parse(jsonData);

newData.forEach(({ landmarks, action }, index) => {
    console.log(`Processing data point ${index + 1}: action=${action}`);
    // Since landmarks are now represented as a single flattened array, directly pass them to the learn function
    machine.learn(landmarks, action);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to handle predictions
app.post('/predict', (req, res) => {
    try {
        const landmarks = req.body.landmarks;

        // Classify the landmarks using the KNN model
        const prediction = machine.classify(landmarks);

        res.json({ prediction });
    } catch (error) {
        console.error('Error processing landmarks data:', error); // Log error
        res.status(500).json({ error: 'Internal server error' }); // Send error response
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});