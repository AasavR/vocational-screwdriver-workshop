// nav.js — Global Experience Selector Overlay for Client Portal
(function() {
  'use strict';

  const EXPERIENCES = [
    {
      id: 'screwdriver',
      href: 'index.html',
      emoji: '🔩',
      title: 'Precision Screwdriver',
      desc: '4-Bolt Workpiece Disassembly (Unity 6 XR)',
      badge: 'LIVE',
      badgeClass: 'xp-badge-active'
    },
    {
      id: 'wrench',
      href: 'experience-wrench.html',
      emoji: '🔧',
      title: 'Torque Wrench Lab',
      desc: '6-Bolt Cylinder Head · 0-150 Nm Torque Dial',
      badge: 'NEW',
      badgeClass: 'xp-badge-new'
    },
    {
      id: 'pliers',
      href: 'experience-pliers.html',
      emoji: '🔌',
      title: 'Combination Pliers Lab',
      desc: '8-Pin Wire Terminals · Grip & Crimp Mechanics',
      badge: 'NEW',
      badgeClass: 'xp-badge-new'
    },
    {
      id: 'showroom',
      href: 'factory-showroom.html',
      emoji: '🏭',
      title: '500-Tool Factory Showroom',
      desc: '5 Classified Industrial Bays · 3D Walkthrough',
      badge: '500 TOOLS',
      badgeClass: 'xp-badge-gold'
    }
  ];

  const path = window.location.pathname.split('/').pop() || 'index.html';
  let activeId = 'screwdriver';
  if (path.includes('wrench')) activeId = 'wrench';
  else if (path.includes('pliers')) activeId = 'pliers';
  else if (path.includes('showroom')) activeId = 'showroom';

  function ensureStyles() {
    if (!document.querySelector('link[href="nav.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'nav.css';
      document.head.appendChild(link);
    }
  }

  function createLauncher() {
    const badge = document.createElement('div');
    badge.id = 'xp-launcher-badge';

    const panel = document.createElement('div');
    panel.id = 'xp-panel';

    const header = document.createElement('div');
    header.className = 'xp-panel-header';
    header.innerHTML = '<span>⚡ WORKSHOP EXPERIENCES</span><span>4 MODULES</span>';
    panel.appendChild(header);

    EXPERIENCES.forEach(xp => {
      const card = document.createElement('a');
      card.className = 'xp-card' + (xp.id === activeId ? ' active-xp' : '');
      card.href = xp.href;
      card.innerHTML = `
        <div class="xp-emoji">${xp.emoji}</div>
        <div class="xp-info">
          <div class="xp-title">${xp.title}</div>
          <div class="xp-desc">${xp.desc}</div>
        </div>
        <div class="xp-badge ${xp.badgeClass}">${xp.badge}</div>
      `;
      panel.appendChild(card);
    });

    const btn = document.createElement('button');
    btn.id = 'xp-trigger-btn';
    btn.innerHTML = `<span class="xp-icon">⚙</span> EXPERIENCES (4)`;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.classList.toggle('open');
      btn.classList.toggle('open', open);
    });

    document.addEventListener('click', (e) => {
      if (!badge.contains(e.target)) {
        panel.classList.remove('open');
        btn.classList.remove('open');
      }
    });

    badge.appendChild(panel);
    badge.appendChild(btn);
    document.body.appendChild(badge);
  }

  function createTopNav() {
    if (activeId === 'screwdriver') return; // index.html already has its own full header

    const nav = document.createElement('div');
    nav.id = 'xp-top-nav';

    const currentXp = EXPERIENCES.find(x => x.id === activeId);
    nav.innerHTML = `
      <div class="xp-nav-left">
        <a href="index.html" class="xp-home-btn">← MAIN WORKSHOP</a>
        <div class="xp-nav-crumb">${currentXp ? currentXp.emoji + ' ' + currentXp.title : 'Tool Experience'} <span>· Vocational Training XR</span></div>
      </div>
      <div class="xp-nav-right">
        <a href="ScrewdriverWorkshop.apk" download="ScrewdriverWorkshop.apk" class="xp-home-btn" style="color:#00e676;border-color:rgba(0,230,118,0.4);background:rgba(0,230,118,0.1)">
          📥 Quest APK (17.5 MB)
        </a>
      </div>
    `;

    document.body.insertBefore(nav, document.body.firstChild);
  }

  function init() {
    ensureStyles();
    createLauncher();
    createTopNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
