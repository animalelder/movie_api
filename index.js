import express, { static as staticFiles } from 'express';
const app = express();

import { json, urlencoded } from 'body-parser';

app.use(json());
app.use(urlencoded({ extended: true }));

// This is the Cross Origin Resource Sharing policy for the application
// This is to allow the front-end to access the API
import cors from 'cors';
import { allowedOrigins } from '@/allowedOrigins';
// app.use(cors());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message = 'The CORS policy for this application does not allow access from origin ' + origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require('@/controllers/auth/auth')(app);

import { authenticate } from 'passport';
import '@/controllers/auth/passport';

import { check } from 'express-validator';

import { createWriteStream } from 'fs';
import { join } from 'path';
import morgan from 'morgan';

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = createWriteStream(join(__dirname, 'log.txt'), {
  flags: 'a',
});
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

import { connect } from 'mongoose';

connect(process.env.CONNECTION_URI);

// import { Movie, User } from '@/models';

// const Movies = Movie;
// const Users = User;

import * as movies from '@/controllers/movies';

// Serve files in the public folder
app.use(staticFiles('public'));

//  *** GET requests ***

/**
 * READ index page
 * @function
 * @name getIndexPage
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Sends a string response "Welcome to my movie page!".
 */
app.get('/', (_req, res) => {
  let responseText = 'Hey there! I love movies.';
  res.send(responseText);
});

/**
 * READ movie list
 * @async
 * @function
 * @name getAllMovies
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while retrieving movies from the database.
 * @returns {Object} - Returns JSON response containing all movies.
 */
app.get('/movies', authenticate('jwt', { session: false }), movies.getMovies);

/**
 * READ movie by name
 * @async
 * @function
 * @name getOneMovie
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.title - The title of the movie to retrieve.
 * @throws {Error} - If there is an error while retrieving the movie from the database.
 * @returns {Object} - Returns JSON response containing the requested movie.
 */
app.get('/movies/:movieTitle', authenticate('jwt', { session: false }), movies.getMovieByTitle);

/**
 * READ genre by name
 * @async
 * @function
 * @name getGenre
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.genreName - The name of the genre to retrieve from the database.
 * @throws {Error} - If there is an error while retrieving genre from the database.
 * @returns {Object} - Returns JSON response containing the genre object of the requested movies.
 */
app.get('/movies/genres/:genreName', authenticate('jwt', { session: false }), movies.getGenre);

/**
 * READ director by name
 * @async
 * @function
 * @name getDirector
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.directorName - The name of the director to retrieve from the database.
 * @throws {Error} - If there is an error while retrieving director from the database.
 * @returns {Object} - Returns JSON response containing the director object of the requested movies.
 */
app.get('/movies/directors/:dirName', authenticate('jwt', { session: false }), movies.getDirector);

/**
 * READ all users
 * @async
 * @function
 * @name getAllUsers
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while retrieving users from the database.
 * @returns {Object} - Returns JSON response containing the all users.
 */
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * READ a user by username
 * @async
 * @function
 * @name getOneUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.Username - The username of the user to retrieve.
 * @throws {Error} - If there is an error while retrieving the user from the database.
 * @returns {Object} - Returns JSON response containing the user with this username.
 */
app.get('/users/:userName', authenticate('jwt', { session: false }), users.getUser);

// *** POST requests ***

const newUserValidation = [
  check('username', 'Username with min. 5 characters is required').isLength({
    min: 5,
  }),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail(),
];
/**
 * CREATE new user
 * @async
 * @function
 * @name signupUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error when creating the new user.
 * @returns {Object} - Returns JSON response containing the new user.
 */
app.post('/users', newUserValidation, users.addUser);

// *** PUT requests ***

const updateUserValidation = [
  check('username', 'Username with min. 5 characters is required').isLength({
    min: 5,
  }),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail(),
];

/**
 * UPDATE user information by username
 * @async
 * @function
 * @name updateUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.Username - The username of the user to update.
 * @throws {Error} - If there is an error while validating input or updating user data in the database.
 * @returns {Object} - JSON response containing the updated user.
 */
app.put('/users/:Username', authenticate('jwt', { session: false }), updateUserValidation, users.updateUser);

/**
 * CREATE new favorite movie for user
 * @async
 * @function
 * @name addFavMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to add to the user's favorites.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while updating user data in the database.
 * @returns {Object} - Returns JSON response containing the updated user's information.
 */
app.put('/users/:userName/favorites/:movieID', authenticate('jwt', { session: false }), users.addFavMovie);

// *** DELETE requests ***

/**
 * DELETE favorite movie for user
 * @async
 * @function
 * @name deleteFavMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to remove from the user's favorites.
 * @param {Object} res - Express response object.
 * @throws {Error} - If there is an error while updating user data in the database.
 * @returns {Object} - Returns JSON response containing the updated user's information.
 */
app.delete('/users/:userName/favorites/:movieID', authenticate('jwt', { session: false }), users.deleteFavMovie);

/**
 * DELETE user by Username
 * @async
 * @function
 * @name deleteUser
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object obtained from JWT authentication.
 * @param {string} req.params.Username - The username of the user to delete.
 * @param {Object} res - Express response object.
 * @throws {Error} -  If there is an error while deleting the user from the database.
 * @returns {Object} - Returns message indicating whether the user was successfully deleted or not.
 */
app.delete('/users/:userName', authenticate('jwt', { session: false }), users.deleteUser);

// END OF REQUESTS

/**
 * Error handling middleware
 * @function
 * @name errorHandler
 * @param {Object} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Object} next - Express next function.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh! Something did not work as expected!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port' + port);
});
