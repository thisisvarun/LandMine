const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../Config/db_config');
const User = require('../Model/User');
const Govt = require('../Model/Government_Registrar');

// User Signup
router.post('/signup', async (req, res) => {
  const { email, name, contact, privateKey, city, postalCode, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User Already Exists' });
    }

    const newUser = new User({
      email,
      name,
      contact,
      privateKey,
      city,
      postalCode,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();
    res.status(200).send('Thanks for registering!');
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Error in Saving');
  }
});

// Government Registrar Registration
router.post('/register_govt', async (req, res) => {
  try {
    const { username, password, address, contact, city } = req.body;

    let existing = await Govt.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Government User Already Exists' });
    }

    const govtUser = new Govt({
      username,
      password,
      address,
      contact,
      city,
    });

    const salt = await bcrypt.genSalt(10);
    govtUser.password = await bcrypt.hash(password, salt);

    await govtUser.save();
    res.status(200).send('Thanks for registering!');
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Error in Saving');
  }
});

// Private Key Login
router.post('/privatekeylogin', async (req, res) => {
  try {
    const { privateKey } = req.body;
    const user = await User.findOne({ privateKey });

    if (user) {
      res.status(200).json({ msg: 'Login successfully', result: user });
    } else {
      res.status(400).json({ msg: 'Private key does not exist' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error occurred', error });
  }
});

// Government Registrar Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await Govt.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User Not Exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect Password!' });

    const payload = { user };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
