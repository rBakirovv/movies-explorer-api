const express = require('express');
const mongoose = require('mongoose');
const user = require('./routes/user');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use('/', user);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
