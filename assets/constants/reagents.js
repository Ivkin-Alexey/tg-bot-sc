const {createDate, createReagentID, createFullName, createNameWithInitials} = require("../../methods/helpers");

const reagentStatuses = {inProcess: "inProcess", completed: "completed", rejected: "rejected"};

// interface INewReagentApplication {
//     id: string;
//     chatID: number;
//     reagentName: string;
//     amount: string;
//     date: string;
//     status: reagentStatus;
// }

function NewReagentApplication(userData) {
    this.id = createReagentID();
    this.chatID = userData.chatID;
    this.fullName = createNameWithInitials(userData);
    this.reagentName = "";
    this.amount = "";
    this.date = createDate();
    this.status = reagentStatuses.inProcess;
}

module.exports = {NewReagentApplication}

