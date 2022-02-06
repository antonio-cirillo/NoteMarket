# NoteMarketBot
__NoteMarketBot__ is a companion bot for the NoteMarket web application.

With this bot users can:

* pair the NoteMarket account with the Telegram account;
* see and download all bought notes;
* send a comment for a note set;
* complete the notes approval process (moderators only).

# Installation
In order to complete the installation process, QnA resources must be manually created.

Follow these steps:

1. login the [QnA Portal](https://qnamaker.ai/) with Azure credentials;
2. Select "Create a knowledge base";
3. Use our .tsv file to populate the knowledge base;
4. Select "Save and train" to generate a QnA AI model.
6. Select "Publish" to finalize the creation of the knowledge base.

At this point, the portal will show some datas in this form:

```XML
POST /knowledgebases/<knowledge-base-id>/generateAnswer
Host: <your-hostname>  // NOTE - this is a URL ending in /qnamaker.
Authorization: EndpointKey <qna-maker-resource-key>
```

Save these information and provide them to the installation script, when prompted.