const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Configure multer to store uploaded files in the 'uploads' directory
const upload = multer({ dest: 'uploads/' });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// connect to the database sqlite3

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('basetab.db');


// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Users table created successfully.');
    }
  });

  // Define a route to handle form submissions
app.post('/register', (req, res) => {
    const { email, password, rePassword } = req.body;
  
    // Validate the form data (you can add your own validation logic here)
    if (!email || !password || !rePassword) {
      return res.status(400).json({ message: 'Missing form data.' });
    }
  
    if (password !== rePassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
  

    // hachage du password 
    const hashedPassword = require('bcryptjs').hashSync(password, 10);

    // Insert the user data into the database
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error inserting user data.' });
        }
        res.status(201).json({ message: 'User registered successfully.' });
        // Redirect to the login page
        //res.redirect('login.html');
      }
    );
  });

  // Define a route to handle form submissions 
app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Validate the form data (you can add your own validation logic here)
    if (!email || !password ) {
      return res.status(400).json({ message: 'Missing form data.' });
    }
    // Retrieve the user data from the database
    db.get(`SELECT * FROM users WHERE email =?`, [email], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving user data.' });
      }
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      // Compare the hashed password with the stored hashed password
      if (!require('bcryptjs').compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      // Generate a JWT token
    const token = jwt.sign({ email }, 'secretkey', { expiresIn: '1h' });

    // Log the generated JWT token
    console.log('Generated JWT token:', token);

    res.json({ message: 'Login successful.', token });
    });
  });


  // create a table info with fname, lname, email, pseudo and pp
  db.run(`CREATE TABLE IF NOT EXISTS info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    email TEXT NOT NULL,
    bdate TEXT NOT NULL,
    pseudo TEXT NOT NULL UNIQUE,
    pp TEXT NOT NULL,
    FOREIGN KEY (email) REFERENCES users (email) 
  )`, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('info table created successfully.');
    }
  });



  // Define a route to handle form submissions
  app.post('/info', upload.single('pp'), (req, res) => {
    const { fname, lname, bdate, pseudo } = req.body;
    const pp = req.file;
    const token = req.headers.authorization; // get JWT token
   
    // Check if the authorization header is present
  if (!token) {
    return res.status(400).json({ message: 'Missing authorization header.' });
  }

   // Extract the email from the JWT token
   let decodedToken;
  try {
    decodedToken = jwt.verify(token.replace('Bearer ', ''), 'secretkey');
  } catch (err) {
    console.error('Token validation error:', err);
    return res.status(401).json({ message: 'Invalid token.' });
  }

  const email = decodedToken.email;

    // Debugging purpose: log the received form data and the email from the JWT token
    console.log('Received form data:', req.body);
    console.log('Email:', email);
    console.log('req.file:', req.file);

    // Validate the form data (you can add your own validation logic here)
    if (!fname || !lname || !bdate || !pseudo || !pp) {
      return res.status(400).json({ message: 'Missing form data.' });
    }

   // Read the file and encode it to base64
  const fs = require('fs');
  fs.readFile(pp.path, (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file.' });
    }

    const base64Image = data.toString('base64');

     // Insert the user data into the database
     db.run(`INSERT INTO info (fname, lname, email, bdate, pseudo, pp) VALUES (?,?,?,?,?,?)`,
      [fname, lname, email, bdate, pseudo, base64Image],
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error inserting user data.' });
        }
        res.status(201).json({ message: 'User registered successfully.' });
      }
    );
  });
});
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });