let tierlist = [
    "ascended",
    "grandmaster-iii",
    "grandmaster-ii",
    "grandmaster-i",
    "master-iii",
    "master-ii",
    "master-i",
    "diamond-iii",
    "diamond-ii",
    "diamond-i",
    "platinum-iii",
    "platinum-ii",
    "platinum-i",
    "gold-iii",
    "gold-ii",
    "gold-i",
    "silver-iii",
    "silver-ii",
    "silver-i",
    "bronze-iii",
    "bronze-ii",
    "bronze-i",
    "beginner",
    "unranked"
  ];

  let tierlistOld = [
    "g+OLD",      
    "gamma+OLD",  
    "gammaOLD",
    "alephOLD",
    "ascendedOLD",
    "novaOLD",
    "grandmasterOLD",
    "masterOLD",
    "diamondOLD",
    "platinumOLD",
    "goldOLD",
    "silverOLD",
    "bronzeOLD",
    "beginnerOLD",
    "unrankedOLD"
  ];


  const switchBtn = document.getElementById("switch");
  let mainList = tierlist;
  
  switchBtn.addEventListener("change", () => {
      if (document.getElementById("date-button").textContent === 'Classic Power Rankings') {
          mainList = tierlistOld;
      } else {
          mainList = tierlist;
      }
      mainList.forEach((tier) => {
          changeTable(tier);
      });
  });
  
  function getGroupTier(t) {
      const simplified = document.getElementById("switch-simplified");
      if (simplified && simplified.checked && mainList === tierlist) {
          const mapped = t.replace(/-(i|ii)$/, "-iii");
          if (mainList.indexOf(mapped) !== -1) return mapped;
      }
      return t;
  }

  function changeTable(tier_table) {
    const escapedTierTable = tier_table.replace(/\+/g, "\\+").replace("OLD", "");
    const selector = `#${escapedTierTable}-table .player-row > *`;
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        const tier = element.getAttribute("tier");
        if (!tier) return;

        const groupTier = getGroupTier(tier);
        const groupTable = getGroupTier(tier_table);

        if (mainList.indexOf(groupTier) <= mainList.indexOf(groupTable)) {
            if (mainList.indexOf(groupTier) < mainList.indexOf(groupTable)) {
                if (switchBtn.checked) {
                    element.style.fontWeight = "800";
                } else {
                    element.style.fontWeight = "";
                }
            }
        } else {
            if (switchBtn.checked) {
                element.style.backgroundColor = "grey";
                element.style.color = "#bbb";
            } else {
                element.style.backgroundColor = "";
                element.style.color = "";
            }
        }
    });
}
  
  let tierChart = null;
  let _chartWasVisible = false;

  function getTierLabelColor(tierf) {
    const el = document.createElement('span');
    el.setAttribute('tierf', tierf);
    el.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;';
    document.body.appendChild(el);
    const color = getComputedStyle(el).color;
    document.body.removeChild(el);
    return color || '#999';
  }

  var _catColorCache = {};

  function getCategoryColor(index) {
    if (_catColorCache[index]) return _catColorCache[index];
    var hue = (index * 137.508) % 360;
    var c = 'hsl(' + hue + ', 65%, 55%)';
    _catColorCache[index] = c;
    return c;
  }

  function populateCategoryPanel() {
    var panel = document.getElementById("chart-category-panel");
    if (!panel || panel.children.length > 0 || !window.__categories) return;
    window.__categories.forEach(function(c) {
      var label = document.createElement("label");
      label.style.cssText = 'display:block;padding:2px 8px;color:#ddd;font-size:11px;cursor:pointer;white-space:nowrap;';
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = c;
      cb.style.cssText = 'vertical-align:middle;margin:0 4px 0 0;accent-color:#555;cursor:pointer;';
      cb.addEventListener("change", function() {
        updateCategoryTrigger();
        var container = document.getElementById("chart-container");
        if (container && container.style.display !== "none") {
          updateTierChart();
          requestAnimationFrame(function() { if (tierChart) tierChart.resize(); });
        }
        if (typeof notifyParentSwitchState === "function") notifyParentSwitchState();
      });
      label.appendChild(cb);
      label.appendChild(document.createTextNode(c));
      panel.appendChild(label);
    });
  }

  function getSelectedCategories() {
    var panel = document.getElementById("chart-category-panel");
    if (!panel) return [];
    var result = [];
    panel.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
      if (cb.checked) result.push(cb.value);
    });
    return result;
  }

  function updateCategoryTrigger() {
    var trigger = document.getElementById("chart-category-trigger");
    if (!trigger) return;
    var selected = getSelectedCategories();
    trigger.textContent = selected.length > 0 ? selected.length + " categories \u25BE" : "Overall \u25BE";
  }

  function createDataLabelsPlugin(isCategoryMode) {
    return {
      id: 'datalabels',
      afterDraw: function(chart) {
        var ctx = chart.ctx;
        ctx.save();
        ctx.textAlign = 'center';

        chart.data.datasets.forEach(function(dataset, di) {
          var meta = chart.getDatasetMeta(di);
          var catTotal = chart.__categoryTotals ? chart.__categoryTotals[di] : chart.__total;

          meta.data.forEach(function(bar, i) {
            var val = dataset.data[i];
            if (val === 0 && !isCategoryMode) return;

            if (val !== 0) {
              var pct = catTotal > 0 ? val / catTotal * 100 : 0;

              ctx.font = 'bold 11px monospace';
              ctx.fillStyle = '#ddd';
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = 3;
              ctx.textBaseline = 'bottom';
              ctx.fillText(val, bar.x, bar.y - 30);

              ctx.font = '9px monospace';
              ctx.fillStyle = '#999';
              ctx.shadowBlur = 0;
              ctx.textBaseline = 'top';
              ctx.fillText('(' + pct.toFixed(1) + '%)', bar.x, bar.y - 30 + 5);
            }

            if (isCategoryMode && chart.__reqTimes && chart.__reqTimes[di] && chart.__reqTimes[di][i]) {
              ctx.font = '11px monospace';
              ctx.fillStyle = chart.data.datasets[di].borderColor || '#777';
              ctx.shadowBlur = 0;
              ctx.textBaseline = 'top';
              ctx.fillText("\u2264" + chart.__reqTimes[di][i], bar.x, bar.y - 30 + 5 + 13);
            }
          });
        });

        ctx.restore();
      }
    };
  }

  function buildOrUpdateChart(labels, datasets, reqTimes2D, categoryTotals, total, isCategoryMode, labelColors) {
    if (tierChart) {
      tierChart.destroy();
      tierChart = null;
    }

    var topPad = isCategoryMode ? 70 : 56;
    var dataLabelsPlugin = createDataLabelsPlugin(isCategoryMode);

    var ignoreSlider = document.getElementById("chart-ignore");
    if (ignoreSlider) {
      ignoreSlider.max = labels.length;
      if (parseInt(ignoreSlider.value) > labels.length) {
        ignoreSlider.value = labels.length;
        var valEl = document.getElementById("chart-ignore-val");
        if (valEl) valEl.textContent = labels.length;
      }
    }

    var ctx = document.getElementById('tier-chart').getContext('2d');
    tierChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        events: [],
        layout: {
          padding: { top: topPad, bottom: 8 }
        },
        plugins: {
          legend: isCategoryMode ? {
            display: true,
            position: 'top',
            labels: { color: '#999', font: { size: 9 }, boxWidth: 12, boxHeight: 8, padding: 8 }
          } : { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            ticks: {
              color: labelColors || '#999',
              maxRotation: 45,
              font: { size: 10, weight: 'bold' }
            },
            grid: { color: '#2a2a2a' }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#999',
              precision: 0,
              font: { size: 10 }
            },
            grid: { color: '#2a2a2a' }
          }
        }
      },
      plugins: [dataLabelsPlugin]
    });
    tierChart.__total = total;
    tierChart.__reqTimes = reqTimes2D;
    tierChart.__categoryTotals = categoryTotals;
    tierChart.__isCategoryMode = isCategoryMode;
  }

  function updateTierChart() {
    if (document.body.dataset.columnSort === "1") return;

    populateCategoryPanel();

    var selectedCats = getSelectedCategories();
    var isCategoryMode = selectedCats.length > 0;

    var tables = document.querySelectorAll('table[id$="-table"]');

    if (isCategoryMode) {
      var powerData = window.__powerData || [];
      var tiers = window.__tiers || [];
      var categories = window.__categories || [];

      var tierNames = {};
      var tierfMap = {};
      tables.forEach(function(table) {
        var reqRow = table.querySelector('tr.req-row');
        var id = table.id.replace('-table', '');
        var displayName = id;
        var tierf = null;
        if (reqRow) {
          var tf = reqRow.querySelector('[tierf]');
          if (tf) tierf = tf.getAttribute('tierf');
          if (reqRow.children[0]) {
            displayName = reqRow.children[0].innerText.trim().replace(/\u00A0/g, ' ').replace(/\n/g, ' ');
          }
        }
        tierNames[id] = displayName;
        tierfMap[id] = tierf;
      });

      var labelIds = [];
      tables.forEach(function(table) {
        var id = table.id.replace('-table', '');
        if (id !== "unranked") labelIds.push(id);
      });

      var datasets = [];
      var allLabels = [];
      var allReqTimes = [];

      var simplifiedEl = document.getElementById("switch-simplified");
      var isSimplified = simplifiedEl && simplifiedEl.checked;

      selectedCats.forEach(function(cat, di) {
        var catIdx = categories.indexOf(cat);
        if (catIdx === -1) return;

        var tierCounts = {};
        labelIds.forEach(function(id) { tierCounts[id] = 0; });

        powerData.forEach(function(player) {
          if (!player) return;
          var score = player[3 + catIdx];
          if (score === -1) return;
          var bestTier = -1;
          for (var t = tiers.length - 1; t >= 0; t--) {
            if (score <= tiers[t]["times"][catIdx]) {
              bestTier = t;
              break;
            }
          }
          if (bestTier === -1) return;
          var slug = tiers[bestTier]["name"].toLowerCase().replace(" ","-");
          if (isSimplified) slug = slug.replace(/-(i|ii)$/, "-iii");
          if (tierCounts[slug] !== undefined) tierCounts[slug]++;
        });

        var data = [];
        var reqs = [];
        labelIds.forEach(function(id) {
          data.push(tierCounts[id] || 0);
          var reqRow = tables.length ? document.querySelector('#' + id + '-table tr.req-row') : null;
          if (reqRow && reqRow.children[3 + catIdx]) {
            reqs.push(reqRow.children[3 + catIdx].textContent.trim());
          } else {
            reqs.push("");
          }
        });

        data.reverse();
        reqs.reverse();

        if (allLabels.length === 0) allLabels = labelIds.map(function(id) { return tierNames[id]; }).reverse();
        var barColors = labelIds.map(function(id) {
          return tierfMap[id] ? getTierLabelColor(tierfMap[id]) : '#666';
        }).reverse();
        datasets.push({
          label: cat,
          data: data,
          backgroundColor: barColors,
          borderColor: barColors,
          borderWidth: 1,
          borderRadius: 3,
          hoverBackgroundColor: barColors,
          hoverBorderColor: barColors,
        });
        allReqTimes.push(reqs);
      });

      var ignoreInput = document.getElementById("chart-ignore");
      var ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;
      if (ignoreN > 0) {
        var n = Math.min(ignoreN, allLabels.length);
        allLabels.splice(0, n);
        datasets.forEach(function(ds) { ds.data.splice(0, n); });
        allReqTimes.forEach(function(rt) { rt.splice(0, n); });
      }
      if (allLabels.length === 0) return;

      var cumulativeBtn = document.getElementById("switch-cumulative");
      var isCumulative = cumulativeBtn && cumulativeBtn.checked;
      var categoryTotals = datasets.map(function(ds) {
        return ds.data.reduce(function(a, b) { return a + b; }, 0);
      });
      if (isCumulative) {
        datasets.forEach(function(ds) {
          var sum = 0;
          for (var i = ds.data.length - 1; i >= 0; i--) {
            sum += ds.data[i];
            ds.data[i] = sum;
          }
        });
      }

      var total = 0;
      datasets.forEach(function(ds) { ds.data.forEach(function(v) { total += v; }); });

      buildOrUpdateChart(allLabels, datasets, allReqTimes, categoryTotals, total, true);

    } else {
      var labels = [];
      var counts = [];
      var bgColors = [];
      var labelColors = [];

      tables.forEach(function(table) {
        var count = table.querySelectorAll('.player-row').length;
        var reqRow = table.querySelector('tr.req-row');
        var displayName = table.id.replace('-table', '');
        var tierf = null;
        if (reqRow) {
          var tf = reqRow.querySelector('[tierf]');
          if (tf) tierf = tf.getAttribute('tierf');
          if (reqRow.children[0]) {
            displayName = reqRow.children[0].innerText.trim().replace(/\u00A0/g, ' ').replace(/\n/g, ' ');
          }
        }
        labels.push(displayName);
        counts.push(count);
        var c = tierf ? getTierLabelColor(tierf) : '#666';
        bgColors.push(c);
        labelColors.push(c);
      });

      labels.reverse();
      counts.reverse();
      bgColors.reverse();
      labelColors.reverse();

      var ignoreInput = document.getElementById("chart-ignore");
      var ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;
      if (ignoreN > 0) {
        var n = Math.min(ignoreN, labels.length);
        labels.splice(0, n);
        counts.splice(0, n);
        bgColors.splice(0, n);
        labelColors.splice(0, n);
      }
      if (counts.length === 0) return;

      var cumulativeBtn = document.getElementById("switch-cumulative");
      var isCumulative = cumulativeBtn && cumulativeBtn.checked;
      if (isCumulative) {
        var sum = 0;
        for (var i = counts.length - 1; i >= 0; i--) {
          sum += counts[i];
          counts[i] = sum;
        }
      }

      var total = 0;
      for (var i = 0; i < counts.length; i++) total += counts[i];

      var dataset = {
        label: 'Players',
        data: counts,
        backgroundColor: bgColors,
        borderColor: bgColors,
        borderWidth: 1,
        borderRadius: 3,
        hoverBackgroundColor: bgColors,
        hoverBorderColor: bgColors,
      };

      buildOrUpdateChart(labels, [dataset], [], [], total, false, labelColors);
    }
  }

  document.getElementById("date-button").addEventListener("click", () => {
    if (document.body.dataset.columnSort === "1") return;
    const container = document.getElementById("chart-container");
    const isVisible = container.style.display !== "none";
    container.style.display = isVisible ? "none" : "block";
    if (!isVisible) {
      updateTierChart();
      requestAnimationFrame(() => { if (tierChart) tierChart.resize(); });
    }
    document.dispatchEvent(new Event("chart-state-changed"));
  });

  const switchBtnReqs = document.getElementById("switch-reqs");
  
  switchBtnReqs.addEventListener("change", () => {
    if (document.body.dataset.columnSort !== "1") {
        applyReqsVisibility();
    }
  });
  
  function applyReqsVisibility() {
    const tables = document.querySelectorAll("table");
    const hide = switchBtnReqs.checked;
  
    tables.forEach((table, index) => {
        const thead = table.querySelector("thead");
        if (thead) {
          if (index === 0) {
            const reqRow = table.querySelector("tr.req-row");
            if (reqRow) {
              reqRow.style.display = hide ? "none" : "";
            }
          } else {
            thead.style.display = hide ? "none" : "";
          }
        }
    });
  }

  document.addEventListener("table-repopulated", () => {
      if (switchBtn.checked) {
          mainList.forEach((tier) => {
              changeTable(tier);
          });
      }
      if (document.body.dataset.columnSort !== "1") {
          applyReqsVisibility();
      }
      const chartContainer = document.getElementById("chart-container");
      if (document.body.dataset.columnSort === "1") {
        if (chartContainer && chartContainer.style.display !== "none") {
          _chartWasVisible = true;
          chartContainer.style.display = "none";
        }
      } else {
        if (_chartWasVisible) {
          _chartWasVisible = false;
          chartContainer.style.display = "block";
          updateTierChart();
        } else if (chartContainer && chartContainer.style.display !== "none") {
          updateTierChart();
        }
      }
  });

  document.getElementById("switch-cumulative").addEventListener("change", () => {
    var container = document.getElementById("chart-container");
    if (container && container.style.display !== "none") {
      updateTierChart();
      requestAnimationFrame(function() { if (tierChart) tierChart.resize(); });
    }
  });

  document.getElementById("chart-ignore").addEventListener("input", function() {
    document.getElementById("chart-ignore-val").textContent = this.value;
    var container = document.getElementById("chart-container");
    if (container && container.style.display !== "none") {
      updateTierChart();
      requestAnimationFrame(function() { if (tierChart) tierChart.resize(); });
    }
    if (typeof notifyParentSwitchState === "function") notifyParentSwitchState();
  });

  document.getElementById("chart-category-trigger").addEventListener("click", function() {
    var panel = document.getElementById("chart-category-panel");
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });
  