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

const COMMENT_DIALOG = 'COMMENT_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var userInfo;
var purchases = [];
var req = {email: null, id : null, comment : null};

class CommentDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(COMMENT_DIALOG);

        this.userInfo = userInfo;

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getPurchases.bind(this),
            this.askId.bind(this),
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
        for(var _id in userInfo.itemsBuyed){
            try{
                const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, _id);

                if (response.data.error) {
                    await step.context.sendActivity(
                        "Ops! Qualcosa è andato storto. Operazione annullata!"
                    );
                    return await step.endDialog();
                }
    
                const item = response.data;
                purchases.push(item);
            }
            catch(error){
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annullata!"
                );
                return await step.endDialog();
            }
        }
        return await step.next(step);
    }

    async askId(step){
        if(purchases.length == 0){
            await step.context.sendActivity(
                "Nessun acquisto da mostrare. Recensione annullata"
            );
            return await step.endDialog();
        }

        var message ='Lista degli acquisti (id, titolo):\n\n'
        for(var item in purchases){
            message +=  item.id + ', '+ item.title +'\n\n';
        }
        message += 'Inserisci l\'id del prodotto da recensire.'

        return await step.prompt(TEXT_PROMPT, {
            prompt: message
        });
    }

    async askComment(step){
        const id = step.result;
        var isValidId = false;

        for(var _id in userInfo.itemsBuyed){
            if(id == _id){
                isValidId = true;
            }
        }

        if(!isValidId){
            await step.context.sendActivity(
                "L'id inserito non è valido. Operazione annullata!"
            );
            return await step.endDialog();
        }

        comment.id = id;
        var message = 'Inserisci la tua recensione';

        return await step.prompt(TEXT_PROMPT, {
            prompt: message
        });
    }

    async sendComment(step){
        req.comment = step.result;
        req.email = userInfo.email;

        try{
            const response = await axios.post(process.env.URL_FUNCTION_POST_COMMENT, req);

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
                "Ops! Qualcosa è andato storto. Operazione annullata!"
            );
            return await step.endDialog();
        }
    }

}

module.exports.CommentDialog = CommentDialog;
module.exports.COMMENT_DIALOG = COMMENT_DIALOG;
