require('dotenv').config();
const fetch = require('node-fetch');

const CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;
const CODE = process.env.YANDEX_CODE; // код из браузера

(async () => {
    try {
        const res = await fetch('https://oauth.yandex.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: CODE,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const data = await res.json();
        console.log('Твой токен доступа (access_token):', data.access_token);
        console.log('Сохрани его в .env как YANDEX_TOKEN');
    } catch (err) {
        console.error(err);
    }
})();