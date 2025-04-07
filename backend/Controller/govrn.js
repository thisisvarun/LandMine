const express = require('express');
const router = express.Router();
const Govt = require('../Model/Government_Registrar');

router.get('/gov', async (req, res) => {
  try {
    const result = await Govt.find({});
    console.log('Fetched government registrars:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching government registrars:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
