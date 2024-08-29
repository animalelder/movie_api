import { use } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findOne, findById } from '@/models/user';
import { Strategy, ExtractJwt } from 'passport-jwt';

let JWTStrategy = Strategy,
  ExtractJWT = ExtractJwt;

use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(username + ' ' + password);
      await findOne({ username })
        .then((user) => {
          if (!user) {
            console.log('Incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password.',
            });
          }
          if (!user.validatePassword(password)) {
            console.log('incorrect password');
            return callback(null, false, {
              message: 'Incorrect password.',
            });
          }
          console.log('finished');
          return callback(null, user);
        })
        .catch((err) => {
          if (err) {
            console.log(err);
            return callback(err);
          }
        });
    }
  )
);

use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      return await findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((err) => {
          return callback(err);
        });
    }
  )
);
