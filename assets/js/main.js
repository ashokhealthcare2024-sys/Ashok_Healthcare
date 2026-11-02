/**
 * Local File Protocol (file://) Compatibility Handler
 * When testing pages offline by double-clicking HTML files without a web server,
 * browsers show a folder directory listing instead of serving index.html.
 * This automatically appends index.html to folder links so the site navigates seamlessly offline.
 */
(function initFileProtocolCompat() {
  if (window.location.protocol !== 'file:') return;

  function resolveFileLink(href) {
    if (!href || href.includes('://') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('javascript:')) {
      return null;
    }
    const isSub = /\/(about-us|services|equipment-products|gallery|blog|careers|contact)\//i.test(window.location.pathname.replace(/\\/g, '/'));
    const clean = href.split('?')[0].split('#')[0];
    if (clean === '/' || clean === '') {
      return isSub ? '../index.html' : 'index.html';
    }
    if (clean === '../') {
      return '../index.html';
    }
    if (clean.endsWith('/')) {
      return clean + 'index.html';
    }
    return null;
  }

  // Intercept all link clicks immediately
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const resolved = resolveFileLink(link.getAttribute('href'));
    if (resolved) {
      e.preventDefault();
      window.location.href = resolved;
    }
  }, true);

  // Also rewrite href attributes in DOM when ready
  const rewriteLinks = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const resolved = resolveFileLink(a.getAttribute('href'));
      if (resolved) {
        a.setAttribute('href', resolved);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteLinks);
  } else {
    rewriteLinks();
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initHeaderOffset();
  initNavbarScroll();
  initScrollToTop();
  updateCurrentYear();
});

/**
 * Dynamically computes and updates the site header height variable
 * Prevents fixed navbar from overlapping page banners or content across devices
 */
function initHeaderOffset() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const updateHeight = () => {
    const height = header.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty('--site-header-height', `${height}px`);
    }
  };

  updateHeight();
  window.addEventListener('resize', updateHeight, { passive: true });
  window.addEventListener('orientationchange', updateHeight, { passive: true });
}

/**
 * Toggles navbar background styling on scroll
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.main-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on page load
}

/**
 * Controls visibility and click event for the Scroll-To-Top button
 */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Updates dynamic year in copyright notice
 */
function updateCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
