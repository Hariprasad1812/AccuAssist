const { postCliqMessage } = require('./zohoApi');

async function sendCliqReply(channelId, text){
  try {
    await postCliqMessage(channelId, text);
  } catch(e){
    console.error('Failed to send Cliq message', e.message);
  }
}

module.exports = { sendCliqReply };