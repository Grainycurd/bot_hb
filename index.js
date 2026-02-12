require('dotenv').config();
const { Telegraf, Scenes, session, Markup } = require('telegraf');
const { sendLetter } = require('./mailer');

const bot = new Telegraf(process.env.BOT_TOKEN);

// ---------- утилита: убрать старые кнопки ----------
async function clearButtons(ctx) {
    try {
        if (ctx.callbackQuery?.message) {
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
        }
    } catch (e) { }
}

// ---------- СЦЕНА КВЕСТА ----------
const quest = new Scenes.WizardScene(
    'quest',

    // ШАГ 1 — подтверждение личности
    async (ctx) => {
        await ctx.reply(
            'Привет.\nПодтверди, пожалуйста:\nТы Дима и у тебя сегодня день рождения?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'yes_dima')],
                [Markup.button.callback('Нет', 'no_dima')]
            ])
        );
        return ctx.wizard.next();
    },

    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        await clearButtons(ctx);

        if (ctx.callbackQuery.data !== 'yes_dima') {
            await ctx.reply('Тогда этот квест не для тебя 🙂');
            return ctx.scene.leave();
        }

        await ctx.reply('Отлично. Тогда начнём маленький квест.');
        await ctx.reply(
            'Ты ел в этом году селедку под шубой?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'shuba_yes')],
                [Markup.button.callback('Нет', 'shuba_no')]
            ])
        );

        return ctx.wizard.next();
    },

    // ШАГ 2 — селедка
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        await clearButtons(ctx);

        if (ctx.callbackQuery.data === 'shuba_yes') {
            await ctx.reply('Сочувствую 😄');
        } else {
            await ctx.reply('Вот это сила воли.');
        }

        await ctx.reply(
            'А искупаться в холодной воде успел в этом году?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'cold_yes')],
                [Markup.button.callback('Нет', 'cold_no')]
            ])
        );

        return ctx.wizard.next();
    },

    // ШАГ 3 — холодная вода
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        await clearButtons(ctx);

        if (ctx.callbackQuery.data === 'cold_yes') {
            await ctx.reply('Вот это характер 💪');
        } else {
            await ctx.reply('Значит всё впереди.');
        }

        await ctx.reply(
            'Ты смотрел OnePunchMan?',
            Markup.inlineKeyboard([
                [Markup.button.callback('Да', 'opm_yes')],
                [Markup.button.callback('Нет', 'opm_no')]
            ])
        );

        return ctx.wizard.next();
    },

    // ШАГ 4 — OnePunchMan
    async (ctx) => {
        if (!ctx.callbackQuery) return;
        await ctx.answerCbQuery();
        await clearButtons(ctx);

        if (ctx.callbackQuery.data === 'opm_yes') {
            await ctx.reply('Тогда ты понимаешь, что такое настоящая сила 👊');
        } else {
            await ctx.reply('Рекомендую к просмотру.');
        }

        await ctx.reply(
            'Я предлагаю тебе оставить свою почту(например gmail 😁), чтобы я мог тебе выслать одну интересную историю об одном интересном человеке.\nОна немного приукрашена, но основана на реальных событиях.\n\nНапиши email сообщением.'
        );

        return ctx.wizard.next();
    },

    // ШАГ 5 — ввод email и отправка письма
    async (ctx) => {
        if (!ctx.message?.text) return;

        const email = ctx.message.text.trim();
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!re.test(email)) {
            await ctx.reply('Похоже на некорректный email. Попробуй ещё раз.');
            return;
        }

        ctx.session.userEmail = email;

        await ctx.reply('Принял ✅ Отправляю письмо…');

        try {
            await sendLetter(email); // <--- вот здесь подключаем mailer.js


            await ctx.reply(
                'Готово ✅\n' +
                'Проверь спам и перетащи письмо во входящие, чтобы письмо корректно отображалось.\n' +
                'Можешь открыть почту по кнопке ниже:',
                Markup.inlineKeyboard([
                    Markup.button.url('Открыть почту', 'https://mail.google.com')
                ])
            );

        } catch (err) {
            console.error(err);
            await ctx.reply('Ошибка отправки письма 😢');
        }

        return ctx.scene.leave();
    }
);

// ---------- РЕГИСТРАЦИЯ ----------
const stage = new Scenes.Stage([quest]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.scene.enter('quest'));

// ---------- ЗАПУСК ----------
bot.launch();
console.log('Bot started');

// корректное завершение
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));