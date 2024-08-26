const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

import { sign } from 'jsonwebtoken';
import { authenticate } from 'passport';

import '@/controllers/auth/passport'; // Your local passport file

let generateJWTToken = (user) => {
  return sign(user, jwtSecret, {
    subject: user.username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256', // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
export default (router) => {
  router.post('/login', (req, res) => {
    authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: info,
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
