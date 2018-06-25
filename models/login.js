module.exports = (req, res) => {   
        if (req.session.user) {
            next();     //If session exists, proceed to page
        } else {
            var err = new Error("Not logged in!");
            console.log(req.session.user);
            next(err);  //Error, trying to access unauthorized page!
        }
}