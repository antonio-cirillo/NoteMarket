const { ActivityHandler } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

class NoteMarketBot extends ActivityHandler {
    constructor(conversationState, userState, dialog, QnAConfig, qnaOptions) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');
        if (!QnAConfig) throw new Error('[QnaMakerBot]: Missing parameter. QnAConfig is required');

        // now create a QnAMaker connector.
        this.qnaMaker = new QnAMaker(QnAConfig, qnaOptions);

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

		this.onMembersAdded(async (context, next) => {
			const membersAdded = context.activity.membersAdded;
			for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
				if (membersAdded[cnt].id !== context.activity.recipient.id) {
					await context.sendActivity(
						`Benvenuto in NoteMarket! Come posso aiutarti?`,
					);
					await this.dialog.run(context, this.dialogState);
				}
			}

			await next();
		});

        this.onMessage(async (context, next) => {
            console.log('Running main dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            await next();
        });
    }

    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }

}

module.exports.NoteMarketBot = NoteMarketBot;
