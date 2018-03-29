const express = require('express');
const path = require('path');
const helmet = require('helmet');
const server = express();

// Middlewares
server.use(helmet());

// Static files
server.use(express.static(path.join(__dirname, './public/')));

// Routes
server.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './public/index.html'));
});
server.get('/about-me', function(req, res) {
  res.sendFile(path.join(__dirname, './public/about-me.html'));
});
server.get('/*', function(req, res) {
  console.log(404);
  res.status(404).send('404');
});

// Run server
const PORT = process.env.PORT || 7777;
server.listen(PORT, '0.0.0.0', () => console.log('App running in:', PORT));
