const {keyboards, stickers, researches} = require("../assets/constants");
const localisations = require("../localisations");
const fs = require("fs");

const {getUserData} = require("./updateDb");

async function sendStartMessage(bot, chatId, first_name, last_name) {
    await bot.sendSticker(chatId, stickers.hello);
    await bot.sendMessage(chatId, `Привет ${last_name} ${first_name}! ` + localisations.startMessage, {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Да', callback_data: "Yes"}, {text: 'Нет', callback_data: "No"}],
            ]
        }
    })
}

async function sendResearches(bot, chatId) {
    const keyboard = [...keyboards.researches, ['❌ Закрыть меню']];
    await bot.sendMessage(chatId, localisations.selectResearches, {
        reply_markup: {
            keyboard,
        },
        isResearch: true
    })
}

async function sendResearch(bot, chatId, researchTopic) {
    const research = researches.find(el => el.name === researchTopic);
    const {id, degree, advisor} = research;
    const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`);
    await bot.sendPhoto(chatId, imageStream);
    await bot.sendMessage(chatId, "Руководитель направления: " + degree + " " + advisor,);
    await bot.sendMessage(chatId, "Описание направления. Описание направления. Описание направления. Описание направления.", {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Присоединиться', callback_data: "joinUs"}],
            ]
        },
        disable_notification: true
    })
}

async function sendConfusedMessage(bot, chatId) {
    await bot.sendSticker(chatId, stickers.unknown);
    await bot.sendMessage(chatId, localisations.iDontUnderstand);
}

async function sendUserData(bot, chatId, userData) {
    const {first_name, last_name,phone, position, study, research} = userData;
    await bot.sendMessage(chatId,
        `Мои данные: \n${research}\n${position}, ${study}\n${last_name} ${first_name}\n${phone}`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Подтвердить', callback_data: "userConfirmData"}],
                    [{text: 'Редактировать', callback_data: "userWantToEditData"}],
                ]
            },
        });

    // let userData = await getUserData(chatId);
    // console.log(userData);
    // await bot.sendMessage(chatId, userData).then(e=>e.log);
}

module.exports = {sendResearch, sendStartMessage, sendResearches, sendConfusedMessage, sendUserData};