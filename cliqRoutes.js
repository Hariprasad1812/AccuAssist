const express = require('express');
const router = express.Router();
const { User, Action } = require('./models');
const { createAndSendOtp, verifyOtp } = require('./otpService');
const { computeRiskScore } = require('./riskEngine');
const { sendCliqReply } = require('./utils');
const { updateZohoUserDisplayName } = require('./zohoApi');

router.post('/webhook', async (req, res) => {
  const body = req.body || {};
  const text = (body.text || '').trim();
  const channelId = body.channel_id || body.channel;
  const zohoUserId = body.user_id || body.sender;
  try {
    let user = await User.findOne({ zohoId: zohoUserId });
    if(!user){
      user = await User.create({ zohoId: zohoUserId, displayName: body.sender_name || 'Unknown', email: body.email });
    }

    if(/reset password/i.test(text) || text.startsWith('/resetpassword')){
      await createAndSendOtp(user._id, 'email', user.email);
      await sendCliqReply(channelId, 'OTP sent to your registered email. Reply: verify otp <code>');
      return res.sendStatus(200);
    }

    if(/verify otp/i.test(text) || text.startsWith('/verify-otp')){
      const parts = text.split(' ');
      const code = parts[parts.length-1];
      const ok = await verifyOtp(user._id, code);
      if(ok.ok){
        const action = await Action.create({ userId:user._id, type:'reset', status:'completed', reason:'self_service' });
        await sendCliqReply(channelId, 'OTP verified. Password reset completed. Check your email for the temp password.');
      } else {
        await sendCliqReply(channelId, 'OTP invalid or expired.');
      }
      return res.sendStatus(200);
    }

    if(/change name to/i.test(text) || text.startsWith('/changename')){
      const match = text.match(/change name to (.+)/i) || text.match(/\/changename\s+(.+)/i);
      if(!match) { await sendCliqReply(channelId, 'Usage: /changename <New Name>'); return res.sendStatus(200); }
      const newName = match[1].trim();
      const recent = await Action.find({ userId: user._id }).sort({createdAt:-1}).limit(20);
      const score = await computeRiskScore({ user, actionType:'change_name', recentActions: recent, ip: body.ip });
      const action = await Action.create({ userId:user._id, type:'change_name', payload:{newName}, status: score > 50 ? 'pending' : 'approved', riskScore:score });
      if(score > 50){
        await sendCliqReply(channelId, `Request is high risk (score ${score}) and will be reviewed by admin.`);
      } else {
        try{
          await updateZohoUserDisplayName(user.zohoId, newName);
          action.status = 'completed';
          await action.save();
          await sendCliqReply(channelId, `Your display name updated to "${newName}".`);
        } catch(e){
          await sendCliqReply(channelId, `Failed to update display name: ${e.message}`);
        }
      }
      return res.sendStatus(200);
    }

    if(/lock account/i.test(text) || text.startsWith('/lockaccount')){
      await Action.create({ userId:user._id, type:'lock', status:'completed', reason:'user_requested' });
      await sendCliqReply(channelId, 'Your account has been locked. Contact admin to restore access.');
      return res.sendStatus(200);
    }

    if(/securityscore/i.test(text) || text.startsWith('/securityscore')){
      const recent = await Action.find({ userId: user._id }).sort({createdAt:-1}).limit(50);
      const score = await computeRiskScore({ user, actionType:'generic', recentActions: recent, ip: body.ip, user });
      await sendCliqReply(channelId, `Your account security score: ${score}/100. Use /help for recommendations.`);
      return res.sendStatus(200);
    }

    await sendCliqReply(channelId, 'I can help with: /resetpassword, /verify-otp <code>, /changename <name>, /lockaccount, /securityscore');
    return res.sendStatus(200);
  } catch(err){
    console.error('Webhook error', err);
    return res.status(500).send({ error: 'internal' });
  }
});

module.exports = router;