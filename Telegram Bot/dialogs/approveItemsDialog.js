const { CardFactory, MessageFactory, InputHints } = require('botbuilder');
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

const WELCOME_CARD = require('../cards/welcomeCard.json');
const REVIEW_CARD = require('../cards/reviewCard.json');

const APPROVE_ITEMS_DIALOG = 'APPROVE_ITEMS_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ApproveItemsDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(APPROVE_ITEMS_DIALOG);

        this.userInfo = null;
        this.items = null;
        this.req = {_id : null , flag : false};

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt('cardPrompt'));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getItemsToApprove.bind(this),
            this.review.bind(this),
            this.sendReview.bind(this)
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

    async getItemsToApprove(step){
        this.userInfo = step.options;
        try{
            const response = await axios.post(process.env.URL_FUNCTION_GET_ITEMS_TO_APPROVE, {email: this.userInfo.email});

            if (response.data.error) {
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
    
            const items = response.data;

            if(items.length == 0){
                await step.context.sendActivity(
                    "Nessun appunto da valutare. Operazione annullata!"
                );
                return await step.endDialog();
            }

            for(var item of items){
                console.log(item)
                WELCOME_CARD.body[0].url = item.image;
                WELCOME_CARD.body[1].text = item.title;
                WELCOME_CARD.body[2].text = item.description;
                WELCOME_CARD.actions[0].url = item.file;
                WELCOME_CARD.actions[0].title = 'Download';

                await step.context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                });
                await step.context.sendActivity({
                    text: 'L\'id dell\'appunto è: ' + item._id
                });
            }

            const message = 'Inserisci l\'id del prodotto da valutare';

            return await step.prompt(TEXT_PROMPT, {
                prompt: message
            });
        }
        catch(error){
            console.log(error);
            await step.context.sendActivity(
                "Ops! Qualcosa è andato storto. Operazione annullata!"
            );
            return await step.endDialog();
        }
    }

    async review(step){
        this.req = {_id: step.result, flag: false}

        const options = {
            prompt: 'Cosa vuoi fare con questi appunti?',
            retryPrompt: 'La risposta non è valida, riprova.',
            choices: this.getChoices()
        };
        return await step.prompt('cardPrompt', options);
    }

    async sendReview(step){
        const choice = step.result.value;

        if(choice == 'Approva'){
            this.req.flag = true;
        }
        try{
            const response = await axios.post(process.env.URL_FUNCTION_REVIEW_ITEM, this.req);
            if(response.error){
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
            
            await step.context.sendActivity(
                "Revisione effettuata con successo!"
            );
            return await step.endDialog();
        }
        catch(error){
            console.log(error);
            await step.context.sendActivity(
                "Ops! Qualcosa è andato storto. Operazione annullata!"
            );
            return await step.endDialog();
        }
    }

    getChoices() {
        var cardOptions = [
                {
                    value: 'Approva',
                    synonyms: []
                },
                {
                    value: 'Rifiuta',
                    synonyms: []
                }
            ];
        return cardOptions;
    }
}

module.exports.ApproveItemsDialog = ApproveItemsDialog;
module.exports.APPROVE_ITEMS_DIALOG = APPROVE_ITEMS_DIALOG;
