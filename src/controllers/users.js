import { writeFile, readFile } from 'fs'
import path from 'path'
import __dirname from '../utils/__dirname.js'
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'db.json')
import {
  newPerson,
  newPersonCheckingRules,
  ConfirmedUserData,
} from '../assets/constants/users.js'
import { createDate } from './helpers.js'
import { confirmedUsers } from '../assets/constants/gSpreadSheets.js'
import { getConstantFromDB } from './updateConstants.js'
import { readJsonFile } from './fs.js'
import { programmerChatID } from '../assets/constants/constants.js'

async function deleteUsersWithEmptyChatID(chatID) {
  return new Promise((resolve, reject) => {
    try {
      checkIsUserSuperAdmin(chatID).then(() => {
        readFile(jsonPath, 'utf8', (error, data) => {
          if (error) {
            reject(error)
            return
          }
          let parsedData = JSON.parse(Buffer.from(data))
          parsedData = parsedData.filter(el => el.chatID !== '')
          writeFile(jsonPath, JSON.stringify(parsedData, null, 2), error => {
            if (error) reject(error)
          })
        })
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function addRandomUser(type = 'user') {
  let user = newPerson
  user.chatID = Math.floor(100000000 + Math.random() * 900000000)
  user.firstName = 'Джон'
  user.lastName = 'Сноу'
  user.phone = '+79533694548'
  user.type = type
  await updateUserData(user.chatID, user)
}

async function createNewPerson(login, password) {
  return new Promise((resolve, reject) => {
    readFile(jsonPath, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      let parsedData = JSON.parse(Buffer.from(data))

      const user = parsedData.find(el => el.login === login)

      if (!user) {
        const newPerson = { login, password }
        parsedData.push(newPerson)
        writeFile(jsonPath, JSON.stringify(parsedData, null, 2), error => {
          if (error) {
            reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`)
            return
          }
          resolve('Пользователь успешно создан')
        })
      } else reject(`Такой пользователь уже существует!`)
    })
  })
}

async function updateUserData(chatID, userData) {
  return new Promise((resolve, reject) => {
    if (typeof chatID === 'undefined') {
      reject(`Ошибка сервера. Полученное значение chatID: ${chatID}`)
      return
    }
    if (typeof userData === 'undefined') {
      reject(`Ошибка сервера. Полученное значение userData: ${userData}`)
      return
    }

    readFile(jsonPath, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      let parsedData = JSON.parse(Buffer.from(data))
      let isNewUser = true
      parsedData = parsedData.map(el => {
        if (el.chatID === chatID) {
          for (let field in el) {
            if (userData[field] !== undefined) {
              el[field] = userData[field]
            }
          }

          let { isUserDataSent, registrationDate } = el.otherInfo
          el.otherInfo.isUserDataSent = checkIsAllFieldsComplete(el)
          if (isUserDataSent === true && registrationDate === '')
            el.otherInfo.registrationDate = createDate()
          else el.otherInfo.registrationDate = ''
          isNewUser = false
        }
        return el
      })

      if (isNewUser) {
        for (let field in userData) {
          newPerson[field] = userData[field]
        }
        newPerson.otherInfo.isUserDataSent = checkIsAllFieldsComplete(newPerson)
        if (newPerson.otherInfo.isUserDataSent) newPerson.otherInfo.registrationDate = createDate()
        parsedData.push(newPerson)
      }

      writeFile(jsonPath, JSON.stringify(parsedData, null, 2), error => {
        if (error) {
          reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`)
          return
        }
        resolve(parsedData)
      })
    })
  })
}

async function getUserData(id) {
  // chatID or login
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(jsonPath).then(parsedData => {
        const user = parsedData.find(el => el.chatID === +id || el.login === id)
        resolve(user)
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function getUserList() {
  return new Promise((resolve, reject) => {
    readFile(jsonPath, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      resolve(JSON.parse(Buffer.from(data)))
    })
  })
}

async function deleteUser(chatID) {
  return new Promise((resolve, reject) => {
    readFile(jsonPath, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }

      let parsedData = JSON.parse(Buffer.from(data))
      parsedData = parsedData.filter(el => el.chatID !== chatID)

      writeFile(jsonPath, JSON.stringify(parsedData, null, 2), error => {
        if (error) {
          reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`)
          return
        }
        resolve(parsedData)
      })
    })
  })
}

function checkIsAllFieldsComplete(object) {
  let isComplete = true
  for (const key in object) {
    if (!isComplete) break
    const rule = newPersonCheckingRules[key]
    if (rule === 'required') {
      if (object[key] === '') isComplete = false
    } else if (Array.isArray(rule)) {
      let str = ''
      rule.forEach(el => {
        str += object[el]
      })
      if (str === '') isComplete = false
    }
  }
  return isComplete
}

async function processUserConfirmation(bot, accountData) {
  // eslint-disable-next-line no-undef
  const { confirmStudentApplication } = superAdministratorActions
  await bot.sendMessage(accountData.chatID, confirmStudentApplication)
  try {
    await confirmedUsers.loadInfo()
    let sheet = confirmedUsers.sheetsByIndex[0]
    const data = new ConfirmedUserData(accountData)
    await sheet.addRow(data)
    await sheet.saveUpdatedCells()
  } catch (e) {
    await bot.sendMessage(
      accountData,
      `Не удалось сохранить данные подтвержденного пользователя в гугл-таблице. Ошибка ${e}`,
    )
  }
}

async function checkIsUserReagentManager(chatID) {
  return new Promise((resolve, reject) => {
    getConstantFromDB('reagents', 'reagentsManagerChatID')
      .then(value => {
        if (+value === chatID) resolve()
        else reject('Пользователь не уполномочен выдавать реактивы')
      })
      .catch(e => reject(e))
  })
}

async function checkIsUserSuperAdmin(chatID) {
  return chatID === programmerChatID
}

// updateNewUserFields();

export {
  updateUserData,
  getUserData,
  getUserList,
  deleteUser,
  addRandomUser,
  deleteUsersWithEmptyChatID,
  processUserConfirmation,
  checkIsUserReagentManager,
  checkIsUserSuperAdmin,
  createNewPerson,
}
