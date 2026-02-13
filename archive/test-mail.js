require('dotenv').config();
const { sendLetter } = require('./mailer');

// Замените на почту, на которую хотите протестировать
const testEmail = 'svianton31@gmail.com';

(async () => {
    try {
        console.log('Попытка отправки письма на', testEmail);
        await sendLetter(testEmail);
        console.log('✅ Письмо успешно отправлено!');
    } catch (err) {
        console.error('❌ Ошибка при отправке письма:', err);
    }
})();