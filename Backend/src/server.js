'use strict';

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import { v1 } from 'uuid';
import { createLogger } from './Logger';
const logger = createLogger();

const MongoStore = require('connect-mongo/es5')(session);
const compression = require('compression');


var PORTS = process.env.NODE_ENV === 'production'
  ? [80, 443]
  : [7000, 8001];

const SESSION_SECRET = 'SECRETS123'

mongoose.connect('mongodb://localhost/Database');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connection is open.');
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

// Set up post logging
app.use((req, res, next) => {
  if (req.method === 'POST') {
    logger.info({reqPost: req});
  }
  next();
});

app.use((req, res, next) => {
  res.success = () => { res.send({ success: true }) };
  res.error = (description = 'Server Error', error) => {
    const type = !!error ? error.toString() : undefined;
    const stackTrace = !!error ? error.stack : undefined;
    logger.error({
      type,
      description,
      stackTrace,
    });
    res.send({ error: 'Server Error' })
  };
  next();
});

// Redirect to https
//
// if (process.env.NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (!req.secure) {
//       res.redirect('https://' + req.headers.host + req.url);
//       return;
//     }
//     next();
//   })
// }

const ORIGIN = process.env.NODE_ENV === 'production'
  ? '1.1.1.1'
  : 'http://localhost:3000';

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, *');
  next();
});



var store = new MongoStore({ mongooseConnection: mongoose.connection });

app.use(session({
  genid: req => v1(),
  secret: SESSION_SECRET,
  store: store
}));

app.listen(PORTS[0], () => {
  console.log('Starting server, listening on port %s', PORTS[0]);
});

app.get('/*', (req, res) => {
  res.send('hello world');
});
