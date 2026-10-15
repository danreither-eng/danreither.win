// Theme toggle + simple enhancements
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('cyberpro-theme');

  if (stored === 'light') {
    root.setAttribute('data-theme', 'light');
    if (toggle) toggle.textContent = '☀️';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.setItem('cyberpro-theme', 'dark');
        toggle.textContent = '🌙';
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('cyberpro-theme', 'light');
        toggle.textContent = '☀️';
      }
    });
  }

  // Smooth active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    let current = '';
    sections.forEach((sec) => {
      if (scrollY >= sec.offsetTop) current = sec.getAttribute('id');
    });
    navLinks.forEach((link) => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--accent-bright)';
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
})();
