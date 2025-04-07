const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

const cors = require('cors');
app.use(cors());

// Sample route
app.post('/signup', (req, res) => {
  // Handle signup logic here
  res.send('Signup endpoint');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
