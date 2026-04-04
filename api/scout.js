export default async function handler(req, res) {
  try {
    const target = req.query.endpoint;
    const method = req.method || 'GET';

    let url, options;

    if (target === 'leaderboard') {
      url = 'https://urus-scout-agent-production.up.railway.app/v1/scout/leaderboard';
      options = { method: 'GET' };
    } else if (target === 'status') {
      url = 'https://urus-scout-agent-production.up.railway.app/v1/scout/status';
      options = { method: 'GET' };
    } else {
      url = 'https://urus-scout-agent-production.up.railway.app/v1/scout';
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {})
      };
    }

    const response = await fetch(url, options);
    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "proxy error", message: err.message });
  }
}
