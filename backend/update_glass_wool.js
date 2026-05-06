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
  const imgUrl = await getWikipediaImageUrl('Glass_wool');
  if (!imgUrl) {
    console.log('Failed to fetch image');
    return;
  }
  console.log('Got image URL:', imgUrl);

  const db = await connect('mongodb://localhost:27017/bmp-tn');
  const result = await db.connection.collection('produits').updateOne(
    { nom: /Isolant laine de verre/i },
    { $set: { image_url: imgUrl } }
  );
  console.log('DB Update result:', result.modifiedCount);
  process.exit(0);
}

run();
