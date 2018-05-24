require('dotenv').config();
const express           = require('express');
const bodyParser        = require('body-parser');
const cookieParser      = require('cookie-parser');
const session           = require('express-session');
const flash             = require('express-flash');
const exphbs            = require('express-handlebars');
const path              = require('path');
const nodemailer        = require('nodemailer');
const i18n              = require('i18n-express');
const firebase          = require('firebase');
const request           = require('superagent');

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
app.use((req, res, next) => {
    req.db = db;
    next();
});

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
    // if (req.cookies.role) {
    //     res.redirect('/' + req.cookies.role);
    // } else {
    //     res.render('home');
    // }
    res.render('home');
});

function getContactForms() {
    var forms = db.ref('contactform');
    var formsArr = [];
    forms.on('value', (snapshot) => {
        snapshot.forEach(function(item) {
            var itemVal = item.val();
            formsArr.push(itemVal);
        });
        return formsArr;
    });
}

function convertTimestamp(timestamp) {
    var newDate = new Date(timestamp);
    var date = smallerThanTen(newDate.getDate());
    var month = smallerThanTen(newDate.getMonth() + 1);
    var year = smallerThanTen(newDate.getFullYear());
    var hours = smallerThanTen(newDate.getHours() + 1);
    var sec = smallerThanTen(newDate.getSeconds());
    return date + "-" + month + "-" + year + " " + hours + ":" + sec;
}

function smallerThanTen(num) {
    return num < 10 ? "0" + num : num;
}

app.get('/database', (req, res) => {
    var user = firebase.auth().currentUser;
    if(user !== null && user.uid == process.env.ADMIN_USER_UID ) {
        res.render('data');
    } else if (user === null) {
        res.render('login');
    } else {
        res.render('error', {
            errormsg: "Only an admin can see this page"
        });
    }
});

app.get('/database/contact', (req, res) => {
    var user = firebase.auth().currentUser;
    if(user !== null && user.uid == process.env.ADMIN_USER_UID ) {
        var formsArr = [];
        req.db.ref('contactform').on('value', (snapshot) => {
            snapshot.forEach(function(item) {
                var itemVal = item.val();
                itemVal.date = convertTimestamp(itemVal.timestamp);
                formsArr.push(itemVal);
            });
            res.send(formsArr);
        });
    } else {
        res.status(500).send({error: "You have no rights to get this data!"});
    }
});

app.get('/hirer', (req, res) => { 
    res.cookie('role', 'hirer').render('hirer');
});
app.get('/supplier', (req, res) => { 
    res.cookie('role', 'supplier').render('supplier');
});
app.get('/freelancer', (req, res) => { 
    res.cookie('role', 'freelancer').render('freelancer');
});

app.get('/termsandconditions', (req, res) => {
    res.render('termsandconditions', {partial: 'terms'});
});
app.get('/gdpr', (req, res) => {
    res.render('termsandconditions', {partial: 'gdpr'});
});
app.get('/generalconsiderations', (req, res) => {
    res.render('termsandconditions', {partial: 'gencons'})
});

app.get('/sluitjeaan', (req, res) => {
    res.render('connect');
});

// Save contactform to database
function writeContactForm(name, email, subject, msg, role) {
    db.ref('contactform').push({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        contactName: name,
        contactEmail: email,
        contactSubject: subject,
        contactMsg: msg,
        contactRole: role
    });
}

// Log in user
function login(email, password, res) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        res.redirect('/database');
    }).catch((err) => {
        // Sign-in went wrong
        res.render('error', {
            roleNews: req.cookies.role + "/newsletter-text",
            errormsg: "Sorry, something went wrong! Error: " + err
        });
    });
}

// Log out user
function logout(res) {
    firebase.auth().signOut().then(() => {
        res.redirect('/');
    }).catch((err) => {
        // Sign-out went wrong
        res.render('error', {
            roleNews: req.cookies.role + "/newsletter-text",
            errormsg: "Sorry, something went wrong! Error: " + err
        });
    })
}

app.post('/login', (req, res) => {
    login(req.body.email, req.body.password, res);
});

app.post('/logout', (req, res) => {
    logout(res);
});

// Send connection kit request
app.post('/sendconnectkit', (req, res) => {
    firebase.auth().signInWithEmailAndPassword(process.env.FB_EMAIL, process.env.FB_PASSWORD);
    let output = `
        <h1>Iemand vraagt een aansluitkit aan</h1>
        <h2>Details:</h2>
        <ul>
            <li>Naam: ${req.body.name}</li>
            <li>Email: ${req.body.email}</li>
            <li>Telefoon: ${req.body.phone}</li>
            <li>Bedrijfsnaam: ${req.body.compname}</li>
            <li>Straat + nummer: ${req.body.street} ${req.body.number}</li>
            <li>Postcode: ${req.body.postal}</li>
            <li>Plaats: ${req.body.city}</li>
            <li>Email adres mag gebruikt worden voor algemene commerciële informatie rondom FFM: ${req.body.generalCommercial}</li>
            <li>Email adres mag gebruikt worden voor gericht individueel commerciele contact: ${req.body.individualContact}</li>
        </ul>
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
        from: '"Aansluitkit request" <wendy.dimmendaal@again.nl>',
        to: 'wendy.dimmendaal@again.nl',
        subject: 'Aansluitkit request',
        text: 'Test 123',
        html: output
    };

    transporter.sendMail(HelperOptions, (error, info) => {
        if(error) {
            req.flash('error', 'Something went wrong: ' + error);
        } else {
            writeContactForm(req.body.name, req.body.email, req.body.subject, req.body.msg, req.cookies.role);
            req.flash('success', 'Je aansluitkit is aangevraagd!');
            res.redirect('/');
        }
    });

    logout(res);
});

// Send contactform
app.post('/send', (req, res) => {
    firebase.auth().signInWithEmailAndPassword(process.env.FB_EMAIL, process.env.FB_PASSWORD);
    let output = `
        <h1>Contact Form FFM.com</h1>
        <h2>Details:</h2>
        <ul>
            <li>Naam: ${req.body.name}</li>
            <li>Email: <a href="mailto:${req.body.email}">${req.body.email}</a></li>
            <li>Onderwerp: ${req.body.subject}</li>
            <li>Gekozen rol: ${req.cookies.role}</li>
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
            writeContactForm(req.body.name, req.body.email, req.body.subject, req.body.msg, req.cookies.role);
            req.flash('success', 'Thanks for the message! We\'ll be in touch');
            res.redirect('/');
        }
    });
    logout(res);
});

//Add subscriber to Mailchimp list
app.post('/signup', (req, res) => {
    request
        .post(process.env.MAILCHIMP_URL + 'lists/' + process.env.MAILCHIMP_LISTID + '/members/')
        .set('Content-Type', 'application/json;charset=urf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + process.env.MAILCHIMP_APIKEY).toString('base64'))
        .send({
            'email_address': req.body.email,
            'status': 'subscribed'
        })
        .end((err, res) => {
            if(res.status < 300 || (res.status === 400 && res.body.title === "Member Exists")) {
                req.flash('success', 'Signed up!');
            } else {
                req.flash('error', 'Something went wrong');
            }
        });
});

var port = process.env.port || 3000;
app.listen(port, () => {
    console.log('Server started...');
});