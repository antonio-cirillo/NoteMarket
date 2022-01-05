export default (req, res, next) =>  {
    // If user are logged
    if (req.session.user) {
        // If moderator are logged
        if (req.session.user.moderator) {
            // Redirect to home page
            res.redirect('/');
            return;
        }
    }
    
    next();
}