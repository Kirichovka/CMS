const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const DB_FILE = './server/db.json';

// Helper function to read db file
const readDbFile = () => {
  try {
    const dbData = fs.readFileSync(DB_FILE, 'utf8');
    console.log('DB file read successfully:', dbData);
    return JSON.parse(dbData);
  } catch (error) {
    console.error('Error reading db file:', error.message);
    throw error;
  }
};

// Helper function to write to db file
const writeDbFile = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    console.log('DB file written successfully');
  } catch (error) {
    console.error('Error writing to db file:', error.message);
    throw error;
  }
};

// Endpoint to get all users
app.get('/users', (req, res) => {
  try {
    const db = readDbFile();
    const users = db.users || [];
    res.json(users);
  } catch (error) {
    console.error('Error in GET /users:', error.message);
    res.status(500).json({ error: 'Error reading users file' });
  }
});

// Endpoint to register a new user
app.post('/users', (req, res) => {
  try {
    const db = readDbFile();
    const users = db.users || [];
    const newUser = req.body;
    users.push(newUser);
    db.users = users;
    writeDbFile(db);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error in POST /users:', error.message);
    res.status(500).json({ error: 'Error writing to users file' });
  }
});

// Endpoint to update a user
app.put('/users/:id', (req, res) => {
  try {
    const db = readDbFile();
    const users = db.users || [];
    const userId = req.params.id;
    const updatedUser = req.body;

    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      db.users = users;
      writeDbFile(db);
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in PUT /users/:id:', error.message);
    res.status(500).json({ error: 'Error updating user' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
