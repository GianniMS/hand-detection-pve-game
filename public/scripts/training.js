import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let runningMode = "VIDEO";
let enableWebcamButton = HTMLButtonElement;
let webcamRunning = false;

// Array to store training data
let trainingData = [];

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 1
    });
};
createHandLandmarker();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("start-training");
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }

    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.textContent = "Start Training";
        enableWebcamButton.classList.remove('stop-training'); // Remove the class
        video.pause(); // Pause the video when training is stopped
        return;
    } else {
        webcamRunning = true;
        enableWebcamButton.textContent = "Stop Training";
        enableWebcamButton.classList.add('stop-training'); // Add the class
    }

    // getUsermedia parameters.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.play(); // Start the video when training is started
        video.addEventListener("loadeddata", predictWebcam);
    });
}

let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
    canvasElement.style.width = video.videoWidth;
    canvasElement.style.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
    }
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (webcamRunning && results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#ffd700",
                lineWidth: 5
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#6495ed", lineWidth: 2 });
        }
    }
    canvasCtx.restore();

    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

// Event listener for Train button
document.querySelectorAll('.training-button')[0].addEventListener('click', () => {
    if (results && results.landmarks) {
        const action = document.getElementById('actionDropdown').value;
        // Add landmarks and action to training data
        trainingData.push({ landmarks: results.landmarks, action: action });
    }
});

// Event listener for Save button
document.querySelectorAll('.training-button')[1].addEventListener('click', () => {
    // Convert training data to JSON
    const jsonData = JSON.stringify(trainingData);
    // Create a blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    // Create a link element
    const link = document.createElement('a');
    // Set link attributes
    link.href = url;
    link.download = 'training_data.json';
    // Simulate click on the link to trigger download
    link.click();

    // Clear the training data after saving
    trainingData = [];
});
