export function getIndex(req, res) {
    
    // If user is logged 
    if (req.session.user) {
        if (req.session.moderator) {
            console.log("You are moderator");
        } else {
            res.render('userHome', {
                error: (req.query.error) ? req.query.error : '',
                confirm: (req.query.confirm) ? req.query.confirm : '',
                user: req.session.user
            })
        }
    } 
    // If user is not logged
    else {
        res.render('index');
    }

}