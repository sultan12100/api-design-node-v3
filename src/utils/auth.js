import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const newToken = user => {
  return jwt.sign({ id: user.id, email: user.email }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const doc = new User({ email: email, password: password })
    await doc.save()
    const token = newToken(doc)
    return res.status(201).send({ token: token })
  } catch (e) {
    return res.status(400).send({ message: 'not a valid token' })
  }
}

export const signin = async (req, res) => {
  var errCode = 0
  try {
    if (!req.body['email'] || !req.body['password']) {
      errCode = 400
      throw new Error('email and password are required')
    }
    const email = req.body.email
    errCode = -1
    const password = req.body.password
    errCode = 0

    const doc = await User.findOne({ email: email }).exec()

    if (!doc) {
      errCode = 401
      throw new Error('user not found')
    }
    const match = await doc.checkPassword(password)
    if (!match) {
      errCode = 401
      throw new Error('password not correct')
    }

    const token = newToken(doc)
    return res.status(201).send({ token })
  } catch (e) {
    console.log(e)
    if (errCode == -1) {
      return res.status(401).send({ message: e.message })
    }
    return res.status(errCode).send({ message: e.message })
  }
}

export const protect = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end()
  } else if (req.headers.authorization.split(' ')[0] !== 'Bearer') {
    return res.status(401).end()
  } else {
    var user = await verifyToken(req.headers.authorization.split(' ')[1])
    user = await User.findById(user.id)
      .lean()
      .exec()
    if (!user) {
      return res.status(401).end()
    } else {
      user = { _id: user._id }
      req.user = user
      next()
    }
  }
}
