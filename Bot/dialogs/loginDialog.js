const { MessageFactory, InputHints } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog,
    ThisMemoryScope
} = require('botbuilder-dialogs');

const axios = require('axios');
require('dotenv').config();

const LOGIN_DIALOG = 'LOGIN_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE = 'USER_PROFILE';

const EMAIL_REGEX = /^[a-zA-Z0-9]{1}[.!#$%&'*+/=?^_`{|}~a-zA-Z0-9-]{0,99}@[a-zA-Z0-9]{1,46}\.[a-zA-Z]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,16}$/;

class LoginDialog extends ComponentDialog {
    constructor(id, userState) {
        super(LOGIN_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.emailStep.bind(this),
            this.checkEmailStep.bind(this),
            this.passwordStep.bind(this),
            this.checkPasswordStep.bind(this),
            this.loginStep.bind(this),
        ]));

        this.initialDialogId = WATERFALL_DIALOG;

    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }


    async emailStep(step) {

        const messageText = 'Inserisci la tua email';
        const msg = MessageFactory.text(
            messageText,
            messageText,
            InputHints.ExpectingInput);

        return await step.prompt(TEXT_PROMPT, {
            prompt: msg
        });
    
    }

    async checkEmailStep(step) {

        const email = step.result;

        if(!EMAIL_REGEX.test(email)) {
            await step.context.sendActivity(
                "L'email inserita non è valida. Operazione annulata!"
            );
            return await step.replaceDialog(LOGIN_DIALOG);
        }

        step.values.user = { email: email };
        return await step.next(step);

    }

    async passwordStep(step) {

        const messageText = 'Inserisci la tua password';
        const msg = MessageFactory.text(
            messageText,
            messageText,
            InputHints.ExpectingInput);

        return await step.prompt(TEXT_PROMPT, {
            prompt: msg
        });
        
    }

    async checkPasswordStep(step) {

        const password = step.result;

        if(!PASSWORD_REGEX.test(password)) {
            await step.context.sendActivity(
                "La password inserita non è valida. Operazione annulata!"
            );
            return await step.replaceDialog(LOGIN_DIALOG);
        }

        step.values.user.password = password;
        return await step.next(step);

    }

    async loginStep(step) {

        try {

            const response = await axios.post(process.env.URL_FUNCTION_LOGIN, step.values.user);

            if (response.data.error) {
                if (response.data.error == 'credentialError') {
                    await step.context.sendActivity(
                        "Email e/o password errati. Operazione annulata!"
                    );
                    return await step.replaceDialog(LOGIN_DIALOG);
                } else {
                    await step.context.sendActivity(
                        "Ops! Qualcosa è andato storto. Operazione annulata!"
                    );
                    return await step.replaceDialog(LOGIN_DIALOG);
                }
            }

            const user = response.data;
            await step.context.sendActivity(
                `Login effeattuato con successo.\n` +
                `Bentornato ${user.name} ${user.surname}, felice di rivederti!`
            )
            return await step.endDialog(response.data);

        } catch (error) {
            await step.context.sendActivity(
                "Ops! Qualcosa è andato storto. Operazione annulata!"
            );
            return await step.replaceDialog(LOGIN_DIALOG);
        }

    }

}

module.exports.LoginDialog = LoginDialog;
module.exports.LOGIN_DIALOG = LOGIN_DIALOG;
