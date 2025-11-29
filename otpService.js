const crypto = require('crypto');
const { OTP } = require('./models');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

function generateOtpCode(){ return (Math.floor(100000 + Math.random()*900000)).toString(); }

async function createAndSendOtp(userId, method, toAddress){
  const code = generateOtpCode();
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 5*60*1000);
  await OTP.create({ userId, otpHash: hash, method, expiresAt });
  if(method === 'email'){
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toAddress,
      subject: 'AccuAssist OTP Code',
      text: `Your OTP: ${code}. Expires in 5 minutes.`
    });
  }
  return true;
}

async function verifyOtp(userId, code){
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const doc = await OTP.findOne({ userId }).sort({createdAt:-1});
  if(!doc) return { ok:false, reason:'no_otp' };
  if(doc.expiresAt < new Date()) return { ok:false, reason:'expired' };
  if(doc.otpHash !== hash) return { ok:false, reason:'invalid' };
  await OTP.deleteMany({ userId });
  return { ok:true };
}

module.exports = { createAndSendOtp, verifyOtp };