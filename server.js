const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = [];
const SECRET = "supersecretkey";

// Inscription
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  res.status(201).send('Utilisateur créé');
});

// Connexion
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Email ou mot de passe incorrect');
  }
  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
