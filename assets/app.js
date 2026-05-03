(function () {
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });

  function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function computeProgressiveTax(taxableIncome, brackets) {
    if (taxableIncome <= 0) return 0;
    let remaining = taxableIncome;
    let lower = 0;
    let total = 0;
    for (const bracket of brackets) {
      const upper = bracket.upTo;
      const taxableAtRate = upper === null ? remaining : Math.min(remaining, upper - lower);
      if (taxableAtRate <= 0) {
        lower = upper === null ? lower : upper;
        continue;
      }
      total += taxableAtRate * bracket.rate;
      remaining -= taxableAtRate;
      if (remaining <= 0) break;
      lower = upper;
    }
    return total;
  }

  function updateResults() {
    const income = Math.max(0, safeNumber(document.getElementById('annualIncome').value));
    const expenses = Math.max(0, safeNumber(document.getElementById('annualExpenses').value));
    const filingStatus = document.getElementById('filingStatus').value;
    const profit = Math.max(0, income - expenses);
    const seBase = profit * 0.9235;
    const ssWageBase = 184500;
    const seSS = Math.min(seBase, ssWageBase) * 0.124;
    const seMedicare = seBase * 0.029;
    const seTax = seSS + seMedicare;
    const adjustedIncome = Math.max(0, profit - (seTax / 2));
    const deduction = window.SITE_CONFIG.federalTaxData.standardDeduction[filingStatus] || 0;
    const taxableIncome = Math.max(0, adjustedIncome - deduction);
    const federalTax = computeProgressiveTax(taxableIncome, window.SITE_CONFIG.federalTaxData.brackets[filingStatus]);
    const annualTax = seTax + federalTax;
    const quarterlyTax = annualTax / 4;

    const values = {
      projectedProfit: profit,
      estimatedSeTax: seTax,
      estimatedFederalTax: federalTax,
      estimatedAnnualTax: annualTax,
      estimatedQuarterlyTax: quarterlyTax
    };

    Object.entries(values).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = currency.format(value);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('calculatorForm');
    if (form) {
      form.addEventListener('input', updateResults);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        updateResults();
      });
      updateResults();
    }
  });
})();
