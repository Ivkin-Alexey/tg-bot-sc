const {writeFile, readFile, readFileSync} = require("fs");
const path = require("path");
const BotAnswers = require("./botAnswers");
const jsonPath = path.join(__dirname, '..', 'assets', 'db', 'db.json');
// const newJsonPath = path.join(__dirname, '..', 'assets', 'db', 'db_users.json');
const users = require(jsonPath);
const fs = require("fs");
const md5 = require('md5');
const {newPerson, unRequiredPersonData, adminsChatID} = require("../assets/constants");

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
                return;
            }
            let parsedData = JSON.parse(Buffer.from(data));
            parsedData = parsedData.map(el => {
                for (const key in newPerson) {
                    if (!el[key] || el[key] === "") el[key] = newPerson[key]
                }
                for (const key in el) {
                    if (!Object.hasOwn(newPerson, key)) delete el[key]
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

async function deleteUsersWithEmptyChatID(chatID) {
    return new Promise((resolve, reject) => {
        try {
            if(!adminsChatID.adminsChatID.includes(+chatID)) reject("Ошибка сервера. Вы не администратор")
            readFile(jsonPath, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                let parsedData = JSON.parse(Buffer.from(data));
                parsedData = parsedData.filter(el => el.chatID !== "")
                writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                    if (error) reject(error);
                });
            })
        } catch (e) {
            reject(e);
        }
    })
}

async function confirmUser(chatID) {
    await updateUserData(chatID, {otherInfo: {registrationDate: "", isUserConfirmed: true, isUserDataSent: false}})
}

async function addRandomUser(type = "user") {
    let user = newPerson;
    user.chatID = Math.floor(100000000 + Math.random() * 900000000);
    user.firstName = "Rayn";
    user.lastName = "Gosling";
    user.type = type;
    await updateUserData(user.chatID, user);
}

async function updateUserData(chatID, userData) {
    return new Promise((resolve, reject) => {
        if(typeof chatID === "undefined") {
            reject(`Ошибка сервера. Полученное значение chatID: ${chatID}`);
            return;
        }
        if(typeof userData === "undefined") {
            reject(`Ошибка сервера. Полученное значение userData: ${userData}`);
            return;
        }

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
                    else el.otherInfo.registrationDate = "";
                    isNewUser = false;
                }
                return el;
            })

            if (isNewUser) {
                for (let field in userData) {
                    newPerson[field] = userData[field];
                }
                newPerson.otherInfo.isUserDataSent = checkIsAllFieldsComplete(newPerson);
                if(newPerson.otherInfo.isUserDataSent) newPerson.otherInfo.registrationDate = createRegistrationDate();
                parsedData.push(newPerson);
            }

            writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(parsedData);
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

async function deleteUser(chatID) {
    return new Promise((resolve, reject) => {

        readFile(jsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }

            let parsedData = JSON.parse(Buffer.from(data));
            parsedData = parsedData.filter(el => el.chatID !== chatID);

            writeFile(jsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(parsedData);
            });
        })
    })
}

function checkIsAllFieldsComplete(object) {
    let clone = Object.assign({}, object);
    let isComplete = false;
    if (unRequiredPersonData.length > 0) {
        unRequiredPersonData.forEach(field => {
            if(typeof field === "string") {
                delete clone[field];
            } else {
                const str = field.reduce((acc, cur) => {
                    console.log(clone[cur])
                    return acc + clone[cur].toString()
                }, "");
                if(str === "") return isComplete;
                else {
                    field.forEach(item => {
                        delete clone[item];
                    })
                }
            }
        })
    }
    isComplete = !Object.values(clone).some(el => el === "");
    return isComplete;
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

createRegistrationDate();

// updateNewUserFields();

module.exports = {updateUserData, getUserData, getUsersList, deleteUser, addRandomUser, deleteUsersWithEmptyChatID}

