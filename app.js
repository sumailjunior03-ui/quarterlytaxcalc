"use strict";

/* ─────────────────────────────────────────
   2025 TAX CONSTANTS
───────────────────────────────────────── */
var SS_WAGE_BASE = 168600;

var STANDARD_DEDUCTIONS = {
  single: 14600,
  mfj:    29200,
  hoh:    21900
};

var BRACKETS = {
  single: [
    [11600,   0.10],
    [47150,   0.12],
    [100525,  0.22],
    [191950,  0.24],
    [243725,  0.32],
    [609350,  0.35],
    [Infinity,0.37]
  ],
  mfj: [
    [23200,   0.10],
    [94300,   0.12],
    [201050,  0.22],
    [383900,  0.24],
    [487450,  0.32],
    [731200,  0.35],
    [Infinity,0.37]
  ],
  hoh: [
    [16550,   0.10],
    [63100,   0.12],
    [100500,  0.22],
    [191950,  0.24],
    [243700,  0.32],
    [609350,  0.35],
    [Infinity,0.37]
  ]
};

var QUARTERLY_DATES = [
  { quarter: "Q1", due: "April 15, 2026" },
  { quarter: "Q2", due: "June 15, 2026" },
  { quarter: "Q3", due: "September 15, 2026" },
  { quarter: "Q4", due: "January 15, 2027" }
];

/* ─────────────────────────────────────────
   UTILITIES
───────────────────────────────────────── */
function parseDollar(str) {
  if (!str || str.trim() === "") return 0;
  var n = parseFloat(String(str).replace(/,/g, "").replace(/\$/g, "").trim());
  return isNaN(n) ? NaN : n;
}

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDec(n) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ─────────────────────────────────────────
   PROGRESSIVE TAX CALCULATOR
───────────────────────────────────────── */
function calcProgressiveTax(taxableIncome, status) {
  var brackets = BRACKETS[status];
  var tax = 0;
  var prev = 0;
  for (var i = 0; i < brackets.length; i++) {
    var top  = brackets[i][0];
    var rate = brackets[i][1];
    if (taxableIncome <= prev) break;
    var slice = Math.min(taxableIncome, top) - prev;
    tax += slice * rate;
    if (top === Infinity) break;
    prev = top;
  }
  return tax;
}

/* ─────────────────────────────────────────
   MAIN CALCULATION
───────────────────────────────────────── */
function calculateTax(inputs) {
  var netProfit  = inputs.netProfit;
  var w2Wages    = inputs.w2Wages;
  var withholding = inputs.withholding;
  var retirement = inputs.retirement;
  var hsa        = inputs.hsa;
  var status     = inputs.status; // "single" | "mfj" | "hoh"

  /* A) Self-employment tax */
  var seBase        = netProfit * 0.9235;
  var remainingSSBase = Math.max(0, SS_WAGE_BASE - w2Wages);
  var ssTaxableSEBase = Math.min(seBase, remainingSSBase);
  var ssTax         = 0.124 * ssTaxableSEBase;
  var medicareTax   = 0.029 * seBase;
  var seTaxTotal    = ssTax + medicareTax;
  var seTaxDeduction = seTaxTotal * 0.5;

  /* B) Federal income tax */
  var stdDed       = STANDARD_DEDUCTIONS[status];
  var totalEarned  = w2Wages + netProfit;
  var agi          = totalEarned - seTaxDeduction - retirement - hsa;
  var taxableIncome = Math.max(0, agi - stdDed);
  var incomeTax    = calcProgressiveTax(taxableIncome, status);

  /* C) Totals */
  var totalFederalTax = incomeTax + seTaxTotal;
  var amountDue       = Math.max(0, totalFederalTax - withholding);
  var quarterlyPayment = amountDue / 4;

  return {
    seBase:          seBase,
    ssTax:           ssTax,
    medicareTax:     medicareTax,
    seTaxTotal:      seTaxTotal,
    seTaxDeduction:  seTaxDeduction,
    agi:             agi,
    taxableIncome:   taxableIncome,
    stdDed:          stdDed,
    incomeTax:       incomeTax,
    totalFederalTax: totalFederalTax,
    withholding:     withholding,
    amountDue:       amountDue,
    quarterlyPayment:quarterlyPayment
  };
}

/* ─────────────────────────────────────────
   DOM HELPERS
───────────────────────────────────────── */
function $(id) { return document.getElementById(id); }

function setVal(id, text) {
  var el = $(id);
  if (el) el.textContent = text;
}

function showResults(res) {
  var section = $("results");
  if (section) {
    section.classList.remove("is-off");
    section.classList.add("is-on");
  }

  setVal("out-income-tax",     fmt(res.incomeTax));
  setVal("out-se-tax",         fmt(res.seTaxTotal));
  setVal("out-total-tax",      fmt(res.totalFederalTax));
  setVal("out-withholding",    fmt(res.withholding));
  setVal("out-amount-due",     fmt(res.amountDue));
  setVal("out-quarterly",      fmt(res.quarterlyPayment));

  /* Detail rows */
  setVal("out-se-base",        fmt(res.seBase));
  setVal("out-ss-tax",         fmt(res.ssTax));
  setVal("out-medicare-tax",   fmt(res.medicareTax));
  setVal("out-se-deduction",   fmt(res.seTaxDeduction));
  setVal("out-agi",            fmt(res.agi));
  setVal("out-std-ded",        fmt(res.stdDed));
  setVal("out-taxable-income", fmt(res.taxableIncome));

  /* Quarterly table */
  var tbody = $("quarterly-tbody");
  if (tbody) {
    tbody.innerHTML = "";
    QUARTERLY_DATES.forEach(function (q) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + q.quarter + "</td>" +
        "<td>" + q.due + "</td>" +
        "<td class='amount'>" + fmt(res.quarterlyPayment) + "</td>";
      tbody.appendChild(tr);
    });
  }

  /* Scroll to results */
  if (section) {
    setTimeout(function () {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

/* ─────────────────────────────────────────
   FORM VALIDATION & SUBMIT
───────────────────────────────────────── */
function clearErrors() {
  var errors = document.querySelectorAll(".field-error");
  errors.forEach(function (el) { el.textContent = ""; });
  var fields = document.querySelectorAll(".input-error");
  fields.forEach(function (el) { el.classList.remove("input-error"); });
}

function showError(fieldId, msg) {
  var field = $(fieldId);
  var errEl = $(fieldId + "-error");
  if (field) field.classList.add("input-error");
  if (errEl) errEl.textContent = msg;
}

function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  var netProfitRaw = $("net-profit").value;
  var statusVal    = $("filing-status").value;
  var w2Raw        = $("w2-wages").value;
  var withholdRaw  = $("withholding").value;
  var retireRaw    = $("retirement").value;
  var hsaRaw       = $("hsa").value;

  var valid = true;

  var netProfit = parseDollar(netProfitRaw);
  if (isNaN(netProfit) || netProfitRaw.trim() === "") {
    showError("net-profit", "Enter a valid dollar amount (e.g. 75000).");
    valid = false;
  }

  if (!statusVal) {
    showError("filing-status", "Select a filing status.");
    valid = false;
  }

  var w2Wages = parseDollar(w2Raw);
  if (isNaN(w2Wages)) { showError("w2-wages", "Enter a valid number or leave blank."); valid = false; }

  var withholding = parseDollar(withholdRaw);
  if (isNaN(withholding)) { showError("withholding", "Enter a valid number or leave blank."); valid = false; }

  var retirement = parseDollar(retireRaw);
  if (isNaN(retirement)) { showError("retirement", "Enter a valid number or leave blank."); valid = false; }

  var hsa = parseDollar(hsaRaw);
  if (isNaN(hsa)) { showError("hsa", "Enter a valid number or leave blank."); valid = false; }

  if (!valid) return;

  var result = calculateTax({
    netProfit:  netProfit,
    status:     statusVal,
    w2Wages:    w2Wages,
    withholding:withholding,
    retirement: retirement,
    hsa:        hsa
  });

  showResults(result);
}

function handleReset() {
  clearErrors();
  var section = $("results");
  if (section) {
    section.classList.add("is-off");
    section.classList.remove("is-on");
  }
}

/* ─────────────────────────────────────────
   NETWORK FOOTER INJECTION
───────────────────────────────────────── */
function renderNetwork() {
  var container = document.getElementById("network-links");
  if (!container) return;
  if (!window.CALC_HQ_NETWORK) return;

  var currentHost = window.location.hostname.replace(/^www\./, "");

  var links = window.CALC_HQ_NETWORK.filter(function (site) {
    if (!site || site.live !== true || !site.url) return false;
    try {
      var siteHost = new URL(site.url).hostname.replace(/^www\./, "");
      return siteHost !== currentHost;
    } catch (err) {
      return false;
    }
  });

  container.innerHTML = "";
  links.forEach(function (site) {
    var a = document.createElement("a");
    a.href = site.url;
    a.textContent = site.label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    container.appendChild(a);
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  renderNetwork();

  var form = $("tax-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  var resetBtn = $("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", handleReset);
  }

  /* Format number inputs on blur: add commas */
  var dollarInputs = document.querySelectorAll(".dollar-input");
  dollarInputs.forEach(function (input) {
    input.addEventListener("blur", function () {
      var v = parseDollar(this.value);
      if (!isNaN(v) && this.value.trim() !== "") {
        this.value = Math.round(v).toLocaleString("en-US");
      }
    });
    input.addEventListener("focus", function () {
      var v = parseDollar(this.value);
      if (!isNaN(v) && this.value.trim() !== "") {
        this.value = Math.round(v);
      }
    });
  });
});
