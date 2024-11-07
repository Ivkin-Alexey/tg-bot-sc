import { updateConstantsDB } from './updateConstants.js'
import { getUser } from './users.js'

async function askReagentsManagerChatID(bot, chatID) {
  const prompt = await bot.sendMessage(chatID, 'Введите chatID менеджера по реактивам', {
    reply_markup: {
      force_reply: true,
    },
  })

  bot.onReplyToMessage(chatID, prompt.message_id, async function (answer) {
    await getUser(+answer.text)
      .then(() => {
        updateConstantsDB('reagents', { reagentsManagerChatID: answer.text })
          .then(
            async () =>
              await bot.sendMessage(
                chatID,
                'ChatID менеджера по реактивам обновлен: ' + answer.text,
              ),
          )
          .catch(async e => await bot.sendMessage(chatID, e))
      })
      .catch(async e => await bot.sendMessage(chatID, e))
  })
}

export { askReagentsManagerChatID }
