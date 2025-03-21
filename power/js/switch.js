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
  
  const switchBtn = document.getElementById("switch");
  
  switchBtn.addEventListener("change", () => {
    tierlist.forEach((tier) => {
      changeTable(tier);
    });
  });
  
  function changeTable(tier_table) {
    const elements = document.querySelectorAll(`#${tier_table}-table .player-row > *`);
    
    elements.forEach((element) => {
      const tier = element.getAttribute("tier");
  
      if (tier) {
        if (tierlist.indexOf(tier) <= tierlist.indexOf(tier_table)) {
          if (tierlist.indexOf(tier) < tierlist.indexOf(tier_table)) {
            if (switchBtn.checked) {
              element.style.fontWeight = "800";
            } else {
              element.style.fontWeight = "";
            }
          }
        } else {
          if (switchBtn.checked) {
            element.style.backgroundColor = "grey";
          } else {
            element.style.backgroundColor = "";
          }
        }
      }
    });
  }
  
  const switchBtnReqs = document.getElementById("switch-reqs");
  
  switchBtnReqs.addEventListener("change", () => {
    toggleTableVisibility();
  });
  
  function toggleTableVisibility() {
    const tables = document.querySelectorAll("table");
    const isToggled = toggleTableVisibility.toggled;
  
    if (!isToggled) {
      tables.forEach((table, index) => {
        const thead = table.querySelector("thead");
        if (thead) {
          if (index === 0) {
            const reqRow = table.querySelector("tr.req-row");
            if (reqRow) {
              reqRow.style.display = "none";
            }
          } else {
            thead.style.display = "none";
          }
        }
      });
      toggleTableVisibility.toggled = true;
    } else {
      tables.forEach((table, index) => {
        const thead = table.querySelector("thead");
        if (thead) {
          if (index === 0) {
            const reqRow = table.querySelector("tr.req-row");
            if (reqRow) {
              reqRow.style.display = "";
            }
          } else {
            thead.style.display = "";
          }
        }
      });
      toggleTableVisibility.toggled = false;
    }
  }
  toggleTableVisibility.toggled = false;
  