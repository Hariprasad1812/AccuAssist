const express = require('express');
const router = express.Router();
const { Action, User } = require('./models');
const { updateZohoUserDisplayName } = require('./zohoApi');

router.get('/approvals/pending', async (req, res) => {
  const pending = await Action.find({ status: 'pending' }).populate('userId').limit(50);
  res.json(pending);
});

router.post('/approvals/:actionId/approve', async (req, res) => {
  const { actionId } = req.params;
  const action = await Action.findById(actionId);
  if(!action) return res.status(404).send('Action not found');
  action.status = 'approved';
  action.updatedAt = new Date();
  await action.save();
  if(action.type === 'change_name'){
    const user = await User.findById(action.userId);
    try{
      await updateZohoUserDisplayName(user.zohoId, action.payload.newName);
      action.status = 'completed';
      await action.save();
    }catch(e){
      action.status = 'failed';
      action.reason = e.message;
      await action.save();
    }
  }
  res.json({ ok:true, action });
});

router.get('/logs', async (req,res) => {
  const logs = await Action.find().sort({createdAt:-1}).limit(200).populate('userId');
  res.json(logs);
});

module.exports = router;