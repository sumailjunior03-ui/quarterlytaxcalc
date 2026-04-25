/* GA4 - Calc-HQ Network Analytics (single injection point) */
(function(){if(!window.__GA4_LOADED){window.__GA4_LOADED=true;var id="G-W4SWZ1YRS2";var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config",id);}})();

/* network.js — single source of truth for site navigation and related tools. */
"use strict";
window.FORBIDDEN_DOMAINS = ["tokentodollarmargin.com"];
window.NETWORK_LINKS = [
  { domain: "calc-hq.com",             name: "Calc-HQ",                url: "https://calc-hq.com/",              description: "Financial calculator hub",           live: true },
  { domain: "1099vsw2calc.com",        name: "1099vsW2Calc.com",       url: "https://1099vsw2calc.com/",         description: "1099 vs W-2 comparison calculator",  live: true },
  { domain: "aftertaxsalarycalc.com",  name: "AfterTaxSalaryCalc.com", url: "https://aftertaxsalarycalc.com/",   description: "After-tax salary calculator",        live: true },
  { domain: "freelanceincomecalc.com", name: "FreelanceIncomeCalc.com",url: "https://freelanceincomecalc.com/",  description: "Freelance income calculator",        live: true },
  { domain: "quarterlytaxcalc.com",    name: "QuarterlyTaxCalc.com",   url: "https://quarterlytaxcalc.com/",     description: "Quarterly tax estimator",            live: true }
];
(function validateNetwork() {
  var seen = Object.create(null);
  for (var i = 0; i < window.NETWORK_LINKS.length; i++) {
    var item = window.NETWORK_LINKS[i];
    if (!item || !item.domain || !item.name || !item.url || typeof item.live !== "boolean") throw new Error("Invalid NETWORK_LINKS entry at index " + i);
    var domain = String(item.domain).toLowerCase();
    if (seen[domain]) throw new Error("Duplicate domain in NETWORK_LINKS: " + domain);
    if (window.FORBIDDEN_DOMAINS.indexOf(domain) !== -1) throw new Error("Forbidden domain present in NETWORK_LINKS: " + domain);
    seen[domain] = true;
  }
})();
window.renderSiteHeader = function renderSiteHeader() {
  var targets = document.querySelectorAll('[data-site-header-nav]');
  if (!targets.length) return;
  var path = window.location.pathname || "/";
  var current = "/";
  if (path.indexOf("/about.html") !== -1) current = "/about.html";
  else if (path.indexOf("/faq.html") !== -1) current = "/faq.html";
  else if (path.indexOf("/privacy.html") !== -1) current = "/privacy.html";
  else if (path.indexOf("/legal.html") !== -1) current = "/legal.html";
  else if (path.indexOf("/contact.html") !== -1) current = "/contact.html";
  function link(href, label) {
    var active = href === current;
    return '<a' + (active ? ' class="active" aria-current="page"' : '') + ' href="' + href + '">' + label + '</a>';
  }
  var navHtml = ['<nav class="header-nav" aria-label="Primary">', link("/", "Home"), link("/about.html", "About"), link("/faq.html", "FAQ"), link("/privacy.html", "Privacy"), link("/legal.html", "Legal"), link("/contact.html", "Contact"), '</nav>'].join('');
  for (var i = 0; i < targets.length; i++) targets[i].innerHTML = navHtml;
};
window.renderFooter = function renderFooter(currentDomain) {
  var footerTarget = document.getElementById('site-footer');
  if (!footerTarget) return;
  var host = String(currentDomain || '').toLowerCase();
  var liveLinks = [];
  for (var i = 0; i < window.NETWORK_LINKS.length; i++) {
    var link = window.NETWORK_LINKS[i];
    var domain = String(link.domain).toLowerCase();
    if (link.live !== true) continue;
    if (window.FORBIDDEN_DOMAINS.indexOf(domain) !== -1) continue;
    if (domain === 'calc-hq.com') continue;
    if (host && domain === host) continue;
    liveLinks.push(link);
  }
  liveLinks.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  var relatedToolsHtml = '<p class="footer-empty">No related tools are listed yet.</p>';
  if (liveLinks.length) {
    relatedToolsHtml = '<ul class="footer-links">' + liveLinks.map(function (link) { return '<li><a href="' + link.url + '">' + link.name + '</a><span>' + link.description + '</span></li>'; }).join('') + '</ul>';
  }
  footerTarget.innerHTML = [
    '<div class="footer-grid">',
      '<div><h2>Site links</h2><ul class="footer-nav-links"><li><a href="/">Home</a></li><li><a href="/about.html">About</a></li><li><a href="/privacy.html">Privacy Policy</a></li><li><a href="/legal.html">Legal</a></li><li><a href="/faq.html">FAQ</a></li><li><a href="/contact.html">Contact</a></li></ul></div>',
      '<div><h2>Related tools</h2>', relatedToolsHtml, '</div>',
      '<div><h2>Resources</h2><p><a href="https://calc-hq.com/" target="_blank" rel="noopener">Financial Calculator Hub</a></p><h2>Contact</h2><p><a href="mailto:' + window.SITE_CONFIG.partnershipsEmail + '">' + window.SITE_CONFIG.partnershipsEmail + '</a></p></div>',
    '</div>',
    '<p class="footer-meta">' + window.SITE_CONFIG.siteName + ' · Estimates run locally in your browser.</p>'
  ].join('');
};
