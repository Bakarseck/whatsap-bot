const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Utiliser LocalAuth pour la persistance de la session
const client = new Client({
    authStrategy: new LocalAuth()
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

client.on('qr', (qr) => {
    console.log('QR code reçu, envoi au client...');
    io.emit('qr', qr);
});

client.on('ready', () => {
    console.log('Le client est prêt.');
    io.emit('ready');
});

client.on('message', async message => {
    console.log(`Message reçu de ${message.from}: ${message.body}`);
    io.emit('message', {
        from: message.from,
        body: message.body,
        hasMedia: message.hasMedia
    });

    if (message.body.toLowerCase() === '#surnom') {
        const surnoms = [
            { arabe: "حبيبتي", transliteration: "Habibti", signification: "mon amour" },
            { arabe: "عمري", transliteration: "Omri", signification: "ma vie" },
            { arabe: "روحي", transliteration: "Rouhi", signification: "mon âme" },
            { arabe: "غاليتي", transliteration: "Ghalyti", signification: "ma précieuse" },
            { arabe: "زهرتي", transliteration: "Zahreti", signification: "ma fleur" },
            { arabe: "قمر", transliteration: "Qamar", signification: "mon étoile" },
            { arabe: "أميرة", transliteration: "Amira", signification: "princesse" },
            { arabe: "نور عيني", transliteration: "Noor 'Ayni", signification: "la lumière de mes yeux" },
            { arabe: "ملاكي", transliteration: "Malaki", signification: "mon ange" },
            { arabe: "دنيتي", transliteration: "Dunyati", signification: "mon monde" }
        ];
        const randomSurnom = surnoms[Math.floor(Math.random() * surnoms.length)];
        const replyMessage = `${randomSurnom.arabe} (${randomSurnom.transliteration}) - Signifie "${randomSurnom.signification}".`;
        message.reply(replyMessage);
    }

    if (message.from.includes('status')) {
        console.log('Message provenant d\'un statut:', message);

        if (message.hasMedia) {
            try {
                const media = await message.downloadMedia();
                if (media && media.mimetype) {
                    const mediaExtension = media.mimetype.split('/')[1];
                    const filePath = path.join(__dirname, `status-files/${message.id.id}.${mediaExtension}`);
                    fs.writeFile(filePath, media.data, 'base64', (err) => {
                        if (err) {
                            console.error('Erreur lors de la sauvegarde du statut :', err);
                        } else {
                            console.log(`Statut enregistré : ${filePath}`);
                        }
                    });
                } else {
                    console.error('Le média téléchargé n\'a pas de type MIME ou est invalide.');
                }
            } catch (err) {
                console.error('Erreur lors du téléchargement du média du statut :', err);
            }
        } else {
            console.log('Le statut ne contient pas de média.');
        }
    }

    if (message.body.toLowerCase() === 'bonjour') {
        message.reply('Bonjour ! Comment puis-je vous aider aujourd\'hui ?');
    }

    if (message.body.toLowerCase() === '#tagall' && message.fromMe) {
        console.log("Commande #tagall détectée provenant de vous");
        const chat = await message.getChat();
        if (chat.isGroup) {
            let mentions = [];
            let text = '══✪〘   Tag All   〙✪══\n\n➲ Message : blank Message\n';

            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${contact.pushname || contact.number}\n`;
            }

            chat.sendMessage(text, { mentions }).then(response => {
                console.log('Message envoyé avec les mentions.');
            }).catch(err => {
                console.error('Erreur lors de l\'envoi du message avec mentions :', err);
            });
        }
    }

    if (message.hasMedia) {
        try {
            const media = await message.downloadMedia();
            if (media && media.mimetype) {
                const mediaExtension = media.mimetype.split('/')[1];
                const filePath = path.join(__dirname, `received-files/${message.id.id}.${mediaExtension}`);
                fs.writeFile(filePath, media.data, 'base64', (err) => {
                    if (err) {
                        console.error(`Erreur lors de la sauvegarde du fichier média (${media.mimetype}) :`, err);
                    } else {
                        console.log(`Fichier média enregistré : ${filePath}`);
                    }
                });
            } else {
                console.error('Le média téléchargé n\'a pas de type MIME ou est invalide.');
            }
        } catch (err) {
            console.error('Erreur lors du téléchargement du média :', err);
        }
    }
});

client.initialize();

// Socket.io pour la communication en temps réel
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');
});

http.listen(3000, () => {
    console.log('Écoute sur le port 3000');
});
