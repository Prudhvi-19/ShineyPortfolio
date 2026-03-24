async function fetchJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setMetaContent(selector, value) {
  if (!value) {
    return;
  }

  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('content', value);
  }
}

function getSideCard(site, type) {
  return site.about?.sideCards?.find((card) => card.type === type) || null;
}

function getInterestItems(site) {
  return getSideCard(site, 'chips')?.items || [];
}

function getApproachItems(site) {
  return getSideCard(site, 'bullets')?.items || [];
}

function getCurrentFocus(site) {
  return (
    site.currentRole?.items?.find((item) => item.label.toLowerCase().includes('focus'))?.value ||
    site.hero?.support ||
    ''
  );
}

function getInquiryModes(site) {
  const item = site.stats?.items?.find((entry) => entry.label.toLowerCase().includes('modes of inquiry'));
  if (!item) {
    return '';
  }

  if (item.label.includes(':')) {
    return item.label.split(':').slice(1).join(':').trim();
  }

  return item.label;
}

function getPublicationTotal(publications) {
  return publications.groups.reduce((count, group) => count + group.items.length, 0);
}

function renderSectionHeading(section) {
  return `
    <div class="section-heading" data-reveal>
      <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
      <h2>${escapeHtml(section.title)}</h2>
      ${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''}
    </div>
  `;
}

function renderActions(actions) {
  return actions
    .map((action) => {
      const download = action.download ? ` download="${escapeHtml(action.download)}"` : '';
      const external = /^https?:\/\//.test(action.href);
      const target = external ? ' target="_blank" rel="noreferrer"' : '';

      return `
        <a
          class="button button--${escapeHtml(action.style || 'ghost')}"
          href="${escapeHtml(action.href)}"${download}${target}
        >
          ${escapeHtml(action.label)}
        </a>
      `;
    })
    .join('');
}

function renderChipList(items, className = 'chip-list') {
  if (!items?.length) {
    return '';
  }

  return `
    <ul class="${escapeHtml(className)}">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;
}

function renderBulletList(items, className = 'bullet-list') {
  if (!items?.length) {
    return '';
  }

  return `
    <ul class="${escapeHtml(className)}">
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;
}

function renderLinkList(items, className = 'document-list') {
  if (!items?.length) {
    return '';
  }

  return `
    <ul class="${escapeHtml(className)}">
      ${items
        .map((item) => {
          const download = item.download ? ` download="${escapeHtml(item.download)}"` : '';
          const external = /^https?:\/\//.test(item.href);
          const target = external ? ' target="_blank" rel="noreferrer"' : '';

          return `
            <li>
              <a href="${escapeHtml(item.href)}"${download}${target}>${escapeHtml(item.label)}</a>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function applyMeta(site) {
  if (site.seo?.title) {
    document.title = site.seo.title;
  }

  setMetaContent('meta[name="description"]', site.seo?.description);
  setMetaContent('meta[name="theme-color"]', site.seo?.themeColor);
  setMetaContent('meta[property="og:title"]', site.seo?.title);
  setMetaContent('meta[property="og:description"]', site.seo?.description);
  setMetaContent('meta[name="twitter:title"]', site.seo?.title);
  setMetaContent('meta[name="twitter:description"]', site.seo?.description);
}

function renderBrand(site) {
  const mark = document.querySelector('.brand__mark');
  const name = document.querySelector('.brand__text strong');
  const role = document.querySelector('.brand__text small');

  if (mark) {
    mark.textContent = site.person.shortName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  if (name) {
    name.textContent = site.person.shortName;
  }

  if (role) {
    role.textContent = site.person.title;
  }
}

function renderHero(site, research, publications) {
  const interests = getInterestItems(site);
  const publicationTotal = getPublicationTotal(publications);
  const inquiryModes = getInquiryModes(site) || 'Bench, clinical, and computational';
  const focus = getCurrentFocus(site);
  const focusSignals = research.featured?.tags?.length ? research.featured.tags : interests;
  const openStatus = /doctoral opportunities/i.test(site.contact?.title || '')
    ? 'Open to PhD opportunities'
    : 'Research collaborations welcome';
  const atlasMetaItems = [
    {
      label: 'Institution',
      value: site.person.worksFor
    },
    {
      label: 'Location',
      value: site.person.location
    },
    {
      label: 'Current role',
      value: site.currentRole.title
    }
  ];

  document.getElementById('hero-copy').innerHTML = `
    <div data-reveal>
      <div class="hero__status">
        <span class="hero__status-pill hero__status-pill--accent">${escapeHtml(openStatus)}</span>
        <span class="hero__status-pill">${escapeHtml(site.person.worksFor)}</span>
        <span class="hero__status-pill hero__status-pill--warm">${escapeHtml(site.person.location)}</span>
      </div>
      <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
      <h1>${escapeHtml(site.hero.headline)}</h1>
      <p class="hero__lede">${escapeHtml(site.hero.lead)}</p>
      <p class="hero__support">${escapeHtml(site.hero.support)}</p>
      <div class="hero__actions">${renderActions(site.hero.actions)}</div>
      <ul class="hero__meta">
        <li><strong>Department</strong> ${escapeHtml(site.person.department)}</li>
        <li><strong>Current focus</strong> ${escapeHtml(focus)}</li>
        <li><strong>Approach</strong> ${escapeHtml(inquiryModes)}</li>
      </ul>
    </div>
  `;

  document.getElementById('hero-panel').innerHTML = `
    <article class="atlas-shell" data-reveal>
      <div class="atlas-shell__header">
        <div>
          <p class="atlas-shell__eyebrow">Current lab chapter</p>
          <h2>${escapeHtml(focus)}</h2>
        </div>
        <span class="atlas-shell__label">${escapeHtml(publicationTotal)} papers in motion</span>
      </div>

      <div class="atlas-shell__summary">
        <p>${escapeHtml(site.currentRole.title)} · ${escapeHtml(site.currentRole.subtitle)}</p>
        <p>${escapeHtml(site.person.worksFor)} · ${escapeHtml(site.person.location)}</p>
      </div>

      <ul class="atlas-meta">
        ${atlasMetaItems
          .map(
            (item) => `
              <li>
                <strong>${escapeHtml(item.label)}</strong>
                <span>${escapeHtml(item.value)}</span>
              </li>
            `
          )
          .join('')}
      </ul>

      <div class="metric-mosaic">
        ${site.stats.items
          .map(
            (item) => `
              <div class="metric-tile">
                <strong>${escapeHtml(item.value)}</strong>
                <span>${escapeHtml(item.label)}</span>
              </div>
            `
          )
          .join('')}
      </div>

      <div class="signal-cluster">
        <p class="signal-cluster__label">Experimental languages</p>
        ${renderChipList(focusSignals.slice(0, 6), 'signal-list')}
      </div>
    </article>
  `;
}

function renderAbout(site, timeline) {
  const interests = getInterestItems(site);
  const approach = getApproachItems(site);
  const documents = site.documents?.items || [];

  document.getElementById('about-section').innerHTML = `
    <div class="about-grid">
      <article class="about-story" data-reveal>
        <p class="eyebrow">${escapeHtml(site.about.eyebrow)}</p>
        <h2>${escapeHtml(site.about.title)}</h2>
        ${site.about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        ${renderChipList(site.person.knowsAbout?.slice(0, 6) || [])}
      </article>

      <div class="about-rail">
        <article class="note-card note-card--warm" data-reveal>
          <p class="note-card__label">Research interests</p>
          <h3>${escapeHtml(getSideCard(site, 'chips')?.title || 'Research interests')}</h3>
          ${renderChipList(interests)}
        </article>

        <article class="note-card" data-reveal>
          <p class="note-card__label">Research practice</p>
          <h3>${escapeHtml(getSideCard(site, 'bullets')?.title || 'How I approach research')}</h3>
          ${renderBulletList(approach)}
        </article>

        <article class="note-card note-card--mint" data-reveal>
          <span class="trajectory-chip">${escapeHtml(timeline.entries.length)} chapters across research and training</span>
          <p class="note-card__label">Portfolio documents</p>
          <h3>${escapeHtml(site.documents?.title || 'Documents')}</h3>
          ${timeline.foundation ? `<p>${escapeHtml(timeline.foundation.summary)}</p>` : ''}
          ${renderLinkList(documents)}
        </article>
      </div>
    </div>
  `;
}

function renderResearch(research) {
  const cards = research.cards
    .map(
      (card) => `
        <article class="research-card" data-reveal>
          <div class="research-card__meta">
            <p class="kicker">${escapeHtml(card.kicker)}</p>
          </div>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.summary)}</p>
          ${renderChipList(card.tags, 'tag-list')}
        </article>
      `
    )
    .join('');

  document.getElementById('research-section').innerHTML = `
    ${renderSectionHeading(research.section)}
    <div class="research-grid">
      <article class="research-feature" data-reveal>
        <div class="research-feature__meta">
          <p class="kicker">${escapeHtml(research.featured.kicker)}</p>
        </div>
        <h3>${escapeHtml(research.featured.title)}</h3>
        <p>${escapeHtml(research.featured.summary)}</p>
        ${renderChipList(research.featured.tags, 'tag-list')}
      </article>

      <div class="research-stack">
        ${cards}
      </div>
    </div>
  `;
}

function renderPublications(publications, site) {
  const totalPublications = getPublicationTotal(publications);
  const underReviewCount =
    publications.groups.find((group) => group.title.toLowerCase() === 'under review')?.items.length || 0;

  const groupsHtml = publications.groups
    .map(
      (group) => `
        <article class="publication-group" data-reveal>
          <div class="publication-group__header">
            <h3>${escapeHtml(group.title)}</h3>
            <span class="publication-group__count">${escapeHtml(group.items.length)}</span>
          </div>
          <div class="publication-list">
            ${group.items
              .map(
                (item) => `
                  <div class="publication-item">
                    <p class="publication-title">${escapeHtml(item.title)}</p>
                    <p>${escapeHtml(item.citation)}</p>
                    ${item.link ? `<a class="publication-link" href="${escapeHtml(item.link.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.link.label)}</a>` : ''}
                  </div>
                `
              )
              .join('')}
          </div>
        </article>
      `
    )
    .join('');

  const documentCard = site.documents?.items?.length
    ? `
        <article class="publication-sidebar-card" data-reveal>
          <h3>${escapeHtml(site.documents.title)}</h3>
          ${renderLinkList(site.documents.items)}
        </article>
      `
    : '';

  document.getElementById('publications-section').innerHTML = `
    ${renderSectionHeading(publications.section)}
    <div class="publication-grid">
      <div class="publication-groups">
        ${groupsHtml}
      </div>

      <aside class="publication-sidebar">
        <article class="publication-sidebar-card" data-reveal>
          <h3>Publication snapshot</h3>
          <div class="publication-summary">
            <div class="summary-stat">
              <strong>${escapeHtml(totalPublications)}</strong>
              <span>papers and manuscripts</span>
            </div>
            <div class="summary-stat">
              <strong>${escapeHtml(underReviewCount)}</strong>
              <span>under review</span>
            </div>
            <div class="summary-stat">
              <strong>${escapeHtml(publications.presentations.items.length)}</strong>
              <span>selected talks</span>
            </div>
          </div>
        </article>

        <article class="publication-sidebar-card" data-reveal>
          <h3>${escapeHtml(publications.presentations.title)}</h3>
          ${renderBulletList(publications.presentations.items, 'presentation-list')}
        </article>

        ${documentCard}
      </aside>
    </div>
  `;
}

function renderMethods(methods) {
  document.getElementById('methods-section').innerHTML = `
    ${renderSectionHeading(methods.section)}
    <div class="methods-grid">
      ${methods.groups
        .map(
          (group, index) => `
            <article class="method-card" data-reveal>
              <p class="method-card__label">Track ${String(index + 1).padStart(2, '0')}</p>
              <h3>${escapeHtml(group.title)}</h3>
              ${renderBulletList(group.items)}
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderTimeline(timeline) {
  const foundationCard = timeline.foundation
    ? `
        <article class="foundation-card" data-reveal>
          <p class="eyebrow">${escapeHtml(timeline.foundation.eyebrow)}</p>
          <h3>${escapeHtml(timeline.foundation.title)}</h3>
          <p>${escapeHtml(timeline.foundation.summary)}</p>
          ${renderChipList(timeline.foundation.tags)}
        </article>
      `
    : '';

  document.getElementById('timeline-section').innerHTML = `
    <div class="timeline-grid">
      <aside class="timeline-intro" data-reveal>
        <p class="eyebrow">${escapeHtml(timeline.section.eyebrow)}</p>
        <h2>${escapeHtml(timeline.section.title)}</h2>
        <p>${escapeHtml(timeline.section.intro)}</p>
        ${foundationCard}
      </aside>

      <div class="timeline-list">
        ${timeline.entries
          .map(
            (entry) => `
              <article class="timeline-entry" data-reveal>
                <div class="timeline-entry__date">${escapeHtml(entry.date)}</div>
                <div class="timeline-entry__body">
                  <h3>${escapeHtml(entry.title)}</h3>
                  <p class="kicker">${escapeHtml(entry.meta)}</p>
                  <p>${escapeHtml(entry.description)}</p>
                </div>
              </article>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderMentorship(mentorship) {
  document.getElementById('mentorship-section').innerHTML = `
    ${renderSectionHeading(mentorship.section)}
    <div class="mentorship-grid">
      ${mentorship.cards
        .map(
          (card) => `
            <article class="mentorship-card" data-reveal>
              <p class="eyebrow">${escapeHtml(card.eyebrow)}</p>
              <h3>${escapeHtml(card.title)}</h3>
              ${renderBulletList(card.items)}
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderContact(site) {
  const qrCard = site.contact?.qr
    ? `
        <aside class="contact-qr" data-reveal>
          <div class="contact-qr__frame">
            <img
              src="${escapeHtml(site.contact.qr.image)}"
              alt="QR code linking to the live Shiney Chandraganti portfolio"
              width="220"
              height="220"
              loading="lazy"
              onerror="this.onerror=null;this.src='${escapeHtml(site.contact.qr.fallbackImage || site.contact.qr.image)}';"
            />
          </div>
          <h3>${escapeHtml(site.contact.qr.title)}</h3>
          ${site.contact.qr.caption ? `<p>${escapeHtml(site.contact.qr.caption)}</p>` : ''}
          ${site.contact.qr.showUrl ? `<a class="contact-qr__link" href="${escapeHtml(site.contact.qr.url)}" target="_blank" rel="noreferrer">${escapeHtml(site.contact.qr.url)}</a>` : ''}
        </aside>
      `
    : '';

  document.getElementById('contact-section').innerHTML = `
    <div class="contact-shell">
      <div class="contact-panel" data-reveal>
        <div>
          <p class="eyebrow">${escapeHtml(site.contact.eyebrow)}</p>
          <h2>${escapeHtml(site.contact.title)}</h2>
          <p>${escapeHtml(site.contact.body)}</p>
        </div>

        <ul class="contact-panel__meta">
          <li>${escapeHtml(site.person.email)}</li>
          <li>${escapeHtml(site.person.location)}</li>
          <li>${escapeHtml(site.person.worksFor)}</li>
        </ul>

        <div class="contact-actions">${renderActions(site.contact.actions)}</div>
      </div>
      ${qrCard}
    </div>
  `;
}

function setFooter(site) {
  const year = document.getElementById('year');
  const note = document.getElementById('footer-note');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (note) {
    if (site.footer?.note) {
      note.textContent = site.footer.note;
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }
}

function setPersonSchema(site) {
  const schema = document.getElementById('person-schema');
  if (!schema) {
    return;
  }

  const [addressLocality = '', ...rest] = site.person.location.split(',');

  schema.textContent = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: site.person.name,
      jobTitle: site.person.title,
      worksFor: {
        '@type': 'CollegeOrUniversity',
        name: site.person.worksFor
      },
      alumniOf: site.person.alumniOf.map((name) => ({
        '@type': 'CollegeOrUniversity',
        name
      })),
      address: {
        '@type': 'PostalAddress',
        addressLocality: addressLocality.trim(),
        addressRegion: rest.join(',').trim()
      },
      email: `mailto:${site.person.email}`,
      knowsAbout: site.person.knowsAbout
    },
    null,
    2
  );
}

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const header = document.querySelector('.site-header');

  if (!toggle || !nav || !header) {
    return;
  }

  const closeNav = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });
}

function setupHeaderState() {
  const header = document.querySelector('[data-header]');
  if (!header) {
    return;
  }

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupScrollProgress() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) {
    return;
  }

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progressBar.style.width = `${ratio * 100}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  if (!links.length) {
    return;
  }

  const linkMap = new Map(links.map((link) => [link.getAttribute('href').slice(1), link]));
  const sections = Array.from(document.querySelectorAll('main section[id]')).filter((section) =>
    linkMap.has(section.id)
  );

  if (!sections.length) {
    return;
  }

  const update = () => {
    const marker = window.scrollY + window.innerHeight * 0.28;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) {
        activeId = section.id;
      }
    });

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function revealInViewElements() {
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      element.style.setProperty('--reveal-delay', '0ms');
      element.classList.add('is-immediate');
      element.classList.add('is-visible');
    }
  });
}

function setupRevealAnimations() {
  const elements = document.querySelectorAll('[data-reveal]');

  if (!elements.length) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  elements.forEach((element, index) => {
    const delay = `${(index % 6) * 55}ms`;
    const rect = element.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.92) {
      element.style.setProperty('--reveal-delay', '0ms');
      element.classList.add('is-immediate');
      element.classList.add('is-visible');
    } else {
      element.style.setProperty('--reveal-delay', delay);
      observer.observe(element);
    }
  });
}

function restoreHashPosition() {
  if (!window.location.hash) {
    return;
  }

  const jump = () => {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ block: 'start' });
    }
  };

  requestAnimationFrame(() => {
    jump();
    setTimeout(() => {
      jump();
      revealInViewElements();
    }, 80);
    setTimeout(() => {
      jump();
      revealInViewElements();
    }, 180);
  });
}

function renderError(error) {
  const message = `Unable to load portfolio content. ${error.message}`;
  document.querySelectorAll('.loading-card').forEach((element) => {
    element.innerHTML = `<p>${escapeHtml(message)}</p>`;
  });
}

async function loadSite() {
  try {
    const [site, research, publications, methods, timeline, mentorship] = await Promise.all([
      fetchJson('data/site.json'),
      fetchJson('data/research.json'),
      fetchJson('data/publications.json'),
      fetchJson('data/methods.json'),
      fetchJson('data/timeline.json'),
      fetchJson('data/mentorship.json')
    ]);

    applyMeta(site);
    renderBrand(site);
    renderHero(site, research, publications);
    renderAbout(site, timeline);
    renderResearch(research);
    renderPublications(publications, site);
    renderMethods(methods);
    renderTimeline(timeline);
    renderMentorship(mentorship);
    renderContact(site);
    setFooter(site);
    setPersonSchema(site);
    setupNavigation();
    setupHeaderState();
    setupScrollProgress();
    setupScrollSpy();
    setupRevealAnimations();
    restoreHashPosition();
  } catch (error) {
    renderError(error);
    setupNavigation();
    setupHeaderState();
    setupScrollProgress();
  }
}

loadSite();
