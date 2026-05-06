"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
async function downloadImage(url, destPath) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!res.ok)
            return false;
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(destPath, buffer);
        return true;
    }
    catch (err) {
        return false;
    }
}
async function getImageUrlFromBing(query) {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const text = await res.text();
        const urls = [];
        const regex = /murl&quot;:&quot;(http[^&]+)&quot;/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            urls.push(match[1]);
            if (urls.length >= 5)
                break;
        }
        return urls;
    }
    catch (err) {
        return [];
    }
}
async function run() {
    console.log('Connecting to DB...');
    const db = await (0, mongoose_1.connect)('mongodb://localhost:27017/bmp-tn');
    const products = await db.connection.collection('produits').find({}).toArray();
    console.log(`Found ${products.length} products to update.`);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    for (const p of products) {
        console.log(`Processing product: ${p.nom}`);
        const urls = await getImageUrlFromBing(p.nom);
        let downloaded = false;
        let finalUrl = '';
        for (const url of urls) {
            const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
            if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext))
                continue;
            const filename = crypto.createHash('md5').update(p.nom).digest('hex') + '.' + ext;
            const destPath = path.join(uploadsDir, filename);
            console.log(`  Trying to download: ${url}`);
            const success = await downloadImage(url, destPath);
            if (success) {
                finalUrl = `/uploads/products/${filename}`;
                downloaded = true;
                console.log(`  Successfully downloaded to ${finalUrl}`);
                break;
            }
        }
        if (downloaded) {
            await db.connection.collection('produits').updateOne({ _id: p._id }, { $set: { image_url: finalUrl } });
            console.log(`  Updated ${p.nom} in DB.`);
        }
        else {
            console.log(`  Failed to download any image for ${p.nom}.`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('Product photos updated successfully!');
    process.exit(0);
}
run().catch(console.error);
//# sourceMappingURL=update-marketplace-photos.js.map