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

  function updateTierChart() {
    if (document.body.dataset.columnSort === "1") return;

    var catSelect = document.getElementById("chart-category");
    if (catSelect && catSelect.options.length <= 1 && window.__categories) {
      window.__categories.forEach(function(c) {
        var opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    var selectedCat = catSelect ? catSelect.value : "";
    var isCategoryMode = selectedCat !== "";

    var tables = document.querySelectorAll('table[id$="-table"]');

    var labels = [];
    var counts = [];
    var bgColors = [];
    var labelColors = [];
    var reqTimes = [];

    if (isCategoryMode) {
      var powerData = window.__powerData || [];
      var tiers = window.__tiers || [];
      var categories = window.__categories || [];
      var catIdx = categories.indexOf(selectedCat);
      if (catIdx === -1) { isCategoryMode = false; }
    }

    if (isCategoryMode) {
      var tierCounts = {};
      var tierNames = {};
      var tierColors = {};
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
        tierCounts[id] = 0;
      });

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
        if (tierCounts[slug] !== undefined) tierCounts[slug]++;
      });

      tables.forEach(function(table) {
        var id = table.id.replace('-table', '');
        if (id === "unranked") return;
        labels.push(tierNames[id]);
        counts.push(tierCounts[id] || 0);
        var c = tierfMap[id] ? getTierLabelColor(tierfMap[id]) : '#666';
        bgColors.push(c);
        labelColors.push(c);
        var reqRow = table.querySelector('tr.req-row');
        if (reqRow && reqRow.children[3 + catIdx]) {
          reqTimes.push(reqRow.children[3 + catIdx].textContent.trim());
        } else {
          reqTimes.push("");
        }
      });
    } else {
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
    }

    labels.reverse();
    counts.reverse();
    bgColors.reverse();
    labelColors.reverse();
    reqTimes.reverse();

    var ignoreSlider = document.getElementById("chart-ignore");
    if (ignoreSlider) {
      ignoreSlider.max = counts.length;
      if (parseInt(ignoreSlider.value) > counts.length) {
        ignoreSlider.value = counts.length;
        var valEl = document.getElementById("chart-ignore-val");
        if (valEl) valEl.textContent = counts.length;
      }
    }

    var ignoreInput = document.getElementById("chart-ignore");
    var ignoreN = ignoreInput ? Math.max(0, parseInt(ignoreInput.value) || 0) : 0;
    if (ignoreN > 0) {
      var n = Math.min(ignoreN, counts.length);
      labels.splice(0, n);
      counts.splice(0, n);
      bgColors.splice(0, n);
      labelColors.splice(0, n);
      reqTimes.splice(0, n);
    }
    if (counts.length === 0) return;

    var cumulativeBtn = document.getElementById("switch-cumulative");
    var isCumulative = cumulativeBtn && cumulativeBtn.checked;

    var total = 0;
    for (var i = 0; i < counts.length; i++) total += counts[i];

    var chartData;
    if (isCumulative) {
      chartData = [];
      var sum = 0;
      for (var i = counts.length - 1; i >= 0; i--) {
        sum += counts[i];
        chartData[i] = sum;
      }
    } else {
      chartData = counts;
    }

    var topPad = isCategoryMode ? 70 : 56;

    var datalabelsPlugin = {
      id: 'datalabels',
      afterDraw: function(chart) {
        var ctx = chart.ctx;
        var meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.textAlign = 'center';

        meta.data.forEach(function(bar, i) {
          var val = chart.data.datasets[0].data[i];
          var pct = chart.__total > 0 ? val / chart.__total * 100 : 0;

          if (val !== 0) {
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

          if (chart.__reqTimes && chart.__reqTimes[i]) {
            ctx.font = '11px monospace';
            ctx.fillStyle = (chart.__reqLabelColors && chart.__reqLabelColors[i]) || '#777';
            ctx.shadowBlur = 0;
            ctx.textBaseline = 'top';
            ctx.fillText("\u2264" + chart.__reqTimes[i], bar.x, bar.y - 30 + 5 + 13);
          }
        });
        ctx.restore();
      }
    };

    if (!tierChart) {
      var ctx = document.getElementById('tier-chart').getContext('2d');
      tierChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
            datasets: [{
            label: 'Players',
            data: chartData,
            backgroundColor: bgColors,
            borderColor: bgColors,
            borderWidth: 1,
            borderRadius: 3,
            hoverBackgroundColor: bgColors,
            hoverBorderColor: bgColors,
          }]
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
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: {
            x: {
              ticks: {
                color: labelColors,
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
        plugins: [datalabelsPlugin]
      });
      tierChart.__total = total;
      tierChart.__reqTimes = reqTimes;
      tierChart.__reqLabelColors = labelColors;
    } else {
      tierChart.data.labels = labels;
      tierChart.data.datasets[0].data = chartData;
      tierChart.data.datasets[0].backgroundColor = bgColors;
      tierChart.data.datasets[0].borderColor = bgColors;
      tierChart.data.datasets[0].hoverBackgroundColor = bgColors;
      tierChart.data.datasets[0].hoverBorderColor = bgColors;
      tierChart.options.scales.x.ticks.color = labelColors;
      tierChart.options.layout.padding.top = topPad;
      tierChart.__total = total;
      tierChart.__reqTimes = reqTimes;
      tierChart.__reqLabelColors = labelColors;
      tierChart.update();
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

  document.getElementById("chart-category").addEventListener("change", function() {
    var container = document.getElementById("chart-container");
    if (container && container.style.display !== "none") {
      updateTierChart();
      requestAnimationFrame(function() { if (tierChart) tierChart.resize(); });
    }
  });
  