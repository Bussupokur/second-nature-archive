function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c]));
}

export async function GET(request) {
  const siteUrl = 'https://second-nature.spiekerbas.xyz';

  try {
    const manifestRes = await fetch(siteUrl + '/manifest.json?v=' + Date.now());
    const records = await manifestRes.json();

    const items = records
      .filter((r) => r.cls === 'nasaat')
      .slice()
      .reverse()
      .map((r) => {
        const guid = escapeXml(String(r.id));
        const title = escapeXml(String(r.id) + ' \u00b7 ' + r.title);
        const description = escapeXml('field transmission \u00b7 length: ' + (r.len || 'unspecified'));
        const link = r.external
          ? (r.external.startsWith('http') ? r.external : siteUrl + '/nasaat/' + r.external.replace(/^nasaat\//, ''))
          : siteUrl + '/#archive';
        return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <description>${description}</description>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Nasaat — Field Transmissions</title>
  <link>${siteUrl}/nasaat/nasaat_platform.html</link>
  <description>New field transmissions as received. No further explanation provided at this access tier.</description>
  <language>en</language>
${items}
</channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  } catch (err) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Nasaat — Field Transmissions</title><description>feed temporarily unavailable</description></channel></rss>', {
      status: 200,
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
    });
  }
}
