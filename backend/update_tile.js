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

async function run() {
  const db = await connect('mongodb://localhost:27017/bmp-tn');
  const imgUrl = await getWikipediaImageUrl('Tile');
  if (imgUrl) {
    const res = await db.connection.collection('produits').updateOne(
      { nom: /Carrelage grès/i },
      { $set: { image_url: imgUrl } }
    );
    console.log(`Updated Tile: ${imgUrl} (${res.modifiedCount})`);
  }
  process.exit(0);
}

run();
