router.post('/signup', async (req, res) => {
  const { email, name, contact, privateKey, city, postalCode, password } = req.body;
  try {
    console.log('Signup attempt with email:', email);

    let user = await User.findOne({ email });
    console.log('User found in database:', user);

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

    console.log('Creating new user:', newUser);

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save();
    console.log('User saved successfully:', newUser);
    res.status(200).send('Thanks for registering!');
  } catch (err) {
    console.log('Error in signup:', err.message);
    res.status(500).send('Error in Saving');
  }
});
