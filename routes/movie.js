const router = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

/*
const { validateUserCard, validateId } = require('../middlewares/validations');
+ валидация
*/

router.get('/movies', getMovies);

router.post('/movies', createMovie);

router.delete('/movies/:id', deleteMovie);

module.exports = router;
