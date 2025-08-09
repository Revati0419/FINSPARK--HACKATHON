const { sendToDialogflow } = require("../config/dialogflow");
const { v4: uuidv4 } = require("uuid");

const sessions = {}; // Store sessions per user

async function processMessage(from, message, lang) {
  if (!sessions[from]) {
    sessions[from] = uuidv4();
  }
  const sessionId = sessions[from];
  const reply = await sendToDialogflow(message, sessionId, lang || process.env.DEFAULT_LANGUAGE);
  return reply;
}

module.exports = { processMessage };
