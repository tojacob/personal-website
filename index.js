const path = require('path');
const express = require('express');
const helmet = require('helmet');
const app = express();

// Middlewares
app.use(helmet());

// Sets
app.use(express.static(path.join(__dirname, './public')));
const PORT = process.env.PORT || 8080;

// Run server
app.listen(PORT, '0.0.0.0', () => console.log('App running in:', PORT));
