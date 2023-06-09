const express = require("express");
const router = express.Router();
const db = require("./../models");
const Movie = db.Movie;
// const authenticateTokenMiddleware = require('../middleware/authentication')
const cloudinaryConfig = require("../config/cloudinary");
const movieService = require("../service/movie.service");

// Inject middleware as global middleware
// router.use(authenticateTokenMiddleware)

// GET /movies
router.get("/api/movies", async (request, response) => {
  const movies = await movieService.findAllMovies(
    request.query.page,
    request.query.size
  );
  const movieCount = await movieService.countMovies();

  return response.status(200).json({
    data: movies,
    meta: {
      page: request.query.page,
      count: movieCount,
      size: movies.length,
    },
  });
});

// GET /movies/:id
router.get("/api/movies/:id", async (request, response) => {
  const movie = await movieService.findByMovieId(request.params.id);

  if (!movie) return response.status(404).json({ message: "Movies not found" });

  return response.status(200).json({ data: movie });
});

// POST /movies
router.post("/api/movies", async (request, response) => {
  // Upload movie photo to cloudinary
  const uploadedFile = await cloudinaryConfig.uploader.upload(
    request.files.photo.path
  );

  const movie = await Movie.create({
    title: request.fields.title,
    genre: request.fields.genre,
    year: request.fields.year,
    photo: uploadedFile?.secure_url,
  });

  if (!movie)
    return response
      .status(422)
      .json({ message: "Failed create movie. Please try again" });

  return response.status(201).json({ data: movie });
});

// PUT /movies/:id
router.put("/api/movies/:id", async (request, response) => {
  const movie = await Movie.findByPk(request.params.id);

  if (!movie) return response.status(404).json({ message: "Movies not found" });

  Movie.update(request.body, { where: { id: request.params.id } });

  return response.status(200).json({ message: "Movie updated" });
});

// DELETE /movies/:id
router.delete("/api/movies/:id", async (request, response) => {
  const movie = await Movie.findByPk(request.params.id);

  if (!movie) return response.status(404).json({ message: "Movies not found" });

  Movie.destroy({ where: { id: request.params.id } });

  return response.status(200).json({ message: "Movie deleted", data: movie });
});

module.exports = router;
