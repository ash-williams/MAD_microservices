const Joi = require("joi");

//data
const movies = [
    {movie_id: 1, movie_name: 'Toy Story', movie_year: 1995, movie_director: 'John Lasseter'}
];



getAll = (req, res) => {
    return res.send(movies);
}



create = (req, res) => {
    const schema = Joi.object({
        movie_name: Joi.string().required(),
        movie_year: Joi.number().min(1900).required(),
        movie_director: Joi.string().required()
    });
    
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
      
    const movie = {
        movie_id: movies.length + 1,
        movie_name: req.body.movie_name,
        movie_year: req.body.movie_year,
        movie_director: req.body.movie_director
    };
    
    movies.push(movie);

    return res.status(201).send(movie);
}



getOne = (req, res) => {
    const id = parseInt(req.params.id);
    const movie = movies.find(m => m.movie_id === id);
  
    if(!movie) return res.status(404).send("The movie with the given ID was not found");
  
    return res.send(movie);
}



update = (req, res) => {
    const id = parseInt(req.params.id);
    const movie = movies.find(m => m.movie_id === id);
  
    if(!movie) return res.status(404).send("The movie with the given ID was not found");
  
    const schema = Joi.object({
        movie_name: Joi.string(),
        movie_year: Joi.number().min(1900),
        movie_director: Joi.string()
    });
  
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
  
    if(req.body.movie_name) movie.movie_name = req.body.movie_name;
    if(req.body.movie_year) movie.movie_year = req.body.movie_year;
    if(req.body.movie_director) movie.movie_director = req.body.movie_director;
  
    return res.status(200).send('');
}



deleteOne = (req, res) => {
    const id = parseInt(req.params.id);
    const movie = movies.find(m => m.movie_id === id);
  
    if(!movie) return res.status(404).send("The movie with the given ID was not found");
  
    const index = movies.indexOf(movie);
    movies.splice(index, 1);
  
    return res.status(200).send('');
}


module.exports = {
    getAll: getAll,
    create: create,
    getOne: getOne,
    update: update,
    deleteOne: deleteOne
}

  