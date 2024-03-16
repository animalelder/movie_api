const express = require('express'),
	fs = require('fs'),
	morgan = require('morgan'),
	path = require('path');

const app = express();
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
	flags: 'a',
});

let movieList = [
	{
		title: 'Spirited Away',
		Director: 'Hayao Miyazaki',
		genre: 'Animation',
	},
	{
		title: 'Almost Famous',
		Director: 'Cameron Crowe',
		genre: 'Drama',
	},
	{
		title: 'Everything Everywhere All At Once',
		Director: 'The Daniels',
		genre: 'Fantasy',
	},
	{
		title: 'Blade Runner ',
		Director: 'Ridley Scott',
		genre: 'Fantasy',
	},
	{
		title: 'A Woman is a Woman',
		Director: 'Jean-Luc Godard',
		genre: 'French New Wave',
	},
	{
		title: 'Band of Outsiders',
		Director: 'Jean-Luc Godard',
		genre: 'French New Wave',
	},
	{
		title: 'Singin in the Rain',
		Director: 'Stanley Donen',
		genre: 'Musical',
	},
	{
		title: 'North By Northwest',
		Director: 'Alfred Hitchcock',
		genre: 'Thriller',
	},
	{
		title: 'Paprika',
		Director: 'Satoshi Kon',
		genre: 'Anime',
	},
	{
		title: 'Once',
		Director: 'John Carney',
		genre: 'Musical',
	},
];

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Serve files in the public folder
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
	let responseText = 'Hey there! I love movies.';
	res.send(responseText);
});

app.get('/movies', (req, res) => {
	res.json(movieList);
});

app.get('/movies/:movieTitle', (req, res) => {
	res.json('Successful GET request with information on requested movie');
});

app.get('/movies/genres/:genreName', (req, res) => {
	res.json('Succesful GET request with list of movies in requested genre');
});

app.get('/movies/directors/:dirName', (req, res) => {
	res.json('Succesful GET request with information of requested director');
});

// POST requests
app.post('/users', (req, res) => {
	res.json('Successfully POST request to add new user account');
});

// PUT requests
app.put('/users/:userName', (req, res) => {
	res.json('Successful PUT request to edit user info');
});

app.put('/users/:userName/favorites/:movieID', (req, res) => {
	res.json('Successful PUT request to add movie to favorites');
});

// DELETE requests
app.delete('/users/:username/favorites/:movieID', (req, res) => {
	res.json('Successful DELETE request to remove movie from favorites');
});

app.delete('/users/:userName', (req, res) => {
	res.json('Successful DELETE request to remove user account');
});

// error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Uh oh! Something did not work as expected!');
});

// listen for requests
app.listen(8080, () => {
	console.log('Your app is listening on port 8080.');
});
