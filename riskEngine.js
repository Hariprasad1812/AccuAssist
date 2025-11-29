async function computeRiskScore({ user, actionType, ip, device, recentActions }){
  let score = 10;
  const recentCount = (recentActions || []).filter(a => a.type === actionType && (Date.now() - new Date(a.createdAt)) < 24*60*60*1000).length;
  if(recentCount > 3) score += 40;
  if(ip && user.lastKnownIp && ip.split('.')[0] !== (user.lastKnownIp||'').split('.')[0]) score += 30;
  if(actionType === 'change_name') score += 20;
  if(score > 100) score = 100;
  return score;
}

module.exports = { computeRiskScore };