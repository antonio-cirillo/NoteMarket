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
const COMMENT_CARD = require('../cards/commentCard.json');

const COMMENT_DIALOG = 'COMMENT_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class CommentDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(COMMENT_DIALOG);

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getPurchases.bind(this),
            this.askComment.bind(this),
            this.sendComment.bind(this),
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

    async getPurchases(step){
        this.req = {email: null, _id : null, comment : null};
        this.user = step.options;
        this.req.email = this.user.email;
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

            this.currentItem = 0;
            for(var item of this.itemsBuyed){
                COMMENT_CARD.body[0].url = item.image;
                COMMENT_CARD.body[1].text = item.title;
                COMMENT_CARD.body[2].text = item.description;
                await step.context.sendActivity({
                    attachments: [CardFactory.adaptiveCard(COMMENT_CARD)]
                });

                this.currentItem += 1;
                await step.context.sendActivity(
                    'ID: ' + this.currentItem
                );
            }
            const message = 'Inserisci l\'id del prodotto da recensire';

            return await step.prompt(TEXT_PROMPT, {
                prompt: message
            });
        }
        catch(error){
            console.log(error);
            await step.context.sendActivity(
                'Errore. Operazione annullata!'
            );
            return await step.endDialog();
        }
    }

    async askComment(step){
        var result = step.result;
        var intId = parseInt(result) - 1;
        var id = null;

        var currItem = -1
        for(var item of this.itemsBuyed){
            currItem += 1;
            if(intId == currItem){
                this.req._id = item._id;
            }
        }

        if(this.req._id == null){
            await step.context.sendActivity(
                'ID non valido. Operazione annullata!'
            );
            return await step.endDialog();
        }

        var message = 'Inserisci la tua recensione';

        return await step.prompt(TEXT_PROMPT, {
            prompt: message
        });
    }

    async sendComment(step){
        this.req.comment = step.result;

        try{
            const response = await axios.post(process.env.URL_FUNCTION_POST_COMMENT, this.req);

            if (response.data.error) {
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
    
            await step.context.sendActivity(
                "Recensione pubblicata!"
            );
            return await step.endDialog();
        }
        catch(error){
            await step.context.sendActivity(
                "Errore. Operazione annullata!"
            );
            return await step.endDialog();
        }
    }

    getChoices() {
        var cardOptions = [
                {
                    value: 'Recensisci ' + this.currentItem,
                    synonyms: [this.currentItem]
                }
            ];
        return cardOptions;
    }

}

module.exports.CommentDialog = CommentDialog;
module.exports.COMMENT_DIALOG = COMMENT_DIALOG;
