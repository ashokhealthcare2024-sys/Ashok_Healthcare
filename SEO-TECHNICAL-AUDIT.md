# Ashok Healthcare Technical SEO Audit

**Scope:** crawlability, sitemap and canonical integrity, internal links, route normalization, and structured data.
**UI impact:** none; source changes in this audit are limited to metadata/schema and Apache routing.

## Executive summary

The public site is crawlable from the checks performed. `robots.txt` allows public paths and names the sitemap; all 38 sitemap URLs map to local pages with matching canonical URLs and titles, and no sitemap page is marked `noindex`. A recursive production crawl found 39 internal HTML URLs, all returning HTTP 200, with no failed internal destinations.

This does not prove Google has indexed the pages. Search Console access was unavailable, so Google's selected canonicals, indexing status, and any account-specific coverage issues remain unverified.

## Findings and changes

| Finding | Root cause / evidence | Action |
|---|---|---|
| The desktop Services navigation link did not navigate normally. | A JavaScript click handler intercepted the parent link even though the dropdown already works with CSS hover/focus. | Fixed in `assets/js/navigation.js`; the change is in commit `a943533`, already pushed. |
| Four featured home-page equipment/service names did not link to their matching detail pages. | Those card names were not links to their corresponding records. | Added the correct links for Home ICU, BiPAP/CPAP, oxygen concentrator, and hospital bed in `index.html`; included in `a943533`. |
| `/products` and `/products/` served duplicate HTTP 200 content instead of redirecting to the `.html` canonical. | Apache did not have an exact normalization rule for the products listing. | Added a specific 301 rule in `.htaccess` for `/products` and `/products/` to `/products.html`. This local rule still needs deployment and production verification. |
| Product JSON-LD described offer prices, review counts, and ratings not visibly supported by the product pages. | Structured data included commercial/review values absent from the visible page content. | Removed the unsupported `Product` nodes from the six product detail pages; retained valid breadcrumb schema. No prices or reviews were invented. |
| 35 FAQ schema questions were not present in their pages' HTML content. | FAQPage markup contained copied or stale questions. | Removed 33 unsupported entries across 11 pages included in this commit. The oxygen page's FAQPage node was removed because none of its marked questions appeared in its content. `diagnostics.html` has two additional stale FAQ entries in the committed baseline; it was excluded because it contains pre-existing uncommitted work. |
| Four noindex/retired aliases had page-specific schema IDs or URLs pointing at old aliases. | Canonical and JSON-LD URLs disagreed. | Aligned the relevant AboutPage/WebPage/FAQ identifiers and URLs with the canonical pages in the alias HTML files. |
| `/productsn/` returns 404. | No local route or evidence that this is a valid historical URL was found. | Left it as a real 404; no speculative redirect was added. |

The previous link/route fixes and the current schema/Apache edits do not change visible content or styling.

## Route inventory

The sitemap lists 38 canonical public URLs. Each was checked against a local HTML file, canonical, title, and robots directive.

**Core pages**

- `/`
- `/about.html`
- `/services.html`
- `/products.html`
- `/careers.html`
- `/gallery.html`
- `/blog.html`
- `/contact.html`

**Services, care guides, and clinical pages**

- `/ambulance-services.html`
- `/diagnostics.html`
- `/medical-equipment-rent-and-sales.html`
- `/physiotherapy.html`
- `/rehabilitation-neuro-and-ortho.html`
- `/services/home-nursing.html`
- `/home-nursing-services-yeshwanthpur-malleshwaram-rajajinagar.html`
- `/home-nursing-charges-bangalore.html`
- `/hospital-discharge-checklist-bangalore.html`
- `/home-nurse-vs-caregiver-bangalore.html`
- `/nri-parents-care-monitoring-bangalore.html`
- `/rehabilitation-centre-in-bangalore.html`
- `/home-nursing-healthcare-services-bangalore.html`
- `/services/home-icu.html`
- `/services/elder-care.html`
- `/palliative-care-bangalore.html`

**Product detail pages**

- `/oxygen-concentrator-rental-bangalore.html`
- `/hospital-bed-rental-bangalore.html`
- `/bipap-cpap-machine-rental-bangalore.html`
- `/patient-monitor-rental-bangalore.html`
- `/wheelchair-rental-bangalore.html`
- `/suction-machine-rental-bangalore.html`

**Blog articles**

- `/blog/best-home-healthcare-services-in-bangalore.html`
- `/blog/home-nursing-services-in-bangalore-complete-guide.html`
- `/blog/bipap-machine-in-yeshwanthpur-expert-home-healthcare-for-sleep-apnea-copd-patients.html`
- `/blog/home-icu-setup-bangalore.html`
- `/blog/physiotherapy-at-home-after-surgery.html`
- `/blog/elder-care-services-guide.html`

**Legal pages**

- `/privacy.html`
- `/terms.html`

## Crawl and validation results

- `robots.txt`: public paths are allowed; `/.git/` is disallowed; the sitemap is declared.
- Sitemap: 38 URLs; zero missing local files, canonical mismatches, missing titles, or `noindex` directives.
- Production sitemap GET checks with a Googlebot user-agent: all 38 URLs returned HTTP 200, had matching canonicals, and lacked meta `noindex` at the time of the check.
- Production recursive crawl: 39 unique internal HTML URLs, 39 HTTP 200 responses, 2,008 anchors, and zero failed/non-200 internal destinations.
- Local source audit: 53 HTML files and 2,625 anchors; zero broken internal links/fragments and zero missing local image files after honoring each page's `<base>` URL.
- Sitemap pages have one canonical preferred URL each. Previous page-structure checks found the expected title, description, and one main heading on all 38 sitemap pages.
- Structured data: all 48 JSON-LD blocks parse; zero `Product` nodes remain. The changes in this commit remove 33 unsupported FAQ questions; the committed baseline of `diagnostics.html` still has two FAQ questions not present in its visible text.
- `robots.txt`, sitemap, canonical, and source checks do not confirm Google indexing or rankings.

## Remaining limitations

- No general cross-category product/service/blog search UI was found. Existing search controls are limited to the FAQ and gallery. Search-result routing across products, services, and articles therefore could not be tested as an existing feature.
- The live `/products/` duplicate was observed before deployment of the new `.htaccess` rule. Its production redirect is not yet verified.
- `diagnostics.html` contains pre-existing uncommitted work and is excluded from this commit. Its two stale FAQ schema entries remain for separate review.
- Five Article schema nodes lack an article image. No image was added because an appropriate visible featured image was not confirmed.
- Search Console is not accessible in this session; Google's indexed-page report, selected canonical, URL Inspection, and rich-result reports need an authenticated owner check.

## Files changed in this audit

- `.htaccess`
- Product schema: `bipap-cpap-machine-rental-bangalore.html`, `hospital-bed-rental-bangalore.html`, `oxygen-concentrator-rental-bangalore.html`, `patient-monitor-rental-bangalore.html`, `wheelchair-rental-bangalore.html`, `suction-machine-rental-bangalore.html`
- FAQ schema: `ambulance-services.html`, `home-nursing-healthcare-services-bangalore.html`, `home-nursing-services-yeshwanthpur-malleshwaram-rajajinagar.html`, `hospital-discharge-checklist-bangalore.html`, `nri-parents-care-monitoring-bangalore.html`, `oxygen-concentrator-rental-bangalore.html`, `palliative-care-bangalore.html`, `rehabilitation-centre-in-bangalore.html`, `services/ambulance-services.html`, `services/home-healthcare-services-bangalore.html`, `services/index.html`
- Canonical schema URLs on retired aliases: `about-ashok-healthcare-bangalore.html`, `services/ambulance.html`, `services/diagnostic-services.html`, `services/physiotherapy.html`

## Deployment and post-deployment checks

1. Review the pushed source changes; `diagnostics.html` was excluded to preserve its pre-existing work.
2. Deploy the `.htaccess` and metadata/schema changes to the production document root.
3. Use GET requests (not HEAD) to confirm `/products/` and `/products` return a single 301 to `/products.html`, followed by HTTP 200; also verify there is no redirect loop.
4. Recheck `https://ashokhealthcare.in/robots.txt` and `https://ashokhealthcare.in/sitemap.xml`; inspect the canonical and robots meta for all sitemap URLs.
5. In Google Search Console, inspect the homepage and key product/service/article URLs, submit the sitemap, review Google's selected canonical and indexing status, and validate any reported enhancement issues.
6. Recheck after Google recrawls. Publishing sitemap or schema changes does not guarantee indexing or rich-result display.
