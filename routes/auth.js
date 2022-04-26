const router = require('express').Router();
const {
  createUser,
  login,
  logout,
} = require('../controllers/user');

const { validateCreateUser, validateLogin } = require('../middlewares/validations');

router.post('/signup', validateCreateUser, createUser);
router.post('/signin', validateLogin, login);
router.delete('/signout', logout);

module.exports = router;
