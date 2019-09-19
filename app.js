require('dotenv').config();
const express                   = require('express');
const bodyParser                = require('body-parser');
const cookieParser              = require('cookie-parser');
const session                   = require('express-session');
const flash                     = require('express-flash');
const exphbs                    = require('express-handlebars');
const {check, validationResult}  = require('express-validator/check');
const {sanitizeBody}            = require('express-validator/filter');
const path                      = require('path');
const nodemailer                = require('nodemailer');
const i18n                      = require('i18n-express');
const superagent                = require('superagent');
const request                   = require('request');
const promRequest               = require('request-promise');
const emails                    = require('./emails');
const http                      = require('http');
const uri                       = require('url');

const app = express();
const sessionStore = new session.MemoryStore;

// Setup Firebase
//https://console.firebase.google.com/project/ffm-website/overview
// var config = {
//     apiKey: process.env.FB_API_KEY,
//     authDomain: process.env.FB_AUTH_DOMAIN,
//     databaseURL: process.env.FB_DATABASE_URL,
//     storageBucket: process.env.FB_PROCESS_BUCKET,
//     messagingSenderId: process.env.FB_MESSAGING_SENDER_ID
// }
// firebase.initializeApp(config);
// const db = firebase.database();
// app.use((req, res, next) => {
//     req.db = db;
//     next();
// });

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

// Settings for mail
const transporter = nodemailer.createTransport({
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

// Flash Middleware
app.use(flash());

app.get('/testhome', (req, res) => {
    res.render('temphome', {
        title: "FlexForceMonkey | Business network for Flex",
        desc: "One platform where temps agency, flex client, self-employed professional and consulting firm work together on an efficient and transparant process",
        img: "./public/images/screenshot.jpg"
    })
})

app.get('/', (req, res) => {
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            res.render('home', {
                title: "FlexForceMonkey | Business network for Flex",
                desc: "One platform where temps agency, flex client, self-employed professional and consulting firm work together on an efficient and transparant process",
                img: "./public/images/screenshot.jpg",
                blogposts: blogs
            });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            res.render('home', {
                title: "FlexForceMonkey | Business network for Flex",
                desc: "One platform where temps agency, flex client, self-employed professional and consulting firm work together on an efficient and transparant process",
                img: "./public/images/screenshot.jpg",
                blogs: null
            });
        });    
});

app.get('/partners', (req, res) => {
    res.render('partners', {
        title: "FlexForceMonkey | Partners",
        desc: "About our partners",
        img: "./public/images/screenshot.jpg",
    });
})

app.get('/blogs', (req, res) => {
    request('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts?_embed=true&per_page=3', (err, resp, body) => {
        var temp = JSON.parse(body);
        temp = getFeaturedImage(temp);
        res.send(temp);
    });
});

app.get('/integration-services', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBblogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'integration-services').render('integration', {
                        title: "FlexForceMonkey | Integration services",
                        desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                        img: "./public/images/hirer.jpg",
                        blogs: blogs,
                        subs: subs
                    });
                })
                .catch(() => {
                    if(req.cookies.ulang == "nl") {
                        req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
                    } else {
                        req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
                    }
                    res.cookie('role', 'integration-services').render('integration', {
                        title: "FlexForceMonkey | Integration services",
                        desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                        img: "./public/images/hirer.jpg",
                        blogs: blogs,
                        subs: null
                    });
                });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
            .then((subRes) => {
                var tempSubs = JSON.parse(subRes);
                var subs = setSubType(tempSubs);
                res.cookie('role', 'integration-services').render('integration', {
                    title: "FlexForceMonkey | Integration services",
                    desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                    img: "./public/images/hirer.jpg",
                    blogs: null,
                    subs: subs
                });
            })
            .catch(() => {
                if(req.cookies.ulang == "nl") {
                    req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
                } else {
                    req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
                }
                res.cookie('role', 'integration-services').render('integration', {
                    title: "FlexForceMonkey | Integration services",
                    desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                    img: "./public/images/hirer.jpg",
                    blogs: null,
                    subs: null
                });
            });
        });
});
app.get('/hirer', (req, res) => {
    res.redirect('/integration-services');
});
app.get('/selfservice-subscribe', (req, res) => {
    let sub;
    if(req.query.sub == 'intbuy' || req.query.sub == 'intsel' || req.query.sub == 'clabuy' || req.query.sub == 'clasel' || req.query.sub == 'selclaint') {
        sub = req.query.sub;
    } else {
        sub = 'intbuy';
    }
    res.render('subscribe', {
        title: "FlexForceMonkey | Subscribe",
        desc: "Subscribe to FlexForceMonkey",
        img: "./public/images/supplier.jpg",
        year: new Date().getFullYear(),
        layout: 'empty.handlebars',
        sub: sub
    });
});
app.get('/cla-engine', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBblogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'cla-engine').render('claengine', {
                        title: "FlexForceMonkey | Cla evaluator",
                        desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                        img: "./public/images/supplier.jpg",
                        blogs: blogs,
                        subs: subs
                    });
                })
                .catch(() => {
                    if(req.cookies.ulang == "nl") {
                        req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
                    } else {
                        req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
                    }
                    res.cookie('role', 'cla-engine').render('claengine', {
                        title: "FlexForceMonkey | Cla evaluator",
                        desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                        img: "./public/images/supplier.jpg",
                        blogs: blogs,
                        subs: null
                    });
                });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'cla-engine').render('claengine', {
                        title: "FlexForceMonkey | Cla evaluator",
                        desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                        img: "./public/images/supplier.jpg",
                        blogs: null,
                        subs: subs
                    });
                })
                .catch(() => {
                    if(req.cookies.ulang == "nl") {
                        req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
                    } else {
                        req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
                    }
                    res.cookie('role', 'cla-engine').render('claengine', {
                        title: "FlexForceMonkey | Cla evaluator",
                        desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                        img: "./public/images/supplier.jpg",
                        blogs: null,
                        subs: null
                    });
                });
        });    
});
app.get('/supplier', (req, res) => {
    res.redirect('/cla-engine');
});
app.get('/online-software', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=3')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getFeaturedImage(tempBlogs);
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'online-software').render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: blogs,
                        subs: subs
                    });
                })
                .catch(() => {
                    if(req.cookies.ulang == "nl") {
                        req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
                    } else {
                        req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
                    }
                    res.cookie('role', 'online-software').render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: blogs,
                        subs: null
                    });
                });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de data. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the data. Our apologies.');
            }
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'online-software').render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: null,
                        subs: subs
                    });
                })
                .catch(() => {
                    res.cookie('role', 'online-software').render('onlinesoftware', {
                        title: "FlexForceMonkey | Online software",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: null,
                        subs: null
                    });
                });
        });  
});
app.get('/freelancer', (req, res) => {
    res.redirect('/online-software');
});

app.get('/ebook', (req, res) => {
    res.render('ebookpage', {
        title: "eBook | Ontvlooien van inkoopsystemen en uitzendprocessen",
        desc: "In dit e-book wordt gekeken naar het Purchase to Pay proces van opdrachtgevers, door de ogen van een uitzender.",
        img: "./public/images/ebook.jpg"
    });
});

app.get('/termsandconditions', (req, res) => {
    res.render('termsandconditions', {
        partial: 'terms',
        title: "FlexForceMonkey | Terms and Conditions",
        desc: "Terms and Conditions (Dutch) of FlexForceMonkey, May 2018",
        img: "./public/images/screenshot.png"
    });
});
app.get('/gdpr', (req, res) => {
    res.render('termsandconditions', {
        partial: 'gdpr',
        title: "FlexForceMonkey | GDPR Provisions",
        desc: "GDPR Provisions (Dutch) of FlexForceMonkey, May 2018",
        img: "./public/images/screenshot.png"
    });
});
app.get('/generalconsiderations', (req, res) => {
    res.render('termsandconditions', {
        partial: 'gencons',
        title: "FlexForceMonkey | General Remarks",
        desc: "General Remarks (Dutch) of FlexForceMonkey, May 2018",
        img: "./public/images/screenshot.png"
    })
});
app.get('/feedback', (req,res) => {
    let score = req.query.score;
    let sent = req.query.sent;
    res.render('feedback', {
        title: "FlexForceMonkey | Feedback",
        desc: "Give us feedback",
        img: "./public/images/screenshot.png",
        score: score,
        sent: sent,
        lang: req.cookies.ulang
    }); 
});

// app.get('/sluitjeaan', (req, res) => {
//     res.render('connect');
// });

// Send connection kit request
// app.post('/sendconnectkit', (req, res) => {
//     let output = `
//         <h1>Iemand vraagt een aansluitkit aan</h1>
//         <h2>Details:</h2>
//         <ul>
//             <li>Naam: ${req.body.name}</li>
//             <li>Email: ${req.body.email}</li>
//             <li>Telefoon: ${req.body.phone}</li>
//             <li>Bedrijfsnaam: ${req.body.compname}</li>
//             <li>Straat + nummer: ${req.body.street} ${req.body.number}</li>
//             <li>Postcode: ${req.body.postal}</li>
//             <li>Plaats: ${req.body.city}</li>
//             <li>Opmerkingen: ${req.body.notes}</li>
//             <li>Email adres mag gebruikt worden voor nieuwsbrieven: ${req.body.newsletters}</li>
//             <li>Email adres mag gebruikt worden voor product updates: ${req.body.productUpdates}</li>
//             <li>Email adres mag gebruikt worden voor gericht individueel commercieel contact: ${req.body.individualContact}</li>
//         </ul>
//     `;
    
//     let HelperOptions = {
//         from: '"Aansluitkit request" <noreply@flexforcemonkey.com>',
//         to: 'doede.van.haperen@lakran.com',
//         //to: 'wendy.dimmendaal@again.nl',
//         subject: 'Aansluitkit request',
//         text: 'Test 123',
//         html: output
//     };

//     // If hidden field is filled, its a spam mail and we don't send it
//     if(req.body.url === "" && req.body.url.length == 0) {
//         transporter.sendMail(HelperOptions, (error, info) => {
//             if(error) {
//                 req.flash('error', 'Something went wrong: ' + error);
//             } else {
//                 req.flash('success', 'Je aansluitkit is aangevraagd!');
//                 res.redirect(req.get('referer'));
//             }
//         });
//     }
// });

// Send contactform
app.post('/send', (req, res) => {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + process.env.RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    let output = emails.buildContactEmail(req.body.name, req.body.email, req.body.subject, req.cookies.role, req.body.msg, req.cookies.ulang);
    
    let HelperOptions = {
        from: '"Contact Form FFM website" <noreply@flexforcemonkey.com>',
        to: 'doede.van.haperen@lakran.com',
        //to: 'wendy.dimmendaal@again.nl',
        subject: 'Reactie contactform FFM.com',
        text: 'Test 123',
        html: output
    };

    request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
            } else {
                req.flash('error', 'Something went wrong with recaptcha: ' + error);
            }
            res.redirect(req.get('referer') + "#contact");
        } else {
            transporter.sendMail(HelperOptions, (errorMail, info) => {
                if(errorMail) {
                    if(req.cookies.ulang == "nl") {
                        req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + errorMail)
                    } else {
                        req.flash('error', 'Something went wrong with sending the email: ' + errorMail);
                    }
                    res.redirect(req.get('referer') + "#contact");
                } else {
                    req.flash('success', 'Thanks for the message! We\'ll be in touch');
                    res.redirect(req.get('referer') + "#contact");
                }
            });
        }
    });
});

// Request selfservice form via integration services
app.post('/selfservice-subscribe', [check('termsconditions').equals('on'), check('avg').equals('on')], (req, res) => {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + process.env.RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    let output = emails.buildSelfServiceFFMEmail(req.cookies.ulang, req.body.email, req.body.companyname, req.body.firstname, req.body.lastname, req.body.emailnewsletters, req.body.emailproductupdates, req.body.emailcomcontact, req.body.sub);
    
    let HelperOptions = {
        from: '"Aanvraag" <noreply@flexforcemonkey.com>',
        to: 'doede.van.haperen@lakran.com',
        //to: 'wendy.dimmendaal@again.nl',
        subject: 'Aanvraag voor aansluiting',
        text: 'Test 123',
        html: output
    };

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        if(req.cookies.ulang == "nl") {
            req.flash('error', 'Je moet de algemene voorwaarden en bepalingen AVG lezen en accepteren voor je verder kunt gaan!')
        } else {
            req.flash('error', 'You need to read and accept the terms and conditions and GDPR provisions before you can register!');
        }
        res.redirect(req.get('referer'));
    } else {
        request(recaptcha_url, function(error, resp, body) {
            body = JSON.parse(body);
            if(body.success !== undefined && !body.success) {
                if(req.cookies.ulang == "nl") {
                    req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
                } else {
                    req.flash('error', 'Something went wrong with recaptcha: ' + error);
                }
                res.redirect(req.get('referer'));
            } else {
                transporter.sendMail(HelperOptions, (errorMail, info) => {
                    if(errorMail) {
                        if(req.cookies.ulang == "nl") {
                            req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + errorMail)
                        } else {
                            req.flash('error', 'Something went wrong with sending the email: ' + errorMail);
                        }
                        res.redirect(req.get('referer'));
                    } else {
                        if(req.cookies.ulang == "nl") {
                            req.flash('success', 'Je aanvraag is verstuurd!')
                        } else {
                            req.flash('success', 'Your request has been sent!');
                        }
                        res.redirect(req.get('referer'));
                    }
                });
                sendMailUser(req.body.email, req.cookies.ulang);
            }
        });
    }
});

// Request for ebook
app.post('/get-ebook', (req, res) => {
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
                path: pathBook
            }
        ]
    };

    request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            res.redirect(req.get('referer'));
            req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
        } else {
            transporter.sendMail(HelperOptions, (errorMail, info) => {
                if(errorMail) {
                    req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + errorMail)
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'Je aanvraag is verstuurd!');
                    sendConfirmMail(req.body);
                    res.redirect(req.get('referer'));
                }
            });
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
        title: "Page not found",
        desc: "404: page not found",
        img: "./public/images/we-slipped.svg"
    });
})

var port = process.env.port || 3000;
app.listen(port, () => {
    console.log('Server started on port ' + port + '...');
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
        from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
        //to: "doede@flexforcemonkey.com",
        to: "wendy.dimmendaal@again.nl",
        subject: "Ebook download",
        text: "",
        html: output
    }
    transporter.sendMail(HelperOptions);
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

// const getBlogPerLang = (lang, arr) => {
//     var tempArr = [];
//     if(lang == "nl") {
//         for(var i = 0; i < arr.length; i++) {
//             if(arr[i].id == 4448) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             } else if(arr[i].id == 4436) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             } else if(arr[i].id == 4428) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             }
//         }
//     } else {
//         for(var i = 0; i < arr.length; i++) {
//             if(arr[i].id == 4453) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             } else if(arr[i].id == 4433) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             } else if(arr[i].id == 4431) {
//                 arr[i].img = getFeaturedImage(arr[i]);
//                 tempArr.push(arr[i]);
//             }
//         }
//     }
//     return tempArr;
// }

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

    transporter.sendMail(options);
}