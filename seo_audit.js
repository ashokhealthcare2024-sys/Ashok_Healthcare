/**
 * Ashok Healthcare - Comprehensive Technical SEO & Google Search Console Audit Tool
 * 
 * Scans all HTML files, verifies canonicals, metadata, H1s, schema,
 * sitemap inclusion, internal links, and broken links.
 * Outputs reports in JSON (seo_audit_report.json) and CSV (seo_audit_report.csv).
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://ashokhealthcare.in';
const IGNORE_DIRS = ['node_modules', '.git', '.gemini', '.agents', 'dist', 'scratch'];

// 1. Discover all HTML files
function getHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        results = results.concat(getHtmlFiles(full));
      }
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// 2. Load sitemap.xml
let sitemapUrls = [];
if (fs.existsSync('sitemap.xml')) {
  const sitemapContent = fs.readFileSync('sitemap.xml', 'utf8');
  sitemapUrls = [...sitemapContent.matchAll(/<loc>(https:\/\/ashokhealthcare\.in\/[^<]*)<\/loc>/g)].map(m => m[1]);
}

// 3. Collect all files
const allFiles = getHtmlFiles('.').map(f => f.replace(/\\/g, '/'));

// Map of canonical URL to relative file path
const urlToFileMap = new Map();
const fileToUrlMap = new Map();

allFiles.forEach(f => {
  let url;
  if (f === 'index.html') {
    url = `${DOMAIN}/`;
  } else {
    url = `${DOMAIN}/${f}`;
  }
  urlToFileMap.set(url, f);
  fileToUrlMap.set(f, url);
});

// 4. Data structures for audit
const pagesData = [];
const internalLinksGraph = new Map(); // targetUrl -> Set of sourceUrls
const brokenLinksList = [];
const titleMap = new Map(); // title -> [urls]
const descMap = new Map(); // desc -> [urls]

// Initialize link graph
allFiles.forEach(f => {
  const url = fileToUrlMap.get(f);
  internalLinksGraph.set(url, new Set());
});

// 5. First pass: Parse every HTML file
allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const url = fileToUrlMap.get(filePath);

  // Check if component partial or verification or 404
  const isComponent = filePath.startsWith('components/');
  const isVerification = filePath.includes('google365c');
  const is404 = filePath === '404.html';

  // Title
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const metaDescription = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';

  // H1 tags
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]*>/g, '').trim());
  const h1Count = h1Matches.length;

  // Canonical tag
  const canonicalMatches = [...content.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/gi)].map(m => m[1].trim());
  const canonicalUrl = canonicalMatches.length > 0 ? canonicalMatches[0] : '';
  const duplicateCanonicals = canonicalMatches.length > 1;

  // Robots meta tag
  const robotsMatch = content.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  const robotsDirective = robotsMatch ? robotsMatch[1].trim() : (isComponent ? 'noindex, nofollow (component fragment)' : 'index, follow (default)');
  const hasNoindex = robotsDirective.toLowerCase().includes('noindex');

  // Meta refresh
  const refreshMatch = content.match(/<meta\s+http-equiv=["']refresh["']\s+content=["']([^"']*)["']/i);
  const refreshTarget = refreshMatch ? refreshMatch[1].trim() : '';

  // Structured Data (JSON-LD)
  const jsonLdBlocks = [...content.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  const structuredDataTypes = [];
  let jsonLdError = null;

  jsonLdBlocks.forEach((block, idx) => {
    try {
      const parsed = JSON.parse(block[1]);
      function extractTypes(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (obj['@type']) {
          if (Array.isArray(obj['@type'])) structuredDataTypes.push(...obj['@type']);
          else structuredDataTypes.push(obj['@type']);
        }
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(extractTypes);
        }
        if (obj['itemListElement'] && Array.isArray(obj['itemListElement'])) {
          obj['itemListElement'].forEach(extractTypes);
        }
      }
      extractTypes(parsed);
    } catch (e) {
      jsonLdError = `Syntax error in block #${idx + 1}: ${e.message}`;
    }
  });

  // Unique structured data types
  const uniqueSchemaTypes = [...new Set(structuredDataTypes)];

  // Outbound links
  const hrefMatches = [...content.matchAll(/<a\s+[^>]*href=["']([^"']*)["']/gi)].map(m => m[1].trim());
  const outboundInternalLinks = [];

  hrefMatches.forEach(href => {
    // Ignore external, tel, mailto, javascript, pure anchors
    if (!href || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('#')) {
      return;
    }
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.startsWith(DOMAIN)) return; // External link
    }

    // Check for <base href="...">
    const baseMatch = content.match(/<base\s+href=["']([^"']*)["']/i);
    const baseHref = baseMatch ? baseMatch[1] : (isComponent ? '/' : null);

    // Normalize link to target URL
    let targetUrl;
    if (href.startsWith('https://ashokhealthcare.in/')) {
      targetUrl = href.split('#')[0].split('?')[0];
    } else if (href.startsWith('/')) {
      targetUrl = `${DOMAIN}${href.split('#')[0].split('?')[0]}`;
    } else if (baseHref === '/') {
      targetUrl = `${DOMAIN}/${href.split('#')[0].split('?')[0]}`;
    } else {
      // Relative link resolution
      const currentDir = path.dirname(filePath);
      const resolved = path.normalize(path.join(currentDir, href.split('#')[0].split('?')[0])).replace(/\\/g, '/');
      if (resolved === 'index.html' || resolved === '.') {
        targetUrl = `${DOMAIN}/`;
      } else {
        targetUrl = `${DOMAIN}/${resolved}`;
      }
    }

    outboundInternalLinks.push({ raw: href, targetUrl });
  });

  // Track duplicate titles and descriptions (only for standalone pages)
  if (!isComponent && !isVerification && title) {
    if (!titleMap.has(title)) titleMap.set(title, []);
    titleMap.get(title).push(url);
  }
  if (!isComponent && !isVerification && metaDescription) {
    if (!descMap.has(metaDescription)) descMap.set(metaDescription, []);
    descMap.get(metaDescription).push(url);
  }

  pagesData.push({
    filePath,
    url,
    title,
    metaDescription,
    h1Count,
    h1Text: h1Matches.join(' | '),
    canonicalUrl,
    duplicateCanonicals,
    robotsDirective,
    hasNoindex,
    refreshTarget,
    isComponent,
    isVerification,
    is404,
    inSitemap: sitemapUrls.includes(url),
    structuredDataTypes: uniqueSchemaTypes,
    jsonLdError,
    outboundInternalLinks,
    incomingLinksCount: 0 // populated in second pass
  });
});

// 6. Second pass: Calculate internal links graph and detect broken links
pagesData.forEach(page => {
  page.outboundInternalLinks.forEach(link => {
    const targetUrl = link.targetUrl;
    // Check if target exists
    if (urlToFileMap.has(targetUrl)) {
      if (internalLinksGraph.has(targetUrl)) {
        internalLinksGraph.get(targetUrl).add(page.url);
      }
    } else {
      // If extensionless URL, check if .html exists
      const targetWithHtml = targetUrl.endsWith('.html') ? targetUrl : `${targetUrl}.html`;
      const localRel = targetUrl.replace(`${DOMAIN}/`, '');
      if (urlToFileMap.has(targetWithHtml)) {
        if (internalLinksGraph.has(targetWithHtml)) {
          internalLinksGraph.get(targetWithHtml).add(page.url);
        }
      } else if (localRel && fs.existsSync(localRel)) {
        // Target is an existing non-HTML asset or XML file (e.g. sitemap.xml, images, etc.)
        return;
      } else {
        brokenLinksList.push({
          sourceUrl: page.url,
          sourceFile: page.filePath,
          targetRaw: link.raw,
          resolvedUrl: targetUrl
        });
      }
    }
  });
});

// Update incoming link counts
pagesData.forEach(page => {
  if (internalLinksGraph.has(page.url)) {
    page.incomingLinksCount = internalLinksGraph.get(page.url).size;
  }
});

// 7. Analysis & Diagnostics
const canonicalPages = pagesData.filter(p => !p.isComponent && !p.isVerification && !p.is404 && !p.hasNoindex);
const orphanPages = canonicalPages.filter(p => p.url !== `${DOMAIN}/` && p.incomingLinksCount === 0);
const missingCanonical = canonicalPages.filter(p => !p.canonicalUrl);
const invalidCanonical = canonicalPages.filter(p => p.canonicalUrl && p.canonicalUrl !== p.url && p.canonicalUrl !== p.url.replace(/\/$/, ''));
const missingTitle = canonicalPages.filter(p => !p.title);
const missingDesc = canonicalPages.filter(p => !p.metaDescription);
const invalidH1 = canonicalPages.filter(p => p.h1Count !== 1);
const missingFromSitemap = canonicalPages.filter(p => !p.inSitemap);
const pagesWithNoindex = pagesData.filter(p => p.hasNoindex && !p.isComponent && !p.is404);
const redirectingPages = pagesData.filter(p => p.refreshTarget || (p.canonicalUrl && p.canonicalUrl !== p.url && p.hasNoindex));

// Duplicate titles & descriptions among canonical pages
const canonicalTitleMap = new Map();
const canonicalDescMap = new Map();
canonicalPages.forEach(p => {
  if (p.title) {
    if (!canonicalTitleMap.has(p.title)) canonicalTitleMap.set(p.title, []);
    canonicalTitleMap.get(p.title).push(p.url);
  }
  if (p.metaDescription) {
    if (!canonicalDescMap.has(p.metaDescription)) canonicalDescMap.set(p.metaDescription, []);
    canonicalDescMap.get(p.metaDescription).push(p.url);
  }
});

const duplicateCanonicalTitles = [];
canonicalTitleMap.forEach((urls, t) => {
  if (urls.length > 1) duplicateCanonicalTitles.push({ title: t, urls });
});

const duplicateCanonicalDescs = [];
canonicalDescMap.forEach((urls, d) => {
  if (urls.length > 1) duplicateCanonicalDescs.push({ description: d, urls });
});

const duplicateTitlesAll = [];
titleMap.forEach((urls, t) => {
  if (urls.length > 1) duplicateTitlesAll.push({ title: t, urls });
});
const duplicateDescsAll = [];
descMap.forEach((urls, d) => {
  if (urls.length > 1) duplicateDescsAll.push({ description: d, urls });
});

// 8. Generate JSON Report
const jsonReport = {
  timestamp: new Date().toISOString(),
  domain: DOMAIN,
  summary: {
    totalHtmlFiles: allFiles.length,
    canonicalIndexablePages: canonicalPages.length,
    sitemapUrlsCount: sitemapUrls.length,
    componentFragmentsCount: pagesData.filter(p => p.isComponent).length,
    legacyAliasPagesCount: redirectingPages.length,
    orphanPagesCount: orphanPages.length,
    brokenInternalLinksCount: brokenLinksList.length,
    missingCanonicalCount: missingCanonical.length,
    invalidCanonicalCount: invalidCanonical.length,
    missingTitleCount: missingTitle.length,
    missingDescriptionCount: missingDesc.length,
    invalidH1Count: invalidH1.length,
    pagesMissingFromSitemapCount: missingFromSitemap.length,
    duplicateCanonicalTitlesCount: duplicateCanonicalTitles.length,
    duplicateCanonicalDescriptionsCount: duplicateCanonicalDescs.length,
    duplicateTitlesAllFilesCount: duplicateTitlesAll.length,
    duplicateDescriptionsAllFilesCount: duplicateDescsAll.length
  },
  canonicalIndexablePages: canonicalPages.map(p => ({
    url: p.url,
    file: p.filePath,
    title: p.title,
    metaDescription: p.metaDescription,
    h1: p.h1Text,
    h1Count: p.h1Count,
    canonicalUrl: p.canonicalUrl,
    robots: p.robotsDirective,
    inSitemap: p.inSitemap,
    incomingLinksCount: p.incomingLinksCount,
    structuredDataTypes: p.structuredDataTypes,
    jsonLdError: p.jsonLdError
  })),
  orphanPages: orphanPages.map(p => ({ url: p.url, file: p.filePath })),
  brokenLinks: brokenLinksList,
  missingFromSitemap: missingFromSitemap.map(p => ({ url: p.url, file: p.filePath })),
  legacyAliasPages: redirectingPages.map(p => ({
    file: p.filePath,
    canonicalTarget: p.canonicalUrl,
    refreshTarget: p.refreshTarget,
    robots: p.robotsDirective
  })),
  duplicateCanonicalTitles,
  duplicateCanonicalDescs,
  duplicateTitlesAllFiles: duplicateTitlesAll,
  duplicateDescsAllFiles: duplicateDescsAll
};

fs.writeFileSync('seo_audit_report.json', JSON.stringify(jsonReport, null, 2), 'utf8');

// 9. Generate CSV Report
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvHeaders = [
  'Page URL',
  'File Path',
  'HTTP Status (Intended)',
  'Title',
  'Meta Description',
  'H1 Count',
  'H1 Text',
  'Canonical URL',
  'Robots Directives',
  'In Sitemap.xml',
  'Incoming Internal Links',
  'Structured Data Types',
  'Has JSON-LD Error',
  'Page Type'
];

const csvRows = [csvHeaders.join(',')];

pagesData.forEach(p => {
  let pageType = 'Canonical Indexable';
  let intendedStatus = '200 OK';
  if (p.is404) {
    pageType = 'Custom Error 404';
    intendedStatus = '404 Not Found';
  } else if (p.isComponent) {
    pageType = 'Component Fragment';
    intendedStatus = '200 OK (Partial)';
  } else if (p.isVerification) {
    pageType = 'GSC Verification Token';
    intendedStatus = '200 OK';
  } else if (p.hasNoindex) {
    pageType = 'Legacy Alias / Redirect';
    intendedStatus = '301 Redirect (via .htaccess)';
  }

  csvRows.push([
    escapeCsv(p.url),
    escapeCsv(p.filePath),
    escapeCsv(intendedStatus),
    escapeCsv(p.title),
    escapeCsv(p.metaDescription),
    escapeCsv(p.h1Count),
    escapeCsv(p.h1Text),
    escapeCsv(p.canonicalUrl),
    escapeCsv(p.robotsDirective),
    escapeCsv(p.inSitemap ? 'Yes' : 'No'),
    escapeCsv(p.incomingLinksCount),
    escapeCsv(p.structuredDataTypes.join(', ')),
    escapeCsv(p.jsonLdError || 'None'),
    escapeCsv(pageType)
  ].join(','));
});

fs.writeFileSync('seo_audit_report.csv', csvRows.join('\n'), 'utf8');

// 10. Console Output Summary
console.log('================================================================');
console.log('       ASHOK HEALTHCARE - COMPLETE REPOSITORY SEO AUDIT');
console.log('================================================================');
console.log(`Total HTML Files Audited:       ${allFiles.length}`);
console.log(`Canonical Indexable Pages:      ${canonicalPages.length}`);
console.log(`Sitemap URLs (sitemap.xml):     ${sitemapUrls.length}`);
console.log(`Component Partial Fragments:    ${pagesData.filter(p => p.isComponent).length}`);
console.log(`Legacy Alias/Redirect Pages:    ${redirectingPages.length}`);
console.log('----------------------------------------------------------------');
console.log(`Orphan Pages (0 incoming links):${orphanPages.length}`);
console.log(`Broken Internal Links:          ${brokenLinksList.length}`);
console.log(`Missing Canonical Tags:         ${missingCanonical.length}`);
console.log(`Invalid Canonical Tags:         ${invalidCanonical.length}`);
console.log(`Missing Page Titles:            ${missingTitle.length}`);
console.log(`Missing Meta Descriptions:      ${missingDesc.length}`);
console.log(`Invalid H1 Tags (!= 1):         ${invalidH1.length}`);
console.log(`Missing from Sitemap.xml:       ${missingFromSitemap.length}`);
console.log(`Duplicate Canonical Titles:     ${duplicateCanonicalTitles.length}`);
console.log(`Duplicate Canonical Descs:      ${duplicateCanonicalDescs.length}`);
console.log('================================================================');
console.log(' Reports Generated:');
console.log('  -> seo_audit_report.json');
console.log('  -> seo_audit_report.csv');
console.log('================================================================');
