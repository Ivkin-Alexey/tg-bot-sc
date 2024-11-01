import { getConstantFromDB } from './updateConstants.js'
import { sendNotification } from './tg-bot-controllers/botAnswers.js'

async function notifyProgrammer(bot, message) {
  const programmerChatID = await getConstantFromDB('general', 'programmerChatID')
  await sendNotification(bot, programmerChatID, message)
}

export { notifyProgrammer }
