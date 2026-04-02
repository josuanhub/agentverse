export default async function handler(req, res) {
  try {
    const target = req.query.endpoint;

    const url = `https://urus-scout-agent-production.up.railway.app/v1/scout/${target}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "proxy error" });
  }
}
