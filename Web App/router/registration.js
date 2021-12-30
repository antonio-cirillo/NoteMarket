import axios from 'axios';
import crypto from 'crypto';

// Declare email, password, name and surname regex
const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;
const NAME_SURNAME_REGEX = /^[A-Za-z][a-zA-Z\s]{1,13}[A-Za-z]$/;

export function getRegistration(req, res) {

    res.render('registration', {
        error: false,
        messageError: ""
    });

}

function toDate(dateStr) {
	let parts = dateStr.split("-");
	parts[0] = parseInt(parts[0]);
  	return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

export function postRegistration(req, res) {

    const { name, surname, email, dob, 
        password, confirmPassword, policy } = req.body;

    // If parameter doesn't match with pattern
    if (!NAME_SURNAME_REGEX.test(name) || !NAME_SURNAME_REGEX.test(surname) ||
        !EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password)) {
            res.render('registration', {
                error: true,
                messageError: "Errore nella compilazione di uno/o più campi"
            });
            return;
    }

    // Check on date
    const date = toDate(dob);
	const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
   	const max = new Date(year - 16, month, day);
	const min = new Date(year - 100, month, day);
    if(date <= min || max < date) {
        res.render('registration', {
            error: true,
            messageError: "Devi avere almeno 16 anni per effettuare la registrazione"
        });
        return;
    }

    // If password and confirmPassword doesn't match
    if (password != confirmPassword) {
        res.render('registration', {
            error: true,
            messageError: "Le password non corrispondono"
        });
        return;
    }

    // If user doesn't accept policy
    if (policy != 'on') {
        res.render('registration', {
            error: true,
            messageError: "Devi prima accettare le condizioni d'uso"
        });
        return;
    }

    // Execute registration serverless
    axios.post('http://localhost:7071/api/registration', {

    }).then((response) => {

    }, (error) => {
        res.render('registration', {
            error: true,
            messageError: "Ops! Qualcosa è andato storto"
        });
        return;
    })

    crypto.randomBytes(20, (err, buf) => {
        console.log(buf.toString('hex'));
    });

}