// Theme toggle + simple enhancements
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('cyberpro-theme');
  const emailContact = document.getElementById('emailContact');
  const emailAddressElement = document.getElementById('emailAddress');

  if (emailContact && emailAddressElement) {
    const emailAddress = ['DanReither', '@Gmail', '.com'].join('');
    emailContact.href = `mailto:${emailAddress}`;
    emailAddressElement.textContent = emailAddress;
  }

  if (stored === 'light') {
    root.setAttribute('data-theme', 'light');
    if (toggle) toggle.textContent = 'Ã¢Ëœâ‚¬Ã¯Â¸Â';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.setItem('cyberpro-theme', 'dark');
        toggle.textContent = 'Ã°Å¸Å’â„¢';
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('cyberpro-theme', 'light');
        toggle.textContent = 'Ã¢Ëœâ‚¬Ã¯Â¸Â';
      }
    });
  }

  const dailyReadButton = document.getElementById('dailyReadButton');
  if (dailyReadButton) {
    const intelSources = [
      ['Podcast', 'SANS Internet Storm Center', 'Daily StormCast audio briefing', 'https://isc.sans.edu/podcast.html'],
      ['Threat Intel', 'CTI Watch', 'Aggregated feed from 28 CTI sources', 'https://ctiwatch.com/articles'],
      ['News', 'TechCrunch Security', 'Security stories from the tech press', 'https://techcrunch.com/category/security/'],
      ['Briefing', 'The CyberWire', 'Daily industry news briefing', 'https://thecyberwire.com/'],
      ['News', 'Cyber Kendra', 'Vulnerabilities and threat news', 'https://www.cyberkendra.com/'],
      ['News', 'Daily Security Review', 'Ransomware, hacks and safety tips', 'https://dailysecurityreview.com/'],
      ['Threat Intel', 'StratQuad Daily Brief', 'Weekday CTI brief with severity ratings, vuln developments and UK/NCSC coverage', 'https://stratquad.co.uk/news'],
      ['Threat Intel', 'CyberNetSec.io Publications', 'Daily threat-intel article collections', 'https://cyber.netsecops.io/publications/'],
      ['Briefing', 'Decryption Digest', 'Priority threat briefing for SOC leads and responders', 'https://www.decryptiondigest.com/'],
      ['Newsletter', 'The it-learn Brief', 'Technical weekday newsletter with recent issues', 'https://blog.it-learn.io/newsletter/']
    ];
    const dailyReadSources = intelSources.map((source) => source[3]);

    const intelBoard = document.getElementById('intelBoard');
    if (intelBoard) {
      const cardsBySite = new Map();
      intelSources.forEach(([tag, name, blurb, url]) => {
        const card = document.createElement('a');
        card.className = 'intel-card';
        card.href = url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const tagEl = document.createElement('span');
        tagEl.className = 'intel-tag';
        tagEl.textContent = tag;
        const nameEl = document.createElement('strong');
        nameEl.textContent = name;
        const blurbEl = document.createElement('span');
        blurbEl.className = 'intel-blurb';
        blurbEl.textContent = blurb;

        card.append(tagEl, nameEl, blurbEl);
        intelBoard.appendChild(card);
        cardsBySite.set(url, { card, blurbEl });
      });

      fetch('https://intel-feed.j6f4q6fhs9.workers.dev/')
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('feed unavailable'))))
        .then((data) => {
          Object.entries(data.items || {}).forEach(([site, latest]) => {
            const entry = cardsBySite.get(site);
            if (!entry || !/^https:\/\//.test(latest.link)) return;
            entry.card.href = latest.link;
            entry.blurbEl.textContent = latest.title;
            entry.blurbEl.classList.add('intel-latest');
            if (latest.date) {
              const age = document.createElement('span');
              age.className = 'intel-date';
              age.textContent = new Date(latest.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              entry.card.appendChild(age);
            }
          });
        })
        .catch(() => {});
    }

    dailyReadButton.addEventListener('click', () => {
      const blockedSources = [];

      for (const url of dailyReadSources) {
        const tab = window.open(url, '_blank');
        if (tab) {
          tab.opener = null;
        } else {
          blockedSources.push(url);
        }
      }

      const status = document.getElementById('dailyReadStatus');
      const fallback = document.getElementById('dailyReadFallback');
      const fallbackLinks = fallback?.querySelector('.daily-read-fallback-links');
      if (fallback && fallbackLinks) {
        fallbackLinks.replaceChildren();
        fallback.hidden = blockedSources.length === 0;
        blockedSources.forEach((url) => {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = new URL(url).hostname.replace(/^www\./, '');
          fallbackLinks.appendChild(link);
        });
      }

      if (status) {
        status.textContent = blockedSources.length
          ? `Enable pop-ups to launch all ${dailyReadSources.length} links at once.`
          : `${dailyReadSources.length} links launched.`;
      }
    });
  }

  const weeklyPicks = [
    {
      title: 'SANS Internet StormCast',
      image: 'podcast-isc-icon.png',
      description: 'Short daily audio on significant vulnerabilities, malware, exploitation, and security developments.',
      format: 'Daily podcast Ã‚Â· Technical Ã‚Â· Free',
      links: [
        ['Listen to StormCast', 'https://isc.sans.edu/podcast.html'],
        ["Today's briefing", 'https://isc.sans.edu/today.html']
      ]
    },
    {
      title: 'SANS NewsBites',
      image: 'reference-sans.png',
      description: 'Expert-annotated security news for a broad view beyond technical indicators. SANS also publishes the weekly @RISK vulnerability brief.',
      format: 'Twice weekly Ã‚Â· Executive-friendly Ã‚Â· Free',
      links: [['Subscribe to SANS newsletters', 'https://www.sans.org/newsletters/']]
    },
    {
      title: 'CyberWire Daily',
      image: 'podcast-cyberwire-icon.png',
      description: 'A polished weekday briefing on attacks, threat actors, policy, research, and the cybersecurity industry.',
      format: 'Weekday podcast and news briefing',
      links: [
        ['Read the daily briefing', 'https://thecyberwire.com/newsletters/daily-briefing'],
        ['Listen to the podcast', 'https://thecyberwire.com/podcasts/daily-podcast/']
      ]
    },
    {
      title: 'CISA Cybersecurity Advisories',
      image: 'reference-cisa.png',
      description: 'Authoritative alerts on significant threats, exploited vulnerabilities, and recommended defensive actions.',
      format: 'Advisories and alerts Ã‚Â· Official U.S. source',
      links: [['Browse CISA advisories', 'https://www.cisa.gov/news-events/cybersecurity-advisories']]
    },
    {
      title: 'BleepingComputer',
      image: 'news-bleepingcomputer.png',
      description: 'Fast-moving coverage of ransomware, breaches, exploited vulnerabilities, and security-product issues.',
      format: 'Frequently updated Ã‚Â· Practitioner-friendly',
      links: [['Read BleepingComputer', 'https://www.bleepingcomputer.com/']]
    },
    {
      title: 'tl;dr sec',
      image: 'feed-tldrsec.png',
      description: 'High-signal security research, tools, talks, and technical write-ups across AppSec, cloud, detection, and AI security.',
      format: 'Weekly email Ã‚Â· Free',
      links: [['Subscribe to tl;dr sec', 'https://tldrsec.com/subscribe']]
    },
    {
      title: 'Krebs on Security',
      image: 'news-krebs-security.png',
      description: 'Investigative reporting on cybercrime, fraud, criminal infrastructure, and data breaches.',
      format: 'Investigative articles Ã‚Â· Free',
      links: [['Read Krebs on Security', 'https://krebsonsecurity.com/']]
    }
  ];
  const weeklyPicksContainer = document.getElementById('weeklyPicks');
  if (weeklyPicksContainer) {
    const weekNumber = Math.floor((Date.now() - Date.UTC(2026, 0, 5)) / (7 * 24 * 60 * 60 * 1000));
    const firstPick = ((weekNumber % weeklyPicks.length) + weeklyPicks.length) % weeklyPicks.length;
    for (let offset = 0; offset < 3; offset += 1) {
      const pick = weeklyPicks[(firstPick + offset) % weeklyPicks.length];
      const card = document.createElement('article');
      card.className = 'card weekly-pick';
      const image = document.createElement('img');
      image.className = 'weekly-pick-logo';
      image.src = pick.image;
      image.alt = `${pick.title} logo`;
      image.loading = 'lazy';
      image.decoding = 'async';
      const format = document.createElement('p');
      format.className = 'weekly-pick-format';
      format.textContent = pick.format;
      const title = document.createElement('h3');
      title.textContent = pick.title;
      const description = document.createElement('p');
      description.textContent = pick.description;
      const links = document.createElement('div');
      links.className = 'weekly-pick-links';
      pick.links.forEach(([label, url]) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label;
        links.appendChild(link);
      });
      card.append(image, format, title, description, links);
      weeklyPicksContainer.appendChild(card);
    }
  }

  const searchInput = document.getElementById('resourceSearch');
  const categorySelect = document.getElementById('resourceCategory');
  const searchStatus = document.getElementById('resourceSearchStatus');
  const clearSearchButton = document.getElementById('clearResourceSearch');
  const filterableItems = Array.from(document.querySelectorAll(
    '#news .card, #feeds .link-list li, #experts .expert-card, #podcasts .podcast-card, #xaccounts .account-chip, #reddit .card, #tools .link-list li, #philly-groups .local-card, #philly-events .local-card'
  ));

  function filterResources() {
    const query = searchInput?.value.trim().toLocaleLowerCase() || '';
    const category = categorySelect?.value || 'all';
    let visibleCount = 0;

    filterableItems.forEach((item) => {
      const section = item.closest('section[id]');
      const categoryMatches = category === 'all' || section?.id === category;
      const textMatches = !query || item.textContent.toLocaleLowerCase().includes(query);
      item.hidden = !(categoryMatches && textMatches);
      if (!item.hidden) visibleCount += 1;
    });

    document.querySelectorAll('#feeds .link-list, #tools .link-list').forEach((list) => {
      list.hidden = !Array.from(list.querySelectorAll('li')).some((item) => !item.hidden);
    });
    document.querySelectorAll('#feeds .two-col, #tools .two-col').forEach((columns) => {
      columns.hidden = !Array.from(columns.querySelectorAll('.link-list')).some((list) => !list.hidden);
    });
    document.querySelectorAll('#tools details.resource-category').forEach((details) => {
      const hasVisibleItem = Array.from(details.querySelectorAll('.link-list li')).some((item) => !item.hidden);
      details.open = (category === 'tools' && !query) || (Boolean(query) && hasVisibleItem);
    });

    if (searchStatus) {
      searchStatus.textContent = query || category !== 'all'
        ? `${visibleCount} ${visibleCount === 1 ? 'resource' : 'resources'} found.`
        : 'Search the full directory.';
    }
  }

  document.querySelectorAll('#tools h3.subsection-title').forEach((heading) => {
    const details = document.createElement('details');
    details.className = 'resource-category';
    const summary = document.createElement('summary');
    summary.className = heading.className;
    summary.textContent = heading.textContent;
    heading.replaceWith(details);
    details.appendChild(summary);

    let content = details.nextElementSibling;
    while (content && !content.matches('h3.subsection-title')) {
      const next = content.nextElementSibling;
      details.appendChild(content);
      content = next;
    }
  });

  searchInput?.addEventListener('input', filterResources);
  categorySelect?.addEventListener('change', filterResources);
  clearSearchButton?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    filterResources();
    searchInput?.focus();
  });

  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (backToTop) backToTop.hidden = window.scrollY < 500;
  }
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

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
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
})();
