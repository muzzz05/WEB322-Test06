const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const tempUser = require('./modules/users');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = 4000;

// HTTPS options
const https_options = {
    key: fs.readFileSync(__dirname + '/server.key'),
    cert: fs.readFileSync(__dirname + '/server.crt') 
};

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Secure HTTP/HTTPS headers
app.use(session({
    secret: 'thisIsAVerySecretKey', 
    resave: false,
    saveUninitialized: true,
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/register');
});

app.get('/login', (req, res) => {
    res.render('login', { errorMsg: '' });
});

app.post('/login', (req, res) => {
    tempUser.checkUser(req.body)
        .then(user => {
            req.session.user = user; 
            res.redirect('/dashboard'); 
        })
        .catch(err => {
            res.render('login', { errorMsg: err });
        });
});


app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { users: req.session.user });
});

app.get('/register', (req, res) => {
    res.render('register', { errorMsg: '' });
});

app.post('/register', (req, res) => {
    tempUser.addUser(req.body)
        .then(() => {
            res.render('message', { message: 'Registration is successful' });
        })
        .catch(err => {
            res.render('register', { errorMsg: err });
        });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Could not log out.');
        } else {
            res.redirect('/login');
        }
    });
});

// 404 Page
app.use((req, res) => {
    res.status(404).render('404');
});

// Start HTTP and HTTPS Servers
http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`The server is listening on HTTP Port: ${HTTP_PORT}`);
});

https.createServer(https_options, app).listen(HTTPS_PORT, () => {
    console.log(`The server is listening on HTTPS Port: ${HTTPS_PORT}`);
});
