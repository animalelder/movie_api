import { Schema, model } from 'mongoose';

let movieSchema = Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
    birth: Date,
    death: Date,
  },
  actors: [String],
  imagepath: String,
  featured: Boolean,
});

let Movie = model('Movie', movieSchema);

export default Movie;
