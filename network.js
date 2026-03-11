/* CalcHQ Network — Central Site Directory
   To add a new site: add one line to CALCHQ_NETWORK array.
   All sites update automatically across the utility network. */

window.CALCHQ_NETWORK = [
  { name: "Calc-HQ",          url: "https://calc-hq.com" },
  { name: "1099vsW2Calc.com", url: "https://1099vsw2calc.com" },
];

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll(".network-links");
    if (!containers.length) return;
    const currentDomain = window.location.hostname.replace("www.", "");
    containers.forEach(function (container) {
      const sites = window.CALCHQ_NETWORK.filter(function (site) {
        try {
          const u = new URL(site.url);
          return u.hostname.replace("www.", "") !== currentDomain;
        } catch (e) {
          return true;
        }
      });
      if (!sites.length) return;
      let html = "<strong>Related Tools:</strong> ";
      html += sites
        .map(function (site) {
          return (
            '<a href="' +
            site.url +
            '" target="_blank" rel="noopener">' +
            site.name +
            "</a>"
          );
        })
        .join(" &nbsp;•&nbsp; ");
      container.innerHTML = html;
    });
  });
})();
