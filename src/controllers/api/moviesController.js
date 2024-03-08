const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');

const createError = require("http-errors")
//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;
const modelResponseMovie = {
    attributes: {
      exclude: ["genre_id", "created_at", "updated_at"],
    },
    include: [
      {
        association: "genre",
        attributes: ["name", "ranking"],
      },
    ],
  }

const modelMovie = {
    attributes: {
        exclude: ['genre_id', 'created_at', 'updated_at']
    },
    include: [
        {
            association: 'genre',
            attributes: ['name', 'ranking']
        }
    ],
}


const moviesController = {
    'list': async (req, res) => {
        try {
            const movies = await db.Movie.findAll(modelMovie)
const moviesURL =movies.map(movie => {
    return {
        ...movie.dataValues,
        URL : `${req.protocol}://${req.get('host')}/api/movies/${movie.id}`,
    }
});
            
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get('host')}/api/movies`,
                },
                data: moviesURL
            })

        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "upss, hubo un error, boca la concha de tu madre"
            })
        }



    },
    'detail': async (req, res) => {
        try {
            let error ;
            const movie = await db.Movie.findByPk(req.params.id,modelMovie
               );
if (!movie) {
    error = new Error("No hay una pelicula con ese ID")
    error.status = 404;
    throw error
}
               

                return res.status(200).json({
                    ok: true,
                    meta: {
                        status: 200,
                        
                        url: `${req.protocol}://${req.get('host')}/api/movies/${movie.id}`,
                    },
                    data: movie
                })
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "upss, hubo un error, boca la concha de tu madre"
            })
        }
    },
    'newe': async (req, res) => {
        try {
           const movies= await db.Movie.findAll({
                order: [
                    ['release_date', 'DESC']
                ],
                limit: 5,
                ...modelMovie
            })
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get('host')}/api/movies/new`,
                },
                data: movies
            })
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "upss, hubo un error, "
            })
        }

    },
    'recomended': async (req, res) => {

        try {
         const movies=   await  db.Movie.findAll({
                
                where: {
                    rating: { [db.Sequelize.Op.gte]: 8 }
                },
                order: [
                    ['rating', 'DESC']
                ],
                ...modelMovie
            })
            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: `${req.protocol}://${req.get('host')}/api/movies/recommended`,
                },
                data: movies
            })
              
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                msg: error.message || "upss, hubo un error, "
            })
        }
        
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    
    create:  async function (req, res) {
try {

    const {title, rating, awards, release_date,genre_id, length}=req.body;
if ([title, rating, awards, release_date, genre_id, length].includes("" || undefined)) throw createError(400,"campos obligatorios") 



    const newMovie = await Movies.create(
        {
            title,
            rating,
            awards,
            release_date,
            length,
            genre_id
        }
    );
    const movie= await Movies.findByPk(newMovie.id , modelResponseMovie  );
    return res.status(200).json({
        ok: true,
        meta: {
            status: 200,
           
            url: `${req.protocol}://${req.get('host')}/api/movies/${newMovie.id}`,
        },
        data:movie
    })
} catch (error) {
    return res.status(error.status || 500).json({
        ok: false,
        msg: error.message || "upss, hubo un error, "
    })
}
    },
 
    update: async function (req, res) {
        let movieId = req.params.id;
        
        try {
    
          
          const {title,rating,awards,release_date,length,genre_id} = req.body;
          if([title,rating,awards,release_date,genre_id].includes("" || undefined)) throw createError(400, "Todos los campos son obligatorios")
          
          if(isNaN(req.params.id)) throw createError(404, "ID inválido")
    
          const movie = await db.Movie.findByPk(req.params.id, modelResponseMovie);
          if(!movie) throw createError(404, "No hay una película con ese ID")
        
        movie.title = title?.trim() || movie.title;
        movie.rating = rating || movie.rating;  
        movie.awards = awards || movie.awards;  
        movie.release_date = release_date || movie.release_date;  
        movie.length = length || movie.length;  
        movie.genre_id = genre_id || movie.genre_id;  
    
        movie.save();
        return res.status(200).json({
          ok: true,
          meta: {
            status: 200,
            url: `${req.protocol}://${req.get("host")}/api/movies/${movie.id}`,
          },
          data: movie,
        })
      } catch (error) {
        return res.status(error.status || 500).json({
          ok: false,
          msg: error.message || "Ups, hubo un Error. Llamá a Eric!!!",
        });
      }
      },
      destroy: function (req, res) {
        let movieId = req.params.id;
        Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
          .then(() => {
            return res.redirect("/movies");
          })
          .catch((error) => res.send(error));
      },
    };
    


module.exports = moviesController;