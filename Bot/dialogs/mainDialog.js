// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { LoginDialog, LOGIN_DIALOG } = require('./loginDialog');

const MAIN_DIALOG = 'MAIN_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super(MAIN_DIALOG);
        this.userState = userState;
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

            this.addDialog(new LoginDialog('loginDialog', userState))
            .addDialog(new ChoicePrompt('cardPrompt'));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.initialStep.bind(this),
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

    async finalStep(stepContext) {
        switch (stepContext.result.value) {
            case 'Login':
                await stepContext.beginDialog(LOGIN_DIALOG, this.userState);
                break;
            case 'Visualizza acquisti':
                await stepContext.beginDialog(/*TODO: Inserire nome dialogo qui */'fakeName', this.userState);
                break;
            default:
                break;
        }

        const userInfo = stepContext.result;
        await this.userProfileAccessor.set(stepContext.context, userInfo);
        return await stepContext.endDialog();
    }

    getChoices() {
        const cardOptions = [
            {
                value: 'Login',
                synonyms: ['login']
            },
            {
                value: 'Visualizza acquisti',
                synonyms: ['acquisti', 'ordini']
            }
        ];

        return cardOptions;
    }
}

module.exports.MainDialog = MainDialog;
module.exports.MAIN_DIALOG = MAIN_DIALOG;