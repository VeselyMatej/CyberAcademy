// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (!menuToggle || !nav) return;
  
  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
      // Open menu
      nav.style.display = 'flex';
      // Small delay to allow display to update before animating
      setTimeout(() => {
        nav.classList.add('active');
        document.body.style.overflow = 'hidden';
      }, 10);
    } else {
      // Close menu
      nav.classList.remove('active');
      document.body.style.overflow = '';
      // Wait for animation to complete before hiding
      setTimeout(() => {
        if (!nav.classList.contains('active')) {
          nav.style.display = 'none';
        }
      }, 300);
    }
  }
  
  // Toggle menu on button click
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      toggleMenu();
    }
  });
  
  // Close menu when clicking on a nav link
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', toggleMenu);
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 860) {
        // Reset menu state on desktop
        nav.style.display = '';
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }, 250);
  });
});

// Handle smooth scrolling and section highlighting
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');
  const header = document.querySelector('.topbar');
  const headerHeight = header.offsetHeight;
  let lastScrollTop = 0;

  // Handle click on nav links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  // Function to update active nav link
  function updateActiveLink() {
    const scrollPosition = window.scrollY + headerHeight + 20;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Throttle scroll event for better performance
  let isScrolling;
  window.addEventListener('scroll', () => {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(updateActiveLink, 50);
  }, { passive: true });

  // Initial check on page load
  updateActiveLink();
});

// Set current year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Show/hide back to top button
window.addEventListener('scroll', () => {
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  }
});

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');
if (backToTopButton) {
  // Show/hide button on scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });

  // Smooth scroll to top when clicked
  backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Send via local backend (Express + Nodemailer)
(function () {
  const btn = document.getElementById('sendMessageBtn');
  const msg = document.getElementById('message');
  const status = document.getElementById('sendStatus');
  const fromName = document.getElementById('senderName');
  const replyTo = document.getElementById('senderEmail');
  if (!btn || !msg || !status) return;

  btn.addEventListener('click', async () => {
    const text = (msg.value || '').trim();
    const nameVal = (fromName && fromName.value || '').trim();
    const emailVal = (replyTo && replyTo.value || '').trim();
    if (!text) {
      status.textContent = 'Napište prosím zprávu.';
      return;
    }
    btn.disabled = true;
    status.textContent = 'Odesílám…';
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, from_name: nameVal, reply_to: emailVal })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error('SEND_FAILED');
      status.textContent = 'Zpráva byla odeslána. Děkujeme!';
      msg.value = '';
      if (fromName) fromName.value = '';
      if (replyTo) replyTo.value = '';
    } catch (e) {
      status.textContent = 'Odeslání se nezdařilo. Zkuste to prosím znovu.';
    } finally {
      btn.disabled = false;
    }
  });
})();

// Logo fallback: if logo image fails, remove it and keep text brand visible
(function () {
  const brand = document.querySelector('.brand');
  const logoImg = document.querySelector('.brand-logo');
  if (!brand) return;

  // If the image exists but fails to load, remove it and rely on text
  if (logoImg) {
    const markNoLogo = () => {
      try { logoImg.remove(); } catch (_) {}
      brand.classList.add('no-logo');
    };

    logoImg.addEventListener('error', markNoLogo);

    // In case the image is missing and no error event fires quickly
    setTimeout(() => {
      if (!logoImg.naturalWidth) markNoLogo();
    }, 800);
  } else {
    brand.classList.add('no-logo');
  }
})();
