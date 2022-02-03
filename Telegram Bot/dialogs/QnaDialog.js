const { CardFactory, MessageFactory, InputHints } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
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

const WELCOME_CARD = require('../cards/welcomeCard.json');

const axios = require('axios');
require('dotenv').config();

const QNA_DIALOG = 'QNA_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class QnaDialog extends ComponentDialog {
    constructor(id, userInfo, QnAMaker) {
        super(QNA_DIALOG);
        this.user = null;
        this.purchases = [];
        this.QnAMaker = QnAMaker;

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.questionStep.bind(this),
            this.answerStep.bind(this)
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

    async questionStep(step){
        this.QnaMaker = step.options
        const message = 'Fammi una domanda';

            return await step.prompt(TEXT_PROMPT, {
                prompt: message
            });
    }

    async answerStep(step){
        const question = step.result;
        //Only if the input isn't recognized
        // send user input to QnA Maker.
        const qnaResults = await this.QnaMaker.getAnswers(step.context);

        console.log(qnaResults);
        // If an answer was received from QnA Maker, send the answer back to the user.
        if (qnaResults[0]) {
            await step.context.sendActivity('' + qnaResults[0].answer);
        }
        else {
            // If no answers were returned from QnA Maker...
            await step.context.sendActivity('Domanda non valida. Operazione annullata!');
        }
        return await step.endDialog();
    }

}

module.exports.QnaDialog = QnaDialog;
module.exports.QNA_DIALOG = QNA_DIALOG;
