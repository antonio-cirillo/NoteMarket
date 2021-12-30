export default (req, res, next) =>  {
    // If user are logged
    if (!req.session.user) {
        // Redirect to home page
        res.redirect('/login');
        return;
    }
    
    next();
}