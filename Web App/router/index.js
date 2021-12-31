export function getIndex(req, res) {
    
    // If user is logged 
    if (req.session.user) {
        console.log(req.session.user);
    } 
    // If user is not logged
    else {
        res.render('index');
    }

}