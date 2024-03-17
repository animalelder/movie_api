const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cineDataDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const express = require('express'),
	fs = require('fs'),
	morgan = require('morgan'),
	path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
	flags: 'a',
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Serve files in the public folder
app.use(express.static('public'));

//  *** GET requests ***

app.get('/', (req, res) => {
	let responseText = 'Hey there! I love movies.';
	res.send(responseText);
});

// Get a list of all movies
app.get('/movies', async (req, res) => {
	await Movies.find()
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Get a movie by title
//Title is taken from URL
app.get('/movies/:movieTitle', async (req, res) => {
	await Movies.findOne({ title: req.params.movieTitle })
		.then((movie) => {
			res.json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Get a list of movies by genre
//Genre is taken from URL
app.get('/movies/genres/:genreName', async (req, res) => {
	await Movies.find({ 'genre.name': req.params.genreName })
		.then((movies) => {
			res.json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Get a list of movies by a director's name
//Director's name is taken from URL
app.get('/movies/directors/:dirName', async (req, res) => {
	await Movies.find({ 'director.name': req.params.dirName })
		.then((director) => {
			res.json(director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

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
app.get('/users/:username', async (req, res) => {
	await Users.findOne({ username: req.params.username })
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// *** POST requests ***

// Add a user
/* We expect JSON in this format
{
	Username: String,
	Password: String,
	Email: String,
	Birthdate: Date
} */
app.post('/users', async (req, res) => {
	await Users.findOne({ username: req.body.username })
		.then((user) => {
			if (user) {
				return res
					.status(400)
					.send(req.body.username + ' already exists');
			} else {
				Users.create({
					username: req.body.username,
					password: req.body.password,
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
});

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
app.put('/users/:Username', async (req, res) => {
	await Users.findOneAndUpdate(
		{ username: req.params.Username },
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				birthdate: req.body.birthdate,
			},
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

// Add a movie to a user's list of favorites
//Username is taken from URL
//MovieID is taken from URL
app.put('/users/:userName/favorites/:movieID', async (req, res) => {
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

// Delete a movie from a user's list of favorites
//Username is taken from URL
//MovieID is taken from URL
app.delete('/users/:userName/favorites/:movieID', async (req, res) => {
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
});

// Delete user by username
//Username is taken from URL
app.delete('/users/:Username', async (req, res) => {
	await Users.findOneAndDelete({ username: req.params.Username })
		.then((user) => {
			if (!user) {
				//first check to see if the user account exists
				res.status(400).send(req.params.Username + ' was not found');
			} else {
				//if the user account exists, delete it
				res.status(200).send(req.params.Username + ' was deleted.');
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// END OF REQUESTS

// This is for error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Uh oh! Something did not work as expected!');
});

// This will listen for requests
app.listen(8080, () => {
	console.log('Your app is listening on port 8080.');
});
