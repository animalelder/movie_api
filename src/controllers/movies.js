import { connect } from 'mongoose';
import Movies from '@/models/movies';

connect(process.env.CONNECTION_URI);

export const getMovies = async (_req, res) => {
  try {
    const movies = await Movies.find();
    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getMovieByTitle = async (req, res) => {
  try {
    const movie = await Movies.findOne({ title: req.params.movieTitle });
    if (!movie) {
      return res.status(404).send('Movie not found');
    }
    return res.status(200).json(movie);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getGenre = async (req, res) => {
  try {
    const genres = await Movies.find({ 'genre.name': req.params.genreName });
    return res.status(200).json(genres);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getDirector = async (req, res) => {
  try {
    const director = await Movies.find({ 'director.name': req.params.dirName });
    return res.status(200).json(director);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
