const https = require('https');
const { connect } = require('mongoose');

async function getWikipediaImageUrl(pageTitle) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=1000`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId] && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

const items = [
  { match: /Carrelage grès/i, title: 'Ceramic_tile' },
  { match: /Peinture acrylique/i, title: 'Paint' },
  { match: /Tuyau PVC/i, title: 'Plastic_pipework' },
  { match: /Mortier/i, title: 'Mortar_(masonry)' },
  { match: /Plaque de plâtre/i, title: 'Drywall' },
  { match: /Tôle/i, title: 'Corrugated_galvanised_iron' },
  { match: /Treillis/i, title: 'Welded_wire_mesh' }
];

async function run() {
  const db = await connect('mongodb://localhost:27017/bmp-tn');
  
  for (const item of items) {
    const imgUrl = await getWikipediaImageUrl(item.title);
    if (imgUrl) {
      const res = await db.connection.collection('produits').updateOne(
        { nom: item.match },
        { $set: { image_url: imgUrl } }
      );
      console.log(`Updated ${item.title}: ${imgUrl} (${res.modifiedCount})`);
    } else {
      console.log(`Failed to fetch for ${item.title}`);
    }
  }
  process.exit(0);
}

run();
