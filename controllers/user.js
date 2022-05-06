const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorConflict = require('../errors/ErrorConflict');
const ValidationError = require('../errors/ValidationError');
const ErrorNotFound = require('../errors/ErrorNotFound');

const SALT_ROUNDS = 10;

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => res.send({ email: user.email, name: user.name }))
    .catch((err) => {
      next(err);
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => res.send({ email: user.email, name: user.name }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные в методы обновления данных пользователя'));
      } else if (err.codeName === 'DuplicateKey') {
        throw new ErrorConflict('Пользователь с таким email уже существует');
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  if (!email || !password || !name) {
    throw new ValidationError('Неккоректно введенны данные');
  }

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (user) {
        throw new ErrorConflict('Пользователь с таким email уже существует');
      }

      return bcrypt.hash(password, SALT_ROUNDS);
    })
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          expires: new Date(Date.now() + 7 * 24 * 3600000),
          httpOnly: true,
          sameSite: true,
        })
        .send({
          name: user.name,
          _id: user._id,
        });
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные в методы создания пользователя'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
        expiresIn: '7d',
      });
      res
        .cookie('jwt', token, {
          expires: new Date(Date.now() + 7 * 24 * 3600000),
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch((err) => {
      next(err);
    });
};

const logout = (req, res, next) => {
  res.clearCookie('jwt');
  next();
};

module.exports = {
  getCurrentUser,
  updateProfile,
  createUser,
  login,
  logout,
};
