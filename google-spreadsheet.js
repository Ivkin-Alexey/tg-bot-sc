// require('dotenv').config();
// const GoogleSpreadsheet = require('google-spreadsheet');
// const JWT = require('google-auth-library');
// const spreadSheetID = '1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE';
//
// const serviceAccountAuth = new JWT.JWT({
//     email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//     key: process.env.GOOGLE_PRIVATE_KEY,
//     scopes: [
//         'https://www.googleapis.com/auth/spreadsheets',
//     ],
// });
//
// const doc = new GoogleSpreadsheet.GoogleSpreadsheet(spreadSheetID, serviceAccountAuth);
// module.exports = {doc};

// await loadDoc();
// async function loadDoc() {
//     await doc.loadInfo();
//     let sheet = doc.sheetsByIndex[0];
//     await sheet.loadCells('A1:A10');
//     const A1 = sheet.getCell(0,0);
//     A1.value = text;
//     await sheet.saveUpdatedCells();
// }