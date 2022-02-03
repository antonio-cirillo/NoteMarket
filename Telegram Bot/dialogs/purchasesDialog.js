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

const WELCOME_CARD = require('../cards/welcomeCard.json');

const axios = require('axios');
require('dotenv').config();

const PURCHASES_DIALOG = 'PURCHASES_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class PurchasesDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(PURCHASES_DIALOG);
        this.user = null;
        this.purchases = [];

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getPurchasesStep.bind(this)
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

    async getPurchasesStep(step){
        this.user = step.options;
        await step.context.sendActivity(
            "Sto cercando i tuoi acquisti..."
        );
        
        try{
            const response = await axios.post(process.env.URL_FUNCTION_GET_ITEMS_BUYED, {email: this.user.email});
            this.itemsBuyed = response.data;

            if(this.itemsBuyed.length == 0){
                await step.context.sendActivity('Nessun acquisto da mostrare. Operazione annullata!');
                return await step.endDialog();    
            }

            for(var item of this.itemsBuyed){
                WELCOME_CARD.body[0].url = item.image;
                WELCOME_CARD.body[1].text = item.title;
                WELCOME_CARD.body[2].text = item.description;
                WELCOME_CARD.actions[0].url = item.file;
                WELCOME_CARD.actions[0].title = 'Download';
                await step.context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                });
            }
        }
        catch(error){
            console.log(error);
            await step.context.sendActivity('Nessun acquisto da mostrare. Operazione annullata!');
            return await step.endDialog();
        }
        return await step.next(step);
    }

}

module.exports.PurchasesDialog = PurchasesDialog;
module.exports.PURCHASES_DIALOG = PURCHASES_DIALOG;
