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
    enableDebugMode.style.display = isAdmin() && exeLeaderboardEnabled && !webLeaderboardEnabled && !lmLeaderboardEnabled ? "inline-block" : "none";
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

//"Public" function to change gameMode ("solveType" - Standard, 2-N Relay etc.)
function changeGameMode(gameMode) {
    requestProxy.gameMode = gameMode;
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
    enableDebugMode.addEventListener("click", function () {
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
        }
    });
    radioCustom.addEventListener("click", () => {
        customMarathonInput.focus();
    });
    puzzleSizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                lastLoadWasPower = false;
                if (radio.value === "History") {
                    radio_allGameModsInteresting.checked = true;
                    request.gameMode = "Interesting";
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
            if (r.value === 'POWER' || r.value === 'POWEROLD' || r.value === 'POWERFMC') {
                if (radio) {
                    radio.checked = true;
                    // Trigger the change event manually
                    radio.dispatchEvent(new Event('change'));
                }
                return;
            }
            if (r.value === 'WRHistory') {
                if (radio) {
                    radio.checked = true;
                    // Trigger the change event manually
                    radio.dispatchEvent(new Event('change'));
                }
                return;
            }
            changePuzzleSize(r.value);
            if (radio) { radio.checked = true; }
            else { document.querySelectorAll('input[name="puzzleSize"]').forEach(function (el) { el.checked = false; }); }
        } else if (r.action === 'name') {
            if (isOnSpecificSizePage()) {
                var wrRadio = document.querySelector('input[name="puzzleSize"][value="NxN WRs"]');
                if (wrRadio) wrRadio.checked = true;
            }
            changeNameFilter(r.value);
        } else if (r.action === 'gameMode') {
            changeGameMode(r.value);
            var gmRadio = document.querySelector('input[name="gamemode"][value="' + r.value.replace(/"/g, '\\"') + '"]');
            if (gmRadio) gmRadio.checked = true;
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
