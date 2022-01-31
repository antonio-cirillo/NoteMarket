export function allLogout(req, res) {
    // Destroy session
    req.session.destroy();
    res.redirect('./');
}