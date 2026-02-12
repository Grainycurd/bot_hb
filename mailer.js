const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function sendLetter(toEmail) {
    const htmlPath = path.join(__dirname, 'letter.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    const payload = {
        key: "MY_SECRET_KEY_123", // Должен совпадать с ключом в Google Script
        to: toEmail,
        subject: 'OneStory-man',
        html: html
    };

    try {
        const response = await axios.post(process.env.GOOGLE_SCRIPT_URL, payload);

        if (response.data === "OK") {
            console.log('✅ Письмо отправлено через Google Proxy');
            return true;
        } else {
            throw new Error('Google Script returned: ' + response.data);
        }
    } catch (error) {
        console.error('❌ Ошибка при обращении к Google Script:', error.message);
        throw error;
    }
}

module.exports = { sendLetter };
