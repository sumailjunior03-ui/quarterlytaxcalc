"use strict";
/* footer.js — footer and site header renderer (framework requirement).
   Depends on: config.js (window.SITE_CONFIG), network.js (window.renderFooter, window.renderSiteHeader)
   Renders on every page via DOMContentLoaded.
   Related Tools cluster is driven dynamically from NETWORK_LINKS in network.js:
     - excludes current domain (from SITE_CONFIG.domain)
     - excludes forbidden domains (from FORBIDDEN_DOMAINS in network.js)
     - excludes calc-hq.com from the cluster (hub link rendered separately in footer HTML)
   No related tool links are hardcoded in HTML. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.renderSiteHeader === "function") {
      window.renderSiteHeader();
    }
    if (typeof window.renderFooter === "function") {
      window.renderFooter(window.SITE_CONFIG ? window.SITE_CONFIG.domain : "");
    }
  });
})();
