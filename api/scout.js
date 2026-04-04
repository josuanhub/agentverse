export default async function handler(req, res) {
  try {
    const target  = req.query.endpoint;
    const BACKEND = 'https://urus-backend-production.up.railway.app';
    const SCOUT   = 'https://urus-scout-agent-production.up.railway.app';

    if (target === 'leaderboard') {
      const r = await fetch(`${SCOUT}/v1/scout/leaderboard`);
      const d = await r.json();
      return res.status(200).json(d);
    }

    if (target === 'status') {
      const r = await fetch(`${SCOUT}/v1/scout/status`);
      const d = await r.json();
      return res.status(200).json(d);
    }

    if (target === 'trust') {
      const agent = req.query.agent || '';
      if (!agent) return res.status(400).json({ ok: false, error: 'missing_agent' });
      const r = await fetch(`${BACKEND}/v1/agent/${encodeURIComponent(agent)}/trust/public`);
      const d = await r.json();
      return res.status(200).json(d);
    }

    const body = req.body || {};
    const r = await fetch(`${SCOUT}/v1/scout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    return res.status(200).json(d);

  } catch (err) {
    return res.status(500).json({ error: 'proxy error', message: err.message });
  }
}
