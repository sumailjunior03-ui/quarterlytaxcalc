"use strict";
/* ads.js — ad slot initialisation (framework requirement).
   Ad slots are inactive by default (SITE_CONFIG.adsActive === false).
   This file exists for framework compliance and future activation
   without structural changes to HTML or other scripts. */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.SITE_CONFIG || !window.SITE_CONFIG.adsActive) return;
    var slots = document.querySelectorAll(".ad-slot[data-active='true']");
    slots.forEach(function (slot) {
      slot.setAttribute("aria-hidden", "false");
    });
  });
})();
