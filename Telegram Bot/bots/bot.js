const { ActivityHandler, CardFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

const CONVERSATION_DATA_PROPERTY = 'CONVERSATION_DATA_PROPERTY';
const USER_PROFILE_PROPERTY = 'USER_PROFILE_PROPERTY';
const WELCOME_CARD = require('../cards/welcomeCard.json');

const axios = require('axios');
require('dotenv').config();


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
                if (membersAdded[cnt].id != context.activity.recipient.id) {
                    WELCOME_CARD.actions[0].url = process.env.YOUR_DOMAIN + '/login';
                    await context.sendActivity({
                        attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                    });
                    await context.sendActivity({
                        text: 'Copia il seguente token: ' + membersAdded[cnt].id
                    });
                    const userProfile = await this.userProfileAccessor.get(context, {});
                    userProfile.id = membersAdded[cnt].id;
                    userProfile.isUserLoggedIn = false;
                    await this.userState.saveChanges(context, false);
                }
			}

			await next();
        });

        this.onMessage(async (context, next) => {
            const userProfile = await this.userProfileAccessor.get(context, {});

            if(!userProfile.id){
                userProfile.id = context.activity.from.id;
                userProfile.isUserLoggedIn = false;
                await this.userState.saveChanges(context, false);
            }

            if(!userProfile.isUserLoggedIn){
                try{
                    const response = await axios.post(process.env.URL_FUNCTION_CHECK_TELEGRAM_TOKEN, {telegramToken: userProfile.id});
    
                    if (!response.data.error) {
                        userProfile.isUserLoggedIn = true;
                        userProfile.user = response.data;
                        await this.userState.saveChanges(context, false);
                        // Run the Dialog with the new message Activity.
                        await this.dialog.run(context, this.dialogState);

                        await next();
                    }
                    else{
                        WELCOME_CARD.actions[0].url = process.env.YOUR_DOMAIN + '/login';
                        await context.sendActivity({
                            attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                        });
                        await context.sendActivity({
                            text: 'Copia il seguente token: ' + userProfile.id
                        });  
                    }
                }
                catch(error){
                    WELCOME_CARD.actions[0].url = process.env.YOUR_DOMAIN + '/login';
                    await context.sendActivity({
                        attachments: [CardFactory.adaptiveCard(WELCOME_CARD)]
                    });
                    await context.sendActivity({
                        text: 'Copia il seguente token: ' + userProfile.id
                    });  
                } 
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
module.exports.userProfileAccessor = this.userProfileAccessor;
