function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[c]));
}

function idDisplay(id) {
  return typeof id === 'number' ? 'REC-' + String(id).padStart(3, '0') : String(id);
}

function clsLabel(cls) {
  if (cls === 'main') return 'main sequence';
  if (cls === 'fork') return 'divergent';
  if (cls === 'article') return 'notice';
  if (cls === 'nasaat') return 'field transmission';
  return cls;
}

export async function GET(request) {
  const siteUrl = 'https://second-nature.spiekerbas.xyz';

  try {
    const manifestRes = await fetch(siteUrl + '/manifest.json?v=' + Date.now());
    const records = await manifestRes.json();

    const items = records
      .slice()
      .reverse()
      .map((r) => {
        const guid = escapeXml(String(r.id));
        const title = escapeXml(idDisplay(r.id) + ' \u00b7 ' + r.title);
        const description = escapeXml('classification: ' + clsLabel(r.cls) + ' \u00b7 length: ' + (r.len || 'unspecified'));
        return `
    <item>
      <title>${title}</title>
      <link>${siteUrl}/#archive</link>
      <guid isPermaLink="false">${guid}</guid>
      <description>${description}</description>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Second Nature — Archive</title>
  <link>${siteUrl}/</link>
  <description>New records as indexed. No further explanation provided at this access tier.</description>
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
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Second Nature — Archive</title><description>feed temporarily unavailable</description></channel></rss>', {
      status: 200,
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
    });
  }
}
