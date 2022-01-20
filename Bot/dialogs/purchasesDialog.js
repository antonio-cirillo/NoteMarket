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

const PURCHASES_DIALOG = 'PURCHASES_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var userInfo;
var purchases = [];

class PurchasesDialog extends ComponentDialog {
    constructor(id, userInfo) {
        super(PURCHASES_DIALOG);

        this.userInfo = userInfo;

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getPurchasesStep.bind(this),
            this.showResultsStep.bind(this),
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
        await step.context.sendActivity(
            "Sto cercando i tuoi acquisti..."
        );

        for(var _id in userInfo.itemsBuyed){
            try{
                const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, _id);

                if (response.data.error) {
                    await step.context.sendActivity(
                        "Ops! Qualcosa è andato storto. Operazione annulata!"
                    );
                    return await step.replaceDialog(LOGIN_DIALOG);
                }
    
                const item = response.data;
                purchases.push(item);
            }
            catch(error){
                await step.context.sendActivity(
                    "Ops! Qualcosa è andato storto. Operazione annulata!"
                );
                return await step.endDialog();
            }
        }
        return await step.next(step);
    }

    async showResultsStep(step){
        if(purchases.length == 0){
            await step.context.sendActivity(
                "Nessun acquisto da mostrare."
            );
            return await step.endDialog();
        }

        var message ='Acquisti:\n\n'
        for(var item in purchases){
            message += '\t'+ item.title +'\n\n';
        }

        await step.context.sendActivity(message);
        return await step.endDialog();
    }

}

module.exports.PurchasesDialog = PurchasesDialog;
module.exports.PURCHASES_DIALOG = PURCHASES_DIALOG;
