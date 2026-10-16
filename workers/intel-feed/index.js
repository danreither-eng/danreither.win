const FEEDS = {
  'https://isc.sans.edu/podcast.html': 'https://isc.sans.edu/rssfeed_full.xml',
  'https://techcrunch.com/category/security/': 'https://techcrunch.com/category/security/feed/',
  'https://thecyberwire.com/': 'https://thecyberwire.com/feeds/rss.xml',
  'https://www.cyberkendra.com/': 'https://www.cyberkendra.com/feeds/posts/default?alt=rss',
  'https://dailysecurityreview.com/': 'https://dailysecurityreview.com/feed/',
  'https://stratquad.co.uk/news': 'https://stratquad.co.uk/news/feed.xml',
  'https://www.decryptiondigest.com/': 'https://www.decryptiondigest.com/feed.xml',
  'https://blog.it-learn.io/newsletter/': 'https://blog.it-learn.io/newsletter/index.xml'
};

const PAGE_SOURCES = {
  'https://ctiwatch.com/articles': { url: 'https://ctiwatch.com/articles', kind: 'ctiwatch' },
  'https://cyber.netsecops.io/publications/': { url: 'https://cyber.netsecops.io/publications/', kind: 'cybernet' }
};

const ALLOWED_ORIGIN = 'https://danreither.win';
const CACHE_KEY = 'daily-intel-board';

const decode = (value) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const tag = (block, name) => {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? decode(match[1]) : '';
};

function parseLatest(xml) {
  const blocks = [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)];
  let latest = null;
  for (const match of blocks) {
    const block = match[0];
    let link = tag(block, 'link');
    if (!link) {
      const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = href ? decode(href[1]) : '';
    }
    const title = tag(block, 'title').replace(/\s*https?:\/\/\S+/g, '');
    const date = tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated') || tag(block, 'dc:date');
    if (!title || !/^https:\/\//i.test(link) || /\/newsletter\/thanks\//.test(link)) continue;
    const timestamp = Date.parse(date);
    const item = { title: title.slice(0, 200), link, date: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString() };
    if (!latest || (item.date && (!latest.date || Date.parse(item.date) > Date.parse(latest.date)))) latest = item;
  }
  return latest;
}

async function latestFor(feedUrl) {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DanReitherIntelBoard/1.0)', Accept: 'application/rss+xml, application/xml, text/xml' },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    if (!response.ok) return null;
    return parseLatest(await response.text());
  } catch {
    return null;
  }
}

async function latestFromPage(url, kind) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DanReitherIntelBoard/1.0)' }, cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!response.ok) return null;
    const html = await response.text();
    const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for (const match of anchors) {
      const href = decode(match[1]);
      const text = decode(match[2]);
      if (kind === 'cybernet') {
        if (!/\/publications\/daily-threat-publications-\d{4}-\d{2}-\d{2}\//.test(href)) continue;
        const link = new URL(href, url).href;
        const title = text.replace(/\s*\d{4}-\d{2}-\d{2}\s*$/, '').trim();
        const datePart = href.match(/(\d{4}-\d{2}-\d{2})/);
        return { title: title.slice(0, 200), link, date: datePart ? new Date(`${datePart[1]}T12:00:00Z`).toISOString() : null };
      }
      if (kind === 'ctiwatch') {
        if (!/^https:\/\//i.test(href) || /ctiwatch\.com|\/events\//i.test(href) || text.length < 35) continue;
        const age = text.match(/\b(just now|\d+\s*[mhd] ago)\b/i);
        const title = age ? text.slice(text.indexOf(age[0]) + age[0].length).trim() : text;
        return { title: title.slice(0, 200), link: href, date: null };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function refresh(env) {
  const previous = env.INTEL_FEED ? await env.INTEL_FEED.get(CACHE_KEY, 'json') || { generated: null, items: {} } : { generated: null, items: {} };
  const entries = await Promise.all([
    ...Object.entries(FEEDS).map(async ([site, feed]) => [site, await latestFor(feed)]),
    ...Object.entries(PAGE_SOURCES).map(async ([site, source]) => [site, await latestFromPage(source.url, source.kind)])
  ]);
  const items = { ...previous.items };
  for (const [site, item] of entries) {
    if (item) items[site] = item;
    else if (site === 'https://blog.it-learn.io/newsletter/' && items[site]?.link.includes('/thanks/')) delete items[site];
  }
  const result = { generated: new Date().toISOString(), items };
  if (env.INTEL_FEED) await env.INTEL_FEED.put(CACHE_KEY, JSON.stringify(result), { expirationTtl: 172800 });
  return result;
}

function jsonResponse(data, request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'Origin'
  };
  if (origin === ALLOWED_ORIGIN) headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN;
  return new Response(JSON.stringify(data), { headers });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
      } });
    }
    if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
    const cached = env.INTEL_FEED ? await env.INTEL_FEED.get(CACHE_KEY, 'json') : null;
    const data = cached || await refresh(env);
    return jsonResponse(data, request);
  },
  async scheduled(_controller, env, context) {
    context.waitUntil(refresh(env));
  }
};
