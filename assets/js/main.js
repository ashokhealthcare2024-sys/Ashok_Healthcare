/**
 * ASHOK HOME HEALTHCARE SERVICES - MAIN JAVASCRIPT
 * Core UI interactions, scroll behaviors, and global initializers
 */

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
