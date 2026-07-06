//Module for basic user interactions with page, such as changing the filters

/*DEPENDENCIES
dataDisplaying.js
dataFetching.js
replayGeneration.js
*/

function reload() {
    if (lastLoadWasPower) {
        loadingPower = true;
        getPowerData();
    } else {
        sendMyRequest();
    }
}

function toggleCurrentCountry() {
    const val = countrySelect.value;
    countryRanksEnabled = val === 'country-leaderboard';
    currentCountry = val;
    reload();
}

function isAdmin() {
    return adminsList && adminsList.some(function (u) { return u.toLowerCase() === (logged_in_as || '').toLowerCase(); });
}

function updateVideoButtonVisibility() {
    enableDebugMode.style.display = isAdmin() && exeLeaderboardEnabled && !webLeaderboardEnabled && !lmLeaderboardEnabled ? "block" : "none";
}

function toggleWebLeaderboard() {
    webLeaderboardEnabled = includeWebCB.checked;
    forceServerUpdate = true;
    updateVideoButtonVisibility();
    reload();
}

function toggleLMLeaderboard() {
    lmLeaderboardEnabled = includeLMCB.checked;
    forceServerUpdate = true;
    updateVideoButtonVisibility();
    reload();
}

function toggleExeLeaderboard() {
    exeLeaderboardEnabled = includeExeCB.checked;
    forceServerUpdate = true;
    updateVideoButtonVisibility();
    reload();
}

//"Public" function to change control type
function changeControls(newtype) {
    controlType = newtype;
    if (!loadingPower) {
        sendMyRequest();
    }
}

//"Public" function to change filter for the name
function changeNameFilter(nameFilter) {
    requestProxy.nameFilter = nameFilter;
}

//"Public" function to change display type
function changeDisplayType(displayType) {
    requestProxy.displayType = displayType;
}

function updateMobileMarathon() {
    var wrap = document.getElementById('mobileMarathonWrap');
    if (!wrap) return;
    var rc = document.getElementById('radio-custom');
    wrap.style.display = (rc && rc.checked) ? 'inline-flex' : 'none';
}

//"Public" function to change gameMode ("solveType" - Standard, 2-N Relay etc.)
function changeGameMode(gameMode) {
    requestProxy.gameMode = gameMode;
    updateMobileMarathon();
    var sel = document.getElementById('gameModeSelect');
    if (sel) {
        var rc = document.getElementById('radio-custom');
        if (rc && rc.checked) {
            sel.value = '';
        } else if (sel.querySelector('option[value="' + gameMode.replace(/"/g, '\\"') + '"]')) {
            sel.value = gameMode;
        } else {
            sel.selectedIndex = -1;
        }
    }
}

//"Public" function to change leaderboardType (time, move, tps)
function changeLeaderboardType(leaderboardType) {
    requestProxy.leaderboardType = leaderboardType;
}

//"Public" function to change puzzle size OR page type completely
function changePuzzleSize(puzzleSize) {
    if (puzzleSize === "NxN WRs") {
        requestProxy.size = [squaresSheetType, squaresSheetType];
        return;
    }
    if (puzzleSize === "All Singles") {
        requestProxy.size = ["All", "All"];
        return;
    }
    if (puzzleSize === "History") {
        requestProxy.size = ["History", "History"];
        return;
    }
    if (puzzleSize === "WRHistory") {
        requestProxy.size = ["WRHistory", "WRHistory"];
        return;
    }
    if (String(puzzleSize).includes("Rankings")) {
        requestProxy.size = [puzzleSize, puzzleSize];
        return;
    }
    const match = puzzleSize.toLowerCase().match(/^(\d+)x(\d+)$/);
    if (match) {
        const [N, M] = match.slice(1).map(Number);
        if (N >= 2 && M >= 2) {
            requestProxy.size = [N, M];
            var sizesSelect = document.getElementById('sizesSelect');
            if (sizesSelect) sizesSelect.value = puzzleSize;
        }
    }
}


//"Public" function to add major event listeners for html elements
function addListenersToElements() {
    updateVideoButtonVisibility();
    includeWebCB?.addEventListener("change", toggleWebLeaderboard);
    includeExeCB?.addEventListener("change", toggleExeLeaderboard);
    includeLMCB?.addEventListener("change", toggleLMLeaderboard);
    setupSearch();
    var menuBtn = document.getElementById('menuButton');
    var menuDropdown = document.getElementById('menuDropdown');
    if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            menuDropdown.hidden = !menuDropdown.hidden;
            if (countrySelect) {
                var opts = countrySelect.querySelector('.country-select-options');
                if (opts) opts.style.display = 'none';
            }
        });
        document.addEventListener('click', function () {
            menuDropdown.hidden = true;
            if (countrySelect) {
                var opts = countrySelect.querySelector('.country-select-options');
                if (opts) opts.style.display = 'none';
            }
        });
        menuDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    enableDebugMode.addEventListener("click", function (e) {
        e.preventDefault();
        if (!exeLeaderboardEnabled || webLeaderboardEnabled || lmLeaderboardEnabled) {
            alert("Video upload not supported for Web, LM or disabled Exe scores, sorry for inconvenience. Please enable only Exe data before uploading.");
        } else {
            if (!debugMode) {
                if (logged_in_as !== "vovker" && logged_in_as !== "dphdmn") {
                    alert("Please find your score on the leaderboard, click on it, and add video link to submit." +
                        "\nNote: Only YouTube links are accepted.\nYou can only submit your own videos for your own scores.\n" +
                        "Abuse of the system may result in a ban from the leaderboard.");
                }
            }
            debugMode = !debugMode;
            sendMyRequest();
        }
    });
    // ytOnlyButton.addEventListener("click", function(){
    //      ytOnlyEnabled = !ytOnlyEnabled;
    //       if (ytOnlyEnabled){
    //           ytOnlyButton.textContent = "Load replays";
    //           hiddenSolveData = solveData;
    //           solveData = [];
    //           sendMyRequest();
    //       }
    //       else {
    //           ytOnlyButton.textContent = "Hide replays";
    //           solveData = hiddenSolveData;
    //           sendMyRequest();
    //       }
    //
    //   });

    function incrementSize(increase = true, dimension = "both") {
        const width = request.width, height = request.height;
        if (typeof width === 'number' && Number.isInteger(width) && typeof height === 'number' && Number.isInteger(height)) {
            let newWidth = width, newHeight = height;
            if (dimension !== "height") newWidth = increase ? width + 1 : Math.max(2, width - 1);
            if (dimension !== "width") newHeight = increase ? height + 1 : Math.max(2, height - 1);
            if (newWidth !== width || newHeight !== height) {
                requestProxy.size = [newWidth, newHeight];
            }
        }
    }

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.altKey) && (event.key === "+" || event.key === "-" || event.key === "=")) {
            event.preventDefault();
            const increase = event.key === "+" || event.key === "=";
            if (event.ctrlKey) incrementSize(increase, "height");
            else if (event.altKey) incrementSize(increase, "width");
        } else if (event.key === "+" || event.key === "-" || event.key === "=") {
            incrementSize(event.key === "+" || event.key === "=", "both");
        }
        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                var rewindSlider = document.getElementById("rewindSlider");
                if (rewindSlider) {
                    rewindSlider.focus();
                    event.preventDefault();
                }
            }
        }
    });
    tierSlider.addEventListener("input", function () {
        const value = tierSlider.value;
        tierLimit = tierLabels[value];
        if (value < 1) {
            tierSliderLabel.innerHTML = `<span class="kappa">${showAnyLevelRecords}</span>`;
        } else if (value > 9) {
            tierSliderLabel.innerHTML = `<span class="alpha WRPB">${showWRsOnly}</span>`;
        } else {
            tierSliderLabel.textContent = '';
            tierSliderLabel.appendChild(document.createTextNode(showRecordsAtleast + ' '));
            tierSliderLabel.appendChild(greekLetterSpan(tierLimit));
            tierSliderLabel.appendChild(document.createTextNode(' ' + showRecordsAtleastTierWord));

        }
        tierActive = true;
        sendMyRequest();
    });
    customRankingsArea.addEventListener("change", () => {
        changeCustomRanks();
    });
    customMarathonInput.addEventListener("input", () => {
        let inputValue = customMarathonInput.value;
        inputValueNew = inputValue.replace(/[^0-9]/g, '');
        customMarathonInput.value = inputValueNew;
        if (inputValue === inputValueNew) {
            radioCustom.value = "Marathon " + parseInt(inputValueNew);
            radioCustom.checked = true;
            changeGameMode(radioCustom.value);
            if (customMarathonInputMobile) customMarathonInputMobile.value = inputValueNew;
        }
    });
    radioCustom.addEventListener("click", () => {
        customMarathonInput.focus();
    });
    var customMarathonInputMobile = document.getElementById('customInputMarathonMobile');
    if (customMarathonInputMobile) {
        customMarathonInputMobile.addEventListener("input", function () {
            var val = this.value.replace(/[^0-9]/g, '');
            this.value = val;
            if (val) {
                radioCustom.value = "Marathon " + parseInt(val);
                radioCustom.checked = true;
                changeGameMode(radioCustom.value);
                customMarathonInput.value = val;
            }
        });
    }
    puzzleSizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                lastLoadWasPower = false;
                if (radio.value === "History") {
                    radio_allGameModsInteresting.checked = true;
                    request.gameMode = "Interesting";
                    updateMobileMarathon();
                }
                if (radio.value === "POWER") {
                    gettingOldPower = false;
                    gettingFMCPower = false;
                    lastLoadWasPower = true;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                if (radio.value === "POWEROLD") {
                    gettingOldPower = true;
                    gettingFMCPower = false;
                    lastLoadWasPower = true;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                if (radio.value === "POWERFMC") {
                    gettingOldPower = false;
                    gettingFMCPower = true;
                    lastLoadWasPower = true;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                if (radio.value === "WRHistory") {
                    lastLoadWasPower = false;
                    rankingTabs.style.display = "none";
                    request.width = "WRHistory";
                    request.height = "WRHistory";
                    contentDiv.style.minHeight = "0px";
                    directUpdate();
                    return;
                }
                changePuzzleSize(radio.value);
            }
        });
    });
    gamemodeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                changeGameMode(radio.value)
            }
        });
    });
    customRankingsArea.placeholder = helpMessage;
    makeExampleButtons(customRankButtonsExamples);
    addTooltip(radio_allGameModsLabelInteresting, tooltipText);

    let navGroup = document.getElementById('nav-group');
    countrySelect = createCountrySelect();
    let loggedIn = document.getElementById('logged_in_container');
    let ref = loggedIn && loggedIn.nextElementSibling;
    if (ref) {
        navGroup.insertBefore(countrySelect, ref);
    } else {
        navGroup.appendChild(countrySelect);
    }
    countrySelect.addEventListener("change", toggleCurrentCountry);

    // Dynamic size tabs - show as many smallest sizes as fit, rest in overflow select
    var sizesSelect = document.getElementById('sizesSelect');
    if (sizesSelect) {
        sizesSelect.addEventListener('change', function () {
            if (this.value) {
                var radio = document.querySelector('input[name="puzzleSize"][value="' + this.value.replace(/"/g, '\\"') + '"]');
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            }
        });
    }
    // Game mode select for mobile
    var gameModeSelect = document.getElementById('gameModeSelect');
    if (gameModeSelect) {
        gameModeSelect.addEventListener('change', function () {
            if (this.value === '') {
                var rc = document.getElementById('radio-custom');
                if (rc) {
                    rc.checked = true;
                    rc.dispatchEvent(new Event('change'));
                }
                var mi = document.getElementById('customInputMarathonMobile');
                if (mi) mi.focus();
            } else {
                var wrap = document.getElementById('mobileMarathonWrap');
                if (wrap) wrap.style.display = 'none';
                var radio = document.querySelector('input[name="gamemode"][value="' + this.value.replace(/"/g, '\\"') + '"]');
                if (radio) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            }
        });
    }
    updateMobileMarathon();
    updateSizeTabs();
    var resizeTimer;
    window.addEventListener('resize', function () {
        if (window.innerWidth <= 1000) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { requestAnimationFrame(updateSizeTabs); }, 100);
    });
}

var _sizeTabElems = null;
function _getSizeTabElems() {
    if (!_sizeTabElems) {
        _sizeTabElems = {
            wrapper: document.getElementById('sizeTabsWrapper'),
            overflow: document.getElementById('sizesOverflow'),
            select: document.getElementById('sizesSelect'),
            headerInner: document.querySelector('.page-header-inner'),
            navGroup: document.querySelector('.nav-left') || document.getElementById('nav-group'),
            viewsWrapper: document.getElementById('views-wrapper'),
            fixedGroups: null
        };
    }
    return _sizeTabElems;
}

function updateSizeTabs() {
    if (window.innerWidth <= 1000) return;

    var e = _getSizeTabElems();
    if (!e.wrapper || !e.overflow || !e.select) return;

    var tabs = e.wrapper.querySelectorAll('.size-tab');
    if (!tabs.length) return;

    e.wrapper.style.display = 'none';
    e.overflow.style.display = 'none';

    if (!e.headerInner || !e.navGroup || !e.viewsWrapper) return;

    var available = e.headerInner.clientWidth - e.navGroup.offsetWidth - 20;

    if (!e.fixedGroups) {
        e.fixedGroups = [];
        var groups = e.viewsWrapper.children;
        for (var i = 0; i < groups.length; i++) {
            var g = groups[i];
            if (g.id !== 'sizeTabsWrapper' && g.id !== 'sizesOverflow') {
                e.fixedGroups.push(g);
            }
        }
    }
    var fixedWidth = 0;
    var fixedCount = e.fixedGroups.length;
    for (var i = 0; i < fixedCount; i++) {
        fixedWidth += e.fixedGroups[i].offsetWidth;
    }
    available -= (fixedWidth - (fixedCount - 1));

    var tabData = [];
    tabs.forEach(function (t) {
        tabData.push({
            el: t,
            value: t.querySelector('input').value,
            label: t.querySelector('label').textContent.trim(),
            width: Math.ceil(t.getBoundingClientRect().width || 48)
        });
    });

    var totalW = tabData.reduce(function (sum, item) { return sum + item.width; }, 0);
    var numTabs = tabData.length;
    if (totalW <= available + 4) {
        // All fit — show everything
        for (var k = 0; k < numTabs; k++) tabData[k].el.style.display = '';
        e.select.innerHTML = '<option value="" disabled selected>Sizes</option>';
        e.overflow.style.display = 'none';
        e.wrapper.style.display = 'inline-flex';
        return;
    }

    // Assign priority levels: 0=highest (3-10), 1=medium (12,16,20), 2=lowest (11,13-15,17-19)
    var prio = {};
    for (var n = 3; n <= 10; n++) prio[n + 'x' + n] = 0;
    prio['12x12'] = 1; prio['16x16'] = 1; prio['20x20'] = 1;
    for (var n = 11; n <= 19; n++) {
        if (n === 12 || n === 16) continue;
        prio[n + 'x' + n] = 2;
    }

    // Mark all visible, then hide lowest-priority tabs starting from the right
    var visible = new Array(numTabs).fill(true);
    var curTotal = totalW;
    var overflowW = 70;

    // Sort indices by priority (descending) then by position (descending = rightmost first)
    // so we always hide the rightmost lowest-priority tab first
    var indices = tabData.map(function (_, idx) { return idx; });
    indices.sort(function (a, b) {
        var pa = prio[tabData[a].value] || 0;
        var pb = prio[tabData[b].value] || 0;
        if (pa !== pb) return pb - pa; // higher priority number = hidden first
        return b - a; // rightmost first
    });

    var hiddenCount = 0;
    for (var s = 0; s < indices.length; s++) {
        var adj = hiddenCount > 0 ? overflowW : 0;
        if (curTotal + adj <= available + 4) break;
        var idx = indices[s];
        curTotal -= tabData[idx].width;
        visible[idx] = false;
        hiddenCount++;
    }

    // Build overflow options from hidden tabs
    var optsHtml = '<option value="" disabled selected>Sizes</option>';
    for (var m = 0; m < numTabs; m++) {
        tabData[m].el.style.display = visible[m] ? '' : 'none';
        if (!visible[m]) {
            optsHtml += '<option value="' + tabData[m].value + '">' + tabData[m].label + '</option>';
        }
    }

    e.select.innerHTML = optsHtml;
    e.overflow.style.display = hiddenCount > 0 ? '' : 'none';
    e.wrapper.style.display = (numTabs - hiddenCount) > 0 ? 'inline-flex' : 'none';
}

//_________________End of "Public" functions of this module_________________//
/* ---------- Search Overlay ---------- */
function setupSearch() {
    if (!searchTrigger || !searchOverlay || !searchInput) return;

    function openSearch() {
        searchOverlay.hidden = false;
        searchInput.value = '';
        currentResults = searchAll('');
        selectedIdx = -1;
        renderSearchResults();
        setTimeout(function () { searchInput.focus(); }, 50);
    }
    function closeSearch() { searchOverlay.hidden = true; }

    searchTrigger.addEventListener('click', openSearch);
    searchOverlay.addEventListener('click', function (e) {
        if (e.target === searchOverlay) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !searchOverlay.hidden) closeSearch();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchOverlay.hidden) openSearch();
            else closeSearch();
        }
    });

    var selectedIdx = -1;
    var currentResults = [];

    searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim().toLowerCase();
        currentResults = searchAll(q);
        selectedIdx = -1;
        renderSearchResults();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            selectedIdx = Math.max(-1, selectedIdx - 1);
            renderSearchResults();
        } else if (e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault();
            selectedIdx = Math.min(currentResults.length - 1, selectedIdx + 1);
            renderSearchResults();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = Math.max(-1, selectedIdx - 1);
            renderSearchResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIdx >= 0 && currentResults[selectedIdx]) {
                goSearchResult(currentResults[selectedIdx]);
            } else if (currentResults.length) {
                goSearchResult(currentResults[0]);
            }
        }
    });

    function renderSearchResults() {
        if (!currentResults.length) {
            searchResults.innerHTML = '<div class="search-result" style="cursor:default"><span class="sr-type">\u2014</span><span class="sr-label" style="color:var(--text-dim)">No results</span></div>';
            return;
        }
        searchResults.innerHTML = '';
        currentResults.forEach(function (r, i) {
            var div = document.createElement('div');
            div.className = 'search-result' + (i === selectedIdx ? ' selected' : '');
            var valueClass = r.type !== 'puzzle' && r.type !== 'player' ? ' sr-view-' + r.value.replace(/[^a-zA-Z0-9]/g, '-') : '';
            div.innerHTML = '<span class="sr-type sr-type-' + r.type + valueClass + '">' + r.type + '</span>' +
                '<span class="sr-label">' + escHtml(r.label) + '</span>' +
                '<span class="sr-meta">' + escHtml(r.meta || '') + '</span>';
            div.addEventListener('click', function () { goSearchResult(r); });
            searchResults.appendChild(div);
        });
    }

    function isOnSpecificSizePage() {
        var w = request.width, h = request.height;
        return (typeof w === 'number' && Number.isInteger(w) && w >= 2) ||
            ['POWER', 'POWEROLD', 'POWERFMC', 'Rankings2', 'Rankings3', 'WRHistory'].indexOf(String(w)) >= 0;
    }

    function goSearchResult(r) {
        closeSearch();
        if (r.action === 'size') {
            var radio = document.querySelector('input[name="puzzleSize"][value="' + r.value.replace(/"/g, '\\"') + '"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            } else {
                document.querySelectorAll('input[name="puzzleSize"]').forEach(function (el) { el.checked = false; });
                changePuzzleSize(r.value);
            }
        } else if (r.action === 'name') {
            if (isOnSpecificSizePage()) {
                var wrRadio = document.querySelector('input[name="puzzleSize"][value="NxN WRs"]');
                if (wrRadio) {
                    wrRadio.checked = true;
                    wrRadio.dispatchEvent(new Event('change'));
                }
            }
            changeNameFilter(r.value);
        } else if (r.action === 'gameMode') {
            var gmRadio = document.querySelector('input[name="gamemode"][value="' + r.value.replace(/"/g, '\\"') + '"]');
            if (gmRadio) {
                gmRadio.checked = true;
                gmRadio.dispatchEvent(new Event('change'));
            } else {
                changeGameMode(r.value);
            }
        }
    }
}

function searchAll(q) {
    var results = [];
    var lowerQ = q.toLowerCase();

    // Puzzle sizes (standard + custom)
    var sizes = [
        { label: '3\u00d73', value: '3x3' },
        { label: '4\u00d74', value: '4x4' },
        { label: '5\u00d75', value: '5x5' },
        { label: '6\u00d76', value: '6x6' },
        { label: '7\u00d77', value: '7x7' },
        { label: '8\u00d78', value: '8x8' },
        { label: '9\u00d79', value: '9x9' },
        { label: '10\u00d710', value: '10x10' },
        { label: '12\u00d712', value: '12x12' },
        { label: '16\u00d716', value: '16x16' },
        { label: '20\u00d720', value: '20x20' },
    ];

    if (!q) {
        // Empty query: views first, then sizes
        var allSpecials = [
            { label: 'Power Rankings', value: 'POWER', meta: 'Rankings', type: 'power' },
            { label: 'FMC Rankings', value: 'POWERFMC', meta: 'Rankings', type: 'power' },
            { label: 'G++ Rankings', value: 'POWEROLD', meta: 'Rankings', type: 'power' },
            { label: 'Kinch Rankings', value: 'Rankings3', meta: 'Rankings', type: 'kinch' },
            { label: 'Popular Rankings', value: 'Rankings2', meta: 'Rankings', type: 'kinch' },
            { label: 'PB History', value: 'History', meta: 'Recently set records', type: 'history' },
            { label: 'WR History', value: 'WRHistory', meta: 'Historical progression', type: 'history' },
            { label: 'World Records', value: 'NxN WRs', meta: 'Square sizes only', type: 'wrs' },
            { label: 'Single WRs matrix', value: 'All Singles', meta: 'All puzzle sizes', type: 'wrs' },
        ];
        allSpecials.forEach(function (s) {
            results.push({ type: s.type, label: s.label, meta: s.meta, action: 'size', value: s.value });
        });
        sizes.forEach(function (s) {
            results.push({ type: 'puzzle', label: s.label, meta: '', action: 'size', value: s.value });
        });
        return results;
    }

    // Puzzle sizes (standard + custom)
    var sizes = [
        { label: '3\u00d73', value: '3x3' },
        { label: '4\u00d74', value: '4x4' },
        { label: '5\u00d75', value: '5x5' },
        { label: '6\u00d76', value: '6x6' },
        { label: '7\u00d77', value: '7x7' },
        { label: '8\u00d78', value: '8x8' },
        { label: '9\u00d79', value: '9x9' },
        { label: '10\u00d710', value: '10x10' },
        { label: '12\u00d712', value: '12x12' },
        { label: '16\u00d716', value: '16x16' },
        { label: '20\u00d720', value: '20x20' },
    ];
    sizes.forEach(function (s) {
        if (s.label.toLowerCase().indexOf(lowerQ) >= 0 || s.value.toLowerCase().indexOf(lowerQ) >= 0) {
            results.push({ type: 'puzzle', label: s.label, meta: '', action: 'size', value: s.value });
        }
    });

    // Custom size (if query matches NxM pattern)
    var customMatch = q.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!customMatch) customMatch = q.match(/^(\d+)$/);
    if (customMatch) {
        var n = parseInt(customMatch[1]);
        var m = customMatch[2] ? parseInt(customMatch[2]) : n;
        if (n >= 2 && m >= 2 && (n > 20 || m > 20 || (n !== m) || (sizes.every(function (s) { return s.value !== n + 'x' + m; })))) {
            results.push({ type: 'puzzle', label: n + '\u00d7' + m, meta: 'Custom', action: 'size', value: n + 'x' + m });
        }
    }

    // Special views
    var specials = [
        { label: 'Power Rankings', value: 'POWER', meta: 'Rankings', type: 'power' },
        { label: 'FMC Rankings', value: 'POWERFMC', meta: 'Rankings', type: 'power' },
        { label: 'G++ Rankings', value: 'POWEROLD', meta: 'Rankings', type: 'power' },
        { label: 'Kinch Rankings', value: 'Rankings3', meta: 'Rankings', type: 'kinch' },
        { label: 'Popular Rankings', value: 'Rankings2', meta: 'Rankings', type: 'kinch' },
        { label: 'PB History', value: 'History', meta: 'Recently set records', type: 'history' },
        { label: 'WR History', value: 'WRHistory', meta: 'Historical progression', type: 'history' },
        { label: 'World Records', value: 'NxN WRs', meta: 'Square sizes only', type: 'wrs' },
        { label: 'Single WRs matrix', value: 'All Singles', meta: 'All puzzle sizes', type: 'wrs' },
    ];
    specials.forEach(function (s) {
        if (s.label.toLowerCase().indexOf(lowerQ) >= 0 || s.value.toLowerCase().indexOf(lowerQ) >= 0) {
            results.push({ type: s.type, label: s.label, meta: s.meta, action: 'size', value: s.value });
        }
    });

    // Players (usernames)
    if (typeof fullUniqueNames !== 'undefined' && fullUniqueNames) {
        fullUniqueNames.forEach(function (name) {
            if (name.toLowerCase().indexOf(lowerQ) >= 0) {
                results.push({ type: 'player', label: name, meta: '', action: 'name', value: name });
            }
        });
    }

    return results.slice(0, 50);
}

function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

//_________________"Private" functions (multiple usage)_________________

//obscure "function" to change request...
var requestProxy = new Proxy(request, {
    set: function (target, key, value) {
        if (key == "size") {
            target["width"] = value[0];
            target["height"] = value[1];
        } else {
            target[key] = value;
        }
        if (!loadingPower) {
            sendMyRequest();
        }
        return true;
    },
});

//_________________"Private" functions (multiple usage) ends_________________
