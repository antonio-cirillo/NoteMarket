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

const APPROVE_ITEMS_DIALOG = 'APPROVE_ITEMS_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var userInfo;
var items;
var req = {_id : null , flag : false};

class ApproveItemsDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(APPROVE_ITEMS_DIALOG);

        this.userInfo = userInfo;

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ChoicePrompt('cardPrompt'));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getItemsToApprove.bind(this),
            this.askId.bind(this),
            this.askReview.bind(this),
            this.sendReview.bind(this),
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
        userInfo = step.options;
        try{
            const response = await axios.post(process.env.URL_FUNCTION_GET_ITEMS_TO_APPROVE, userInfo.email);

            if (response.data.error) {
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
    
            items = response.data;
        }
        catch(error){
            await step.context.sendActivity(
                "Ops! Qualcosa è andato storto. Operazione annullata!"
            );
            return await step.endDialog();
        }
        return await step.next(step);
    }

    async askId(step){
        if(!items || items.length == 0){
            await step.context.sendActivity(
                "Nessun prodotto da approvare. Operazione annullata"
            );
            return await step.endDialog();
        }

        var message ='Prodotti da approvare (id, titolo):\n\n'
        for(var item of items){
            message +=  item._id + ', '+ item.title +'\n\n';
        }
        message += 'Inserisci l\'id del prodotto da approvare.'

        return await step.prompt(TEXT_PROMPT, {
            prompt: message
        });
    }

    async askReview(step){
        const id = step.result;
        var selectedItem = null;

        for(var item of items){
            if(item._id == id){
                selectedItem = item;
            }
        }

        if(selectedItem == null){
            await step.context.sendActivity(
                "Il prodotto selezionato non corrisponde a nessun prodotto in revisione. Operazione annullata!"
            );
            return await step.endDialog();
        }

        await step.context.sendActivity(
            "Download: " + selectedItem.file
        );
        
        req._id = selectedItem._id;

        const options = {
            prompt: 'Cosa vuoi fare con questi appunti?',
            retryPrompt: 'La risposta non è valida, riprova.',
            choices: this.getChoices()
        };

        return await step.prompt('cardPrompt', options);
    }

    async sendReview(step){
        switch(step.result.value){
            case 'Approva':
                req.flag = true;
            case 'Rifiuta':
                req.flag = false;
        }

        try{
            const response = await axios.post(process.env.URL_FUNCTION_REVIEW_ITEM, req);

            if (response.data.error) {
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
    
            await step.context.sendActivity(
                "Revisione pubblicata!"
            );
            return await step.endDialog();
        }
        catch(error){
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
