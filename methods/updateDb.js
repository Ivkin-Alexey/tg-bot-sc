const {writeFile, readFile, readFileSync} = require("fs");
const path = require("path");
const BotAnswers = require("./botAnswers");
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'db.json');
// const newJsonPath = path.join(__dirname, '..', 'assets', 'db', 'db_users.json');
const users = require(jsonPath);
const fs = require("fs");
const md5 = require('md5');

const newUser = {
    chatID: "",
    firstName: "",
    lastName: "",
    patronymic: "",
    phone: "",
    position: "",
    study: "",
    research: "",
    type: "user",
    otherInfo: {registrationDate: "", isUserConfirmed: false, isUserDataSent: false}
};

let md5Previous = null;
let fsWait = false;
fs.watch(jsonPath, (event, filename) => {
    if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);
        const md5Current = md5(fs.readFileSync(jsonPath));
        if (md5Current === md5Previous) {
            return;
        }
        md5Previous = md5Current;

        console.log(`${filename} file Changed`);
    }
});

async function updateNewUserFields() {
    try {
        readFile(jsonPath, 'utf8', (error, data) => {
            if (error) {
                console.log(error);
                return;
            }
            let parsedData = JSON.parse(Buffer.from(data));
            parsedData = parsedData.map(el => {
                for (const key in newUser) {
                    if (!el[key] || el[key] === "") el[key] = newUser[key]
                }
                return el
            })
            writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) console.log(error);
            });
        })
    } catch (e) {
        console.log(e);
    }
}

async function confirmUser(chatID) {
    updateUserData(chatID, {otherInfo: {registrationDate: "", isUserConfirmed: true, isUserDataSent: false}})
}

async function updateUserData(chatID, userData) {
    return new Promise((resolve, reject) => {

        readFile(jsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }

            let parsedData = JSON.parse(Buffer.from(data));
            let isNewUser = true;
            parsedData = parsedData.map(el => {
                if (el.chatID === chatID) {
                    for (let field in userData) {
                        el[field] = userData[field];
                    }
                    el.otherInfo.isUserDataSent = checkIsAllFieldsComplete(el);
                    if(el.otherInfo.isUserDataSent) el.otherInfo.registrationDate = createRegistrationDate();
                    isNewUser = false;
                }
                return el;
            })

            if (isNewUser) {
                for (let field in userData) {
                    newUser[field] = userData[field];
                }
                newUser.otherInfo.isUserDataSent = checkIsAllFieldsComplete(newUser);
                if(newUser.otherInfo.isUserDataSent) newUser.otherInfo.registrationDate = createRegistrationDate();
                parsedData.push(newUser);
            }

            writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    console.log(error);
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(newUser);
            });
        })
    })
}

async function getUserData(chatID) {
    const file = await readFileSync(jsonPath);
    return JSON.parse(Buffer.from(file))[chatID];
}

function getUsersList() {
    return new Promise((resolve, reject) => {
        readFile(jsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            resolve(JSON.parse(Buffer.from(data)));
        })
    })
}

function checkIsAllFieldsComplete(el) {
    return !Object.values(el).some(el => el === "");
}

function createRegistrationDate() {
    const date = new Date();
    let day, month, year;
    day = date.getDate();
    if(+day<10) day= "0" + day;
    month = +date.getMonth()+1;
    if(+month<10) month= "0" + month;
    year = date.getFullYear();
    return day + "." + month + "." + year;
}

createRegistrationDate()

// updateNewUserFields();

module.exports = {updateUserData, getUserData, getUsersList}

