import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import knn from 'knear';
import fs from 'fs';

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, 'public')));

// Serve files
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const k = 3;
const machine = new knn.kNear(k);

const jsonData = fs.readFileSync('public/training_data.json');
const newData = JSON.parse(jsonData);

// Shuffle the data
newData.sort(() => Math.random() - 0.5);

// Split the data into training and testing datasets
const splitIndex = Math.floor(newData.length * 0.8);
const trainData = newData.slice(0, splitIndex);
const testData = newData.slice(splitIndex);

// Train the KNN model using the training dataset
trainData.forEach(({ landmarks, action }, index) => {
    machine.learn(landmarks, action);
    // Log to prove model size and diversity
    console.log(`Training data point ${index + 1}: Action=${action}`);
});

app.use(bodyParser.json());

// Route for handling predictions for gameplay
app.post('/predict', (req, res) => {
    try {
        const landmarks = req.body.landmarks;
        const prediction = machine.classify(landmarks);
        res.json({ prediction });
    } catch (error) {
        console.error('Error processing landmarks data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for handling testing
app.post('/test', (req, res) => {
    try {
        const landmarks = req.body.landmarks;
        const prediction = machine.classify(landmarks);
        res.json({ prediction });
    } catch (error) {
        console.error('Error processing test round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for receiving feedback on predictions
let correctPredictions = 0;
app.post('/feedback', (req, res) => {
    try {
        const { correct } = req.body;
        if (correct) {
            correctPredictions = Math.min(correctPredictions + 1, testData.length);
        } else {
            correctPredictions = Math.max(correctPredictions - 1, 0);
        }
        // Calculate percentage
        const accuracy = (correctPredictions / testData.length) * 100;
        console.log(`Accuracy: ${accuracy}%`);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if server is live
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});