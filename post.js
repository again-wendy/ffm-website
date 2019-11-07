const sendContactForm = function(req, res) {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + process.env.RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;

    let output = emails.buildContactEmail(req.body.name, req.body.email, req.body.subject, req.cookies.role, req.body.msg, req.cookies.ulang);
    
    let HelperOptions = {
        from: '"Contact Form FFM website" <noreply@flexforcemonkey.com>',
        //to: 'doede@flexforcemonkey.com',
        to: 'wendy.dimmendaal@again.nl',
        subject: 'Reactie contactform FFM.com',
        text: 'Test 123',
        html: output
    };

    request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            req.flash('error', 'Er is iets mis gegaan met de recaptcha: ' + error);
            res.redirect(req.get('referer') + "#contact");
        } else {
            transporter.sendMail(HelperOptions, (errorMail, info) => {
                if(errorMail) {
                    req.flash('error', 'Er is iets mis gegaan met het verzenden van de email: ' + errorMail)
                    res.redirect(req.get('referer') + "#contact");
                } else {
                    req.flash('success', 'Thanks for the message! We\'ll be in touch');
                    res.redirect(req.get('referer') + "#contact");
                }
            });
        }
    });
}

module.exports = {
    sendContactForm
}