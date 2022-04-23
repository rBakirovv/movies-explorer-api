const { NODE_ENV, DATABASE } = process.env;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const user = require('./routes/user');
const movie = require('./routes/movie');
const { createUser, login, logout } = require('./controllers/user');
const { validateCreateUser, validateLogin } = require('./middlewares/validations');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const ErrorNotFound = require('./errors/ErrorNotFound');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect(NODE_ENV === 'production' ? DATABASE : 'mongodb://localhost:27017/bitfilmsdb');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLogin, login);
app.delete('/signout', logout);

app.use(auth);

app.use('/', user);
app.use('/', movie);

app.use(errorLogger);

app.use(errors());

app.use((req, res, next) => {
  next(new ErrorNotFound('Запрашиваемый ресурс не найден'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
