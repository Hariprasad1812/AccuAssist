const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  zohoId: { type: String, index: true },
  displayName: String,
  email: { type: String, index: true },
  phone: String,
  roles: [String],
  mfaEnabled: { type: Boolean, default: false },
  lastKnownIp: String,
  createdAt: { type: Date, default: Date.now }
});

const ActionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  payload: { type: Schema.Types.Mixed },
  status: { type: String, default: 'requested' },
  riskScore: Number,
  deviceInfo: String,
  ipAddress: String,
  reason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const ApprovalSchema = new Schema({
  actionId: { type: Schema.Types.ObjectId, ref: 'Action' },
  approverId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  comments: String,
  timestamp: { type: Date, default: Date.now }
});

const OTPSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  otpHash: String,
  method: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Action: mongoose.model('Action', ActionSchema),
  Approval: mongoose.model('Approval', ApprovalSchema),
  OTP: mongoose.model('OTP', OTPSchema)
};