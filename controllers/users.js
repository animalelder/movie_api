import { connect } from 'mongoose';
import { validationResult } from 'express-validator';
import Users from '@/models/Users';

connect(process.env.CONNECTION_URI);

export const getUser = async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.userName });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const addUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const existingUsernameUser = await Users.findOne({ username: req.body.username });
  if (existingUsernameUser) {
    return res.status(409).send('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const user = await Users.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      birthdate: req.body.birthdate,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

// async (req, res) => {
//   check the validation object for errors
//   let errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(422).json({ errors: errors.array() });
//   }

//   let hashedPassword = Users.hashPassword(req.body.password);
//   await Users.findOne({ username: req.body.username })
//     .then((user) => {
//       if (user) {
//         return res.status(400).send(req.body.username + ' already exists');
//       } else {
//         Users.create({
//           username: req.body.username,
//           password: hashedPassword,
//           email: req.body.email,
//           birthdate: req.body.birthdate,
//         })
//           .then((user) => res.status(201).json(user))
//           .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//           });
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Error: ' + error);
//     });
// };

export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const existingUsername = await Users.findOne({
    username: req.body.username,
    _id: { $ne: req.user._id },
  });
  if (existingUsername) {
    return res.status(409).send('Username already exists');
  }

  const existingEmail = await Users.findOne({
    email: req.body.email,
    _id: { $ne: req.user._id },
  });

  if (existingEmail) {
    return res.status(409).send('Email already exists');
  }

  try {
    const updatedUser = await Users.findOneAndUpdate(
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
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const deleteUser = async (req, res) => {
  if (req.user.username !== req.params.userName) {
    return res.status(400).send('Permission denied');
  }

  try {
    await Users.findOneAndDelete({ username: req.params.username });
    return res.status(204).send('User deleted');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const addFavMovies = async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.userName },
      { $push: { favoriteMovies: req.params.movieID } },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const removeFavMovies = async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.userName },
      { $pull: { favoriteMovies: req.params.movieID } },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
