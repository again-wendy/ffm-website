const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const i18n = require('i18n-express');

const app = express();

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
app.use(cookieParser());

app.get('/', (req, res) => {
    if (req.cookies.role) {
        res.redirect('/' + req.cookies.role)
    } else {
        res.render('choice', {layout: false});
    }
});

app.get('/hirer', (req, res) => { 
    res.cookie('role', 'hirer').render('hirer');
});
app.get('/supplier', (req, res) => { 
    res.cookie('role', 'supplier').render('supplier');
});
app.get('/interim', (req, res) => { 
    res.cookie('role', 'interim').render('interim'); 
});
app.get('/freelancer', (req, res) => { 
    res.cookie('role', 'freelance').render('freelance');
});

// Send contactform
app.post('/send', (req, res) => {
    let output = `
        <h1>Contact Form AGAIN.nl</h1>
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
        from: '"Contact Form AGAIN website" <wendy.dimmendaal@again.nl>',
        to: 'wendy.dimmendaal@again.nl',
        subject: 'Hello World',
        text: 'Test 123',
        html: output
    };
    
    transporter.sendMail(HelperOptions, (error, info) => {
        if(error) {
            res.render('error', {errorMsg: error, defaultLayout: 'simple'});
        }
        res.redirect('/?form=send');
    });
})

var port = process.env.port || 3000;
app.listen(port, () => {
    console.log('Server started...');
});