/* ============================================================
   QuantMate Prototype - Shared JavaScript
   Sidebar, tabs, modals, dark mode, mock data
   ============================================================ */

function initDarkMode() {
  const saved = localStorage.getItem('tm-dark');
  if (saved === '1' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}

function toggleDark() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('tm-dark', document.documentElement.classList.contains('dark') ? '1' : '0');
}

function toggleLanguagePrototype() {
  const current = localStorage.getItem('quantmate-lang') || 'en';
  const next = current === 'zh' ? 'en' : 'zh';
  localStorage.setItem('quantmate-lang', next);
  showToast(next === 'zh' ? 'Language switched to 中文 (static prototype)' : 'Language switched to English (static prototype)', 'info');
}

initDarkMode();

const CURRENT_PAGE = location.pathname.split('/').pop()?.replace('.html', '') || 'dashboard';
const PAGE_ALIASES = {
  ai: ['ai-assistant'],
  'ai-assistant': ['ai-assistant'],
  alerts: ['monitoring'],
  monitoring: ['monitoring'],
  sharing: ['team-space'],
  workspaces: ['team-space'],
  'team-space': ['team-space'],
  account: ['account-security'],
  'account-security': ['account-security'],
  'paper-trading-account': ['paper-trading'],
  'visual-explorer': ['analytics'],
};

function isCurrentPage(itemId) {
  const activeIds = PAGE_ALIASES[CURRENT_PAGE] || [CURRENT_PAGE];
  return activeIds.includes(itemId);
}

function buildSidebar() {
  const nav = [
    { section: 'Overview' },
    { name: 'Dashboard', href: 'dashboard.html', icon: 'layout-dashboard', id: 'dashboard' },
    { section: 'Research & Data' },
    { name: 'Backtesting', href: 'backtest.html', icon: 'trending-up', id: 'backtest' },
    { name: 'Market Data', href: 'market-data.html', icon: 'database', id: 'market-data' },
    { name: 'Strategy Research', href: 'strategies.html', icon: 'file-code', id: 'strategies' },
    { name: 'Factor Lab', href: 'factor-lab.html', icon: 'flask-conical', id: 'factor-lab', badge: 'Beta', badgeTone: 'beta' },
    { name: 'Composite Strategies', href: 'composite-strategies.html', icon: 'git-compare', id: 'composite-strategies', badge: 'Beta', badgeTone: 'beta' },
    { section: 'Trading & Portfolio' },
    { name: 'Portfolio', href: 'portfolio.html', icon: 'briefcase', id: 'portfolio' },
    { name: 'Trading', href: 'trading.html', icon: 'arrow-left-right', id: 'trading' },
    { name: 'Paper Trading', href: 'paper-trading.html', icon: 'globe', id: 'paper-trading' },
    { name: 'Analytics', href: 'analytics.html', icon: 'bar-chart-3', id: 'analytics' },
    { section: 'Operations & Alerts' },
    { name: 'Monitoring', href: 'monitoring.html', icon: 'bell', id: 'monitoring', badge: '3', badgeTone: 'count' },
    { name: 'Reports', href: 'reports.html', icon: 'file-text', id: 'reports' },
    { section: 'AI & Collaboration' },
    { name: 'AI Assistant', href: 'ai-assistant.html', icon: 'sparkles', id: 'ai-assistant', badge: 'Preview', badgeTone: 'preview' },
    { name: 'Auto Pilot', href: 'auto-pilot.html', icon: 'bot', id: 'auto-pilot', badge: 'Preview', badgeTone: 'preview' },
    { name: 'Marketplace', href: 'marketplace.html', icon: 'store', id: 'marketplace', badge: 'Beta', badgeTone: 'beta' },
    { name: 'Team Space', href: 'team-space.html', icon: 'users', id: 'team-space', badge: 'Preview', badgeTone: 'preview' },
    { section: 'System' },
    { name: 'Settings', href: 'settings.html', icon: 'settings', id: 'settings' },
    { name: 'Account Security', href: 'account-security.html', icon: 'shield', id: 'account-security' },
  ];

  let html = `
    <div class="sidebar-header">
      <div class="sidebar-brand-block">
        <div class="sidebar-brand-row">
          <button class="btn btn-ghost btn-icon" onclick="toggleSidebar()" title="Toggle sidebar">
            ${icon('menu')}
          </button>
          <div class="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            QuantMate宽盟
          </div>
        </div>
        <div class="sidebar-meta">
          <p>Portal Version: v0.0.0</p>
          <p>Portal Build: 2026-05-21 10:00</p>
          <p>API Version: v1</p>
          <p>API Build: 2026-05-21 10:00</p>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">`;

  nav.forEach(item => {
    if (item.section) {
      html += `<div class="sidebar-section-label">${item.section}</div>`;
    } else {
      const active = isCurrentPage(item.id) ? ' active' : '';
      const toneClass = item.badgeTone ? ` nav-badge-${item.badgeTone}` : '';
      const badge = item.badge ? `<span class="nav-badge${toneClass}">${item.badge}</span>` : '';
      html += `<a href="${item.href}" class="sidebar-link${active}">${icon(item.icon)} ${item.name}${badge}</a>`;
    }
  });

  html += `</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user-block">
        <div class="sidebar-user">
          <div class="sidebar-user-name">demo_user</div>
          <div class="sidebar-user-email">demo@quantmate.io</div>
        </div>
        <div class="sidebar-footer-actions">
          <button class="btn btn-ghost btn-sm" onclick="toggleLanguagePrototype()" title="Switch language">
            ${icon('globe')} English
          </button>
          <a href="login.html" class="btn btn-ghost btn-icon" title="Log out">${icon('log-out')}</a>
        </div>
      </div>
    </div>`;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = html;
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  if (s) s.classList.toggle('collapsed');
}

function panelsForGroup(group) {
  return document.querySelectorAll(
    `.tab-panel[data-group="${group}"], .detail-panel[data-group="${group}"]`
  );
}

function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabBar => {
    tabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = tabBar.dataset.group || 'default';
        tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        panelsForGroup(group).forEach(panel => {
          panel.classList.toggle('active', panel.dataset.panel === target);
        });
      });
    });
  });
}

function hydrateInlineIcons(root) {
  const scope = root || document.body;
  if (!scope) return;
  scope.querySelectorAll('*').forEach(el => {
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
    if (typeof el.innerHTML !== 'string' || el.innerHTML.indexOf("${icon('") === -1) return;
    el.innerHTML = el.innerHTML.replace(/\$\{icon\('([^']+)'\)\}/g, (_, name) => icon(name));
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

document.addEventListener('click', event => {
  if (event.target.classList.contains('modal-overlay') && event.target.classList.contains('open')) {
    event.target.classList.remove('open');
  }
});

const ICONS = {
  'layout-dashboard': '<path d="M3 3h7v9H3z"/><path d="M14 3h7v5h-7z"/><path d="M14 12h7v9h-7z"/><path d="M3 16h7v5H3z"/>',
  'file-code': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'bar-chart-3': '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'monitor': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'credit-card': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  'sparkles': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  'bot': '<path d="M12 2v4"/><path d="M8 6h8"/><rect x="4" y="8" width="16" height="12" rx="3"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M9 18h6"/><path d="M5 12H2"/><path d="M22 12h-3"/><path d="M8 20v2"/><path d="M16 20v2"/>',
  'store': '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>',
  'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'arrow-left-right': '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  'flask-conical': '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  'panel-left-close': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
  'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'square': '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'shopping-cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2H4l2.68 12.39A2 2 0 0 0 8.63 16H19a2 2 0 0 0 1.95-1.57L23 6H6"/>',
  'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'calculator': '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>',
  'layout-grid': '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'edit': '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'stop-circle': '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>',
  'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  'send': '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'key': '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'menu': '<line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>',
  'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
  'wallet': '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};

function icon(name, cls = '') {
  const paths = ICONS[name] || ICONS.info;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">${paths}</svg>`;
}

function pageShell(title, subtitle) {
  return `<div class="page-header">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
      </div>
      <button class="btn btn-ghost btn-icon" style="display:none" id="mobile-menu" onclick="toggleSidebar()">${icon('menu')}</button>
    </div>
  </div>`;
}

const MOCK = {
  stocks: [
    { code: 'AAPL', name: 'Apple', price: 185.6, change: 2.35, industry: 'Consumer Tech' },
    { code: 'MSFT', name: 'Microsoft', price: 412.48, change: -0.64, industry: 'Software' },
    { code: 'NVDA', name: 'NVIDIA', price: 948.92, change: 1.12, industry: 'Semiconductors' },
    { code: 'AMZN', name: 'Amazon', price: 156.3, change: 1.85, industry: 'E-Commerce' },
    { code: 'JPM', name: 'JPMorgan', price: 185.67, change: -0.32, industry: 'Banking' },
    { code: 'META', name: 'Meta', price: 512.21, change: 3.12, industry: 'Internet' },
    { code: 'XOM', name: 'Exxon Mobil', price: 118.45, change: 0.56, industry: 'Energy' },
    { code: 'TSLA', name: 'Tesla', price: 222.18, change: -2.41, industry: 'EV' },
  ],
  strategies: [
    { id: 1, name: 'DualMA_Cross', type: 'CTA', status: 'active', version: 3, desc: 'Dual moving average crossover strategy', className: 'DualMaCross' },
    { id: 2, name: 'RSI_Reversal', type: 'CTA', status: 'active', version: 2, desc: 'RSI reversal strategy', className: 'RsiReversal' },
    { id: 3, name: 'BollingerBand', type: 'CTA', status: 'active', version: 1, desc: 'Bollinger breakout strategy', className: 'BollingerBand' },
    { id: 4, name: 'MACD_Trend', type: 'CTA', status: 'active', version: 1, desc: 'MACD trend following', className: 'MacdTrend' },
    { id: 5, name: 'MyAlpha01', type: 'Alpha', status: 'active', version: 5, desc: 'Multi-factor stock selection with momentum', className: 'MyAlpha01' },
    { id: 6, name: 'MeanRevert_v2', type: 'Custom', status: 'draft', version: 2, desc: 'Mean reversion draft strategy', className: 'MeanRevertV2' },
    { id: 7, name: 'PairTrading_v1', type: 'StatArb', status: 'active', version: 1, desc: 'Statistical arbitrage pair trading', className: 'PairTrading' },
    { id: 8, name: 'QlibTopK', type: 'AI', status: 'active', version: 2, desc: 'Qlib model-based stock ranking', className: 'QlibTopK' },
    { id: 9, name: 'GridTrader', type: 'Grid', status: 'active', version: 1, desc: 'Dynamic grid trading for range-bound markets', className: 'GridTrader' },
    { id: 10, name: 'MomentumAlpha', type: 'Alpha', status: 'active', version: 3, desc: 'Technical momentum alpha strategy', className: 'MomentumAlpha' },
    { id: 11, name: 'MLPredictor', type: 'AI', status: 'draft', version: 1, desc: 'Machine learning price prediction', className: 'MlPredictor' },
    { id: 12, name: 'VolBreakout', type: 'Custom', status: 'active', version: 2, desc: 'Volatility breakout entry strategy', className: 'VolBreakout' },
  ],
  backtests: [
    { id: 'BT-001', strategy: 'DualMA_Cross', symbol: 'AAPL', status: 'completed', return: 23.5, sharpe: 1.42, maxDD: -12.3, date: '2026-03-13' },
    { id: 'BT-002', strategy: 'RSI_Reversal', symbol: 'AMZN', status: 'completed', return: 15.2, sharpe: 1.18, maxDD: -8.7, date: '2026-03-13' },
    { id: 'BT-003', strategy: 'MyAlpha01', symbol: 'NVDA', status: 'running', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
    { id: 'BT-004', strategy: 'BollingerBand', symbol: 'JPM', status: 'failed', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
    { id: 'BT-005', strategy: 'DualMA_Cross', symbol: 'MSFT', status: 'queued', return: null, sharpe: null, maxDD: null, date: '2026-03-14' },
  ],
  positions: [
    { symbol: 'AAPL', name: 'Apple', strategy: 'DualMA_Cross', dir: 'Long', qty: 100, entry: 182, current: 185.6, pnl: 360, pnlPct: 1.98 },
    { symbol: 'AMZN', name: 'Amazon', strategy: 'RSI_Reversal', dir: 'Long', qty: 500, entry: 148.5, current: 156.3, pnl: 3900, pnlPct: 5.25 },
    { symbol: 'TSLA', name: 'Tesla', strategy: 'MyAlpha01', dir: 'Long', qty: 1000, entry: 246, current: 222.18, pnl: -23820, pnlPct: -9.68 },
  ],
  orders: [
    { id: 'ORD-001', time: '09:31:02', symbol: 'AAPL', dir: 'Buy', type: 'Limit', price: 182, qty: 100, filled: 100, status: 'filled' },
    { id: 'ORD-002', time: '09:35:15', symbol: 'AMZN', dir: 'Buy', type: 'Market', price: 148.5, qty: 500, filled: 500, status: 'filled' },
    { id: 'ORD-003', time: '10:02:30', symbol: 'TSLA', dir: 'Buy', type: 'Limit', price: 246, qty: 1000, filled: 1000, status: 'filled' },
    { id: 'ORD-004', time: '14:25:00', symbol: 'META', dir: 'Sell', type: 'Limit', price: 515, qty: 200, filled: 0, status: 'pending' },
    { id: 'ORD-005', time: '14:30:00', symbol: 'JPM', dir: 'Buy', type: 'Stop', price: 184.5, qty: 300, filled: 0, status: 'cancelled' },
  ],
  alerts: [
    { id: 1, time: '14:32:00', type: 'Price move', level: 'Warning', symbol: 'TSLA', msg: 'Tesla dropped more than 5%', status: 'Open' },
    { id: 2, time: '13:15:00', type: 'System error', level: 'Critical', symbol: '', msg: 'Worker process exited unexpectedly', status: 'Acknowledged' },
    { id: 3, time: '10:05:00', type: 'Data delay', level: 'Info', symbol: '', msg: 'Market feed delayed by more than 5 minutes', status: 'Resolved' },
  ],
  factors: [
    { name: 'momentum_20d', ic: 0.052, ir: 1.23, ret: 8.5, desc: '20-day momentum factor' },
    { name: 'value_pe', ic: 0.038, ir: 0.95, ret: 6.2, desc: 'PE valuation factor' },
    { name: 'quality_roe', ic: 0.045, ir: 1.10, ret: 7.8, desc: 'ROE quality factor' },
    { name: 'size_ln_mv', ic: -0.031, ir: -0.78, ret: -3.1, desc: 'Market cap factor' },
    { name: 'volatility_60d', ic: -0.028, ir: -0.65, ret: -2.5, desc: '60-day volatility factor' },
    { name: 'turnover_20d', ic: 0.022, ir: 0.55, ret: 4.1, desc: '20-day turnover factor' },
  ],
};

function pnlColor(val) {
  return val >= 0 ? 'text-success' : 'text-destructive';
}

function pnlSign(val) {
  return val >= 0 ? '+' : '';
}

function statusBadge(status) {
  const map = {
    completed: 'badge-success',
    filled: 'badge-success',
    active: 'badge-success',
    online: 'badge-success',
    Resolved: 'badge-success',
    running: 'badge-primary',
    queued: 'badge-warning',
    pending: 'badge-warning',
    Open: 'badge-warning',
    failed: 'badge-destructive',
    cancelled: 'badge-muted',
    draft: 'badge-muted',
    Acknowledged: 'badge-primary',
    Info: 'badge-primary',
    Warning: 'badge-warning',
    Critical: 'badge-destructive',
  };
  return `<span class="badge ${map[status] || 'badge-muted'}">${status}</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  hydrateInlineIcons();
  initTabs();
});

function showToast(msg, type) {
  type = type || 'info';
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icons = { success: 'OK', error: 'ERR', info: 'INFO', warning: 'WARN' };
  toast.innerHTML = '<span>' + (icons[type] || 'INFO') + '</span> ' + msg;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function showConfirm(msg, onYes) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-box"><h4>Confirm action</h4><p>' + msg + '</p><div class="confirm-actions"><button class="btn btn-secondary btn-sm" id="cfmNo">Cancel</button><button class="btn btn-primary btn-sm" id="cfmYes">Confirm</button></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#cfmNo').onclick = function () { document.body.removeChild(overlay); };
  overlay.querySelector('#cfmYes').onclick = function () { document.body.removeChild(overlay); if (onYes) onYes(); };
  overlay.addEventListener('click', function (event) { if (event.target === overlay) document.body.removeChild(overlay); });
}

function submitModal(id, msg, type) {
  closeModal(id);
  showToast(msg, type || 'success');
}

function activateTab(group, tabName) {
  const bar = document.querySelector('.tabs[data-group="' + group + '"]');
  if (!bar) return;
  bar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  panelsForGroup(group).forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });
}
