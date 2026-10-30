/**
 * ASHOK HOME HEALTHCARE SERVICES - NAVIGATION JAVASCRIPT
 * Mega menu, responsive mobile drawer, subfolder resolution, active page highlighting, ARIA accessibility
 */

(function () {
  'use strict';

  function initFileProtocolCompat() {
    if (window.location.protocol !== 'file:') return;
    const isSub = /\/(about-us|services|equipment-products|gallery|blog|careers|contact)\//i.test(window.location.pathname.replace(/\\/g, '/'));
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!h || h.includes('://') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('#') || h.startsWith('javascript:')) return;
      if (h === '/' || h === '') {
        a.setAttribute('href', isSub ? '../index.html' : 'index.html');
      } else if (h === '../') {
        a.setAttribute('href', '../index.html');
      } else if (h.endsWith('/')) {
        a.setAttribute('href', h + 'index.html');
      }
    });
  }

  function initAll() {
    initFileProtocolCompat();
    ensureMobileDrawer();
    initMobileDrawer();
    highlightActiveNavLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  /**
   * Ensures a responsive offcanvas mobile drawer exists in DOM with correct subfolder prefixes
   */
  function ensureMobileDrawer() {
    if (document.getElementById('mobileDrawer')) return;

    const pathname = window.location.pathname.toLowerCase();
    const isSubfolder = pathname.includes('/services/') ||
                        pathname.includes('/blog/') ||
                        pathname.includes('/about-us/') ||
                        pathname.includes('/equipment-products/') ||
                        pathname.includes('/gallery/') ||
                        pathname.includes('/careers/') ||
                        pathname.includes('/contact/');
    const prefix = isSubfolder ? '../' : '';

    // Backdrop
    let backdrop = document.getElementById('drawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'drawerBackdrop';
      backdrop.className = 'drawer-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    // Drawer
    const drawer = document.createElement('aside');
    drawer.id = 'mobileDrawer';
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Mobile Navigation Menu');
    drawer.setAttribute('aria-hidden', 'true');

    drawer.innerHTML = `
      <div class="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3 flex-shrink-0">
        <a href="${prefix}" class="d-flex align-items-center text-decoration-none">
          <img src="${prefix}assets/images/ashoklogoh-tras.webp" alt="Ashok Home Healthcare Services" style="height: 38px; width: auto; max-width: 200px; object-fit: contain;">
        </a>
        <button type="button" id="closeMobileDrawer" class="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="d-flex flex-column gap-1.5 mb-4 overflow-y-auto flex-grow-1" style="scrollbar-width: thin;">
        <a href="${prefix}" class="mobile-nav-item" data-nav="home">Home</a>
        <a href="${prefix}about-us/" class="mobile-nav-item" data-nav="about">About Us</a>
        
        <div class="mobile-nav-group my-1">
          <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light mobile-services-toggle" style="cursor: pointer;" role="button" tabindex="0" aria-expanded="false" aria-controls="mobileServicesList" onclick="toggleMobileServicesMenu(event)">
            <span class="fw-bold text-slate-800 small user-select-none">Clinical Healthcare Services</span>
            <span class="nav-toggle-sub text-slate-600 p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; pointer-events: none;" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.25s ease;"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>
          <div id="mobileServicesList" class="mobile-services-list ps-3 flex-column gap-1 border-start border-2 border-primary-200 ms-2 mt-2">
            <a href="${prefix}services/home-nursing.html" class="mobile-nav-subitem">Home Nursing Care</a>
            <a href="${prefix}services/home-icu.html" class="mobile-nav-subitem">Home ICU Setup</a>
            <a href="${prefix}rehabilitation-neuro-and-ortho.html" class="mobile-nav-subitem">Neuro &amp; Ortho Rehab</a>
            <a href="${prefix}physiotherapy.html" class="mobile-nav-subitem">Physiotherapy at Home</a>
            <a href="${prefix}services/elder-care.html" class="mobile-nav-subitem">Elder Care &amp; Support</a>
            <a href="${prefix}palliative-care-bangalore.html" class="mobile-nav-subitem">Palliative &amp; Hospice Care</a>
            <a href="${prefix}diagnostics.html" class="mobile-nav-subitem">Diagnostic Lab Tests</a>
            <a href="${prefix}ambulance-services.html" class="mobile-nav-subitem">24/7 ALS Ambulance</a>
            <a href="${prefix}rehabilitation-centre-in-bangalore.html" class="mobile-nav-subitem">Rehabilitation Centre</a>
            <a href="${prefix}nri-parents-care-monitoring-bangalore.html" class="mobile-nav-subitem">NRI Parents Healthcare</a>
            <a href="${prefix}home-nursing-healthcare-services-bangalore.html" class="mobile-nav-subitem">Clinical Nursing Services</a>
            <a href="${prefix}services/" class="mobile-nav-subitem text-primary fw-bold">Explore All Services →</a>
          </div>
        </div>

        <!-- Medical Equipment Rentals Group -->
        <div class="mobile-nav-group my-1">
          <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light mobile-equipment-toggle" style="cursor: pointer;" role="button" tabindex="0" aria-expanded="false" aria-controls="mobileEquipmentList" onclick="toggleMobileEquipmentMenu(event)">
            <span class="fw-bold text-slate-800 small user-select-none">Medical Equipment Rentals</span>
            <span class="nav-toggle-sub text-slate-600 p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; pointer-events: none;" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.25s ease;"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>
          <div id="mobileEquipmentList" class="mobile-equipment-list ps-3 flex-column gap-1 border-start border-2 border-primary-200 ms-2 mt-2" style="display: none;">
            <a href="${prefix}oxygen-concentrator-rental-bangalore.html" class="mobile-nav-subitem">Oxygen Concentrators (5L/10L)</a>
            <a href="${prefix}bipap-cpap-machine-rental-bangalore.html" class="mobile-nav-subitem">BiPAP &amp; CPAP Machines</a>
            <a href="${prefix}hospital-bed-rental-bangalore.html" class="mobile-nav-subitem">ICU Hospital Beds</a>
            <a href="${prefix}patient-monitor-rental-bangalore.html" class="mobile-nav-subitem">Multipara Patient Monitors</a>
            <a href="${prefix}wheelchair-rental-bangalore.html" class="mobile-nav-subitem">Motorized &amp; Manual Wheelchairs</a>
            <a href="${prefix}suction-machine-rental-bangalore.html" class="mobile-nav-subitem">Suction Machines on Rent</a>
            <a href="${prefix}medical-equipment-rent-and-sales.html" class="mobile-nav-subitem">Medical Equipment Hub</a>
            <a href="${prefix}equipment-products/" class="mobile-nav-subitem text-primary fw-bold">All Equipment Catalog →</a>
          </div>
        </div>

        <!-- Bangalore Patient & Care Guides Group -->
        <div class="mobile-nav-group my-1">
          <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light mobile-guides-toggle" style="cursor: pointer;" role="button" tabindex="0" aria-expanded="false" aria-controls="mobileGuidesList" onclick="toggleMobileGuidesMenu(event)">
            <span class="fw-bold text-slate-800 small user-select-none">Bangalore Care Guides</span>
            <span class="nav-toggle-sub text-slate-600 p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; pointer-events: none;" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.25s ease;"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>
          <div id="mobileGuidesList" class="mobile-guides-list ps-3 flex-column gap-1 border-start border-2 border-primary-200 ms-2 mt-2" style="display: none;">
            <a href="${prefix}home-nursing-services-yeshwanthpur-malleshwaram-rajajinagar.html" class="mobile-nav-subitem">Yeshwanthpur &amp; Malleshwaram Nursing</a>
            <a href="${prefix}home-nursing-charges-bangalore.html" class="mobile-nav-subitem">Home Nursing Charges Bangalore</a>
            <a href="${prefix}home-nurse-vs-caregiver-bangalore.html" class="mobile-nav-subitem">Nurse vs Caregiver Comparison</a>
            <a href="${prefix}hospital-discharge-checklist-bangalore.html" class="mobile-nav-subitem">Hospital Discharge Checklist</a>
            <a href="${prefix}home-nursing-healthcare-services-bangalore.html" class="mobile-nav-subitem">Complete Home Nursing Services</a>
          </div>
        </div>

        <a href="${prefix}equipment-products/" class="mobile-nav-item" data-nav="products">Equipment &amp; Products</a>
        <a href="${prefix}gallery/" class="mobile-nav-item" data-nav="gallery">Photo &amp; Video Gallery</a>
        <a href="${prefix}blog/" class="mobile-nav-item" data-nav="blog">Healthcare Blogs</a>
        <a href="${prefix}careers/" class="mobile-nav-item" data-nav="careers">Careers &amp; Vacancies</a>
        <a href="${prefix}contact/" class="mobile-nav-item" data-nav="contact">Contact &amp; Hub</a>
      </div>

      <div class="pt-3 border-top d-flex flex-column gap-2 mt-auto flex-shrink-0">
        <a href="tel:+917829753538" class="btn-primary-custom w-100 justify-content-center py-2.5 text-decoration-none" aria-label="Emergency Call Desk">
          Book Assessment
        </a>
        <a href="tel:+917829753538" class="btn btn-outline-primary w-100 py-2 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call +91 78297 53538
        </a>
        <a href="https://wa.me/917829753538?text=Hello%20Ashok%20Healthcare%2C%20I%20need%20healthcare%20support." target="_blank" rel="noreferrer" class="btn btn-success w-100 py-2 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none">
          WhatsApp Emergency Desk
        </a>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  function openMobileDrawerAction() {
    const drawer = document.getElementById('mobileDrawer') || document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('drawerBackdrop') || document.getElementById('mobileNavBackdrop');
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (backdrop) {
      backdrop.classList.add('show');
      backdrop.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
    const toggleBtn = document.getElementById('mobileMenuToggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileDrawerAction() {
    const drawer = document.getElementById('mobileDrawer') || document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('drawerBackdrop') || document.getElementById('mobileNavBackdrop');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.classList.remove('show');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    const toggleBtn = document.getElementById('mobileMenuToggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  /**
   * Toggles the mobile services dropdown open and closed reliably
   */
  function toggleMobileServicesMenu(e, forceState) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof e === 'boolean') {
      forceState = e;
    }
    const list = document.getElementById('mobileServicesList');
    const toggles = document.querySelectorAll('.mobile-services-toggle');
    if (!list) return;

    const isCurrentlyOpen = list.classList.contains('show') || list.classList.contains('open') || window.getComputedStyle(list).display === 'flex';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
      list.classList.add('show', 'open');
      list.style.setProperty('display', 'flex', 'important');
    } else {
      list.classList.remove('show', 'open');
      list.style.setProperty('display', 'none', 'important');
    }

    toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      const icon = toggle.querySelector('svg');
      if (icon) {
        icon.style.transform = shouldOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  function toggleMobileEquipmentMenu(e, forceState) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof e === 'boolean') {
      forceState = e;
    }
    const list = document.getElementById('mobileEquipmentList');
    const toggles = document.querySelectorAll('.mobile-equipment-toggle');
    if (!list) return;

    const isCurrentlyOpen = list.classList.contains('show') || list.classList.contains('open') || window.getComputedStyle(list).display === 'flex';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
      list.classList.add('show', 'open');
      list.style.setProperty('display', 'flex', 'important');
    } else {
      list.classList.remove('show', 'open');
      list.style.setProperty('display', 'none', 'important');
    }

    toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      const icon = toggle.querySelector('svg');
      if (icon) {
        icon.style.transform = shouldOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  function toggleMobileGuidesMenu(e, forceState) {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof e === 'boolean') {
      forceState = e;
    }
    const list = document.getElementById('mobileGuidesList');
    const toggles = document.querySelectorAll('.mobile-guides-toggle');
    if (!list) return;

    const isCurrentlyOpen = list.classList.contains('show') || list.classList.contains('open') || window.getComputedStyle(list).display === 'flex';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
      list.classList.add('show', 'open');
      list.style.setProperty('display', 'flex', 'important');
    } else {
      list.classList.remove('show', 'open');
      list.style.setProperty('display', 'none', 'important');
    }

    toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      const icon = toggle.querySelector('svg');
      if (icon) {
        icon.style.transform = shouldOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // Export functions globally
  window.closeMobileDrawerAction = closeMobileDrawerAction;
  window.toggleMobileServicesMenu = toggleMobileServicesMenu;
  window.toggleMobileEquipmentMenu = toggleMobileEquipmentMenu;
  window.toggleMobileGuidesMenu = toggleMobileGuidesMenu;

  /**
   * Initializes event listeners via robust event delegation
   */
  function initMobileDrawer() {
    // Event delegation on document so dynamic headers/buttons always work
    document.addEventListener('click', (e) => {
      // Toggle button
      const toggle = e.target.closest('#mobileMenuToggle, .mobile-menu-toggle');
      if (toggle) {
        e.preventDefault();
        openMobileDrawerAction();
        return;
      }

      // Close button
      const close = e.target.closest('#closeMobileDrawer, #mobileNavClose, .close-drawer-btn');
      if (close) {
        e.preventDefault();
        closeMobileDrawerAction();
        return;
      }

      // Backdrop click
      if (e.target.matches('#drawerBackdrop, #mobileNavBackdrop') || e.target.closest('#drawerBackdrop, #mobileNavBackdrop')) {
        closeMobileDrawerAction();
        return;
      }

      // Submenu toggle in drawer (supports tapping anywhere on header row or arrow)
      const subToggle = e.target.closest('.mobile-services-toggle, #toggleMobileSubmenu, .nav-toggle-sub');
      if (subToggle) {
        toggleMobileServicesMenu(e);
        return;
      }
      const equipToggle = e.target.closest('.mobile-equipment-toggle');
      if (equipToggle) {
        toggleMobileEquipmentMenu(e);
        return;
      }
      const guidesToggle = e.target.closest('.mobile-guides-toggle');
      if (guidesToggle) {
        toggleMobileGuidesMenu(e);
        return;
      }

      // Any navigation link click inside drawer
      const navLink = e.target.closest('.mobile-drawer a, .mobile-nav-drawer a');
      if (navLink && !navLink.classList.contains('nav-toggle-sub') && !navLink.classList.contains('mobile-services-toggle')) {
        const href = navLink.getAttribute('href');
        if (href && href.startsWith('#')) {
          closeMobileDrawerAction();
        }
        // For external and page navigation links, let browser navigate naturally without aborting
      }
    });

    // Keyboard listener for Escape and Enter/Space on toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const drawer = document.getElementById('mobileDrawer') || document.getElementById('mobileNavDrawer');
        if (drawer && drawer.classList.contains('open')) {
          closeMobileDrawerAction();
        }
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (document.activeElement && document.activeElement.classList.contains('mobile-services-toggle')) {
          e.preventDefault();
          toggleMobileServicesMenu();
        }
      }
    });
  }

  /**
   * Highlights active navigation links based on current pathname
   */
  function highlightActiveNavLink() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-item-link, .mobile-nav-item, .mobile-nav-subitem');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const target = href.toLowerCase();

      // Check homepage
      if ((target === 'index.html' || target === '/' || target === './index.html' || target === '../index.html') &&
        (currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath === '')) {
        link.classList.add('active');
      } else if (target !== '/' && target !== 'index.html' && target !== '../index.html' && !target.startsWith('#')) {
        const cleanTarget = target.replace('.html', '').replace('../', '').replace('./', '');
        if (cleanTarget.length > 2 && currentPath.includes(cleanTarget)) {
          link.classList.add('active');
        }
      }
    });

    // Auto-expand services submenu if user is on any service page
    if (currentPath.includes('/services') || currentPath.includes('services.html')) {
      toggleMobileServicesMenu(true);
    }
  }
})();
