const { MessageFactory, InputHints } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const MAIN_WATERFALL_DIALOG = 'loginWaterfallDialog';
const TEXT_PROMPT = 'loginTextprompt';
const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;
const userDetails = null;

class LoginDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'LoginDialog');
        userDetails = stepContext.options;
        // Define the main dialog and its related components.
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.emailStep.bind(this),
                this.checkEmailStep.bind(this),
                this.passwordStep.bind(this),
                this.loginStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    //Prompt the user to enter its credentials
    async emailStep(stepContext) {
         stepContext.values.accountDetails = {email: null, password: null};

        if (!accountDetails.email) {
            const messageText = 'Enter your email';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

            const repromptMessageText = "I'm sorry, a valid email is required to continue";
            const repromptMessage = MessageFactory.text(repromptMessageText, repromptMessageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { 
                prompt: msg, 
                retryPrompt: msg
            });
        }

        return await stepContext.next();
    }

    async checkEmailStep(stepContext){
        //If test fails reprompt the user for a new email
        if(!EMAIL_REGEX.test(stepContext.result)){
            const repromptMessageText = "I'm sorry, a valid email is required to continue";
            const repromptMessage = MessageFactory.text(repromptMessageText, repromptMessageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: repromptMessage });
        }
        return await stepContext.next(stepContext.result);
    }

    async passwordStep(stepContext) {
        stepContext.values.accountDetails.email = stepContext.result;

        if (!accountDetails.password) {
            const messageText = 'Enter your password';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next();
    }

    async checkPasswordStep(stepContext){
        //If test fails reprompt the user for a new password
        if(!PASSWORD_REGEX.test(stepContext.result)){
            const repromptMessageText = "La password inserita non rispetta il formato richiesto";
            const repromptMessage = MessageFactory.text(repromptMessageText, repromptMessageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: repromptMessage });
        }
        return await stepContext.next(stepContext.result);
    }

    async loginStep(stepContext) {
        stepContext.values.accountDetails.password = stepContext.result;
        try{
            const response = await axios.post(process.env.URL_FUNCTION_LOGIN, {
                email: stepContext.values.accountDetails.email,
                password: stepContext.values.accountDetails.password
            })
            if(response.data.error){
                //TODO: error handling
                if(response.data.error == "credentialError"){}
                else if(response.data.error == "notVerifiedError"){}
                else{}
            }
        }catch(error){}

        //TODO: put response.data in userDetails object
        return await stepContext.endDialog(response.data);
    }
}

module.exports.LoginDialog = LoginDialog;
