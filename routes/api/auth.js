const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Get user route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    // Find user with id matching the id from the request (decoded by our auth middleware)
    // Use mongoose to remove password from user before sending
    const user = await User.findById(req.user.id).select('-password');

    // Send user (as json) in response
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error.');
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  // Use express validator to check each field
  [
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Password is required.').exists({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials.' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials.' }] });
      }

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
        // Arg 4. Callback: Check for errors, then return json with the jwt
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
