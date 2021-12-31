import axios from 'axios';

export function getActiveAccount(req, res) {

     // If token is passed
    if (req.query.token != null) {

        // Execute active serverless
        axios.post(process.env.URL_FUNCTION_ACTIVE_ACCOUNT, {
            token: req.query.token
        }).then((response) => {
            // Check if there is an error
            if (response.data.error) {
                res.redirect('./login?error=generic');
                return;         
            }
            // If there isn't an error
            else {
                res.redirect('./login?confirm=verify');
                return;                  
            }
        }, (error) => {
            res.redirect('./login?error=generic');
            return;
        });

    } else {
        res.redirect('./login');
        return;
    }

}