import axios from 'axios';

// Declare email and password regex
const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;

export function getLogin(req, res) {

    res.render('login', {
        error: false
    });

}

export function postLogin(req, res) {
    
    const { email, password } = req.body;
    
    // If email or password doesn't match with pattern 
    if (!EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password)) {
        res.render('login', {
            error: 'genericError'
        });
    } 
    // Execute login serverless
    else {
        axios.post('http://localhost:7071/api/login', {
            email: email,
            password: password
        }).then((response) => {
            // Check if there is an error
            if (response.data.error) {
                res.render('login', {
                    error: response.data.error
                });
            } 
            // Login successful
            else {
                req.session.user = response.data;
                req.session.save();
                // Redirect to homepage
                res.redirect('/');
            }
        }, (error) => {
            res.render('login', {
                error: 'genericError'
            });
        });
    }
    
}