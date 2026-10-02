// Vercel serverless function — proxies requests to the Teamwork API
// so the API key never touches the browser and CORS isn't an issue.

export default async function handler(req, res) {
  const TEAMWORK_URL = process.env.TEAMWORK_URL || 'https://9cloudwebworks.teamwork.com';
  const API_KEY = process.env.TEAMWORK_API_KEY || 'twp_kouI7Vd8IetzZ1b88Y7L8vf6Xm0K';

  const { endpoint, ...params } = req.query;

  if (!endpoint) {
    res.status(400).json({ error: 'Missing required "endpoint" query parameter' });
    return;
  }

  // Build the query string Teamwork expects, forwarding through any
  // filters the frontend supplied (fromdate, todate, page, pageSize, etc).
  const query = new URLSearchParams(params).toString();
  const url = `${TEAMWORK_URL}/${endpoint}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Teamwork API auth: API key as the Basic Auth username, any password.
        Authorization: `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    // Teamwork's v1 API puts paging info in response HEADERS
    // (x-page / x-pages / x-records), not in the JSON body — true for
    // time_entries.json, tasks.json, and people.json alike. Attach it
    // to the body as `_pagination` so the frontend's pager can read it
    // the same way regardless of endpoint.
    const xPage = response.headers.get('x-page');
    const xPages = response.headers.get('x-pages');
    const xRecords = response.headers.get('x-records') || response.headers.get('x-total-records');
    if (xPage !== null || xPages !== null || xRecords !== null) {
      data._pagination = {
        page: xPage ? Number(xPage) : undefined,
        pages: xPages ? Number(xPages) : undefined,
        records: xRecords ? Number(xRecords) : undefined,
      };
    }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
