// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory, InputHints } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { LoginDialog, LOGIN_DIALOG } = require('./loginDialog');
const { PurchasesDialog, PURCHASES_DIALOG } = require('./purchasesDialog');
const { CommentDialog, COMMENT_DIALOG } = require('./commentDialog');

const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
var dialogState;
var isUserLoggedIn = false;
var userInfo;

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        this.addDialog(new LoginDialog('loginDialog', userState))
            .addDialog(new PurchasesDialog('purchasesDialog', userInfo))
            .addDialog(new CommentDialog('commentDialog', userInfo))
            .addDialog(new ChoicePrompt('cardPrompt'))
            .addDialog(new TextPrompt('textPrompt'))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.initialStep.bind(this),
                this.invokeStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        const options = {
            prompt: 'Cosa possiamo fare per te?',
            retryPrompt: 'La risposta non è valida, riprova.',
            choices: this.getChoices()
        };
        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }

    async invokeStep(stepContext){
        dialogState = stepContext.result.value;
        switch (stepContext.result.value) {
            case 'Login':
                if(!isUserLoggedIn){
                    return await stepContext.beginDialog(LOGIN_DIALOG, this.userState);
                }
                else{
                    const messageText = 'Utente già loggato';
                    const msg = MessageFactory.text(messageText, messageText, InputHints.IgnoringInput);
                    return await stepContext.prompt('textPrompt', { prompt: msg });
                }
            case 'Visualizza acquisti':
                if(!isUserLoggedIn){
                    const messageText = 'Per usare questa funzionalità è necessario effettuare il login.';
                    const msg = MessageFactory.text(messageText, messageText, InputHints.IgnoringInput);
                    return await stepContext.prompt('textPrompt', { prompt: msg });
                }
                return await stepContext.beginDialog('purchaseDialog', userInfo);
            case 'Scrivi recensione':
                if(!isUserLoggedIn){
                    const messageText = 'Per usare questa funzionalità è necessario effettuare il login.';
                    const msg = MessageFactory.text(messageText, messageText, InputHints.IgnoringInput);
                    return await stepContext.prompt('textPrompt', { prompt: msg });
                }
                return await stepContext.beginDialog('commentDialog', userInfo);
            case 'Revisione':
                if(!isUserLoggedIn || !userInfo.moderator){
                    const messageText = 'Per usare questa funzionalità è necessario effettuare il login ed essere un moderatore.';
                    const msg = MessageFactory.text(messageText, messageText, InputHints.IgnoringInput);
                    return await stepContext.prompt('textPrompt', { prompt: msg });
                }
                return await stepContext.beginDialog(/*TODO: Inserire nome dialogo qui */'fakeName', userInfo);
        }
    }

    async finalStep(stepContext) {
        //Saves the login details only if the user is not logged-in and the selected option is Login
        if(dialogState == 'Login' && !isUserLoggedIn){
            userInfo = stepContext.result;
            await this.userProfileAccessor.set(stepContext.context, userInfo);
            isUserLoggedIn = true;
        }
        return await stepContext.endDialog();
    }

    getChoices() {
        var cardOptions;
        if(userInfo.moderator && isUserLoggedIn){
            cardOptions = [
                {
                    value: 'Revisione',
                    synonyms: []
                }
            ];
        }
        if(!userInfo.moderator && isUserLoggedIn){
            cardOptions = [
                {
                    value: 'Visualizza acquisti',
                    synonyms: ['acquisti', 'ordini']
                },
                {
                    value: 'Scrivi recensione',
                    synonyms: ['recensione', 'recensioni']
                }
            ];
        }
        if(!isUserLoggedIn){
            cardOptions = [
                {
                    value: 'Login',
                    synonyms: ['login', 'accesso']
                }
            ];
        }
        return cardOptions;
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;