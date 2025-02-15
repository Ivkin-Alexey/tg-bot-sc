import { createDate, createTime, createFullName } from '../../controllers/helpers.js'

const amountOfEquipment = 10000

const equipmentPageSize = 20

const defaultEquipmentPage = 1

const fieldsToSearch = [
  'serialNumber',
  'inventoryNumber',
  'name',
  'description',
  'brand',
  'model',
  'category',
]

const invalidEquipmentCellData = ["", "-", " - "]

const equipmentFilterList = [
  {
    name: 'classification',
    label: 'Классификация',
    options: [
      'Комплексы измерительно-вычислительные, информационноизмерительные, для автоматизации и управления научнотехнологическими процессами',
      'Оборудование вспомогательное для контроля и регулирования физических параметров',
      'Оборудование для акустических измерений',
      'Оборудование для вибро-акустических исследований машин и механизмов',
      'Оборудование для геофизических исследований',
      'Оборудование для гидрологических и геологических исследований',
      'Оборудование для гидромеханических процессов',
      'Оборудование для измерения и контроля ионизирующих излучений',
      'Оборудование для изучения живых систем',
      'Оборудование для исследований химического и элементного состава веществ и материалов прочее',
      'Оборудование для исследования и анализа методом оптической спектроскопии',
      'Оборудование для исследования и определения физических свойств среды',
      'Оборудование для исследования коллоидных свойств и адгезии',
      'Оборудование для исследования с использованием хроматографических методов анализа',
      'Оборудование для исследования состава, строения веществ и материалов прочее',
      'Оборудование для исследования строения вещества дифракционными методами',
      'Оборудование для исследования физико-механических процессов',
      'Оборудование для метеорологических и аэрологических исследований',
      'Оборудование для определения механических свойств и величин',
      'Оборудование для оптических измерений и исследований (кроме микроскопов и телескопов)',
      'Оборудование для реализации физико-химических и химических процессов',
      'Оборудование для физических и физико-химических методов разделения',
      'Оборудование для физической обработки материалов',
      'Оборудование для электротехнических измерений и контроля электрических и электромагнитных параметров',
      'Оборудование для ядерной физики и физики высоких энергий',
      'Оборудование и приборы для масс-спектрометрии',
      'Оборудование пробоподготовки',
      'Оборудование термическое',
      'Приборы для измерения времени и частоты',
      'Приборы для микроскопических исследований',
      'Приборы и аппаратура для исследования и анализа поверхности прочие',
      'Спектрометры электронного парамагнитного резонанса',
    ],
  },
  {
    name: 'measurements',
    label: 'Измерения',
    options: [
      'Биологические и медицинские измерения',
      'Виброакустические измерения',
      'Измерения времени и частоты',
      'Измерения геометрических величин',
      'Измерения давления, вакуумные измерения',
      'Измерения механических величин',
      'Измерения параметров потока, расхода, уровня, объема веществ',
      'Измерения физико-химического состава и свойств веществ',
      'Измерения характеристик ионизирующих излучений и ядерных констант',
      'Измерения электрических и магнитных величин',
      'Оптические и оптико-физические измерения',
      'Радиотехнические и радиоэлектронные измерения',
      'Теплофизические и температурные измерения',
    ],
  },
  {
    name: 'type',
    label: 'Тип',
    options: [
      'Вспомогательное оборудование',
      'Измерительное оборудование СИ',
      'Измерительное оборудование не СИ',
      'Испытательное оборудование',
      'Оборудование иного назначения',
    ],
  },
  {
    name: 'kind',
    label: 'Вид',
    options: ['Научное оборудование', 'Учебно-научное оборудование', 'Учебное оборудование'],
  },
  {
    name: 'department',
    label: 'Подразделение',
    options: [
      'Комплексная учебная лаборатория горного факультета «Горное производство и безопасность»',
      'Комплексная учебная лаборатория нефтегазового факультета',
      'Комплексная учебная лаборатория общей физики',
      'Комплексная учебная лаборатория факультета переработки минерального сырья',
      'Межкафедральная учебная лаборатория Геомеханики и строительных материалов',
      'Межкафедральная учебно-научная лаборатория вычислительной техники и маркшейдерско-геодезических приборов',
      'Многофункциональная учебная лаборатория общей химии в Инженерном корпусе',
      'НИ «Геомеханики и геотехнологии»',
      'НОЦ «Цифровые технологии»',
      'НЦ «Арктика»',
      'НЦ «Наука о Земле»',
      'НЦ «Переработки ресурсов»',
      'НЦ «Экосистема»',
      'УНЛ "Геотехнологии"',
      'Учебная лаборатория «Природных резервуаров и петрофизических свойств пород» кафедры геологии нефти и газа',
      'Учебная лаборатория «Разведочной геофизики» кафедры геофизики',
      'Учебная лаборатория кафедры автоматизации технологических процессов и производств',
      'Учебная лаборатория кафедры безопасности производств',
      'Учебная лаборатория кафедры геологии и разведки месторождений полезных ископаемых',
      'Учебная лаборатория кафедры гидрогеологии и инженерной геологии',
      'Учебная лаборатория кафедры исторической и динамической геологии',
      'Учебная лаборатория кафедры материаловедения и технологии художественных изделий',
      'Учебная лаборатория кафедры машиностроения',
      'Учебная лаборатория кафедры метрологии, приборостроения и управления качеством',
      'Учебная лаборатория кафедры механики',
      'Учебная лаборатория кафедры минералогии, кристаллографии и петрографии',
      'Учебная лаборатория кафедры общей электротехники',
      'Учебная лаборатория кафедры системного анализа и управления',
      'Учебная лаборатория кафедры теплотехники и теплоэнергетики',
      'Учебная лаборатория кафедры транспортно-технологических процессов и машин',
      'Учебная лаборатория кафедры электронных систем',
      'Учебная лаборатория кафедры электроэнергетики и электромеханики',
      'Учебно-научная лаборатория «экологического мониторинга» горного факультета',
      'Учебно-научная лаборатория Транспортно-технологических процессов и машин',
      'Центр коллективного пользования',
    ],
  },
]

export const equipmentFilterNames = equipmentFilterList.map(el => el.name)

const equipmentItem = {
  inventoryNumber: 'Инвентарный №',
  category: 'Категория',
  name: 'Наименование оборудования',
  serialNumber: 'Заводской №',
  description: 'Область применения оборудования',
  brand: 'Изготовитель',
  model: 'Модель',
  imgUrl: 'Ссылки на фотографии',
  filesUrl:
    'Эксплуатационно-техническая документация\n' +
    '(ссылка на облако)\n' +
    '\n' +
    'Паспорт/руководство по эксплуатации',
  classification: 'Классификация оборудования',
  measurements: 'Вид измерений',
  type: 'Тип оборудования',
  kind: 'Вид оборудования',
  department: 'Наименование подразделения',
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

export {
  equipmentItem,
  invalidEquipmentCellData,
  StartData,
  EndData,
  WorkingEquipmentItem,
  amountOfEquipment,
  equipmentFilterList,
  fieldsToSearch,
  equipmentPageSize,
  defaultEquipmentPage
}
