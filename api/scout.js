export default async function handler(req, res) {
  try {
    const target = req.query.endpoint;

    // GET endpoints — leaderboard y status
    if (target === 'leaderboard' || target === 'status') {
      const url = `https://urus-scout-agent-production.up.railway.app/v1/scout/${target}`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    // POST — analyze agent
    const body = req.body || {};
    const url = 'https://urus-scout-agent-production.up.railway.app/v1/scout';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'proxy error', message: err.message });
  }
}
