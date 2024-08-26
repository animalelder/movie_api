import { hashSync, compareSync } from 'bcrypt';

import { Schema, model } from 'mongoose';

let userSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthdate: Date,
  favoriteMovies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
});

// Hash the password before saving it to the database
userSchema.statics.hashPassword = (password) => {
  return hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return compareSync(password, this.password);
};

let User = model('User', userSchema);

export default User;
