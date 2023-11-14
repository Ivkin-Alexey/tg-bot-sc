const {adminsChatID, timeZoneRelativeToUTC} = require("../assets/constants");

function createDate() {
    const date = new Date();
    let day, month, year;
    day = date.getDate();
    if(+day<10) day= "0" + day;
    month = +date.getMonth()+1;
    if(+month<10) month= "0" + month;
    year = date.getFullYear();
    return day + "." + month + "." + year;
}

function createTime() {
    const date = new Date();
    let hours, minutes;
    hours = date.getUTCHours() + timeZoneRelativeToUTC;
    if(+hours<10) hours= "0" + hours;
    minutes = date.getUTCMinutes();
    if(+minutes<10) minutes = "0" + minutes;
    return hours + ":" + minutes;
}

function createFullName(userData) {
    const {firstName, lastName, patronymic} = userData;
    return lastName + " " + firstName + " " + patronymic;
}

function checkIsUserSuperAdmin(chatID) {
    const result = {resolved: true, errorMsg: ""};
    if(!adminsChatID.includes(chatID)) {
        result.resolved = false;
        result.errorMsg = "Данную команду могут использовать только суперадминистраторы"
    }
    return result;
}

module.exports = {createDate, createTime, checkIsUserSuperAdmin, createFullName}