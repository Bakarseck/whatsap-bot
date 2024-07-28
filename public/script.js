const socket = io();

document.getElementById('loading').style.display = 'block';
document.getElementById('qr-container').style.display = 'none';
document.getElementById('content').style.display = 'none';

socket.on('qr', (qr) => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('qr-container').style.display = 'block';
    document.getElementById('content').style.display = 'none';

    const qrCodeContainer = document.getElementById('qr-code');
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
        text: qr,
        width: 256,
        height: 256,
    });
});

socket.on('ready', () => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('qr-container').style.display = 'none';
    document.getElementById('content').style.display = 'block';
});

socket.on('message', (msg) => {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerText = `${msg.from}: ${msg.body}`;
    messagesContainer.appendChild(messageElement);
});
