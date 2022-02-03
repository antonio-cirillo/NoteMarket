// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { QnAMaker } = require('botbuilder-ai');
const { MessageFactory, InputHints } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { PurchasesDialog, PURCHASES_DIALOG } = require('./purchasesDialog');
const { CommentDialog, COMMENT_DIALOG } = require('./commentDialog');
const { ApproveItemsDialog, APPROVE_ITEMS_DIALOG } = require('./approveItemsDialog')

const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
var userInfo;

class MainDialog extends ComponentDialog {
    constructor(userState, QnAConfig, qnaOptions) {
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.userProfile = {initialized: false};

        // now create a QnAMaker connector.
        this.qnaMaker = new QnAMaker(QnAConfig, qnaOptions);

        this.addDialog(new PurchasesDialog(PURCHASES_DIALOG, userInfo))
            .addDialog(new CommentDialog(COMMENT_DIALOG, userInfo))
            .addDialog(new ApproveItemsDialog(APPROVE_ITEMS_DIALOG, userInfo))
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
        this.userProfile = await this.userProfileAccessor.get(turnContext, {});
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext) {
        
        const options = {
            prompt: 'Cosa possiamo fare per te?',
            choices: this.getChoices()
        };
        // Prompt the user with the configured PromptOptions.
        return await stepContext.prompt('cardPrompt', options);
    }

    async invokeStep(stepContext){
        switch (stepContext.result.value) {
            case 'Visualizza acquisti':
                return await stepContext.beginDialog(PURCHASES_DIALOG, this.userProfile.user);
            case 'Scrivi recensione':
                return await stepContext.beginDialog(COMMENT_DIALOG, this.userProfile.user);
            case 'Revisione':
                return await stepContext.beginDialog(APPROVE_ITEMS_DIALOG, this.userProfile.user);
            default:
                //Only if the input isn't recognized
                // send user input to QnA Maker.
                const qnaResults = await this.qnaMaker.getAnswers(context);

                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                    await context.sendActivity('' + qnaResults[0].answer);
                }
                else {
                    // If no answers were returned from QnA Maker...
                    await context.sendActivity('Nessuna opzione valida selezionata. Operazione annullata!');
                }
                return await stepContext.replaceDialog(MAIN_DIALOG);
        }
    }

    async finalStep(stepContext) {
        return await stepContext.endDialog();
    }

    getChoices() {
        var cardOptions;
        if(this.userProfile.isUserLoggedIn && this.userProfile.user.moderator){
            cardOptions = [
                {
                    value: 'Revisione',
                    synonyms: []
                }
            ];
        }
        if(this.userProfile.isUserLoggedIn && !this.userProfile.user.moderator){
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
        return cardOptions;
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;