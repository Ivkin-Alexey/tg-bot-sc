import { prisma } from '../../../index.js'
import { processEndpointError } from '../../utils/errorProcessing.js'
import { getUserData } from '../../data-access/users.js'
import { personRoles } from '../../assets/constants/users.js'

export default function get(app) {
  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  //   next();
  // });

  app.get('/hello', async (req, res) => {
    return res.status(200).json('Привет')
  })

  app.get('/jwtHello', (req, res) => {
    return res.status(200).json('Привет')
  })

  app.get('/users/token', async (req, res) => {
    try {
      const isValid = req.isAuthenticated
      return res.status(200).json({message: isValid ? "Токен валидный" : "Токен не валидный", data: isValid})
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/users/:login', async (req, res) => {
    try {
      const { login } = req.params
      const userData = await getUserData(login)
      res.status(200).json(userData)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/users', async (req, res) => {
    try {
      const { login } = req.query
      if (!login) {
        const msg = 'Логин отсутствует'
        throw { message: msg, status: 400 }
      }
      const userData = await getUserData(login)
      const {role} = userData
      if (role !== personRoles.admin) {
        const msg = `У пользователя ${login} недостаточно прав для этого запроса`
        throw { message: msg, status: 403 }
      }
      const users = await prisma.user.findMany({
        select: {
          login: true,
        },
      })
      return res.status(200).json(users)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

}
