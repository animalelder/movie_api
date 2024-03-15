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

let topTenMovies = [
	{
		title: 'Spirited Awau',
		Director: 'Hayao Miyazaki',
	},
	{
		title: 'Almost Famous',
		Director: 'Cameron Crowe',
	},
	{
		title: 'Everything Everywhere All At Once',
		Director: 'The Daniels',
	},
	{
		title: 'Blade Runner ',
		Director: 'Ridley Scott',
	},
	{
		title: 'A Woman is a Woman',
		Director: 'Jean-Luc Godard',
	},
	{
		title: 'Band of Outsiders',
		Director: 'Jean-Luc Godard',
	},
	{
		title: 'Singin in the Rain',
		Director: 'Stanley Donen',
	},
	{
		title: 'North By Northwest',
		Director: 'Alfred Hitchcock',
	},
	{
		title: 'Paprika',
		Director: 'Satoshi Kon',
	},
	{
		title: 'Once',
		Director: 'John Carney',
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
	res.json(topTenMovies);
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
