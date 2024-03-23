# cineDataDB

## Node.JS server and API Project

Check out the [documentation](https://cine-data-db-04361cdbefbe.herokuapp.com/documentation.html) for this project for more details.

### What can the API do?

- Return a list of all movies to the user
- Return data about a single movie by title to the user
- Return data about a genre (description) by name/title
- Return data about a director by name
- Allow new users to register
- Allow users to update their user info (username)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

### Details of the URL Endpoints

| Function                         | URL Endpoint                              | Response                                                                         |
| -------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| Get All Movies                   | /movies                                   | Return a list of all movies to user                                              |
| Get Movie by Title               | /movies/\[movieTitle\]                    | Return data (description, genre, director, artwork) about a single movie to user |
| Get all movies of a genre        | /movies/genre/\[genreName\]               | Return a list of all movies to user                                              |
| Get movies of a Director by name | /movies/director/\[directorName\]         | Return a list of all director's movies to user                                   |
| Register as new user             | /users                                    | Create new user account                                                          |
| Update user info                 | /users/\[username\]                       | Allows user to edit their info                                                   |
| Add a movie to favorites         | /users/\[username\]/favorites/\[movieID\] | \[movie title\] has been added to \[username\]'s favorites                       |
| Remove movie from favorites      | /users/\[username\]/favorites/\[movieID\] | \[movie title\] has been removed from \[username\]'s favorites                   |
| Delete user account              | /users/\[username\]                       | Confirmation account was deleted                                                 |
