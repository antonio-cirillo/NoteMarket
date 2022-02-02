const { ActivityHandler, CardFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

const CONVERSATION_DATA_PROPERTY = 'CONVERSATION_DATA_PROPERTY';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
const WELCOME_CARD = require('../cards/welcomeCard.json');

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
        
        // Create the state property accessors for the conversation data and user profile.
        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);


		this.onMembersAdded(async (context, next) => {
			const membersAdded = context.activity.membersAdded;
			for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
				if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    var base = 'Per utilizzare il nostro Bot devi effettuare il pairing tra il tuo account e Telegram:';
                    var instr1 = `  - Copia il seguente ID: ${membersAdded[cnt].id}`;
                    var instr2 = '  - Accedi al nostro sito tramite il link in basso;';
                    var instr3 = '  - Inserisci l\'ID all\'interno del tuo profilo e premi il pulsante \'Salva\'';
                    WELCOME_CARD.actions[0].url = process.env.YOUR_DOMAIN + '/login';
                    WELCOME_CARD.body[2].text = base;
                    WELCOME_CARD.body[3].text = instr1;
                    WELCOME_CARD.body[4].text = instr2;
                    WELCOME_CARD.body[5].text = instr3;
                    await context.sendActivity({
                        text: '',
                        attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                    });
                    const userProfile = await this.userProfileAccessor.get(context, {});
                    userProfile.id = membersAdded[cnt].id;
                    userProfile.isUserLoggedIn = false;
                    await this.userState.saveChanges(context, false);
					await this.dialog.run(context, this.dialogState);
				}
			}

			await next();
		});

        this.onMessage(async (context, next) => {
            console.log('Running main dialog with Message Activity.');
            const userProfile = await this.userProfileAccessor.get(context, {});
            if(!userProfile.isUserLoggedIn){
                WELCOME_CARD.actions[0].url = process.env.YOUR_DOMAIN + '/login';
                await context.sendActivity({
                    text: '',
                    attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                });
                await next();
            }
            else{
                // Run the Dialog with the new message Activity.
                await this.dialog.run(context, this.dialogState);

                await next();
            }
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
