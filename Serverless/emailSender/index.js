const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = async function (context, req) {

    // Get email, subject and body
    const email = (req.query.email || (req.body && req.body.email));
    const subject = (req.query.subject || (req.body && req.body.subject));
    const body = (req.query.body || (req.body && req.body.body));

    // Login to gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Create message
    const message = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: body
    };

    // Send email
    try {
        await transporter.sendMail(message);
        context.res = { body: { error: false } };
        return;
    } catch (error) {
        context.res = { body: { error: true } };
        return;
    }
    
}