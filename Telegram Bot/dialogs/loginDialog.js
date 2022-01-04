const { MessageFactory, InputHints } = require('botbuilder');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const MAIN_WATERFALL_DIALOG = 'loginWaterfallDialog';
const TEXT_PROMPT = 'TextPrompt';
const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;
var userDetails = null;

class LoginDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'LoginDialog');
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
        console.log('[LoginDialog]: emailStep');
        //Initialize userDetails and accountDetails objects
        console.log('[LoginDialog]: emailStep -> Inizializzo userDetails');
        userDetails = stepContext.options;
        console.log('[LoginDialog]: emailStep -> Inizializzo accountDetails');
        stepContext.values.accountDetails = {email: null, password: null};

        //Check if the email field is empty and prompt for a valid email
        //otherwise the dialog continues with the provided email
        if (!stepContext.values.accountDetails.email) {
            console.log('[LoginDialog]: emailStep -> email non presente, creo il prompt');
            const messageText = 'Inserisci la tua email';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            
            return await stepContext.prompt(TEXT_PROMPT, { 
                prompt: msg
            });
        }

        return await stepContext.next(stepContext.values.accountDetails.email);
    }

    async checkEmailStep(stepContext){
        console.log('[LoginDialog]: checkEmailStep');
        //If test fails reprompt the user for a new email
        if(!EMAIL_REGEX.test(stepContext.result)){
            const repromptMessageText = "Mi dispiace, per eseguire il login è richiesta una email valida";
            const repromptMessage = MessageFactory.text(repromptMessageText, repromptMessageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: repromptMessage });
        }
        return await stepContext.next(stepContext.result);
    }

    async passwordStep(stepContext) {
        console.log('[LoginDialog]: passwordStep');
        stepContext.values.accountDetails.email = stepContext.result;

        if (!stepContext.values.accountDetails.password) {
            const messageText = 'Inserisci la tua password';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(stepContext.values.accountDetails.password);
    }

    async checkPasswordStep(stepContext){
        console.log('[LoginDialog]: checkPasswordStep');
        //If test fails reprompt the user for a new password
        if(!PASSWORD_REGEX.test(stepContext.result)){
            const repromptMessageText = "La password inserita non rispetta il formato richiesto, riprova";
            const repromptMessage = MessageFactory.text(repromptMessageText, repromptMessageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: repromptMessage });
        }
        return await stepContext.next(stepContext.result);
    }

    async loginStep(stepContext) {
        console.log('[LoginDialog]: loginStep');
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

        //Put response.data in userDetails object
        userDetails = response.data
        return await stepContext.endDialog(response.data);
    }
}

module.exports.LoginDialog = LoginDialog;
