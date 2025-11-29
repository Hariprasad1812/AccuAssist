const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

let _accessToken = null;
let _accessTokenExpiry = 0;

async function refreshAccessToken(){
  if(_accessToken && Date.now() < _accessTokenExpiry - 60000) return _accessToken;
  const resp = await axios.post('https://accounts.zoho.com/oauth/v2/token', qs.stringify({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token'
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  _accessToken = resp.data.access_token;
  _accessTokenExpiry = Date.now() + (resp.data.expires_in * 1000);
  return _accessToken;
}

async function postCliqMessage(channelId, message){
  const token = await refreshAccessToken();
  return axios.post(`https://cliq.zoho.com/api/v2/channels/${channelId}/message`, { text: message }, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` }
  });
}

async function updateZohoUserDisplayName(zohoUserId, newName){
  const token = await refreshAccessToken();
  // NOTE: Adjust endpoint to your Zoho People/Directory API path per your tenant
  const resp = await axios.put(`https://people.zoho.com/people/api/forms/P_Employee/${zohoUserId}`, {
    display_name: newName
  }, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  return resp.data;
}

module.exports = { refreshAccessToken, postCliqMessage, updateZohoUserDisplayName };