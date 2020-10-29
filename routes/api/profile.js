const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // find one profile in the database where
    const profile = await Profile.findOne({
      // user (obejctid of user) is equal to the userid sent in the request by the middleware
      user: req.user.id,
      // populate the profile with information about the user from the associated user model
    }).populate('user', ['name', 'avatar']);

    // if no profile exists
    if (!profile) {
      // return the response
      return (
        res
          // with status code 400 - bad request
          .status(400)
          // and some json with a message
          .json({ msg: 'There is no profile for this user.' })
      );
    }

    res.json(profile);
    // catch the error if there is one
  } catch (err) {
    // log the error in the server's terminal
    console.error(err.message);
    // send a server error as a response, with a 500 status code - internal server error
    res.status(500).send('Server error.');
  }
});

module.exports = router;
