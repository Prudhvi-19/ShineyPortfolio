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

function renderSectionHeading(section) {
  return `
    <div class="section-heading">
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
      const target = action.href.startsWith('http') ? ' target="_blank" rel="noreferrer"' : '';
      return `<a class="button button--${escapeHtml(action.style || 'ghost')}" href="${escapeHtml(action.href)}"${download}${target}>${escapeHtml(action.label)}</a>`;
    })
    .join('');
}

function renderChipList(items) {
  return `<ul class="chip-list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function renderBulletList(items) {
  return `<ul class="bullet-list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function renderLinkList(items) {
  return `<ul class="link-list">${items
    .map((item) => {
      const download = item.download ? ` download="${escapeHtml(item.download)}"` : '';
      const target = item.href.startsWith('http') ? ' target="_blank" rel="noreferrer"' : '';
      return `<li><a href="${escapeHtml(item.href)}"${download}${target}>${escapeHtml(item.label)}</a></li>`;
    })
    .join('')}</ul>`;
}

function applyMeta(site) {
  if (site.seo?.title) {
    document.title = site.seo.title;
  }

  const description = document.querySelector('meta[name="description"]');
  if (description && site.seo?.description) {
    description.setAttribute('content', site.seo.description);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor && site.seo?.themeColor) {
    themeColor.setAttribute('content', site.seo.themeColor);
  }
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

function renderHero(site) {
  document.getElementById('hero-copy').innerHTML = `
    <p class="eyebrow">${escapeHtml(site.hero.eyebrow)}</p>
    <h1>${escapeHtml(site.hero.headline)}</h1>
    <p class="hero__lead">${escapeHtml(site.hero.lead)}</p>
    <p class="hero__support">${escapeHtml(site.hero.support)}</p>
    <div class="hero__actions">${renderActions(site.hero.actions)}</div>
  `;

  document.getElementById('hero-role').innerHTML = `
    <article class="panel panel--dark">
      <h2>${escapeHtml(site.currentRole.heading)}</h2>
      <p class="profile-card__title">${escapeHtml(site.currentRole.title)} · ${escapeHtml(site.currentRole.subtitle)}</p>
      <ul class="meta-list">
        ${site.currentRole.items
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
    </article>
  `;

  document.getElementById('hero-stats').innerHTML = `
    <article class="panel">
      <p class="eyebrow">${escapeHtml(site.stats.heading)}</p>
      <div class="metric-grid">
        ${site.stats.items
          .map(
            (item) => `
              <div class="metric-card">
                <strong>${escapeHtml(item.value)}</strong>
                <span>${escapeHtml(item.label)}</span>
              </div>
            `
          )
          .join('')}
      </div>
    </article>
  `;
}

function renderAbout(site) {
  document.getElementById('about-main').innerHTML = `
    <div class="section-heading section-heading--compact">
      <p class="eyebrow">${escapeHtml(site.about.eyebrow)}</p>
      <h2>${escapeHtml(site.about.title)}</h2>
      ${site.about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
    </div>
  `;

  document.getElementById('about-side').innerHTML = site.about.sideCards
    .map((card) => {
      let content = '';
      if (card.type === 'chips') {
        content = renderChipList(card.items);
      } else if (card.type === 'links') {
        content = renderLinkList(card.items);
      } else {
        content = renderBulletList(card.items);
      }

      return `
        <article class="content-card">
          <h3>${escapeHtml(card.title)}</h3>
          ${content}
        </article>
      `;
    })
    .join('');
}

function renderResearch(research) {
  const cards = research.cards
    .map(
      (card) => `
        <article class="research-card">
          <p class="kicker">${escapeHtml(card.kicker)}</p>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.summary)}</p>
          ${card.tags ? renderChipList(card.tags) : ''}
        </article>
      `
    )
    .join('');

  document.getElementById('research-section').innerHTML = `
    ${renderSectionHeading(research.section)}
    <div class="research-layout">
      <article class="research-feature">
        <p class="kicker">${escapeHtml(research.featured.kicker)}</p>
        <h3>${escapeHtml(research.featured.title)}</h3>
        <p>${escapeHtml(research.featured.summary)}</p>
        ${renderChipList(research.featured.tags)}
      </article>
      <div class="research-stack">${cards}</div>
    </div>
  `;
}

function renderPublications(publications, site) {
  const groupsHtml = publications.groups
    .map(
      (group) => `
        <article class="publication-card">
          <h3>${escapeHtml(group.title)}</h3>
          <div class="publication-list">
            ${group.items
              .map(
                (item) => `
                  <div class="publication-item">
                    <p class="publication-title">${escapeHtml(item.title)}</p>
                    <p>${escapeHtml(item.citation)}</p>
                    ${item.link ? `<a href="${escapeHtml(item.link.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.link.label)}</a>` : ''}
                  </div>
                `
              )
              .join('')}
          </div>
        </article>
      `
    )
    .join('');

  const summary = publications.groups.map((group) => ({
    title: group.title,
    count: group.items.length
  }));

  const documentCard = site.documents?.items?.length
    ? `
        <article class="publication-sidebar-card">
          <h3>${escapeHtml(site.documents.title)}</h3>
          ${renderLinkList(site.documents.items)}
        </article>
      `
    : '';

  document.getElementById('publications-section').innerHTML = `
    ${renderSectionHeading(publications.section)}
    <div class="publication-layout">
      <div class="publication-stack">${groupsHtml}</div>
      <aside class="publication-sidebar">
        <article class="publication-sidebar-card">
          <h3>${escapeHtml(publications.presentations.title)}</h3>
          ${renderBulletList(publications.presentations.items)}
        </article>
        <article class="publication-sidebar-card">
          <h3>Publication snapshot</h3>
          <div class="publication-summary">
            ${summary
              .map(
                (item) => `
                  <div class="summary-chip">
                    <strong>${escapeHtml(item.count)}</strong>
                    <span>${escapeHtml(item.title)}</span>
                  </div>
                `
              )
              .join('')}
          </div>
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
          (group) => `
            <article class="method-card">
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
  document.getElementById('timeline-section').innerHTML = `
    <div class="timeline-layout">
      <div class="timeline-shell">
        <p class="eyebrow">${escapeHtml(timeline.section.eyebrow)}</p>
        <h2>${escapeHtml(timeline.section.title)}</h2>
        <p>${escapeHtml(timeline.section.intro)}</p>
      </div>
      <div class="timeline-list">
        ${timeline.entries
          .map(
            (entry) => `
              <article class="timeline-entry">
                <div class="timeline-date">${escapeHtml(entry.date)}</div>
                <div class="timeline-card">
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
            <article class="content-card">
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
  document.getElementById('contact-section').innerHTML = `
    <div class="contact-shell">
      <div>
        <p class="eyebrow">${escapeHtml(site.contact.eyebrow)}</p>
        <h2>${escapeHtml(site.contact.title)}</h2>
        <p>${escapeHtml(site.contact.body)}</p>
      </div>
      <div class="contact-actions">${renderActions(site.contact.actions)}</div>
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
    note.textContent = site.footer.note;
  }
}

function setPersonSchema(site) {
  const schema = document.getElementById('person-schema');
  if (!schema) {
    return;
  }

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
        addressLocality: site.person.location.split(',')[0],
        addressRegion: site.person.location.split(',').slice(1).join(',').trim()
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

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });
}

function restoreHashPosition() {
  if (!window.location.hash) {
    return;
  }

  requestAnimationFrame(() => {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView();
    }
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
    renderHero(site);
    renderAbout(site);
    renderResearch(research);
    renderPublications(publications, site);
    renderMethods(methods);
    renderTimeline(timeline);
    renderMentorship(mentorship);
    renderContact(site);
    setFooter(site);
    setPersonSchema(site);
    setupNavigation();
    restoreHashPosition();
  } catch (error) {
    renderError(error);
    setupNavigation();
  }
}

loadSite();
