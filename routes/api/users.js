const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  // Use express validator to check each field
  [
    check('name', 'Name is required.').not().isEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters.'
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists.' }] });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      // Initialize a new user with mongoose, but don't save to database yet
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      // Set mongo user's password to the encrypted version
      user.password = await bcrypt.hash(password, salt);

      // Save the new user to the mongo database
      await user.save();

      // Set paylaod to be saved in jwt (user id)
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        // Arg 1. Payload: User id to be saved
        payload,
        // Arg 2. JWT Secret: Uses config to grab the jwtSecret from our config file
        config.get('jwtSecret'),
        // Arg 3. Options: We set an expiration option
        { expiresIn: 360000 },
        // Arg 4. Callback: Check for errorrs, then return json with the jwt
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error.');
    }
  }
);

module.exports = router;
