
let powerData;
let tiers;
let categories;
let num_tiers;
let num_categories;
let oldTiers;
let userFinalTierMap;
let fmcPower;
let simplifiedView = false;
let trueView = false;
let categoryOrder = [];
let sortedPlayerRow = null;
let sortColumn = null;
let sortAsc = true;
let __truePlaces = {};

function catIdx(j) {
    return sortedPlayerRow ? categoryOrder[j] : j;
}

function computeCategoryOrder(player) {
    const scored = [];
    for (let c = 0; c < num_categories; c++) {
        const time = player[c + 3];
        let tierIdx, ahead;
        if (time == -1) {
            tierIdx = -2;
            ahead = -Infinity;
        } else {
            tierIdx = result_tier(c, time);
            if (tierIdx < 0) {
                ahead = (tiers[0].times[c] - time) / tiers[0].times[c] * 100;
            } else if (tierIdx >= num_tiers - 1) {
                ahead = (tiers[tierIdx].times[c] - time) / tiers[tierIdx].times[c] * 100;
            } else {
                ahead = (tiers[tierIdx + 1].times[c] - time) / tiers[tierIdx + 1].times[c] * 100;
            }
        }
        scored.push({ idx: c, tierIdx, ahead });
    }
    scored.sort((a, b) => a.tierIdx - b.tierIdx || a.ahead - b.ahead);
    return scored.map(s => s.idx);
}

function resetSort() {
    sortedPlayerRow = null;
    categoryOrder = [];
    sortColumn = null;
}

function hasScores(user) {
    for (var c = 0; c < num_categories; c++) {
        if (user[c + 3] != -1) return true;
    }
    return false;
}

function getTooltip() {
    return document.getElementById("score-tooltip");
}

function setupResetHeaderCell(cell) {
    cell.style.minWidth = "132px";
    cell.style.cursor = "pointer";
    cell.addEventListener("mouseenter", () => {
        cell.style.backgroundColor = "#3a3a3a";
        cell.style.color = "#ffffff";
    });
    cell.addEventListener("mouseleave", () => {
        cell.style.backgroundColor = "";
        cell.style.color = "";
    });
    cell.addEventListener("click", () => {
        resetSort();
        ["switch-true", "switch-simplified", "switch", "switch-reqs", "switch-empty"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        notifyParentSwitchState();
        trueView = false;
        simplifiedView = false;
        populate_table(powerData);
        document.dispatchEvent(new Event("table-repopulated"));
    });
}

function setupSortableHeaderCell(cell, col) {
    if (!cell || col === undefined) return;
    cell.style.cursor = "pointer";
    cell.addEventListener("click", () => {
        if (sortColumn === col) sortAsc = !sortAsc;
        else { sortColumn = col; sortAsc = true; }
        populate_table(powerData);
        document.dispatchEvent(new Event("table-repopulated"));
    });
}

function isSubTierIII(name) {
    return !!name.match(/ (III)$/);
}

function isSubTierIorII(name) {
    const m = name.match(/ (I{1,3})$/);
    return m && (m[1] === "I" || m[1] === "II");
}

function getBaseTierName(name) {
    return name.replace(/ (I{1,3})$/, "");
}

function format(time, noTrail=false) {
    if (time == -1) {
        return "";
    }

    var t = time;
    var seconds = Math.floor(t / 1000);
    var millis = t % 1000;


    var result = seconds + "." + millis.toString().padStart(3, "0");
    // Remove unnecessary trailing zeros after the decimal point
    if (noTrail) {
        result = result.replace(/\.?0+$/, ''); // Remove trailing zeros & dot if necessary
    }
    return result;
    
}

function result_tier(category, time){
    if(time == -1){
        return -1;
    }

    var tier;
    for(tier=0; tier<num_tiers; tier++){
        if(time == ""){
            break;
        }
        if(time > tiers[tier]["times"][category]){
            break;
        }
    }
    return tier-1;
}


function populate_table(table){
    if (sortedPlayerRow && !table.includes(sortedPlayerRow)) resetSort();
    var results_table = document.getElementById("results-table");

    // remove previous wrapper if it exists
    var prevWrapper = results_table.previousElementSibling;
    if (prevWrapper && prevWrapper.className === "results-table") {
        prevWrapper.remove();
    }

    // remove the previous table, if there was one
    while(results_table.hasChildNodes()){
        results_table.removeChild(results_table.firstChild);
    }
    // Insert wrapper div before results_table
    // which user do we need to add to the table next?
    var next_user = 0;

        // Categories table
        var tier_wrapper = document.createElement("div");
        tier_wrapper.className = "results-table";
        tier_wrapper.style.position = "sticky";
        tier_wrapper.style.top = "0";
        tier_wrapper.style.zIndex = "100";
        tier_wrapper.style.paddingTop = "var(--header_height)";
        tier_wrapper.style.marginBottom = "calc(-1 * var(--header_height))";
        var tier_table = document.createElement("table");
        tier_wrapper.appendChild(tier_table);
        results_table.parentNode.insertBefore(tier_wrapper, results_table);
        var tier_head = document.createElement("thead");
        var tier_events_row = document.createElement("tr");
        tier_head.className = "table-header";
        tier_events_row.className = "events-row";
        tier_table.appendChild(tier_head);
        tier_head.appendChild(tier_events_row);
        tier_table.style.position = 'sticky';
        tier_head.style.zIndex = 2;
        for(var j=0; j<3; j++){
            tier_events_row.appendChild(document.createElement("td"));
        }
        tier_events_row.children[0].textContent = (sortedPlayerRow || sortColumn !== null) ? "Reset sorting" : "Name";
        setupResetHeaderCell(tier_events_row.children[0]);
        tier_events_row.children[1].textContent = "Place" + (sortColumn === 1 ? (sortAsc ? " ▲" : " ▼") : "");
        setupSortableHeaderCell(tier_events_row.children[1], 1);
        tier_events_row.children[2].textContent = "Power" + (sortColumn === 2 ? (sortAsc ? " ▲" : " ▼") : "");
        setupSortableHeaderCell(tier_events_row.children[2], 2);
        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[catIdx(j)].replace(/ /g, '<br>');
            const col = catIdx(j) + 3;
            if (sortColumn === col) div.innerHTML += sortAsc ? " ▲" : " ▼";
            setupSortableHeaderCell(div, col);
            tier_events_row.appendChild(div);
        }
        
    if (trueView) {
        var trueTierMap = [];
        for (var u = 0; u < table.length; u++) {
            const user = table[u];
            if (!user) { trueTierMap[u] = -1; continue; }
            var incomplete = false;
            for (var c = 0; c < num_categories; c++) {
                if (user[c + 3] == -1) { incomplete = true; break; }
            }
            if (incomplete) { trueTierMap[u] = -1; continue; }
            var worst = num_tiers;
            for (var c = 0; c < num_categories; c++) {
                const t = result_tier(c, user[c + 3]);
                if (t < worst) worst = t;
            }
            trueTierMap[u] = worst;
        }
    }
    // In simplified view, map sub-tier I/II worst tiers to their III (parent color)
    if (trueView && simplifiedView) {
        for (var u = 0; u < table.length; u++) {
            const w = trueTierMap[u];
            if (w === -1) continue;
            const name = tiers[w]["name"];
            if (isSubTierIorII(name)) {
                const base = getBaseTierName(name);
                var found = -1;
                for (var k = w + 1; k < num_tiers; k++) {
                    if (tiers[k]["name"].startsWith(base + " ") && isSubTierIII(tiers[k]["name"])) {
                        found = k;
                        break;
                    }
                }
                trueTierMap[u] = found;
            }
        }
    }



    var placeCounter = 1;

    const isColSort = sortColumn !== null;

    const renderUserRow = function(user, tierTable, tierAttrName, tierIndex) {
        var user_row = document.createElement("tr");
        var name_div = document.createElement("td");
        var place_div = document.createElement("td");
        var power_div = document.createElement("td");

        name_div.innerHTML = appendFlagIconToNickname(user[0], true);
        place_div.textContent = trueView ? (sortColumn !== null && user.__place ? user.__place : (__truePlaces[user[0]] || placeCounter++)) : user[1];
        if (trueView && sortColumn === null) __truePlaces[user[0]] = parseInt(place_div.textContent);
        power_div.textContent = user[2];

        user_row.className = "player-row";
        name_div.className = "player";
        name_div.classList.add("sortable-player");
        name_div.addEventListener("click", (e) => {
            e.stopPropagation();
            sortedPlayerRow = user;
            categoryOrder = computeCategoryOrder(user);
            populate_table(powerData);
            document.dispatchEvent(new Event("table-repopulated"));
        });
        place_div.className = "player-place";
        power_div.className = "player-power";
        let attrName = tierAttrName;
        if (oldTiers) attrName += "OLD";
        name_div.setAttribute("tier", attrName);
        place_div.setAttribute("tier", attrName);
        power_div.setAttribute("tier", attrName);

        if(tierIndex !== undefined && !trueView && (tierIndex !== tiers.length - 1) && (user[2] > tiers[tierIndex+1]["limit"])){
            power_div.setAttribute("class", "player-power power_req_reached");
            power_div.setAttribute("title", "Missing one score of the higher tier to rank up.");
        }

        tierTable.appendChild(user_row);
        user_row.appendChild(name_div);
        user_row.appendChild(place_div);
        user_row.appendChild(power_div);
        if (oldTiers) {
            const dynamicSum = PowerCalc.getDynamicSum(user.slice(3));
            if (dynamicSum > 303030 && user[2] <= 303030){
                power_div.innerHTML += `<br><span style="fontSize=10px;">${dynamicSum}</span>`;
            }
        }
        const playerOrder = computeCategoryOrder(user);
        for(var j=0; j<num_categories; j++){
            const origC = catIdx(j);
            let time = user[origC + 3];
            var div = document.createElement("td");
            div.textContent = format(time, fmcPower);
            const rank = playerOrder.length - playerOrder.indexOf(origC);
            div.dataset.rank = rank;
            div.dataset.total = playerOrder.length;
            if (time != -1) {
                const ti = result_tier(origC, time);
                let ahead, target;
                if (ti < 0) {
                    target = tiers[0].times[origC];
                    ahead = (target - time) / target * 100;
                } else if (ti >= num_tiers - 1) {
                    target = tiers[ti].times[origC];
                    ahead = (target - time) / target * 100;
                } else {
                    target = tiers[ti + 1].times[origC];
                    ahead = (target - time) / target * 100;
                }
                const arrow = (ti >= 0 && ti < num_tiers - 1) ? "\u2192 " : "";
                const targetStr = format(target, true);
                const sign = ahead >= 0 ? "+" : "";
                const pct = ahead.toFixed(2);
                const tierName = ti >= 0 && ti < num_tiers ? tiers[ti].name : tiers[0].name;
                const tierSlug = tierName.toLowerCase().replace(" ","-");
                const diff = target - time;
                const diffSign = diff >= 0 ? "+" : "-";
                div.dataset.diff = diffSign + format(Math.abs(diff));
                div.dataset.tierName = tierName;
                div.dataset.tierSlug = oldTiers ? tierSlug + "OLD" : tierSlug;
                div.dataset.arrow = arrow;
                div.dataset.target = targetStr;
                div.dataset.ahead = sign + pct + "%";
                if (arrow) {
                    const nextName = tiers[ti + 1].name;
                    const nextSlug = nextName.toLowerCase().replace(" ","-");
                    div.dataset.nextTier = nextName;
                    div.dataset.nextTierSlug = oldTiers ? nextSlug + "OLD" : nextSlug;
                }
                div.addEventListener("mouseenter", function () {
                    const tip = getTooltip();
                    const rect = this.getBoundingClientRect();
                    let h = "<span class=\"tip-tier\" tierf=\"" + this.dataset.tierSlug + "\">" + this.dataset.tierName + "</span>";
                    if (this.dataset.arrow) {
                        h += " " + this.dataset.arrow + this.dataset.target + " (" + this.dataset.diff + ") for <span tierf=\"" + this.dataset.nextTierSlug + "\">" + this.dataset.nextTier + "</span>";
                    } else {
                        h += " " + this.dataset.target;
                    }
                    h += " (" + this.dataset.rank + "/" + this.dataset.total + ")";
                    tip.innerHTML = h;
                    tip.style.display = "block";
                    const tipW = tip.offsetWidth;
                    const tipH = tip.offsetHeight;
                    let left = rect.left;
                    let top = rect.bottom + 4;
                    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
                    if (top + tipH > window.innerHeight - 8) top = rect.top - tipH - 4;
                    if (left < 8) left = 8;
                    if (top < 8) top = 8;
                    tip.style.left = left + "px";
                    tip.style.top = top + "px";
                });
                div.addEventListener("mouseleave", function () {
                    getTooltip().style.display = "none";
                });
            }
            user_row.appendChild(div);
            const t = result_tier(origC, time);
            if(t != -1){
                const name = tiers[t]["name"].toLowerCase().replace(" ","-");
                let attrName = name;
                if (oldTiers) attrName += "OLD";
                div.setAttribute("tier", attrName);
            }
        }
    };

    // --- Global sort mode (Power or category column) ---
    if (isColSort) {
        document.body.dataset.columnSort = "1";
        const allUsers = [];
        for (var u = 0; u < table.length; u++) {
            const user = table[u];
            if (user === undefined) break;
            if (!hasScores(user)) continue;
            if (trueView) {
                var incomplete = false;
                for (var c = 0; c < num_categories; c++) {
                    if (user[c + 3] == -1) { incomplete = true; break; }
                }
                if (incomplete) continue;
                user.__place = __truePlaces[user[0]] || placeCounter++;
                const ti = trueTierMap[u];
                user.__tier = (ti >= 0 && ti < num_tiers) ? tiers[ti]["name"].toLowerCase().replace(" ","-") : "";
            }
            allUsers.push(user);
        }
        allUsers.sort((a, b) => {
            const va = a[sortColumn];
            const vb = b[sortColumn];
            if (va === -1 && vb !== -1) return 1;
            if (vb === -1 && va !== -1) return -1;
            return sortAsc ? va - vb : vb - va;
        });
        var global_table = document.createElement("table");
        results_table.appendChild(global_table);

        for (const user of allUsers) {
            const userTierName = trueView ? (user.__tier || "") : (userFinalTierMap[user[0]] ? userFinalTierMap[user[0]].toLowerCase().replace(" ","-") : "");
            renderUserRow(user, global_table, userTierName);
        }

        var reqsChk = document.getElementById("switch-reqs");
        if (reqsChk) {
            reqsChk.checked = true;
        }
        return;
    }

    document.body.dataset.columnSort = "0";

    const unrankedUsers = [];
    for (var uu = 0; uu < table.length; uu++) {
        const u = table[uu];
        if (u === undefined) break;
        if (hasScores(u) && u[2] == 0) unrankedUsers.push(u);
    }
    const unrankedNames = new Set(unrankedUsers.map(u => u[0]));

    for(var i=num_tiers-1; i>0; i--){
        let effectiveTier = tiers[i];
        if (simplifiedView) {
            const name = effectiveTier["name"];
            if (isSubTierIorII(name)) {
                continue;
            }
            if (isSubTierIII(name)) {
                const iTier = tiers[i - 2];
                effectiveTier = { ...effectiveTier, limit: iTier["limit"], power: iTier["power"], times: iTier["times"] };
            }
        }
        const tier_name = effectiveTier["name"].toLowerCase().replace(" ","-");

        // table of all results of users in this tier
        var tier_table = document.createElement("table");
        tier_table.id = tier_name + "-table";
        results_table.appendChild(tier_table);

        // set up the header rows
        var tier_head = document.createElement("thead"); // header containing the following three rows
        var tier_req_row = document.createElement("tr"); // row containing the results required for the tier
        var tier_events_row = document.createElement("tr"); // row containing names of the categories

        tier_head.className = "table-header";
        tier_req_row.className = "req-row";
        tier_events_row.className = "events-row";
        tier_table.appendChild(tier_head);
        
        tier_events_row.style.display = 'none';
        tier_head.appendChild(tier_req_row);
        tier_head.appendChild(tier_events_row);


        // tier name row
        var tier_name_div = document.createElement("td");

        let displayName = effectiveTier["name"];
        const displayNameAttr = effectiveTier["name"].toLowerCase().replace(" ","-");
        if (simplifiedView && isSubTierIII(tiers[i]["name"])) {
            displayName = getBaseTierName(effectiveTier["name"]);
        }
        if (trueView) displayName = "True\u00A0" + displayName;
        // fill up the whole width of the table (columns = username, place, power, categories)
        tier_name_div.colSpan = num_categories+3;
        tier_name_div.textContent = displayName;
        const name = displayNameAttr;
        let attrName = name;
        if (oldTiers) {
            attrName += "OLD";
        }
        // tier requirements row
        for(var j=0; j<3; j++){
            const tdel = document.createElement("td");
            tdel.setAttribute("tierf", attrName);
            tier_req_row.appendChild(tdel);
        }

        tier_req_row.children[0].innerHTML = displayName.replace(/ /g, '<br>');
        tier_req_row.children[0].style.minWidth = "132px";
        tier_req_row.children[1].textContent = effectiveTier["power"];
        tier_req_row.children[2].textContent = effectiveTier["limit"];
        if (effectiveTier["limit"] == 9999999) {
            tier_req_row.children[2].textContent = "∞";
        }

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(effectiveTier["times"][catIdx(j)], true);
            div.setAttribute("tierf", attrName);
            tier_req_row.appendChild(div);
        }

        // tier events row
        for(var j=0; j<3; j++){
            tier_events_row.appendChild(document.createElement("td"));
        }
        tier_events_row.children[0].textContent = (sortedPlayerRow || sortColumn !== null) ? "Reset sorting" : "Name";
        setupResetHeaderCell(tier_events_row.children[0]);
        tier_events_row.children[1].textContent = "Place" + (sortColumn === 1 ? (sortAsc ? " ▲" : " ▼") : "");
        setupSortableHeaderCell(tier_events_row.children[1], 1);
        tier_events_row.children[2].textContent = "Power" + (sortColumn === 2 ? (sortAsc ? " ▲" : " ▼") : "");
        setupSortableHeaderCell(tier_events_row.children[2], 2);

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[catIdx(j)].replace(/ /g, '<br>');
            const col = catIdx(j) + 3;
            if (sortColumn === col) div.innerHTML += sortAsc ? " ▲" : " ▼";
            setupSortableHeaderCell(div, col);
            tier_events_row.appendChild(div);
        }

        // add the users to the table
        if (trueView) next_user = 0;
        const tierUsers = [];
        while(true){
            const user = table[next_user];
            // if the user is undefined or the user's power is too low, stop adding new rows
            if (user === undefined) {
                break;
            }

            if (trueView) {
                if (trueTierMap[next_user] !== i) {
                    next_user++;
                    continue;
                }
            } else {
                // if the user's power is too low, stop adding new rows
                if(user[2] < effectiveTier["limit"] && effectiveTier["limit"]>1){ 
                    break;
                }
                let tierMatch;
                if (simplifiedView && isSubTierIII(tiers[i]["name"])) {
                    const baseName = getBaseTierName(tiers[i]["name"]);
                    tierMatch = !userFinalTierMap[user[0]].startsWith(baseName);
                } else {
                    tierMatch = userFinalTierMap[user[0]] != effectiveTier["name"];
                }
                if(tierMatch){
                    //don't add users if no scores for valid tier
                    if (effectiveTier["name"] != "Beginner") {
                        break;
                    }
                    
                }
            }

            if (!hasScores(user)) {
                next_user++;
                continue;
            }

            if (unrankedNames.has(user[0])) {
                next_user++;
                continue;
            }

            tierUsers.push(user);
            next_user++;
        }

        const hideEmpty = document.getElementById("switch-empty")?.checked;
        if (hideEmpty && tierUsers.length === 0) {
            results_table.removeChild(tier_table);
            continue;
        }

        const tierAttrName = (function() {
            if (!trueView && simplifiedView && isSubTierIII(tiers[i]["name"])) {
                return null; // will be computed per user
            }
            return tier_name;
        })();

        for (const user of tierUsers) {
            let ta = tierAttrName;
            if (ta === null) {
                const userTier = userFinalTierMap[user[0]];
                ta = userTier ? userTier.toLowerCase().replace(" ","-") : "";
            }
            renderUserRow(user, tier_table, ta, i);
        }
    }

    // Unranked row for players with scores but 0 power
    if (!trueView && unrankedUsers.length > 0) {
        var unranked_table = document.createElement("table");
        unranked_table.id = "unranked-table";
        results_table.appendChild(unranked_table);
        var unranked_head = document.createElement("thead");
        var unranked_req_row = document.createElement("tr");
        var unranked_events_row = document.createElement("tr");
        unranked_head.className = "table-header";
        unranked_req_row.className = "req-row";
        unranked_events_row.className = "events-row";
        unranked_table.appendChild(unranked_head);
        unranked_events_row.style.display = 'none';
        unranked_head.appendChild(unranked_req_row);
        unranked_head.appendChild(unranked_events_row);
        const unrankedTierName = "unranked";
        for(var j=0; j<3; j++){
            var tdel = document.createElement("td");
            tdel.setAttribute("tierf", unrankedTierName + (oldTiers ? "OLD" : ""));
            unranked_req_row.appendChild(tdel);
        }
        unranked_req_row.children[0].textContent = "Unranked";
        unranked_req_row.children[1].textContent = "0";
        unranked_req_row.children[2].textContent = "0";
        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(tiers[num_tiers-1]["times"][catIdx(j)], true);
            div.setAttribute("tierf", unrankedTierName + (oldTiers ? "OLD" : ""));
            unranked_req_row.appendChild(div);
        }
        for(var j=0; j<3; j++){
            unranked_events_row.appendChild(document.createElement("td"));
        }
        unranked_events_row.children[0].textContent = "Name";
        unranked_events_row.children[1].textContent = "Place";
        unranked_events_row.children[2].textContent = "Power";
        for(var j=0; j<num_categories; j++){
            var tdel = document.createElement("td");
            tdel.innerHTML = categories[catIdx(j)].replace(/ /g, '<br>');
            unranked_events_row.appendChild(tdel);
        }
        for (const user of unrankedUsers) {
            renderUserRow(user, unranked_table, unrankedTierName);
        }
    }
}

export function show_results_from_date(){
    populate_table(powerData);
    var date_button = document.getElementById("date-button");
    if (oldTiers) {
        date_button.innerHTML = "Classic Power Rankings";
    } else {
        if (fmcPower){
            date_button.innerHTML = "FMC Power Rankings";
        } else {
            date_button.innerHTML = "Modern Power Rankings";
        }
    }
}

const SWITCH_IDS = ["switch-true", "switch-simplified", "switch", "switch-reqs", "switch-empty"];

function applySwitchStates(states) {
    if (!states) return;
    SWITCH_IDS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && states[id] !== undefined) el.checked = states[id];
    });
    var trueEl = document.getElementById("switch-true");
    if (trueEl) trueView = trueEl.checked;
    var simEl = document.getElementById("switch-simplified");
    if (simEl) simplifiedView = simEl.checked;
}

function notifyParentSwitchState() {
    var state = {};
    SWITCH_IDS.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) state[id] = el.checked;
    });
    try { parent.postMessage({type: "powerSwitchState", state: state}, '*'); } catch(e) {    }
}

function renderSortedTableWithSavedStateReal(savedCol, savedAsc) {
    __truePlaces = {};
    populate_table(powerData);
    document.dispatchEvent(new Event("table-repopulated"));
    if (savedCol !== null) {
        sortColumn = savedCol;
        sortAsc = savedAsc;
        populate_table(powerData);
        document.dispatchEvent(new Event("table-repopulated"));
    }
}

window.addEventListener('message', (event) => {
    const data = event.data;
    const [eventPowerData, eventOldTiers, gettingFMCPower, eventuserFinalTierMap, eventTiers, eventFMCtiers, eventTiersOld, eventCategoriesNew, eventCategoriesOld, eventCategoriesFMC] = data;
    powerData = eventPowerData;
    oldTiers = eventOldTiers;
    userFinalTierMap = eventuserFinalTierMap;
    fmcPower = gettingFMCPower;
    
    if (oldTiers) {
        tiers = eventTiersOld;
        categories = eventCategoriesOld;
    } else {
        if (fmcPower) {
            tiers = eventFMCtiers;
            categories = eventCategoriesFMC;
        } else {
        tiers = eventTiers;
        categories = eventCategoriesNew;
        }
    }
    num_tiers = tiers.length;
    num_categories = categories.length;

    resetSort();
    applySwitchStates(data[10]);

    const simplifiedDiv = document.getElementById("switch-div-simplified");
    if (simplifiedDiv) {
        simplifiedDiv.style.display = oldTiers ? "none" : "";
    }

    show_results_from_date();
    document.dispatchEvent(new Event("table-repopulated"));
});

SWITCH_IDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("change", notifyParentSwitchState);
});

const simplifiedBtn = document.getElementById("switch-simplified");
if (simplifiedBtn) {
    simplifiedBtn.addEventListener("change", () => {
        simplifiedView = simplifiedBtn.checked;
        populate_table(powerData);
        document.dispatchEvent(new Event("table-repopulated"));
    });
}

const trueBtn = document.getElementById("switch-true");
if (trueBtn) {
    trueBtn.addEventListener("change", () => {
        var savedCol = sortColumn;
        var savedAsc = sortAsc;
        resetSort();
        trueView = trueBtn.checked;
        renderSortedTableWithSavedStateReal(savedCol, savedAsc);
    });
}

const hideBtn = document.getElementById("switch-empty");
if (hideBtn) {
    hideBtn.addEventListener("change", () => {
        populate_table(powerData);
        document.dispatchEvent(new Event("table-repopulated"));
    });
}

const resultsTable = document.getElementById("results-table");
if (resultsTable) {
    resultsTable.addEventListener("mouseleave", () => {
        getTooltip().style.display = "none";
    });
}

document.querySelectorAll(".switch-div").forEach(sd => {
    const label = sd.querySelector("label");
    if (!label) return;
    const tt = sd.getAttribute("data-tt");
    if (!tt) return;
    const lines = tt.split("\n");
    const html = lines.map(l => {
        const idx = l.indexOf(": ");
        if (idx === -1) return l;
        return "<span>" + l.substring(0, idx) + "</span>" + l.substring(idx);
    }).join("<br>");
    label.addEventListener("mouseenter", function () {
        const tip = getTooltip();
        const rect = this.getBoundingClientRect();
        tip.innerHTML = html;
        tip.style.display = "block";
        const tipW = tip.offsetWidth;
        const tipH = tip.offsetHeight;
        let left = rect.left + rect.width / 2 - tipW / 2;
        let top = rect.bottom + 4;
        if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
        if (top + tipH > window.innerHeight - 8) top = rect.top - tipH - 4;
        if (left < 8) left = 8;
        if (top < 8) top = 8;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
    });
    label.addEventListener("mouseleave", function () {
        getTooltip().style.display = "none";
    });
});