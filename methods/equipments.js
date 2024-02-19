const {EquipmentItem} = require("../assets/constants/equipments");
const {equipment} = require("../assets/constants/localisations");
const fs = require('fs');
const request = require('request');
const {
    equipmentOperations,
    equipmentList,
    equipmentListSheetID
} = require("../assets/constants/gSpreadSheets");
const {StartData} = require("../assets/constants/equipments");
const {readFile, writeFile, writeFileSync} = require("fs");
const path = require("path");
const {getUserData} = require("./users");
const {createDate, createTime} = require("./helpers");
const {amountOfEquipment} = require("../assets/constants/equipments");
const {personRoles} = require("../assets/constants/users");
const localisations = require("../assets/constants/localisations");
const equipmentJsonPath = path.join(__dirname, '..', 'assets', 'db', 'equipment.json');
const workingEquipmentJsonPath = path.join(__dirname, '..', 'assets', 'db', 'workingEquipment.json');
const imagesPath = path.join(__dirname, '..', 'assets', 'images', 'equipments');

async function startWorkWithEquipment(chatID = 392584400, accountData, equipment) {
    const {category, id} = equipment;
    return new Promise(async (resolve, reject) => {
        try {
            const updatedEquipmentList = await updateEquipmentUsingStatus(category, id, chatID);
            await equipmentOperations.loadInfo();
            let sheet = equipmentOperations.sheetsByIndex[0];
            const data = new StartData(chatID, accountData, equipment);
            await sheet.addRow(data);
            await sheet.saveUpdatedCells();
            resolve(updatedEquipmentList);
        } catch (e) {
            reject(e);
        }
    })
}

async function endWorkWithEquipment(chatID = 392584400, accountData, equipment) {
    const {category, id} = equipment;
    return new Promise(async (resolve, reject) => {
        try {
            await equipmentOperations.loadInfo();
            let sheet = equipmentOperations.sheetsByIndex[0];
            const equipment = await updateEquipmentUsingStatus(category, id, chatID);
            const rows = await sheet.getRows();
            let ended = false;
            for(let i = 2; i < rows.length; i++) {
                if(ended) break;
                const endTime = rows[i].get("endTime");
                if (endTime === "") {
                    const rowData = rows[i]._rawData.join("");
                    if (rowData.includes(chatID) && rowData.includes(id) && rowData.includes(createDate())) {
                        ended = true;
                        rows[i].set("endTime", createTime());
                        await rows[i].save();
                    }
                }
            }
            resolve(equipment);
        } catch (e) {
            reject(e);
        }
    })
}

async function reloadEquipmentDB(bot, chatID) {

    const userData = await getUserData(chatID);
    if (userData.role === personRoles.superAdmin) {
        await bot.sendMessage(chatID, equipment.dbIsReloading);
        await createEquipmentDbFromGSheet()
            .then(r => bot.sendMessage(chatID, r))
            .catch(err => bot.sendMessage(chatID, err));
    } else {
        await bot.sendMessage(chatID, localisations.users.errors.userAccessError);
    }
}

async function createEquipmentDbFromGSheet() {
    return new Promise((resolve, reject) => {
        fetchEquipmentListFromGSheet().then(async list => {
            const listWithCategories = {};
            list.forEach(el => {
                if (listWithCategories[el.category]) listWithCategories[el.category].push(el);
                else {
                    listWithCategories[el.category] = [];
                    listWithCategories[el.category].push(el);
                }
            })
            await writeFileSync(equipmentJsonPath, JSON.stringify(listWithCategories, null, 2), error => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                }

            })
            resolve(equipment.dbIsReloadedMsg);
        })
    })
}

async function fetchEquipmentListFromGSheet() {
    return new Promise(async (resolve, reject) => {
        try {
            const equipment = [];
            await equipmentList.loadInfo();
            let sheet = equipmentList.sheetsById[equipmentListSheetID];
            const rows = await sheet.getRows();
            for (let i = 0; i < amountOfEquipment; i++) {
                const newEquipmentItem = new EquipmentItem;
                newEquipmentItem.name = rows[i].get("Наименование оборудования") || "";
                newEquipmentItem.brand = rows[i].get("Изготовитель") || "";
                newEquipmentItem.model = rows[i].get("Модель") || "";
                newEquipmentItem.category = rows[i].get("Категория") || "";
                newEquipmentItem.filesUrl = rows[i].get("Эксплуатационно-техническая документация\n" +
                    "(ссылка на облако)\n" +
                    "\n" +
                    "Паспорт/руководство по эксплуатации") || "";
                newEquipmentItem.id = (rows[i].get("Заводской номер") + newEquipmentItem.model) || "";
                newEquipmentItem.imgUrl = rows[i].get("Ссылки на фотографии") || "";
                equipment.push(newEquipmentItem);
                // if(newEquipmentItem.name === "Реакторная система") await downloadEquipmentImage(newEquipmentItem.imgUrl, imagesPath + newEquipmentItem.id + ".jpeg",  () => console.log(newEquipmentItem.id + ".jpeg"));
            }
            resolve(equipment);
        } catch (e) {
            reject(e);
        }
    })
}

async function downloadEquipmentImage(uri, filename, callback) {
        request.head(uri, function(err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

// async function updateEquipmentUsingStatus(equipmentCategory, equipmentID, chatID) {
//     return new Promise((resolve, reject) => {
//         readFile(workingEquipmentJsonPath, 'utf8', (error, data) => {
//
//             if (error) {
//                 reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
//                 return;
//             }
//
//             let parsedData = JSON.parse(Buffer.from(data));
//             let index = parsedData[equipmentCategory].findIndex(el => el.id === equipmentID);
//             let equipment = parsedData[equipmentCategory][index];
//             let {isUsing} = equipment;
//             if (isUsing.includes(chatID)) isUsing = isUsing.filter(el => {
//                 return el !== chatID
//             });
//             else isUsing.push(chatID);
//             parsedData[equipmentCategory][index].isUsing = isUsing;
//             writeFile(equipmentJsonPath, JSON.stringify(parsedData, null, 2), (error) => {
//                 if (error) {
//                     reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
//                     return;
//                 }
//                 resolve(parsedData);
//             });
//         })
//     })
// }

async function updateEquipmentUsingStatus(equipmentCategory, equipmentID, chatID) {
    return new Promise((resolve, reject) => {
        readFile(workingEquipmentJsonPath, 'utf8', (error, data) => {

            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }

            let parsedData = JSON.parse(Buffer.from(data));
            let index = parsedData[equipmentCategory].findIndex(el => el.id === equipmentID);
            let equipment = parsedData[equipmentCategory][index];
            let {isUsing} = equipment;
            if (isUsing.includes(chatID)) isUsing = isUsing.filter(el => {
                return el !== chatID
            });
            else isUsing.push(chatID);
            parsedData[equipmentCategory][index].isUsing = isUsing;
            writeFile(equipmentJsonPath, JSON.stringify(parsedData, null, 2), (error) => {
                if (error) {
                    reject(`Ошибка записи данных на сервере: ${error}. Сообщите о ней администратору`);
                    return;
                }
                resolve(parsedData);
            });
        })
    })
}

async function getEquipmentList() {
    return new Promise((resolve, reject) => {
        readFile(equipmentJsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`);
                return;
            }
            resolve(JSON.parse(Buffer.from(data)));
        })
    })
}

module.exports = {
    startWorkWithEquipment,
    endWorkWithEquipment,
    getEquipmentList,
    createEquipmentDbFromGSheet,
    reloadEquipmentDB
}