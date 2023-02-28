const socket = io();
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.log(error);
    });

function capture() {
    //for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL('image/png');
            socket.emit('image', data);
        }, 3000);
   // }
}

socket.on('connect', () => {
    console.log('Connected to server');
});

window.onload = capture;