// ...existing code...

// Express backend for Deepseek API proxy
const express = require('express');
const bodyParser = require('body-parser');
let fetchFn;
try {
    fetchFn = fetch;
} catch {
    fetchFn = require('node-fetch');
}
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

app.use(bodyParser.json());

// Local llama.cpp server endpoint for Phi-3 model
const PHI3_API_URL = 'http://localhost:8080/v1/chat/completions';
const LLAMA_SERVER_URL = 'http://localhost:8080/completion';


app.post('/api/phi3', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }
    try {
        const apiRes = await fetchFn(PHI3_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                // You can add other parameters here if needed
            })
        });
        const data = await apiRes.json();
        // Extract response text
        const responseText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content
            : 'No response from Phi-3 model.';
        res.json({ response: responseText });
    } catch (err) {
        res.status(500).json({ error: 'Failed to connect to Phi-3 server.', details: err.message });
    }
});

app.post('/api/phi3', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }
    try {
        const apiRes = await fetchFn(LLAMA_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                n_predict: 128 // adjust as needed
            })
        });
        const data = await apiRes.json();
        res.json({ response: data.content || 'No response from Phi-3 model.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to connect to Phi-3 server.', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
