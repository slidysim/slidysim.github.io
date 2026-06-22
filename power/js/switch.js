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

  function createDataLabelsPlugin(isCategoryMode, numCats) {
    return {
      id: 'datalabels',
      afterDatasetsDraw: function(chart) {
        var ctx = chart.ctx;

        var totalBars = 0;
        chart.data.datasets.forEach(function(ds) { totalBars += ds.data.length; });
        if (totalBars > 67) return;

        ctx.save();

        try {
          ctx.textAlign = 'center';

          chart.data.datasets.forEach(function(dataset, di) {
            var meta = chart.getDatasetMeta(di);
            var catTotal = (chart.__categoryTotals && chart.__categoryTotals[di] !== undefined) ? chart.__categoryTotals[di] : chart.__total;

            meta.data.forEach(function(bar, i) {
              var val = dataset.data[i];
              if (val === 0 && !isCategoryMode) return;

              if (val === 0) return;

              if (numCats > 1) {
                var pct = catTotal > 0 ? val / catTotal * 100 : 0;

                ctx.font = 'bold 9px monospace';
                ctx.fillStyle = '#ddd';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 3;
                ctx.textBaseline = 'bottom';
                ctx.fillText(val, bar.x, bar.y - 18);

                var tierId = (chart.__allBarIds || [])[i];
                var tf = tierId ? (chart.__tierfMap || {})[tierId] : null;
                var pctColor = tf ? getTierLabelColor(tf) : '#999';
                ctx.font = '9px monospace';
                ctx.fillStyle = pctColor;
                ctx.shadowBlur = 0;
                ctx.textBaseline = 'bottom';
                ctx.fillText(pct.toFixed(1) + '%', bar.x, bar.y - 7);

                var barH = bar.y - bar.baseY;
                if (barH > 16 && dataset.label) {
                  var abbr = dataset.label.length > 5 ? dataset.label.substring(0, 4) + '\u2026' : dataset.label;
                  ctx.font = 'bold 8px monospace';
                  ctx.fillStyle = '#000';
                  ctx.shadowBlur = 0;
                  ctx.textBaseline = 'middle';
                  ctx.fillText(abbr, bar.x, bar.baseY + barH / 2);
                }
                return;
              }

            var pct = catTotal > 0 ? val / catTotal * 100 : 0;

            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#ddd';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 3;
            ctx.textBaseline = 'bottom';
            ctx.fillText(val, bar.x, bar.y - 22);

            var bgArr = dataset.backgroundColor;
            var pctColor = (Array.isArray(bgArr) && bgArr[i]) || '#999';
            ctx.font = '9px monospace';
            ctx.fillStyle = pctColor;
            ctx.shadowBlur = 0;
            ctx.textBaseline = 'top';
            ctx.fillText(pct.toFixed(1) + '%', bar.x, bar.y - 22 + 5);
            });
          });
        } finally {
          ctx.restore();
        }

        ctx.globalAlpha = 1;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    };
  }

  function buildOrUpdateChart(labels, datasets, reqTimes2D, categoryTotals, total, isCategoryMode, labelColors, allBarIds, tierfMap) {
    var canUpdate = tierChart && !tierChart._destroyed &&
      tierChart.__isCategoryMode === isCategoryMode &&
      tierChart.data.datasets.length === datasets.length &&
      tierChart.data.datasets.every(function(ds, i) { return ds.label === datasets[i].label; });

    if (canUpdate) {
      tierChart.data.labels = labels;
      datasets.forEach(function(ds, di) {
        tierChart.data.datasets[di].data = ds.data;
        tierChart.data.datasets[di].backgroundColor = ds.backgroundColor;
        tierChart.data.datasets[di].borderColor = ds.borderColor;
        tierChart.data.datasets[di].hoverBackgroundColor = ds.hoverBackgroundColor;
        tierChart.data.datasets[di].hoverBorderColor = ds.hoverBorderColor;
      });
      if (labelColors) tierChart.options.scales.x.ticks.color = labelColors;
      tierChart.__total = total;
      tierChart.__reqTimes = reqTimes2D;
      tierChart.__categoryTotals = categoryTotals;
      tierChart.__allBarIds = allBarIds || null;
      tierChart.__tierfMap = tierfMap || null;
      tierChart.__isCategoryMode = isCategoryMode;
      tierChart.update();
      return;
    }

    if (tierChart) {
      tierChart.destroy();
      tierChart = null;
    }

    var numCats = datasets.length;
    var topPad = isCategoryMode ? 70 : 40;
    var dataLabelsPlugin = createDataLabelsPlugin(isCategoryMode, numCats);

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
        events: isCategoryMode ? ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'] : [],
        layout: {
          padding: { top: topPad, bottom: 8 }
        },
        plugins: {
          legend: { display: false },
          tooltip: isCategoryMode ? {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgb(20,20,20)',
            titleColor: '#ddd',
            bodyColor: '#bbb',
            borderColor: '#333',
            borderWidth: 1,
            padding: 8,
            titleFont: { size: 10, weight: 'bold' },
            bodyFont: { size: 10 },
            callbacks: {
              title: function(items) { return items[0].label; },
              label: function(item) {
                var chart = item.chart;
                var di = item.datasetIndex;
                var ii = item.dataIndex;
                var val = item.raw;
                if (val === 0) return null;
                var catTotal = (chart.__categoryTotals || [])[di] || 0;
                var pct = catTotal > 0 ? val / catTotal * 100 : 0;
                var req = (chart.__reqTimes || [])[di] ? (chart.__reqTimes[di][ii] || '') : '';
                return item.dataset.label + ': ' + val + ' (' + pct.toFixed(1) + '%)' + (req ? ' \u2264' + req : '');
              },
              labelColor: function(item) {
                var chart = item.chart;
                var ids = chart.__allBarIds || [];
                var tfMap = chart.__tierfMap || {};
                var id = ids[item.dataIndex];
                var color = id && tfMap[id] ? getTierLabelColor(tfMap[id]) : '#666';
                return { borderColor: color, backgroundColor: color };
              },
              labelTextColor: function(item) {
                var chart = item.chart;
                var ids = chart.__allBarIds || [];
                var tfMap = chart.__tierfMap || {};
                var id = ids[item.dataIndex];
                return id && tfMap[id] ? getTierLabelColor(tfMap[id]) : '#bbb';
              }
            }
          } : { enabled: false }
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
    tierChart.__allBarIds = allBarIds || null;
    tierChart.__tierfMap = tierfMap || null;
  }

  function updateTierChart() {
    if (document.body.dataset.columnSort === "1") return;

    populateCategoryPanel();

    var selectedCats = getSelectedCategories();
    var isCategoryMode = selectedCats.length > 0;

    var simplifiedEl = document.getElementById("switch-simplified");
    var isSimplified = simplifiedEl && simplifiedEl.checked;
    var trueEl = document.getElementById("switch-true");
    var isTrueTries = trueEl && trueEl.checked;
    var cumulativeBtn = document.getElementById("switch-cumulative");
    var isCumulative = cumulativeBtn && cumulativeBtn.checked;
    var ignoreInput = document.getElementById("chart-ignore");
    var ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;

    var titleEl = document.getElementById("chart-title");
    if (titleEl) {
      var titleParts = [];
      if (isTrueTries) titleParts.push("True");
      if (isSimplified) titleParts.push("Grouped");
      if (isCumulative) titleParts.push("Cumulative");
      if (isCategoryMode) {
        titleParts.push("Category Distribution:");
        titleParts.push(selectedCats.join(", "));
      } else {
        titleParts.push("Tier Distribution");
      }
      if (ignoreN > 0) titleParts.push("(skip " + ignoreN + ")");
      titleEl.textContent = titleParts.join(" ");
    }

    var tables = document.querySelectorAll('table[id$="-table"]');

    if (isCategoryMode) {
      var powerData = window.__powerData || [];
      var tiers = window.__tiers || [];
      var categories = window.__categories || [];

      var tierNames = {};
      var tierfMap = {};
      var tierReqRows = {};
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
        tierReqRows[id] = reqRow;
      });

      var labelIds = [];
      tables.forEach(function(table) {
        labelIds.push(table.id.replace('-table', ''));
      });

      var datasets = [];
      var allLabels = [];
      var allBarIds = [];
      var allReqTimes = [];

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
          var reqRow = tierReqRows[id];
          if (reqRow && reqRow.children[3 + catIdx]) {
            reqs.push(reqRow.children[3 + catIdx].textContent.trim());
          } else {
            reqs.push("");
          }
        });

        data.reverse();
        reqs.reverse();

        if (allLabels.length === 0) {
          allLabels = labelIds.map(function(id) { return tierNames[id]; }).reverse();
          allBarIds = labelIds.slice().reverse();
        }
        var barColors = allBarIds.map(function(id) {
          return tierfMap[id] ? getTierLabelColor(tierfMap[id]) : '#666';
        });
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

    var totalTiers = allLabels.length;
    var skipSlider = document.getElementById("chart-ignore");
    var maxSkip = Math.max(0, totalTiers - 1);
    if (skipSlider) {
      skipSlider.max = maxSkip;
      if (parseInt(skipSlider.value) > maxSkip) {
        skipSlider.value = maxSkip;
        var valEl = document.getElementById("chart-ignore-val");
        if (valEl) valEl.textContent = maxSkip;
      }
    }

    ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;
    if (ignoreN > 0) {
      var n = Math.min(ignoreN, allLabels.length);
      allLabels = allLabels.slice(n);
      allBarIds = allBarIds.slice(n);
      datasets = datasets.map(function(ds) {
        return {
          label: ds.label,
          data: ds.data.slice(n),
          backgroundColor: Array.isArray(ds.backgroundColor) ? ds.backgroundColor.slice(n) : ds.backgroundColor,
          borderColor: Array.isArray(ds.borderColor) ? ds.borderColor.slice(n) : ds.borderColor,
          borderWidth: 1,
          borderRadius: 3,
          hoverBackgroundColor: Array.isArray(ds.hoverBackgroundColor) ? ds.hoverBackgroundColor.slice(n) : ds.hoverBackgroundColor,
          hoverBorderColor: Array.isArray(ds.hoverBorderColor) ? ds.hoverBorderColor.slice(n) : ds.hoverBorderColor,
        };
      });
      allReqTimes = allReqTimes.map(function(rt) { return rt.slice(n); });
    }
    if (allLabels.length === 0) return;

    isCumulative = cumulativeBtn && cumulativeBtn.checked;
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

      var catLabelColors = allBarIds.map(function(id) {
        return tierfMap[id] ? getTierLabelColor(tierfMap[id]) : '#999';
      });
      buildOrUpdateChart(allLabels, datasets, allReqTimes, categoryTotals, total, true, catLabelColors, allBarIds, tierfMap);

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

      var totalTiers = labels.length;
      var skipSlider = document.getElementById("chart-ignore");
      var maxSkip = Math.max(0, totalTiers - 1);
      if (skipSlider) {
        skipSlider.max = maxSkip;
        if (parseInt(skipSlider.value) > maxSkip) {
          skipSlider.value = maxSkip;
          var valEl = document.getElementById("chart-ignore-val");
          if (valEl) valEl.textContent = maxSkip;
        }
      }

      ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;
      if (ignoreN > 0) {
        var n = Math.min(ignoreN, labels.length);
        labels = labels.slice(n);
        counts = counts.slice(n);
        bgColors = bgColors.slice(n);
        labelColors = labelColors.slice(n);
      }
      if (counts.length === 0) return;

      isCumulative = cumulativeBtn && cumulativeBtn.checked;
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

      buildOrUpdateChart(labels, [dataset], [], [], total, false, labelColors, null, null);
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
  