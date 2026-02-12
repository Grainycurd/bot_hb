const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    // Используем прямой IP Яндекса, чтобы исключить проблемы с DNS
    host: '77.88.21.158',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        // ОБЯЗАТЕЛЬНО: так как сертификат выдан на "smtp.yandex.ru", 
        // а мы заходим по IP, нужно отключить строгую проверку имени хоста
        rejectUnauthorized: false,
        servername: 'smtp.yandex.ru' // Помогаем серверу понять, какой сертификат показать
    },
    family: 4,
    connectionTimeout: 10000, // 10 секунд на попытку соединения
    greetingTimeout: 10000
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