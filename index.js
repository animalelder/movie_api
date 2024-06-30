const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This is the Cross Origin Resource Sharing policy for the application
// This is to allow the front-end to access the API
const cors = require('cors');
app.use(cors());

// Change to server
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:4200',
  'https://cinedata-movie-api.onrender.com',
  'https://github.com',
  'https://animalelder.github.io',
  ,
];

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

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

const fs = require('fs');
const path = require('path');
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

const morgan = require('morgan');
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve files in the public folder
app.use(express.static('public'));

//  *** GET requests ***

/**
 * READ index page
 * @function
 * @name getIndexPage
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Sends a string response "Welcome to my movie page!".
 */
app.get('/', (req, res) => {
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
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.get('/movies/:movieTitle', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ title: req.params.movieTitle })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find({ 'genre.name': req.params.genreName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.get('/movies/directors/:dirName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find({ 'director.name': req.params.dirName })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.get('/users/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if (req.user.username !== req.params.userName) {
    return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  await Users.findOne({ username: req.params.userName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// *** POST requests ***

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
app.post(
  '/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + ' already exists');
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthdate: req.body.birthdate,
          })
            .then((user) => res.status(201).json(user))
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// *** PUT requests ***

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
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    check('username', 'Username with min. 5 characters is required').isLength({
      min: 5,
    }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    await Users.findOne({
      username: req.body.username,
      _id: { $ne: req.user._id },
    })
      .then((existingUsernameUser) => {
        if (existingUsernameUser) {
          return res.status(409).send(req.body.username + ' already exists, please choose another username.');
        } else {
          Users.findOne({
            email: req.body.email,
            _id: { $ne: req.user._id },
          })
            .then((existingEmailUser) => {
              if (existingEmailUser) {
                const errorMessage = req.body.email + ' already exists, please choose another email.';
                return res.status(409).send(errorMessage);
              } else {
                let hashedPassword = Users.hashPassword(req.body.password);
                Users.findOneAndUpdate(
                  { username: req.params.Username },
                  {
                    $set: {
                      username: req.body.username,
                      password: hashedPassword,
                      email: req.body.email,
                      birthdate: req.body.birthdate,
                    },
                  },
                  { new: true }
                )
                  .then((updatedUser) => {
                    res.json(updatedUser);
                  })
                  .catch((err) => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                  });
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send('Error: ' + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

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
app.put('/users/:userName/favorites/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if (req.user.username !== req.params.userName) {
    return res.status(400).send('Permission denied');
  }
  // CONDITION ENDS
  await Users.findOneAndUpdate(
    { username: req.params.userName },
    {
      $push: { favoriteMovies: req.params.movieID },
    },
    { new: true }
  ) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
app.delete(
  '/users/:userName/favorites/:movieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if (req.user.username !== req.params.userName) {
      return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate(
      { username: req.params.userName },
      {
        $pull: { favoriteMovies: req.params.movieID },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

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
app.delete('/users/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndDelete({ username: req.params.userName })
    .then((user) => {
      if (!user) {
        //first check to see if the user account exists
        res.status(400).send(req.params.userName + ' was not found');
      } else {
        //if the user account exists, delete it
        res.status(200).send(req.params.userName + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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

/**
 * Listen for requests
 * @function
 * @name listen
 * @param {number} port - Port number.
 */
/**
 * Listen for requests
 * @function
 * @name listen
 * @param {number} port - Port number.
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port' + port);
});
