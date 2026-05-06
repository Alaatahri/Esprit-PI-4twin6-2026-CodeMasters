"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
async function run() {
    console.log('Connecting to DB...');
    const db = await (0, mongoose_1.connect)('mongodb://localhost:27017/bmp-tn');
    const projects = await db.connection.collection('projects').find({}).toArray();
    console.log(`Found ${projects.length} projects to update.`);
    for (const p of projects) {
        let photoApres = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80';
        let photoAvant = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80';
        const title = p.titre.toLowerCase();
        const desc = p.description ? p.description.toLowerCase() : '';
        const content = title + ' ' + desc;
        if (content.includes('cuisine')) {
            photoApres = 'https://images.unsplash.com/photo-1556910103-1c02745a872f?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80';
        }
        else if (content.includes('salle de bain') || content.includes('plomberie')) {
            photoApres = 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80';
        }
        else if (content.includes('bureau') || content.includes('aménagement')) {
            photoApres = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80';
        }
        else if (content.includes('appartement')) {
            photoApres = 'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&q=80';
        }
        else if (content.includes('immeuble')) {
            photoApres = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80';
        }
        else if (content.includes('villa') || content.includes('maison')) {
            photoApres = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80';
            photoAvant = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80';
        }
        await db.connection.collection('projects').updateOne({ _id: p._id }, { $set: { photosApres: [photoApres], photosAvant: [photoAvant] } });
    }
    const suivis = await db.connection.collection('suiviprojects').find({}).toArray();
    for (const s of suivis) {
        if (s.photo_url || s.photoUrl) {
            const img = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80';
            await db.connection.collection('suiviprojects').updateOne({ _id: s._id }, { $set: { photo_url: img, photoUrl: img } });
        }
    }
    console.log('Photos updated successfully!');
    process.exit(0);
}
run().catch(console.error);
//# sourceMappingURL=update-photos.js.map