const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/upload', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const userId = req.headers['x-user-id']; // Menerima User ID dari frontend
        const { fileName, fileData } = req.body;

        if (!apiKey || !userId) {
            return res.status(400).json({ error: 'API Key atau User ID tidak ditemukan di header!' });
        }

        // Konversi base64 audio ke Buffer
        const buffer = Buffer.from(fileData, 'base64');

        // FormData / payload untuk dikirim ke API Open Cloud Roblox (Asset Creation)
        // Creator target diset menggunakan User ID yang diinputkan pengguna
        const FormData = require('form-data');
        const form = new FormData();
        
        const assetRequest = {
            assetType: "Audio",
            displayName: fileName,
            description: "Uploaded via Brian Studio Bypass",
            creationContext: {
                creator: {
                    userId: userId
                }
            }
        };

        form.append('request', JSON.stringify(assetRequest));
        form.append('file', buffer, { filename: `${fileName}.mp3`, contentType: 'audio/mpeg' });

        // Endpoint resmi Open Cloud Roblox v1 Assets
        const rbxResponse = await fetch('https://apis.roblox.com/assets/v1/assets', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                ...form.getHeaders()
            },
            body: form
        });

        const rbxResult = await rbxResponse.json();

        if (rbxResponse.ok) {
            return res.status(200).json({ success: true, data: rbxResult });
        } else {
            return res.status(rbxResponse.status).json({ error: rbxResult.message || 'Gagal mengunggah ke Roblox' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan internal pada server.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});