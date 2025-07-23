// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const resultsDiv = document.getElementById('results');
    
    // Load models from CDN (or use your local path)
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');

    // Start camera
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });

    // Detection function
    async function detectFaces() {
        // Set canvas size = video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Detect faces
        const detections = await faceapi.detectAllFaces(canvas, 
            new faceapi.TinyFaceDetectorOptions());
        
        // Draw boxes
        faceapi.draw.drawDetections(canvas, detections);
        
        // Return detections count
        return detections.length;
    }

    // Capture & Save button
    document.getElementById('capture').addEventListener('click', async () => {
        const faceCount = await detectFaces();
        resultsDiv.innerHTML = `Detected ${faceCount} face(s)`;
        
        // Convert canvas to image
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Send to server
        try {
            const response = await fetch('save_face.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });
            const result = await response.json();
            resultsDiv.innerHTML += `<p>${result.message}</p>`;
        } catch (err) {
            resultsDiv.innerHTML += `<p style="color:red">Save failed: ${err}</p>`;
        }
    });
});