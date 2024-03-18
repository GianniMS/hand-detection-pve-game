import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let runningMode = "VIDEO";
let enableTestButton = HTMLButtonElement;
let webcamRunning = false;

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

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
    enableTestButton = document.getElementById("start-test");
    enableTestButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! Hand Landmarker not loaded yet.");
        return;
    }

    if (webcamRunning) {
        webcamRunning = false;
        enableTestButton.textContent = "Start testing";
        enableTestButton.classList.remove('stop-test');
        video.pause();
        return;
    } else {
        webcamRunning = true;
        enableTestButton.textContent = "Stop testing";
        enableTestButton.classList.add('stop-test');
    }

    const constraints = {
        video: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.play();
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
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#ffd700",
                lineWidth: 5
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#6495ed", lineWidth: 2 });
            // Send landmarks for testing
            sendLandmarksForTesting(landmarks);
        }
    }
    canvasCtx.restore();

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}

async function sendLandmarksForTesting(landmarks) {
    const flattenedLandmarks = landmarks.flatMap(point => [point.x, point.y, point.z]);

    const response = await fetch('/test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ landmarks: flattenedLandmarks })
    });
    const data = await response.json();
    console.log(`Testing result: ${data.prediction}`);

    updateUI(data.prediction);
}

function updateUI(prediction) {
    // Get the element to update
    const abilityDisplay = document.querySelector('.ability-display');

    // Map prediction to the corresponding ability
    const abilityMap = {
        "shield": "Test result: Shield",
        "attack": "Test result: Attack",
        "heal": "Test result: Heal",
        "idle": "Test result: Idle pose"
    };

    abilityDisplay.textContent = abilityMap[prediction];
}

document.getElementById('correct-test').addEventListener('click', () => {
    sendFeedback(true);
});

document.getElementById('incorrect-test').addEventListener('click', () => {
    sendFeedback(false);
});

async function sendFeedback(isCorrect) {
    try {
        const response = await fetch('/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correct: isCorrect })
        });
        if (response.ok) {
            console.log(`Feedback sent successfully for ${isCorrect ? 'correct' : 'incorrect'} prediction.`);
        } else {
            console.error('Failed to send feedback.');
        }
    } catch (error) {
        console.error('Error sending feedback:', error);
    }
}