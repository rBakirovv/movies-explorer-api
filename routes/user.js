const router = require('express').Router();
const {
  getCurrentUser,
  updateProfile,
} = require('../controllers/user');

/*
const {
  validateUserData,
  validateUserAvatar,
  validateId,
} = require('../middlewares/validations');
+ валидация в roter.
*/

router.get('/users/me', getCurrentUser);

router.patch('/users/me', updateProfile);

module.exports = router;
