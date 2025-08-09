require('dotenv').config();
const dialogflow = require('@google-cloud/dialogflow');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
console.log('projectId:', projectId);

const sessionClient = new dialogflow.SessionsClient(); // NO keyFilename here!

async function sendToDialogflow(text, sessionId, languageCode = process.env.DEFAULT_LANGUAGE) {
  console.log('sessionId:', sessionId);

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode,
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult.fulfillmentText;
}

module.exports = { sendToDialogflow };
