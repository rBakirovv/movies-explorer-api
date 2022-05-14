const { NODE_ENV, DATABASE } = process.env;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const userRouter = require('./routes/user');
const movieRouter = require('./routes/movie');
const authRouter = require('./routes/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const ErrorNotFound = require('./errors/ErrorNotFound');

const { PORT = 3001 } = process.env; // поменять при хосте

const app = express();

mongoose.connect(NODE_ENV === 'production' ? DATABASE : 'mongodb://localhost:27017/moviesdb');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.use(cors({
  origin: [
    'https://api.bakirov.movies.nomoredomains.work',
    'http://api.bakirov.movies.nomoredomains.work',
    'https://bakirov.movies.nomoredomains.work',
    'http://bakirov.movies.nomoredomains.work',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));

app.use('/', authRouter);

app.use(auth);

app.use('/', userRouter);
app.use('/', movieRouter);

app.use((req, res, next) => {
  next(new ErrorNotFound('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
