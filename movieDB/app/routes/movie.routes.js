const movies = require('../controllers/movie.controller');
const auth = require('../middleware/auth');

module.exports = function(app){
  app.route("/movies")
    .get(auth.auth, movies.getAll)
    .post(auth.auth, movies.create);
  
  app.route("/movies/:id")
    .get(auth.auth, movies.getOne)
    .patch(auth.auth, movies.update)
    .delete(auth.auth, movies.deleteOne);
}


  