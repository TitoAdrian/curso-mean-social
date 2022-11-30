'use strict'

const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

var app = express();

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200
}

// cargar rutas
const user_routes = require('./routes/user');
const follow_routes = require('./routes/follow');
const publication_routes = require('./routes/publication');
const message_routes = require('./routes/message');

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json())
app.use(cors(corsOptions));

// rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

// exportar
module.exports = app;