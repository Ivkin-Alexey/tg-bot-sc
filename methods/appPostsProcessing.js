import {
  updateUserData,
  deleteUser,
  processUserConfirmation,
  getUserData,
  createNewPerson,
  getUserList
} from "./users.js";
import { startWorkWithEquipment, endWorkWithEquipment } from "./equipments.js";
import localisations from "../assets/constants/localisations.js";
import { generateAccessToken } from "./jwt.js";
import {
  deleteReagentApplication,
  addNewReagentAppToDB,
  sendReagentAppDataToManager,
} from "./reagents.js";
import { personRoles } from "../assets/constants/users.js";
const { denyApplication } = localisations.superAdministratorActions;

async function updateUserDataPost(req, res, bot) {
  const { body } = req;
  const { chatID, formData } = body;
  try {
    return await updateUserData(+chatID, formData)
      .then((userList) => {
        const userData = userList.find((el) => el.chatID === +chatID);
        if (formData?.isUserConfirmed) processUserConfirmation(bot, userData);
        return userList;
      })
      .then((data) => res.status(200).json(data));
  } catch (e) {
    return res.status(500).json(e);
  }
}

async function deletePersonPost(req, res, bot) {
  const { chatID, login, password, personData } = req.body;
  try {
    return await deleteUser(+chatID)
      .then((personList) => {
        bot.sendMessage(chatID, denyApplication);
        return personList;
      })
      .then((data) => res.status(200).json(data));
  } catch (e) {
    return res.status(500).json(e);
  }
}

async function createNewPersonPost(req, res, bot) {
  const { login, password } = req.body;
  try {
    const token = generateAccessToken({
      login,
      password,
    });
    return await createNewPerson(login, password).then((notification) =>
      res.status(200).json({ notification, token })
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
  }
}

async function loginPersonPost(req, res, bot) {
  const { login, password } = req.body;

  try {
    if (!login || !password) {
      return res.status(400).json({
        login,
        password,
        message: "Ошибка. Неверный логин или пароль",
      });
    }
  
    const users = await getUserList();
  
    const user = users.find(
      (user) => user.login === login && user.password === password
    );
  
    if (!user) {
      return res.status(400).json({
        login,
        password,
        message: "Ошибка. Неверный логин или пароль",
      });
    }
  
    const token = generateAccessToken(login, password);
  
    return res.status(200).json({
      token: token,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
  }


}

async function equipmentStartPost(req, res, bot) {
  const { body } = req;
  const { chatID, accountData, equipment } = body;
  try {
    return await startWorkWithEquipment(+chatID, accountData, equipment).then(
      (data) => res.status(200).json(data)
    );
  } catch (e) {
    return res.status(500).json(e);
  }
}

async function equipmentEndPost(req, res) {
  const { body } = req;
  const { chatID, accountData, equipment } = body;
  try {
    return await endWorkWithEquipment(+chatID, accountData, equipment).then(
      (data) => res.status(200).json(data)
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json(e);
  }
}

async function addNewReagentAppToDBPost(req, res, bot) {
  const { body } = req;
  const { userData, applicationData } = body;
  return new Promise(() => {
    addNewReagentAppToDB(userData, applicationData, bot)
      .then((app) => {
        sendReagentAppDataToManager(app, bot);
        return res.status(200).json(app);
      })
      .catch((error) => res.status(500).json(error));
  });
}

async function updateReagentApplicationPost(req, res, bot) {
  const { body } = req;
  const { userData, applicationData } = body;
  return new Promise(() => {
    updateReagentApplications(userData, applicationData, bot)
      .then((applicationList) => res.status(200).json(applicationList))
      .catch((error) => res.status(500).json(error));
  });
}

async function deleteReagentApplicationPost(req, res) {
  const { body } = req;
  const { applicationID, chatID } = body;
  return new Promise(() => {
    getUserData(chatID)
      .then((userData) => {
        if (userData.role === personRoles.superAdmin)
          deleteReagentApplication(applicationID);
      })
      .then((applicationList) => res.status(200).json(applicationList))
      .catch((error) => res.status(500).json(error));
  });
}

export {
  updateUserDataPost,
  deletePersonPost,
  equipmentEndPost,
  equipmentStartPost,
  updateReagentApplicationPost,
  deleteReagentApplicationPost,
  addNewReagentAppToDBPost,
  createNewPersonPost,
  loginPersonPost,
};
