const https = require('https');

function searchUnsplash(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].id);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const queries = {
    'ciment': 'cement bag',
    'brique': 'red bricks wall construction',
    'acier': 'steel rebar construction',
    'treillis': 'wire mesh steel',
    'sable': 'construction sand pile',
    'gravier': 'gravel stones',
    'carrelage': 'ceramic floor tiles',
    'peinture': 'white paint bucket',
    'tuyau': 'pvc pipes',
    'mortier': 'mortar cement',
    'plaque': 'drywall gypsum board',
    'isolant': 'glass wool insulation',
    'tôle': 'galvanized steel sheet roof'
  };

  const results = {};
  for (const [key, q] of Object.entries(queries)) {
    const id = await searchUnsplash(q);
    if (id) {
      results[key] = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=900&q=80`;
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run();
