const express = require('express');
const router = express.Router();
const Owner = require('../Model/Owners');

// Validation middleware
const validateOwnerInput = (req, res, next) => {
  const { name, email, contact, pan, address, state, city, postalCode } = req.body;
  
  if (!name || !email || !contact || !pan || !address || !state || !city || !postalCode) {
    return res.status(400).json({ 
      success: false, 
      error: 'All required fields must be provided' 
    });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid email format' 
    });
  }

  // Indian phone number validation
  if (!/^[6-9]\d{9}$/.test(contact)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid contact number' 
    });
  }

  next();
};

// Add owner details
router.post('/owner', validateOwnerInput, async (req, res) => {
  try {
    // Check if owner with same email or PAN already exists
    const existingOwner = await Owner.findOne({
      $or: [
        { ownerEmailId: req.body.email },
        { panNumber: req.body.pan }
      ]
    });

    if (existingOwner) {
      return res.status(409).json({
        success: false,
        error: 'Owner with this email or PAN already exists'
      });
    }

    const newOwner = new Owner({
      ownerName: req.body.name,
      ownerEmailId: req.body.email,
      ownerContactNumber: req.body.contact,
      panNumber: req.body.pan,
      occupation: req.body.occupation,
      ownerPermanentAddress: req.body.address,
      state: req.body.state,
      city: req.body.city,
      postalCode: req.body.postalCode,
      laddress: req.body.laddress || '',
      lcity: req.body.lcity || '',
      lstate: req.body.lstate || '',
      lpostalCode: req.body.lpostalCode || '',
      larea: req.body.larea || '',
      lamount: req.body.lamount || ''
    });

    const savedOwner = await newOwner.save();

    res.status(201).json({
      success: true,
      message: 'Owner details added successfully',
      data: {
        id: savedOwner._id,
        name: savedOwner.ownerName,
        email: savedOwner.ownerEmailId
      }
    });

  } catch (err) {
    console.error('Error adding owner:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while saving owner details'
    });
  }
});

// Get all owners
router.get('/owner', async (req, res) => {
  try {
    const owners = await Owner.find({})
      .select('-__v') // Exclude version key
      .lean();

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners
    });
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching owners'
    });
  }
});

module.exports = router;