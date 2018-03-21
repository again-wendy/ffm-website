require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const i18n = require('i18n-express');
const firebase = require('firebase');

const app = express();
const sessionStore = new session.MemoryStore;

// Setup Firebase
var config = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: process.env.FB_DATABASE_URL,
    storageBucket: process.env.FB_PROCESS_BUCKET
}
firebase.initializeApp(config);
const db = firebase.database();

// Setup language
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ['en', 'nl'],
    textsVarName: 'translation'
}));

// View engine setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Static folders
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cookie Parser Middleware
app.use(cookieParser(process.env.SECRET_KEY));

// Session Middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    key: process.env.COOKIE_KEY,
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}));

// Flash Middleware
app.use(flash());

app.get('/', (req, res) => {
    if (req.cookies.role) {
        res.render('home', {
            role: req.cookies.role, 
            roleIntro: req.cookies.role + "/intro", 
            roleNews: req.cookies.role + "/newsletter-text"
        });
    } else {
        res.render('choice', {layout: false});
    }
});

app.get('/hirer', (req, res) => { 
    res.cookie('role', 'hirer').redirect('/');
});
app.get('/supplier', (req, res) => { 
    res.cookie('role', 'supplier').redirect('/');
});
app.get('/interim', (req, res) => { 
    res.cookie('role', 'interim').redirect('/');
});
app.get('/freelancer', (req, res) => { 
    res.cookie('role', 'freelancer').redirect('/');
});
app.get('/curious', (req, res) => {
    res.cookie('role', 'curious').redirect('/');
});

// Save contactform to database
function writeContactForm(name, email, subject, msg) {
    db.ref('contactform').push({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        contactName: name,
        contactEmail: email,
        contactSubject: subject,
        contactMsg: msg
    });
}

// Log in standard user
function login() {
    firebase.auth().signInWithEmailAndPassword(process.env.FB_EMAIL, process.env.FB_PASSWORD);
}

// Send contactform
app.post('/send', (req, res) => {
    let output = `
        <h1>Contact Form FFM.com</h1>
        <h2>Details:</h2>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Email: <a href="mailto:${req.body.email}">${req.body.email}</a></li>
            <li>Subject: ${req.body.subject}</li>
        </ul>
        <h4 style="margin-bottom:0;">Message:</h4> 
        <p>${req.body.msg}</p>
    `;

    let transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        secure: false,
        port: 25,
        auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    let HelperOptions = {
        from: '"Contact Form FFM website" <wendy.dimmendaal@again.nl>',
        to: 'wendy.dimmendaal@again.nl',
        subject: 'Reactie contactform FFM.com',
        text: 'Test 123',
        html: output
    };
    
    transporter.sendMail(HelperOptions, (error, info) => {
        if(error) {
            req.flash('error', 'Something went wrong: ' + error);
        } else {
            writeContactForm(req.body.name, req.body.email, req.body.subject, req.body.msg);
            req.flash('success', 'Thanks for the message! We\'ll be in touch');
            res.redirect('/');
        }
    });
});

var port = process.env.port || 3000;
app.listen(port, () => {
    login();
    console.log('Server started...');
});