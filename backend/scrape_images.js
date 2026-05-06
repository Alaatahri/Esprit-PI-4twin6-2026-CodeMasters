const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapePexels(query) {
  try {
    const html = await fetchHtml(`https://www.pexels.com/search/${encodeURIComponent(query)}/`);
    const match = html.match(/src="(https:\/\/images\.pexels\.com\/photos\/[^"]+)"/);
    if (match && match[1]) {
      return match[1].split('?')[0] + '?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=1';
    }
    return null;
  } catch(e) {
    return null;
  }
}

async function run() {
  const queries = {
    'ciment': 'cement bag',
    'brique': 'red bricks wall',
    'acier': 'steel rebar',
    'treillis': 'steel mesh wire',
    'sable': 'construction sand',
    'gravier': 'gravel stones',
    'carrelage': 'ceramic tiles floor',
    'peinture': 'paint bucket white',
    'tuyau': 'pvc pipes',
    'mortier': 'mortar cement',
    'plaque': 'drywall gypsum',
    'isolant': 'glass wool insulation',
    'tôle': 'galvanized steel roof'
  };

  const results = {};
  for (const [key, q] of Object.entries(queries)) {
    const url = await scrapePexels(q);
    if (url) {
      results[key] = url;
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run();
