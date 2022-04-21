const router = require('express').Router();
const {
  getCurrentUser,
  updateProfile,
} = require('../controllers/user');

const { validateUserData } = require('../middlewares/validations');

router.get('/users/me', getCurrentUser);

router.patch('/users/me', validateUserData, updateProfile);

module.exports = router;
