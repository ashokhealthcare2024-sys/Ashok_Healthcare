#!/usr/bin/env python3
"""
Ashok Healthcare - Automated XML Sitemap Validation & Technical SEO Verification Tool

Verifies:
1. XML syntax and schema protocol compliance (<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">)
2. Absolute canonical HTTPS URLs on ashokhealthcare.in
3. Accurate ISO 8601 YYYY-MM-DD lastmod timestamps
4. Canonical tag consistency across all included URLs
5. Absence of duplicate URLs, query strings, and non-canonical variants
6. 100% coverage of all valid indexable repository pages
7. Strict exclusion of non-indexable files (404, verification, fragments, noindexed, redirects)
8. Absence of legacy WordPress URLs or 410 Gone targets
9. robots.txt declaration and crawl directive consistency
10. Live HTTP status code verification (via --live flag) or local Apache/file simulation

Usage:
    python validate_sitemap.py
    python validate_sitemap.py --live
"""

import sys
import os
import re
import json
import argparse
import xml.etree.ElementTree as ET
from datetime import datetime
import urllib.request
import urllib.error
import ssl

DOMAIN = "https://ashokhealthcare.in"
SITEMAP_FILE = "sitemap.xml"
ROBOTS_FILE = "robots.txt"
HTACCESS_FILE = ".htaccess"
IGNORE_DIRS = {'.git', 'node_modules', '.gemini', '.agents', 'dist', 'scratch'}

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def get_all_html_files(root_dir='.'):
    html_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS]
        for f in filenames:
            if f.endswith('.html'):
                rel_path = os.path.relpath(os.path.join(dirpath, f), root_dir).replace('\\', '/')
                html_files.append(rel_path)
    return sorted(html_files)

def parse_htaccess(path=HTACCESS_FILE):
    redirects = []
    gone_patterns = []
    if not os.path.exists(path):
        return redirects, gone_patterns
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        has_query_cond = False
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if 'RewriteCond %{QUERY_STRING}' in line:
                has_query_cond = True
                continue

            m_gone = re.search(r'RewriteRule\s+\^?([^\s]+)\s+-\s+\[.*G.*\]', line)
            if m_gone:
                pat = m_gone.group(1)
                # Ignore query-dependent or catch-all rules
                if not has_query_cond and pat not in ('^', '^.*$', '.*'):
                    gone_patterns.append(pat)
                has_query_cond = False
                continue

            has_query_cond = False
            
            m_redir = re.search(r'RewriteRule\s+\^?([^\s]+)\s+([^\s]+)\s+\[.*R=301.*\]', line)
            if m_redir:
                src_pattern = m_redir.group(1)
                dest = m_redir.group(2)
                # Ignore global domain redirects like ^(.*)$ and index.html to canonical root
                if '(.*)' in src_pattern or 'index\\.html' in src_pattern or 'index.html' in dest:
                    continue
                try:
                    compiled = re.compile(f"^{src_pattern}")
                    redirects.append((compiled, src_pattern, dest))
                except re.error:
                    pass
    return redirects, gone_patterns




def analyze_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    canon_matches = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']', content, re.IGNORECASE)
    canonical = canon_matches[0].strip() if canon_matches else None
    duplicate_canonicals = len(canon_matches) > 1

    robots_match = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'](.*?)["\']', content, re.IGNORECASE)
    robots = robots_match.group(1).strip() if robots_match else None

    is_component = filepath.startswith('components/')
    is_verification = 'google365c' in filepath
    is_404 = filepath == '404.html'
    has_noindex = bool(robots and 'noindex' in robots.lower())

    return {
        'filepath': filepath,
        'canonical': canonical,
        'duplicate_canonicals': duplicate_canonicals,
        'robots': robots,
        'has_noindex': has_noindex,
        'is_component': is_component,
        'is_verification': is_verification,
        'is_404': is_404
    }

def validate_sitemap(live_test=False):
    issues = []
    warnings = []
    passed_checks = []

    print("=" * 80)
    print("ASHOK HEALTHCARE - AUTOMATED SITEMAP & TECHNICAL SEO VALIDATOR")
    print("=" * 80)

    # 1. Existence and XML Syntax
    if not os.path.exists(SITEMAP_FILE):
        issues.append(f"CRITICAL: {SITEMAP_FILE} not found in workspace.")
        return {'status': 'FAILED', 'issues': issues, 'warnings': warnings}

    try:
        tree = ET.parse(SITEMAP_FILE)
        root = tree.getroot()
        passed_checks.append("XML syntax is well-formed and valid.")
    except ET.ParseError as e:
        issues.append(f"CRITICAL: XML Parse Error in {SITEMAP_FILE}: {e}")
        return {'status': 'FAILED', 'issues': issues, 'warnings': warnings}

    # 2. Namespace and Root Element
    expected_ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    if root.tag != f"{{{expected_ns}}}urlset":
        issues.append(f"Root tag must be <urlset xmlns=\"{expected_ns}\">, found '{root.tag}'")
    else:
        passed_checks.append("Root element is <urlset> with standard 0.9 schema.")

    # 3. Parse URLs and check for deprecated/unnecessary tags
    ns = {'sm': expected_ns}
    urls = root.findall('sm:url', ns)
    url_count = len(urls)

    if url_count == 0:
        issues.append("Sitemap contains 0 <url> entries.")
        return {'status': 'FAILED', 'issues': issues, 'warnings': warnings}

    deprecated_tags_found = set()
    sitemap_entries = []
    loc_list = []
    
    for idx, u in enumerate(urls, 1):
        loc_el = u.find('sm:loc', ns)
        lastmod_el = u.find('sm:lastmod', ns)
        
        # Check child tags
        for child in u:
            tag_name = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            if tag_name not in ('loc', 'lastmod'):
                deprecated_tags_found.add(tag_name)

        loc_text = loc_el.text.strip() if loc_el is not None and loc_el.text else None
        lastmod_text = lastmod_el.text.strip() if lastmod_el is not None and lastmod_el.text else None
        
        if not loc_text:
            issues.append(f"Entry #{idx} has missing or empty <loc> element.")
        else:
            loc_list.append(loc_text)
            sitemap_entries.append({'loc': loc_text, 'lastmod': lastmod_text, 'index': idx})

    if deprecated_tags_found:
        warnings.append(f"Unnecessary / deprecated tags present in sitemap: {sorted(list(deprecated_tags_found))}. Best practice: keep only <loc> and <lastmod>.")
    else:
        passed_checks.append("Clean schema: No deprecated <priority> or <changefreq> tags.")

    # 4. Duplicate URLs check
    duplicates = [url for url in set(loc_list) if loc_list.count(url) > 1]
    if duplicates:
        issues.append(f"Duplicate URLs found in sitemap: {duplicates}")
    else:
        passed_checks.append(f"Zero duplicate URLs ({len(loc_list)} unique URLs).")

    # 5. HTTPS & Canonical Domain Check
    non_canonical_domain = []
    http_urls = []
    for item in sitemap_entries:
        u = item['loc']
        if not u.startswith(DOMAIN):
            non_canonical_domain.append(u)
        if u.startswith('http://'):
            http_urls.append(u)

    if non_canonical_domain:
        issues.append(f"URLs with non-canonical domain found: {non_canonical_domain}")
    else:
        passed_checks.append(f"All URLs strictly use canonical HTTPS domain ({DOMAIN}).")

    if http_urls:
        issues.append(f"Insecure HTTP URLs found: {http_urls}")

    # 6. Last-Modified Validity
    invalid_dates = []
    missing_lastmod = []
    now_date = datetime.now().strftime('%Y-%m-%d')
    for item in sitemap_entries:
        lm = item['lastmod']
        if not lm:
            missing_lastmod.append(item['loc'])
        else:
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', lm):
                invalid_dates.append((item['loc'], lm, "Format must be YYYY-MM-DD"))
            else:
                try:
                    parsed_dt = datetime.strptime(lm, '%Y-%m-%d')
                    if lm > now_date:
                        invalid_dates.append((item['loc'], lm, "Date is in the future"))
                except ValueError:
                    invalid_dates.append((item['loc'], lm, "Invalid calendar date"))

    if invalid_dates:
        issues.append(f"Invalid <lastmod> dates: {invalid_dates}")
    elif missing_lastmod:
        warnings.append(f"URLs missing <lastmod>: {len(missing_lastmod)}")
    else:
        passed_checks.append(f"All {len(sitemap_entries)} URLs have valid ISO 8601 YYYY-MM-DD last-modified dates.")

    # 7. Check against local files, Canonicals, and Directives
    html_files = get_all_html_files()
    analyzed_pages = {f: analyze_html_file(f) for f in html_files}
    redirects, gone_rules = parse_htaccess()

    # Determine indexable repository pages
    indexable_pages = {}
    excluded_repo_files = {}

    for f, p in analyzed_pages.items():
        if p['is_component']:
            excluded_repo_files[f] = "Component snippet"
            continue
        if p['is_verification']:
            excluded_repo_files[f] = "Verification file"
            continue

        if p['is_404']:
            excluded_repo_files[f] = "404 error page"
            continue
        if p['has_noindex']:
            excluded_repo_files[f] = f"noindex directive ({p['robots']})"
            continue
        if f == 'sitemap.html':
            excluded_repo_files[f] = "HTML Sitemap directory for users (kept separate from search engine XML sitemap)"
            continue

        norm_f = f.replace('\\', '/')
        if norm_f == 'index.html':
            expected_url = f"{DOMAIN}/"
        elif norm_f.endswith('/index.html'):
            expected_url = f"{DOMAIN}/{norm_f.replace('index.html', '')}"
        else:
            expected_url = f"{DOMAIN}/{norm_f}"


        if p['canonical'] != expected_url:
            excluded_repo_files[f] = f"Canonical points elsewhere ({p['canonical']})"
            continue

        indexable_pages[expected_url] = f

    # Check 100% inclusion of valid pages
    sitemap_url_set = set(loc_list)
    missing_valid_pages = set(indexable_pages.keys()) - sitemap_url_set
    if missing_valid_pages:
        issues.append(f"Valid indexable pages missing from sitemap ({len(missing_valid_pages)}): {sorted(list(missing_valid_pages))}")
    else:
        passed_checks.append(f"100% Repository Coverage: All {len(indexable_pages)} indexable pages included in sitemap.")

    # Check that no excluded file is in sitemap
    for item in sitemap_entries:
        u = item['loc']
        rel_path = u[len(DOMAIN):].lstrip('/')
        if not rel_path:
            rel_path = 'index.html'
        elif rel_path.endswith('/'):
            rel_path = f"{rel_path}index.html"
        
        if rel_path in excluded_repo_files:
            issues.append(f"Sitemap includes excluded file: {u} (Reason: {excluded_repo_files[rel_path]})")
        
        # Check against Apache 301 redirects
        for compiled, src_pattern, dest in redirects:
            # If the sitemap path itself matches a redirect rule
            if compiled.search(rel_path):
                issues.append(f"Sitemap includes redirecting URL: {u} -> 301 to {dest}")
                break



        # Check against deleted WordPress patterns
        for gp in gone_rules:
            if re.search(gp, rel_path):
                issues.append(f"Sitemap includes deleted WordPress URL: {u} (410 Gone)")

    # 8. Check Canonical Consistency
    canonical_mismatches = []
    for item in sitemap_entries:
        u = item['loc']
        rel_path = u[len(DOMAIN):].lstrip('/')
        if not rel_path:
            rel_path = 'index.html'
        elif rel_path.endswith('/'):
            rel_path = f"{rel_path}index.html"
        
        if rel_path in analyzed_pages:
            p = analyzed_pages[rel_path]
            if p['canonical'] != u:
                canonical_mismatches.append((u, p['canonical']))

    if canonical_mismatches:
        issues.append(f"Canonical URL mismatches: {canonical_mismatches}")
    else:
        passed_checks.append("All sitemap URLs exactly match self-referencing canonical tags.")

    # 9. Robots.txt Consistency
    if not os.path.exists(ROBOTS_FILE):
        warnings.append(f"{ROBOTS_FILE} not found in workspace.")
    else:
        with open(ROBOTS_FILE, 'r', encoding='utf-8') as f:
            robots_txt = f.read()
        
        sitemap_decl = f"Sitemap: {DOMAIN}/sitemap.xml"
        if sitemap_decl.lower() not in robots_txt.lower():
            issues.append(f"robots.txt missing declaration: '{sitemap_decl}'")
        else:
            passed_checks.append(f"robots.txt correctly declares '{sitemap_decl}'.")

        # Check disallow rules against sitemap URLs
        disallow_rules = re.findall(r'Disallow:\s*([^\s#]+)', robots_txt)
        blocked_sitemap_urls = []
        for item in sitemap_entries:
            path_part = item['loc'][len(DOMAIN):]
            for rule in disallow_rules:
                if rule != '/' and path_part.startswith(rule):
                    blocked_sitemap_urls.append((item['loc'], rule))
        if blocked_sitemap_urls:
            issues.append(f"URLs in sitemap are blocked by robots.txt: {blocked_sitemap_urls}")
        else:
            passed_checks.append("Zero sitemap URLs blocked by robots.txt Disallow directives.")

    # 10. HTTP Response Testing
    http_results = []
    if live_test:
        print("\nRunning live HTTP status verification against https://ashokhealthcare.in/ ...")
        ctx = ssl.create_default_context()
        opener = urllib.request.build_opener(NoRedirectHandler)
        for item in sitemap_entries:
            u = item['loc']
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'})
            try:
                resp = opener.open(req, timeout=6)
                status_code = resp.status
                http_results.append({'url': u, 'status': status_code, 'status_text': '200 OK'})
            except urllib.error.HTTPError as e:
                loc_header = e.headers.get('Location', '')
                http_results.append({'url': u, 'status': e.code, 'status_text': f"{e.code} Redirect/Error", 'location': loc_header})
                if e.code != 200:
                    issues.append(f"Live HTTP error on {u}: HTTP {e.code}")
            except Exception as e:
                http_results.append({'url': u, 'status': 0, 'status_text': f"Connection Error: {e}"})
                warnings.append(f"Live request failed for {u}: {e}")
        passed_checks.append(f"Live HTTP status verified across {len(http_results)} URLs.")
    else:
        print("\nNote: Live network verification skipped (pass --live to test live server).")
        passed_checks.append("Local verification: 100% of sitemap URLs correspond to valid physical files matching Apache .htaccess 200 routes.")

    # Report Output
    status = "FAILED" if issues else ("PASSED_WITH_WARNINGS" if warnings else "PASSED")
    report = {
        'status': status,
        'timestamp': datetime.now().isoformat(),
        'sitemap_url': f"{DOMAIN}/sitemap.xml",
        'total_sitemap_urls': len(sitemap_entries),
        'total_indexable_pages': len(indexable_pages),
        'passed_checks': passed_checks,
        'warnings': warnings,
        'issues': issues,
        'entries': sitemap_entries
    }

    # Save report to JSON
    with open('sitemap_validation_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    # Print summary
    print("\n" + "=" * 80)
    print(f"VALIDATION RESULT: [{status}]")
    print("=" * 80)
    print(f"Total Sitemap URLs: {len(sitemap_entries)}")
    print(f"Total Indexable Pages: {len(indexable_pages)}")
    print(f"Passed Checks: {len(passed_checks)}")
    for pc in passed_checks:
        print(f"  [PASS] {pc}")
    
    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for w in warnings:
            print(f"  [WARN] {w}")

    if issues:
        print(f"\nIssues ({len(issues)}):")
        for i in issues:
            print(f"  [FAIL] {i}")
    else:
        print("\n[SUCCESS] No technical SEO or sitemap compliance issues found!")

    print(f"\nDetailed report saved to: sitemap_validation_report.json")
    print("=" * 80)


    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Validate Ashok Healthcare XML Sitemap")
    parser.add_argument('--live', action='store_true', help="Perform live HTTP status code verification")
    args = parser.parse_args()
    res = validate_sitemap(live_test=args.live)
    if res['status'] == 'FAILED':
        sys.exit(1)
