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
  });
  