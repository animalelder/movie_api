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
  'https://cine-data-db-04361cdbefbe.herokuapp.com/',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application does not allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// I don't think we need uuid but I am keepin this here in case.
// const uuid = require('uuid');

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

/* mongoose.connect('mongodb://localhost:27017/cineDataDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}); */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve files in the public folder
app.use(express.static('public'));

//  *** GET requests ***

app.get('/', (req, res) => {
  let responseText = 'Hey there! I love movies.';
  res.send(responseText);
});

// Get a list of all movies
// Added authentication to this route so that only users with a valid JWT can access it
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get a movie by title
//Title is taken from URL
app.get(
  '/movies/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.movieTitle })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Get a list of movies by genre
//Genre is taken from URL
app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'genre.name': req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get a list of movies by a director's name
//Director's name is taken from URL
app.get(
  '/movies/directors/:dirName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find({ 'director.name': req.params.dirName })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get all users
// Do not let this be used in production
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

// Get a user by username
//Username is taken from URL
app.get(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

// *** POST requests ***

// Add a user
/* We expect JSON in this format
{
    Username: String,
    Password: String,
    Email: String,
    Birthdate: Date
} */
app.post(
  '/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check(
      'username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
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

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  [
    check('username', 'Username with min. 5 characters is required').isLength({
      min: 5,
    }),
    check(
      'username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    Users.findOne({
      username: req.body.username,
      _id: { $ne: req.user._id },
    })
      .then((existingUsernameUser) => {
        if (existingUsernameUser) {
          return res
            .status(409)
            .send(
              req.body.username +
                ' already exists, please choose another username.'
            );
        } else {
          Users.findOne({
            email: req.body.email,
            _id: { $ne: req.user._id },
          })
            .then((existingEmailUser) => {
              if (existingEmailUser) {
                const errorMessage =
                  req.body.email +
                  ' already exists, please choose another email.';
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

// Add a movie to a user's list of favorites
//Username is taken from URL
//MovieID is taken from URL
app.put(
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
  }
);

// *** DELETE requests ***

// Delete a movie from a user's list of favorites
//Username is taken from URL
//MovieID is taken from URL
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

// Delete user by username
//Username is taken from URL
app.delete(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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
  }
);

// END OF REQUESTS

// This is for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh oh! Something did not work as expected!');
});

// This will listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port' + port);
});
