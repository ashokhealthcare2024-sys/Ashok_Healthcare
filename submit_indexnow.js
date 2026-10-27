const fs = require('fs');
const https = require('https');

const KEY = '8f4b29c1d0e34a65b719e83c0f2a4d91';
const HOST = 'ashokhealthcare.in';

const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/ashokhealthcare\.in\/[^<]*)<\/loc>/g)].map(m => m[1]);

console.log(`Submitting ${urlList.length} URLs to IndexNow for ${HOST}...`);

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urlList
});

const endpoints = [
  { host: 'api.indexnow.org', path: '/indexnow' },
  { host: 'www.bing.com', path: '/indexnow' }
];

endpoints.forEach(({ host, path }) => {
  const req = https.request({
    host,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`[${host}] Response Status: ${res.statusCode} ${res.statusMessage}`);
      if (body) console.log(`[${host}] Response Body: ${body}`);
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log(`✅ [${host}] IndexNow submission successful!`);
      } else {
        console.log(`ℹ️ [${host}] Status ${res.statusCode}. (Ensure ${KEY}.txt is uploaded to production server).`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`❌ [${host}] Error:`, err.message);
  });

  req.write(payload);
  req.end();
});
