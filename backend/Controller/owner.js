const express = require('express');
const router = express.Router();
const Owner = require('../Model/Owners');

// API for adding owner details
router.post('/owner', async (req, res) => {
  try {
    let result = new Owner({
      ownerName: req.body.name,
      ownerEmailId: req.body.email,
      ownerContactNumber: req.body.contact,
      panNumber: req.body.pan,
      occupation: req.body.occupation,
      ownerPermanentAddress: req.body.address,
      state: req.body.state,
      city: req.body.city,
      postalCode: req.body.postalCode,
      laddress: req.body.laddress,
      lcity: req.body.lcity,
      lstate: req.body.lstate,
      lpostalCode: req.body.lpostalCode,
      larea: req.body.larea,
      lamount: req.body.lamount,
    });

    result = await result.save();
    console.log('Owner details saved:', result);
    res.status(200).send({ msg: 'Owner Details Added Successfully', result });
  } catch (err) {
    console.error('Error adding owner:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
