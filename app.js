const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/database.js');
const cookieSession = require('cookie-session');

// app init
const app = express();

// set the port
const port = process.env.PORT || 3000;

//connect with database
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
mongoose.connection.on('connected', () => {
  console.log(`============================= \n|| Database  Is  Connected ||\n============================= \n`);
});
mongoose.connection.on('error', (error) => {
  console.log('Something Went Worng!!', error)
});

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// session middleware
app.set('trust proxy', 1);
app.use(
    cookieSession({
        name: 'session',
        keys: ['icEgv958cdfidDGyU', 'r5oQr8dd785sSe8Ddnj5'],
        maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month
    })
);
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

//api
app.use('/api/posts/', require('./api/posts.js'));
app.use('/api/categories/', require('./api/categories.js'));
app.use('/api/users/', require('./api/users.js'));
app.use('/api/auth/', require('./api/auth.js'));
app.use('/api/search/', require('./api/search.js'));

app.listen(port, ()=>{
  console.log(`============================== \n||the app is running at ${port}||\n============================== \n`);
});
