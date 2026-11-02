/**
 * Ashok Healthcare - Google Instant Indexing API Tool
 * 
 * Submits all 39 sitemap URLs directly to Google's Indexing API
 * to force Googlebot to crawl and evaluate pages immediately.
 * 
 * Requirements:
 * 1. Place your Google Service Account JSON file as 'service_account.json' in this folder.
 * 2. Ensure the service account email is added as an Owner/Full User in Google Search Console.
 * 3. Run: node google_instant_index.js
 */

const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const SERVICE_ACCOUNT_FILE = 'service_account.json';

if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  console.log('================================================================');
  console.log('   GOOGLE INSTANT INDEXING API SETUP REQUIRED (3 MINUTE SETUP)');
  console.log('================================================================');
  console.log('');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Create or select a project.');
  console.log('3. Enable the "Web Search Indexing API":');
  console.log('   https://console.cloud.google.com/apis/library/indexing.googleapis.com');
  console.log('4. Create a Service Account (IAM & Admin -> Service Accounts -> Create Service Account).');
  console.log('5. Click on the created service account -> Keys tab -> Add Key -> Create new key -> JSON.');
  console.log('6. Save that downloaded JSON file as "service_account.json" in this project directory.');
  console.log('7. Copy the client_email from that JSON file (e.g. xxx@project.iam.gserviceaccount.com).');
  console.log('8. Open Google Search Console -> Settings -> Users and permissions -> Add User.');
  console.log('   Paste the client_email and grant "Owner" permission.');
  console.log('9. Run this script again: node google_instant_index.js');
  console.log('================================================================');
  process.exit(1);
}

const keyData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getGoogleAccessToken() {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: keyData.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = base64url(JSON.stringify(header));
    const encodedClaim = base64url(JSON.stringify(claim));
    const signatureInput = `${encodedHeader}.${encodedClaim}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(keyData.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

    const req = https.request({
      host: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Failed to obtain Google access token: ${body}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function publishUrl(accessToken, url) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      url: url,
      type: 'URL_UPDATED'
    });

    const req = https.request({
      host: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, body: err.message });
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('Authenticating with Google Cloud OAuth2...');
  try {
    const accessToken = await getGoogleAccessToken();
    console.log('✅ Google Authentication Successful!');

    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const urls = [...sitemap.matchAll(/<loc>(https:\/\/ashokhealthcare\.in\/[^<]*)<\/loc>/g)].map(m => m[1]);

    console.log(`Submitting ${urls.length} URLs to Google Indexing API...`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const result = await publishUrl(accessToken, url);
      if (result.status === 200) {
        console.log(`[${i + 1}/${urls.length}] ✅ Pushed to Googlebot: ${url}`);
      } else {
        console.log(`[${i + 1}/${urls.length}] ⚠️ Status ${result.status} for ${url}: ${result.body}`);
      }
      // Small throttle to stay well within Google rate limits
      await new Promise(r => setTimeout(r, 150));
    }

    console.log('\n🎉 ALL URLS SUCCESSFULLY PUSHED TO GOOGLEBOT FOR RAPID INDEXING!');
  } catch (err) {
    console.error('❌ Error during Google Indexing process:', err.message);
  }
}

main();
