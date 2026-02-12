const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',   // SMTP сервер Яндекса
    port: 465,                 // SSL порт
    secure: true,              // true для 465
    auth: {
        user: process.env.MAIL_USER, // твоя почта Яндекс
        pass: process.env.MAIL_PASS  // пароль приложения
    },
    family: 4,
    tls: {
        rejectUnauthorized: false // на случай проблем с SSL
    }
});

// Проверка соединения
transporter.verify()
    .then(() => console.log('✅ Яндекс готов к отправке'))
    .catch(err => console.error('❌ Ошибка соединения с Яндекс:', err));

async function sendLetter(toEmail) {
    const htmlPath = path.join(__dirname, 'letter.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    const info = await transporter.sendMail({
        from: `"Твой друг" <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: 'Специальная история для тебя',
        html
    });

    console.log('Письмо отправлено:', info.messageId);
    return info;
}

module.exports = { sendLetter };