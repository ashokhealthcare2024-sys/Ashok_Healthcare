# Ashok Healthcare Website

Static, responsive website for Ashok Healthcare. It uses HTML, CSS, and vanilla JavaScript, with site assets in `assets/`.

## Project structure

- `index.html` — homepage
- Root-level HTML files — service, equipment, policy, and information pages
- `about-us/`, `services/`, `equipment-products/`, `gallery/`, `blog/`, `careers/`, and `contact/` — page directories
- `assets/css/`, `assets/js/`, `assets/images/`, `assets/gallery/`, and `assets/videos/` — site styles, scripts, images, and media
- `.htaccess` — Apache routing and redirects
- `.cpanel.yml` — cPanel deployment tasks
- `sitemap.xml` and `rss.xml` — search-engine sitemap and feed
- `validate_sitemap.py` — sitemap and canonical-route validation

## Run locally

From the project directory, start Python's static file server:

```powershell
python -m http.server 8080
```

Open `http://localhost:8080` in a browser. The website has no npm build step.

## Validate the sitemap

```powershell
python validate_sitemap.py
```

The validator checks sitemap XML, canonical URLs, robots.txt, and that sitemap routes map to local pages.

## Deployment

The site can be served as static files. For cPanel deployment, review `.cpanel.yml` and set `DEPLOYPATH` to the intended web root before deploying.

## Contact

- Phone: [+91 78297 53538](tel:+917829753538)
- WhatsApp: [+91 78297 53538](https://wa.me/917829753538)
- Website: [ashokhealthcare.in](https://ashokhealthcare.in/)
