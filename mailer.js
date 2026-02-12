const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 587,             // <-- Было 465, ставим 587
    secure: false,         // <-- Было true, ставим false (это включает STARTTLS)
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // <-- Добавь это, иногда помогает, если сертификаты шалят
    },
    // Оставляем family: 4, это важно для Railway!
    family: 4
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