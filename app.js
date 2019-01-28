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
const superagent        = require('superagent');
const request           = require('request');
const promRequest       = require('request-promise');

const app = express();
const sessionStore = new session.MemoryStore;

// Setup Firebase
// var config = {
//     apiKey: process.env.FB_API_KEY,
//     authDomain: process.env.FB_AUTH_DOMAIN,
//     databaseURL: process.env.FB_DATABASE_URL,
//     storageBucket: process.env.FB_PROCESS_BUCKET
// }
// firebase.initializeApp(config);
// const db = firebase.database();
// app.use((req, res, next) => {
//     req.db = db;
//     next();
// });

// Setup language
app.use(i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ['en', 'nl'],
    textsVarName: 'translation'
}));

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

app.get('/', (req, res) => {
    res.render('home', {
        title: "FlexForceMonkey | Systemintegration as a Service",
        desc: "One platform where temps agency, flex client, self-employed professional and consulting firm work together on an efficient and transparant process",
        img: "./public/images/screenshot.png"
    });
});

app.get('/blogs', (req, res) => {
    request('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts?_embed=true&per_page=100', (err, resp, body) => {
        var temp = JSON.parse(body);
        temp = getBlogPerLang(req.cookies.ulang, temp);
        res.send(temp);
    });
});

app.get('/integration', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=100')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getBlogPerLang(req.cookies.ulang, tempBlogs);
            res.cookie('role', 'integration').render('hirer', {
                title: "FlexForceMonkey | Integration",
                desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                img: "./public/images/hirer.jpg",
                blogs: blogs
            });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            res.cookie('role', 'integration').render('hirer', {
                title: "FlexForceMonkey | Integration",
                desc: "So your dream is about a fully automated flex supply chain? You want to run the lead in a process without unnecessary supplier lock-in? We think that dream makes sense! Join the collaborative flex experience. Join the collaborative flex experience!",
                img: "./public/images/hirer.jpg",
                blogs: null
            });
        });
});
app.get('/supplier', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=100')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getBlogPerLang(req.cookies.ulang, tempBlogs);
            res.cookie('role', 'supplier').render('supplier', {
                title: "FlexForceMonkey | Temp staffing/Consulting firm",
                desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                img: "./public/images/supplier.jpg",
                blogs: blogs
            });
        })
        .catch(() => {
            if(req.cookies.ulang == "nl") {
                req.flash('error', 'Er is iets mis gegaan met het ophalen van de blogs. Onze excuses.');
            } else {
                req.flash('error', 'Something went wrong retrieving the blogs. Our apologies.');
            }
            res.cookie('role', 'supplier').render('supplier', {
                title: "FlexForceMonkey | Temp staffing/Consulting firm",
                desc: "Stop operations battles on PO numbers and billable hours that do not fit in the labor agreement: join the collaborative flex experience",
                img: "./public/images/supplier.jpg",
                blogs: null
            });
        });    
});
app.get('/freelancer', (req, res) => { 
    promRequest('http://flexjungle.flexforcemonkey.com/wp-json/wp/v2/posts/?_embed=true&per_page=100')
        .then((blogRes) => {
            var tempBlogs = JSON.parse(blogRes);
            var blogs = getBlogPerLang(req.cookies.ulang, tempBlogs);
            promRequest('https://api.flexforcemonkey.com/api/Subscriptions')
                .then((subRes) => {
                    var tempSubs = JSON.parse(subRes);
                    var subs = setSubType(tempSubs);
                    res.cookie('role', 'freelancer').render('freelancer', {
                        title: "FlexForceMonkey | Boutique firm/SEP",
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
                    res.cookie('role', 'freelancer').render('freelancer', {
                        title: "FlexForceMonkey | Boutique firm/SEP",
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
                    res.cookie('role', 'freelancer').render('freelancer', {
                        title: "FlexForceMonkey | Boutique firm/SEP",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: null,
                        subs: subs
                    });
                })
                .catch(() => {
                    res.cookie('role', 'freelancer').render('freelancer', {
                        title: "FlexForceMonkey | Boutique firm/SEP",
                        desc: "Surely you once started out to create added value? We are positive it was not your dream to be busy with doing your administration! Join the collaborative flex experience",
                        img: "./public/images/freelancer.jpg",
                        blogs: null,
                        subs: null
                    });
                });
        });  
});

// app.get('/ebook', (req, res) => {
//     res.render('ebookpage', {
//         title: "eBook | Titel eBook",
//         desc: "Want to know everything about ...? Download our eBook!",
//         img: "./public/images/ebook.jpg"
//     });
// });

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

// Request for ebook
// app.post('/get-ebook', (req, res) => {
//     let output;
//     let pathBook;
//     if(req.cookies.ulang == "nl") {
//         output = `
//             <h1>Hier is je eBook!</h1>
//             <p>${req.body.email}</p>
//             <p>Je hebt op <a href="http://flexforcemonkey.com/">FlexForceMonkey.com</a> een eBook aangevraagd. Hij zit als bijlage bij deze mail!</p>
//             <p>Heb je nog vragen? Neem gerust contact met ons op!</p>
//         `;
//         pathBook = './public/files/ebook-nl.pdf';
//     } else {
//         output = `
//             <h1>Here is your eBook!</h1>
//             <p>${req.body.email}</p>
//             <p>You've requested on <a href="http://flexforcemonkey.com/">FlexForceMonkey.com</a> an eBook. You can find it as an attachment!</p>
//             <p>Any questions? Don't hesitate to contact us!</p>
//         `;
//         pathBook = './public/files/ebook-en.pdf'
//     }

//     let HelperOptions = {
//         from: '"FlexForceMonkey" <noreply@flexforcemonkey.com>',
//         to: 'wendy.dimmendaal@again.nl',
//         subject: 'FlexForceMonkey eBook',
//         text: 'Test 123',
//         html: output,
//         attachments: [
//             {
//                 path: pathBook
//             }
//         ]
//     };

//     // If hidden field is filled, its a spam mail and we don't send it
//     if(req.body.url === "" && req.body.url.length == 0) {
//         transporter.sendMail(HelperOptions, (error, info) => {
//             if(error) {
//                 req.flash('error', 'Something went wrong: ' + error);
//             } else {
//                 req.flash('success', 'You can find your eBook in your mailbox!');
//                 res.redirect(req.get('referer'));
//             }
//         });
//     }
// });

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
    console.log('Server started...');
});

const getFeaturedImage = (arr) => {
    if( arr._embedded['wp:featuredmedia'] != undefined ) {
        var img = arr._embedded['wp:featuredmedia'][0].source_url;
        arr.img = img;
    } else {
        arr.img = "./public/images/imgplaceholder.png";
    }
    return arr.img;
}

const getBlogPerLang = (lang, arr) => {
    var tempArr = [];
    if(lang == "nl") {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].id == 4388) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            } else if(arr[i].id == 4373) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            } else if(arr[i].id == 4292) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            }
        }
    } else {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].id == 4380) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            } else if(arr[i].id == 4365) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            } else if(arr[i].id == 4358) {
                arr[i].img = getFeaturedImage(arr[i]);
                tempArr.push(arr[i]);
            }
        }
    }
    return tempArr;
}

const setSubType = (arr) => {
    for(var i = 0; i < arr.length; i++) {
        switch (arr[i].subscriptionType) {
            case 0: 
                arr[i].subscriptionTypeText = "Basic";
                break;
            case 1: 
                arr[i].subscriptionTypeText = "Basic+";
                break;
            case 2: 
                arr[i].subscriptionTypeText = "SmallBusiness";
                break;
            case 3: 
                arr[i].subscriptionTypeText = "MediumBusiness";
                break;
            case 4: 
                arr[i].subscriptionTypeText = "Enterprise";
                break;
        }
    }
    return arr;
}