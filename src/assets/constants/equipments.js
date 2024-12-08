import { createDate, createTime, createFullName } from '../../controllers/helpers.js'

const amountOfEquipment = 600

function EquipmentItem() {
  this.inventoryNumber = ''
  this.serialNumber = ''
  this.id = ''
  this.category = ''
  this.name = ''
  this.description = ''
  this.brand = ''
  this.model = ''
  this.imgUrl = ''
  this.filesUrl = ''
}

function WorkingEquipmentItem(equipmentId, userID, longUse = false) {
  this.id = equipmentId
  this.category = ''
  this.name = ''
  this.brand = ''
  this.model = ''
  this.imgUrl = ''
  this.filesUrl = ''
  this.userID = userID
  this.longUse = longUse
}

function StartData(chatID, login, accountData, equipment) {
  this.equipmentId = equipment.id
  this.date = createDate()
  this.startTime = createTime()
  this.fullName = createFullName(accountData)
  this.chatID = chatID
  this.login = login
  this.position = accountData?.position
  this.name = equipment.name + ' ' + equipment.model
}

function EndData() {
  this.endTime = createTime()
}

export { EquipmentItem, StartData, EndData, WorkingEquipmentItem, amountOfEquipment }
