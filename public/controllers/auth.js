module.exports = {
    isAuthenticated: (req, res, next) => {
        var user = firebase.auth().currentUser;
        if (user !== null) {
            req.user = user;
            console.log(user);
            next();
        } else {
            // res.redirect('/');
        }
    }
}