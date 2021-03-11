require('dotenv').config();
const express                   = require('express');
const bodyParser                = require('body-parser');
const cookieParser              = require('cookie-parser');
const session                   = require('express-session');
const flash                     = require('express-flash');
const exphbs                    = require('express-handlebars');
const {check, validationResult} = require('express-validator/check');
const {sanitizeBody}            = require('express-validator/filter');
const path                      = require('path');
//const nodemailer                = require('nodemailer');
const i18n                      = require('i18n-express');
const superagent                = require('superagent');
const request                   = require('request');
const promRequest               = require('request-promise');
const emails                    = require('./emails');
const ebookFile                 = require('./ebook-base64');
const http                      = require('http');
const https                     = require('https');
const uri                       = require('url');
const fs                        = require('fs');
const mime                      = require('mime');
const redirectHttp              = require('express-http-to-https');
const sgMail                    = require('@sendgrid/mail');
const unirest                   = require('unirest');

const app = express();
const sessionStore = new session.MemoryStore;

// View engine setup
var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        iff: function(a, operator, b, opts) {
            var bool = false;
            switch (operator) {
                case '==':
                    bool = a == b;
                    break;
                case '>':
                    bool = a > b;
                    break;
                case '<':
                    bool = a < b;
                    break;
                case '<=':
                    bool = a <= b;
                    break;
                case '>=':
                    bool = a >= b;
                    break;
                case '!=':
                    bool = a != b;
                    break;
                default:
                    throw "Unknown operator " + operator;
            }
            if(bool) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Static folders
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/.well-known/pki-validation', express.static(path.join(__dirname, '.well-known/pki-validation')))

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Cookie Parser Middleware
app.use(cookieParser(process.env.SECRET_KEY));

// Setup language
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ['en', 'nl'],
    textsVarName: 'translation'
}));

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

// For certificate
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

// Settings for mail
sgMail.setApiKey(process.env.SENDGRID_API_NEW_KEY);

// Flash Middleware
app.use(flash());

app.get('/', (req, res) => {
    var apiCall = unirest("GET", "https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/");

    apiCall.headers({
        "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.X_RAPIDAPI_HOST,
        "useQueryString": true
    });

    apiCall.end(function (result) {
        if (result.error) throw new Error(result.error);
        var notDutch = true;
        if(result.body.country_code == "NL" || result.body.country_code == "BE") {
            notDutch = false;
        } 
        res.render('home', {
            title: "FlexForceMonkey | Business network for Flex",
            desc: "Eén platform waar uitzendbureau, inlener, ZZP-er en consulting bedrijf samenwerken aan een efficiënt proces",
            img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
            url: "http:flexforcemonkey.com",
            notDutch: notDutch
        });
    });    
});

app.get('/en', (req, res) => {
    res.render('english-home', {
        title: "FlexForceMonkey | Business network for Flex",
        desc: "Eén platform waar uitzendbureau, inlener, ZZP-er en consulting bedrijf samenwerken aan een efficiënt proces",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com",
        layout: 'main-en'
    }); 
});

app.get('/partners', (req, res) => {
    res.render('partners', {
        title: "FlexForceMonkey | Partners",
        desc: "Over onze partners",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/partners",
    });
})

app.get('/blogs', (req, res) => {
    request('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts?_embed=true&per_page=3', (err, resp, body) => {
        var temp = JSON.parse(body);
        temp = getFeaturedImage(temp);
        res.send(temp);
    });
});

app.get('/opdrachtgever', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            res.cookie('role', 'opdrachtgever', { sameSite: true }).render('opdrachtgever', {
                title: "FlexForceMonkey | Integration services",
                desc: "Dus jij droomt van een volledig gedigitaliseerde keten? Inkoop- en verkooptransacties verwerken van zowel blue- als white-collar inhuur via één netwerk? Eén platform dat alle data-integratie afhandelt? Dat vinden wij logisch!",
                img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                url: "http:flexforcemonkey.com/integration-services",
                blogs: blogs
            });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            res.cookie('role', 'opdrachtgever', { sameSite: true }).render('opdrachtgever', {
                title: "FlexForceMonkey | Integration services",
                desc: "Dus jij droomt van een volledig gedigitaliseerde keten? Inkoop- en verkooptransacties verwerken van zowel blue- als white-collar inhuur via één netwerk? Eén platform dat alle data-integratie afhandelt? Dat vinden wij logisch!",
                img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                url: "http:flexforcemonkey.com/integration-services",
                blogs: null
            });
        });
});

app.get('/buyer', (req, res) => { 
    res.cookie('role', 'opdrachtgever', { sameSite: true }).render('buyer', {
        title: "FlexForceMonkey | Integration services",
        desc: "Dus jij droomt van een volledig gedigitaliseerde keten? Inkoop- en verkooptransacties verwerken van zowel blue- als white-collar inhuur via één netwerk? Eén platform dat alle data-integratie afhandelt? Dat vinden wij logisch!",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/integration-services",
        layout: 'main-en'
    });
});

app.get('/integration-services', (req, res) => {
    res.redirect('/opdrachtgever');
});
app.get('/hirer', (req, res) => {
    res.redirect('/opdrachtgever');
});
app.get('/inlener', (req, res) => {
    res.redirect('/opdrachtgever');
});

app.get('/leverancier', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBblogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            res.cookie('role', 'leverancier', { sameSite: true }).render('leverancier', {
                title: "FlexForceMonkey | Customer connectivity platform",
                desc: "Stop nu met losse spreadsheets en macro’s om alle binnenkomende uren terug te rekenen naar de CAO. Bouw je urenstroom om naar een soepele operatie waarbij je kunt vertrouwen op één gecheckte bron.",
                img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                url: "http:flexforcemonkey.com/cla-engine",
                blogs: blogs
            });
        })
        .catch(() => {
            req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            res.cookie('role', 'leverancier', { sameSite: true }).render('leverancier', {
                title: "FlexForceMonkey | Customer connectivity platform",
                desc: "Stop nu met losse spreadsheets en macro’s om alle binnenkomende uren terug te rekenen naar de CAO. Bouw je urenstroom om naar een soepele operatie waarbij je kunt vertrouwen op één gecheckte bron.",
                img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                url: "http:flexforcemonkey.com/cla-engine",
                blogs: null
            });
        });    
});
app.get('/supplier', (req, res) => { 
    res.cookie('role', 'leverancier', { sameSite: true }).render('supplier', {
        title: "FlexForceMonkey | Customer connectivity platform",
        desc: "Stop nu met losse spreadsheets en macro’s om alle binnenkomende uren terug te rekenen naar de CAO. Bouw je urenstroom om naar een soepele operatie waarbij je kunt vertrouwen op één gecheckte bron.",
        img: "./public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/cla-engine",
        layout: 'main-en'
    });
});
app.get('/cao-ontrafelaar', (req, res) => {
    res.redirect('/leverancier');
});
app.get('/cla-engine', (req, res) => {
    res.redirect('/leverancier');
});
app.get('/uitzender', (req, res) => {
    res.redirect('/leverancier');
});
app.get('/invited', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            res.cookie('role', 'invited', { sameSite: true }).render('invited', {
                title: "FlexForceMonkey | Online software",
                desc: "Ben je uitgenodigd om een account aan te maken op FlexForceMonkey? Join the collaborative flex experience",
                img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                url: "http:flexforcemonkey.com/invited",
                blogs: blogs
            });
        })
        .catch(() => {
            req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'invited', { sameSite: true }).render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Het draait toch om de kwaliteit van jullie uren? De administratie ervan moet eigenlijk vanzelf gaan.",
                        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                        url: "http:flexforcemonkey.com/online-software",
                        blogs: null,
                        subs: subs
                    });
                })
                .catch(() => {
                    res.cookie('role', 'invited', { sameSite: true }).render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Het draait toch om de kwaliteit van jullie uren? De administratie ervan moet eigenlijk vanzelf gaan.",
                        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
                        url: "http:flexforcemonkey.com/online-software",
                        blogs: null,
                        subs: null
                    });
                });
        });  
});
app.get('/online-software', (req, res) => {
    res.redirect('/invited');
});
app.get('/freelancer', (req, res) => {
    res.redirect('/invited');
});
app.get('/mkb', (req, res) => {
    res.redirect('/invited')
});

app.get('/ebook', (req, res) => {
    res.render('ebookpage', {
        title: "eBook | Ontvlooien van inkoopsystemen en uitzendprocessen",
        desc: "In dit e-book wordt gekeken naar het Purchase to Pay proces van opdrachtgevers, door de ogen van een uitzender.",
        img: "http:flexforcemonkey.com/public/images/og-img/ebook.jpg",
        url: "http:flexforcemonkey.com/ebook",
    });
});

app.get('/use-cases', (req, res) => {
    res.render('usecases', {
        title: "FlexForceMonkey | Use cases",
        desc: "Hier zie je voorbeelden van hoe FlexForceMonkey jou kan helpen.",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/ebook",
    });
});

app.get('/termsandconditions', (req, res) => {
    res.render('termsandconditions', {
        partial: 'terms',
        title: "FlexForceMonkey | Algemene voorwaarden",
        desc: "Algemene voorwaarden FlexForceMonkey, Mei 2018",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/termsandconditions",
    });
});
app.get('/gdpr', (req, res) => {
    res.render('termsandconditions', {
        partial: 'gdpr',
        title: "FlexForceMonkey | Bepalingen AVG",
        desc: "Privacy verklaring / informatie algemene verordening gegevensbescherming",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/gdpr",
    });
});
app.get('/generalconsiderations', (req, res) => {
    res.render('termsandconditions', {
        partial: 'gencons',
        title: "FlexForceMonkey | Algemene opmerkingen",
        desc: "Algemene opmerkingen FlexForceMonkey",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/generalconsiderations",
    })
});
app.get('/feedback', (req,res) => {
    let score = req.query.score;
    let sent = req.query.sent;
    res.render('feedback', {
        title: "FlexForceMonkey | Feedback",
        desc: "Laat ons weten van je van ons vindt!",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http:flexforcemonkey.com/feedback",
        score: score,
        sent: sent,
        lang: req.cookies.ulang
    }); 
});

// Request selfservice form via integration services
app.post('/selfservice-subscribe', [check('termsconditions').equals('on'), check('avg').equals('on')], (req, res) => {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + process.env.RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    let output = emails.buildSelfServiceFFMEmail(req.cookies.ulang, req.body.email, req.body.companyname, req.body.firstname, req.body.lastname, req.body.emailnewsletters, req.body.emailproductupdates, req.body.emailcomcontact, req.body.sub);
    
    const msg = {
        to: 'doede@flexforcemonkey.com',
        //to: 'wendy@flexforcemonkey.com',
        from: '"Aanvraag" <noreply@flexforcemonkey.com>',
        subject: 'Aanvraag voor aansluiting',
        text: 'Test 123',
        html: output
    }

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        req.flash('error', 'Je moet de algemene voorwaarden en bepalingen AVG lezen en accepteren voor je verder kunt gaan!')
        res.redirect(req.get('referer'));
    } else {
        request(recaptcha_url, function(error, resp, body) {
            body = JSON.parse(body);
            if(body.success !== undefined && !body.success) {
                req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
                res.redirect(req.get('referer'));
            } else {
                sgMail.send(msg)
                    .then(() => {
                        req.flash('success', 'Je aanvraag is verstuurd!');
                        res.redirect(req.get('referer'));
                    })
                    .catch((error) => {
                        req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + error);
                        res.redirect(req.get('referer'));
                    })
                sendMailUser(req.body.email, req.cookies.ulang);
            }
        });
    }
});

// Request for ebook
app.post('/download-ebook', (req, res) => {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + process.env.RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    let output = emails.buildEbookEmailNL();
    let pathBook = './public/files/ebook-uitzenden-aansluiten-op-p2p.pdf';

    let HelperOptions = {
        from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
        to: req.body.email,
        subject: 'FlexForceMonkey eBook',
        text: 'Test 123',
        html: output,
        attachments: [
            {
                content: ebookFile.ebook,
                filename: "ebook-uitzenden-aansluiten-op-p2p.pdf",
                type: 'application/pdf',
                disposition: 'attachment',
                contentId: 'FFMEbook'
            }
        ]
    }

    request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            console.log("iets mis gegaan met recaptcha")
            res.redirect(req.get('referer'));
            req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
        } else {
            sgMail.send(HelperOptions)
                .then(() => {
                    console.log("Mail is verstuurd")
                    req.flash('success', 'Je aanvraag is verstuurd!');
                    sendConfirmMail(req.body);
                    res.redirect(req.get('referer'));
                })
                .catch((error) => {
                    console.log("Mail is niet verstuurd");
                    console.log(error);
                    req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + error);
                    res.redirect(req.get('referer'));
                })
        }
   });
});

//Add subscriber to Mailchimp list
app.post('/signup', (req, res) => {
    superagent
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

// Fallback for wrong urls
app.get('*', (req, res) => {
    res.render('404', {
        title: "Pagina niet gevonden",
        desc: "404: pagina niet gevonden",
        img: "http:flexforcemonkey.com/public/images/og-img/flexforcemonkey.jpg",
        url: "http://flexforcemonkey.com/404"
    });
})

var port = process.env.port || 3000;
app.listen(port, () => {
    console.log('Server started on http://localhost:' + port);
});

const sendConfirmMail = (body) => {
    let output = `
        <h1>Iemand heeft een ebook gedownload!</h1>
        <h3>${body.email} heeft de volgende antwoorden gegeven:</h3>
        <p><strong>Geef aan of je opdrachtgever of uitlener bent binnen de keten van digitalisering</strong></p>
        <p>${body.role}</p>
        <br />
        <p><strong>Kun je ons vertellen wat jouw allerbelangrijkste frustratie is binnen het dagelijkse samenwerken en administratieve proces met jouw uitlener/opdrachtgever?</strong></p>
        <p>${body.frustration}</p>
        <br />
    `;
    let HelperOptions = {
        to: "doede@flexforcemonkey.com",
        //to: "wendy@flexforcemonkey.com",
        from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
        subject: "Ebook download",
        html: output
    }
    sgMail.send(HelperOptions);
}

const getFeaturedImage = (arr) => {
    for(var i = 0; i < arr.length; i++) {
        if( arr[i]._embedded['wp:featuredmedia'] != undefined ) {
            var img = arr[i]._embedded['wp:featuredmedia'][0].source_url;
            arr[i].img = img;
        } else {
            arr[i].img = "./public/images/imgplaceholder.png";
        }
    }
    return arr;
}

const setSubType = (arr) => {
    for(var i = 0; i < arr.length; i++) {
        switch (arr[i].subscriptionType) {
            case 0: 
                arr[i].subscriptionTypeText = "Basic";
                break;
            case 1: 
                arr[i].subscriptionTypeText = "MKB";
                break;
            case 4: 
                arr[i].subscriptionTypeText = "Enterprise";
                break;
        }
    }
    arr.splice(2,2);
    return arr;
}

const sendMailUser = (email, lang) => {
    let options;
    if(lang == "nl") {
        let outputNL = emails.buildSelfServiceUserEmailNL();

        options = {
            from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
            to: email,
            subject: "Je aanvraag is in behandeling",
            text: "",
            html: outputNL
        }
    } else {
        let outputEN = emails.buildSelfServiceUserEmailEN();

        options = {
            from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
            to: email,
            subject: "Your request is pending",
            text: "",
            html: outputEN
        }
    }

    sgMail.send(options)
}