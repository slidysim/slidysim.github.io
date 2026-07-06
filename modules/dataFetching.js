//Module to work with exernal data (primarly getting main leaderboard data)

/*DEPENDENCIES
dataDisplaying.js
dataProcessing.js
userInteractions.js
*/

function loadAnimation(loadingAnimation, contentDiv) {
    contentDiv.style.opacity = '0.25';
    setTimeout(() => {
        loadingAnimation.style.display = 'block';
        setTimeout(() => {
            loadingAnimation.style.opacity = '1';
        }, 50);
    }, 250);
}

function unloadAnimation(loadingAnimation, contentDiv) {
    loadingAnimation.style.opacity = '0';
    setTimeout(() => {
        loadingAnimation.style.display = 'none';
        contentDiv.style.opacity = '1';
    }, 250);
}

function handleScoresResponse(error, res, customScores, customUserList) {
    unloadAnimation(loadingAnimation, contentDiv);
    document.body.style.pointerEvents = 'auto';
    if (error) {
        console.log("Error:", error);
    } else {
        leaderboardData = customScores || deduplicatePlayerScores(res.scoresParsed) || [];
        const userList = customUserList || res.userList || [];
        fullUniqueNames = userList.length ? userList.sort() : [];

        if (initial) {
            addListenersToElements();
        }
        directUpdate();
        if (initial) {
            document.getElementById("controlsDiv").style.opacity = "1";
            document.querySelector('.page-header').style.opacity = '1';
            document.querySelector('.page-footer').style.opacity = '1';
            customRanksCheck();
            initial = false;
        }
        if (typeof countrySelect !== 'undefined' && countrySelect && typeof rebuildCountryOptions === 'function') {
            rebuildCountryOptions(countrySelect);
        }
    }
}

function getCategoryKey(s) {
    return `${s.width}-${s.height}-${s.leaderboardType}-${s.controls}-${s.gameMode}-${s.displayType}-${s.nameFilter}-${s.avglen}`;
}

function isBetter(web, live, type) {
    // Map type to the value and comparison direction
    const config = {
        "tps": { get: (x) => x.tps, higherIsBetter: true },
        "move": { get: (x) => x.moves, higherIsBetter: false },
        "time": { get: (x) => x.time, higherIsBetter: false },
        "FMC": { get: (x) => x.time, higherIsBetter: false },
        "FMC MTM": { get: (x) => x.time, higherIsBetter: false }
    };
    
    const cfg = config[type] || config["time"];
    const webVal = cfg.get(web);
    const liveVal = cfg.get(live);
    
    if (webVal === -1) return false;
    if (liveVal === -1) return true;
    
    return cfg.higherIsBetter ? webVal > liveVal : webVal < liveVal;
}

function deduplicatePlayerScores(scores) {
    if (!scores || !scores.length) return scores || [];

    const map = new Map();

    scores.forEach(s => {
        const key = getCategoryKey(s) + '-' + s.nameFilter;
        const existing = map.get(key);

        if (!existing || isBetter(s, existing, s.leaderboardType)) {
            map.set(key, s);
        }
    });

    return Array.from(map.values());
}

function mergeWebPBs(liveData, webData) {
    if (!liveData || !webData) return liveData || webData || [];

    liveData = deduplicatePlayerScores(liveData);
    webData = deduplicatePlayerScores(webData);

    if (!liveData.length) return webData.map(s => ({ ...s, isWeb: true }));
    if (!webData.length) return liveData.map(s => ({ ...s, isWeb: false }));
    
    const map = new Map();
    
    // Add live data first, mark as not web
    liveData.forEach(s => {
        map.set(getCategoryKey(s), { ...s, isWeb: false });
    });
    
    // Process web data
    webData.forEach(w => {
        const key = getCategoryKey(w);
        const l = map.get(key);
        
        if (!l || isBetter(w, l, w.leaderboardType)) {
            // If web score is better or no live score exists, use web score
            map.set(key, { ...w, isWeb: true });
        }
        // If live score is better, it stays in the map with isWeb: false
    });
    
    return Array.from(map.values());
}

function mergeLMPBs(existingData, lmData) {
    if (!existingData || !lmData) return existingData || lmData || [];

    existingData = deduplicatePlayerScores(existingData);
    lmData = deduplicatePlayerScores(lmData);

    if (!existingData.length) return lmData.map(s => ({ ...s, isLM: true }));
    if (!lmData.length) return existingData;

    const map = new Map();

    existingData.forEach(s => {
        map.set(getCategoryKey(s), { ...s });
    });

    lmData.forEach(lm => {
        const key = getCategoryKey(lm);
        const existing = map.get(key);

        if (!existing || isBetter(lm, existing, lm.leaderboardType)) {
            map.set(key, { ...lm, isLM: true });
        }
    });

    return Array.from(map.values());
}

function updateServer(auth_token, displayType, controlType, pbType) {
    const loadingAnimation = document.getElementById("loadingAnimation");
    const contentDiv = document.getElementById("contentDiv");
    latestRecordTime = new Date();
    loadAnimation(loadingAnimation, contentDiv);
    document.body.style.pointerEvents = 'none';

    // ---- Decide which source(s) to fetch, per current slider state ----
    //
    // Two top-level modes:
    //   archiveMode === "live"
    //     Exe: fetched live from the server (archiveDate = "LIVE").
    //     Web: closest-older web archive to "now" (= latest web archive).
    //     LM:  closest-older lm archive to "now" (= latest lm archive).
    //   archiveMode === "archive"
    //     Exe: closest-older exe archive to selectedSliderDate (or skip if none).
    //     Web: closest-older web archive to selectedSliderDate (or skip if none).
    //     LM:  closest-older lm archive to selectedSliderDate (or skip if none).
    //
    // For each enabled type, if no archive ≤ the target date exists, that
    // type is dropped from the merge and the source-status line shows "N/A".

    const isExeToggleOn = exeLeaderboardEnabled;
    const isWebToggleOn = webLeaderboardEnabled;
    const isLMToggleOn = lmLeaderboardEnabled;

    // The target timestamp for the "closest-older" lookup. In live mode we use
    // +Infinity so the closest-older archive is simply the newest available
    // (matches the old latestWebArchive / latestLMArchive behaviour).
    const targetTs = (archiveMode === 'archive' && selectedSliderDate != null)
        ? selectedSliderDate
        : Number.POSITIVE_INFINITY;

    let exeArchive = null; // null means "use live server" (only valid in live mode)
    let webArchive = null; // null means "not fetched"
    let lmArchive  = null;

    if (isExeToggleOn) {
        if (archiveMode === 'live') {
            exeArchive = null; // live server
        } else {
            exeArchive = findClosestOlderArchive(availableExeArchives, targetTs);
        }
    }
    if (isWebToggleOn) {
        webArchive = findClosestOlderArchive(availableWebArchives, targetTs);
    }
    if (isLMToggleOn) {
        lmArchive = findClosestOlderArchive(availableLMArchives, targetTs);
    }

    // Record what we're going to fetch (for the source-status line + messages).
    selectedArchiveDates = {
        exe: exeArchive,
        web: webArchive,
        lm:  lmArchive,
    };

    const hasAnySource =
        (isExeToggleOn && (archiveMode === 'live' || exeArchive)) ||
        (isWebToggleOn && webArchive) ||
        (isLMToggleOn && lmArchive);

    if (!hasAnySource) {
        // Nothing to fetch — show empty leaderboard.
        lastFetchOk = { exe: false, web: false, lm: false };
        if (typeof refreshSourceStatus === 'function') {
            refreshSourceStatus({
                exe: isExeToggleOn ? { live: archiveMode === 'live', archive: exeArchive, ok: false } : null,
                web: isWebToggleOn ? { archive: webArchive, ok: false } : null,
                lm:  isLMToggleOn  ? { archive: lmArchive,  ok: false } : null,
            });
        }
        handleScoresResponse(null, { scoresParsed: [], userList: [] }, [], []);
        return;
    }

    let pending = 0;
    let exeData = null;     let exeUserList = [];
    let webData = null;     let webUserList = [];
    let lmData = null;      let lmUserList = [];

    function finalize() {
        if (--pending > 0) return;

        // Track which types actually yielded data, for the status line.
        // Don't reset a type's status when its toggle is off — that way
        // toggling off then on doesn't briefly show "N/A" in the preview.
        lastFetchOk = {
            exe: isExeToggleOn ? !!exeData : lastFetchOk.exe,
            web: isWebToggleOn ? !!webData : lastFetchOk.web,
            lm:  isLMToggleOn  ? !!lmData  : lastFetchOk.lm,
        };

        let mergedScores = [];
        let mergedUserList = [];

        // Merge order: exe first (it's the "main" source), then web, then lm.
        // The merge* helpers already dedupe + pick the better score per
        // (category + player), and tag entries with isWeb / isLM so the
        // leaderboard can show the source icon next to each score.
        if (lastFetchOk.exe) {
            mergedScores = deduplicatePlayerScores(exeData) || [];
            mergedUserList = [...exeUserList];
        }

        if (lastFetchOk.web) {
            mergedScores = mergeWebPBs(mergedScores, webData);
            mergedUserList = [...new Set([...mergedUserList, ...webUserList])].sort();
        }

        if (lastFetchOk.lm) {
            mergedScores = mergeLMPBs(mergedScores, lmData);
            mergedUserList = [...new Set([...mergedUserList, ...lmUserList])].sort();
        }

        // Restore archiveDate to a sensible global value. The per-fetch value
        // was captured inside getScores() at call time, so mutating it here is
        // safe. In live mode we set "LIVE" so buildTimestampSection renders the
        // "Last leaderboard update: X ago" timer; in archive mode we set the
        // exe archive name (or the web/lm fallback) so the legacy
        // buildTimestampSection branch can still format something.
        if (archiveMode === 'live') {
            archiveDate = exeFallbackArchive || "LIVE";
        } else {
            archiveDate = exeArchive || webArchive || lmArchive || "LIVE";
        }

        // Update the slider's source-status line.
        if (typeof refreshSourceStatus === 'function') {
            refreshSourceStatus({
                exe: isExeToggleOn ? { live: archiveMode === 'live' && !exeArchive, archive: exeArchive, ok: lastFetchOk.exe } : null,
                web: isWebToggleOn ? { archive: webArchive, ok: lastFetchOk.web } : null,
                lm:  isLMToggleOn  ? { archive: lmArchive,  ok: lastFetchOk.lm }  : null,
            });
        }
        // Sync the per-type preview items so they reflect actual fetch result.
        if (typeof updatePreviewSourceStatus === 'function') {
            const ts = archiveSlider ? parseInt(archiveSlider.value, 10) : NaN;
            updatePreviewSourceStatus(!isNaN(ts) ? ts : (selectedSliderDate || Number.POSITIVE_INFINITY));
        }

        // handleScoresResponse expects the "primary" res (used for userList
        // fallback). We pass the exe data as primary when available, else an
        // empty stub. The merged scores are passed via customScores.
        const primaryRes = exeData
            ? { scoresParsed: exeData, userList: exeUserList }
            : { scoresParsed: [], userList: [] };
        handleScoresResponse(null, primaryRes, mergedScores, mergedUserList);
    }

    // Exe fetch (live server OR exe archive).
    if (isExeToggleOn && (archiveMode === 'live' || exeArchive)) {
        pending++;
        const savedArchiveDate = archiveMode === 'live' ? "LIVE" : exeArchive;
        archiveDate = savedArchiveDate;
        getScoresWrapper(auth_token, displayType, controlType, pbType, (err, res) => {
            exeFetchAttempted = true;
            if (!err && res?.scoresParsed) {
                exeData = res.scoresParsed;
                exeUserList = res.userList || [];
                exeFallbackArchive = null;
                finalize();
            } else if (archiveMode === 'live' && !exeArchive) {
                // Live server unavailable — try latest exe archive as fallback.
                const fallback = availableExeArchives[0];
                if (fallback) {
                    exeArchive = fallback;
                    archiveDate = fallback;
                    selectedArchiveDates.exe = fallback;
                    exeFallbackArchive = fallback;
                    getScoresWrapper(auth_token, displayType, controlType, pbType, (fallbackErr, fallbackRes) => {
                        exeFetchAttempted = true;
                        if (!fallbackErr && fallbackRes?.scoresParsed) {
                            exeData = fallbackRes.scoresParsed;
                            exeUserList = fallbackRes.userList || [];
                        } else {
                            exeFallbackArchive = null;
                        }
                        finalize();
                    });
                    return;
                }
                finalize();
            } else {
                finalize();
            }
        });
    }

    // Web fetch (always an archive — there's no live web source).
    if (isWebToggleOn && webArchive) {
        pending++;
        archiveDate = webArchive;
        getScoresWrapper(auth_token, displayType, controlType, pbType, (webErr, webRes) => {
            if (!webErr && webRes?.scoresParsed) {
                webData = webRes.scoresParsed;
                webUserList = webRes.userList || [];
            }
            finalize();
        });
    }

    // LM fetch (always an archive).
    if (isLMToggleOn && lmArchive) {
        pending++;
        archiveDate = lmArchive;
        getScoresWrapper(auth_token, displayType, controlType, pbType, (lmErr, lmRes) => {
            if (!lmErr && lmRes?.scoresParsed) {
                lmData = lmRes.scoresParsed;
                lmUserList = lmRes.userList || [];
            }
            finalize();
        });
    }
}

function removeBannedScores(scores) {
    const bannedScores = [
        { nameFilter: "MOKA", tps: 181512 },
        { nameFilter: "robotmania", tps: 9999000, leaderboardType: "tps", gameMode: "Marathon 42" }
    ];

    return scores.filter(score =>
        !bannedScores.some(banned => {
            // Check every property in the banned score object
            return Object.keys(banned).every(key => banned[key] === score[key]);
        })
    );
}

function directUpdate() {
    // Reset tier slider on any update/view change, unless the user is actively dragging it.
    if (!tierActive) {
        tierSlider.value = "0";
        tierLimit = "Any";
        tierSliderLabel.innerHTML = `<span class="kappa">${showAnyLevelRecords}</span>`;
    }
    tierActive = false;

    let sheetType = request.height;
    if (sheetType === squaresSheetType && controlType === "both") {
        changeControls("unique");
        return;
    }
    leaderboardData = removeBannedScores(leaderboardData);
    //console.log("direct update called");
    document.getElementById('power-iframe')?.remove();
    document.getElementById('wrhistory-iframe')?.remove();

    if (sheetType === "WRHistory") {
        const header = document.getElementById("leaderboardName");
        header.innerHTML = '';
        NxNWRsContainer.innerHTML = "";
        solveTypeDiv.style.display = "none";

        radio_allGameModsLabel.style.display = 'none';
        radio_allGameModsLabelInteresting.style.display = 'none';
        radio_allGameModsLabelNMSingles.style.display = 'none';
        tierLimiterTab.style.display = 'none';
        tooltip.style.display = 'none';
        tooltip.classList.remove(...tooltip.classList);
        rankingTabs.style.display = "none";
        const contentDiv = document.getElementById('contentDiv');
        contentDiv.className = "";
        contentDiv.style.opacity = "1";
        contentDiv.innerHTML = '';
        resetContentDivLayout(contentDiv);
        const iframe = document.createElement('iframe');
        iframe.id = "wrhistory-iframe";
        iframe.src = 'https://dphdmn.github.io/slidyhistory/';
        contentDiv.insertAdjacentElement('afterend', iframe);
        return;
    }

    //if(loadingPower) {
    //    controlType = 'unique';
    //}
    isAllMarathons = (request.gameMode === allMarathons);
    last_displayType = request.displayType;
    last_controlType = controlType;
    last_pbType = request.leaderboardType;
    NxNWRsContainer.innerHTML = "";
    tooltip.style.display = 'none';
    NxMSelected = totalWRsAmount;

    radio_allGameModsLabel.style.display = 'none';
    radio_allGameModsLabelInteresting.style.display = 'none';
    radio_allGameModsLabelNMSingles.style.display = 'none';
    tierLimiterTab.style.display = 'none';
    tooltip.classList.remove(...tooltip.classList);
    solveTypeDiv.style.display = 'block';
    if ((request.gameMode === "All Solve Types" || request.gameMode === "Interesting" || request.gameMode === "Standard Singles") && (sheetType !== "History")) {
        radiostandardgamemode.checked = true;
        request.gameMode = "Standard";
        updateMobileMarathon();
        var sel = document.getElementById('gameModeSelect');
        if (sel) sel.value = 'Standard';
    }
    let cleanedData;
    if (countryRanksEnabled) {
        cleanedData = filterDataByRequest(getCountryScores(leaderboardData), request);
    } else {
        if (currentCountry === "worldwide") {
            cleanedData = filterDataByRequest(leaderboardData, request);
        } else {
            cleanedData = filterDataByRequest(filterScoresByCountry(currentCountry), request);
        }
    }
    cleanedData = cleanedData.sort((a, b) => {
        return a["timestamp"] - b["timestamp"];
    });
    //console.log("Sheet Type ", sheetType);
    if (sheetType === squaresSheetType) {
        processSquareRecordsData(cleanedData, sheetType);
    } else if (sheetType === "All") {
        processNxMRecordsData(cleanedData);
    } else if (String(sheetType).includes("Rankings")) {
        processRankingsData(cleanedData, sheetType);
    } else if (sheetType === "History") {
        processHistoryData(cleanedData);
    } else {
        processNormalLeaderboard(cleanedData, isAllMarathons);

    }
    updateSelectSizes();
}

//"Public" function for sending request for processing data based on request
function sendMyRequest() {
    //console.log("sending request");
    closeReplay();
    let new_displayType = request.displayType;
    let new_controlType = controlType;
    let new_pbType = request.leaderboardType;
    if (loadingPower || forceServerUpdate) {
        forceServerUpdate = false;
        updateServer(user_token, new_displayType, controlType, new_pbType);
    } else {
        if (new_displayType === last_displayType && new_controlType === last_controlType && new_pbType === last_pbType) {
            directUpdate();
        } else {
            if (last_displayType !== -1) {
                updateServer(user_token, new_displayType, controlType, new_pbType);
            } else {
            }
        }
    }
}

//"Public" function to extract items for current leaderboard from data object list based on request
function filterDataByRequest(data, request) {
    if (String(request.width)
        .includes("Rankings")) {
        return data.filter(entry => {
            return true;
        });
    }
    if (request.width === "History") {
        if (request.gameMode === allMarathons) {
            return data.filter(entry => {
                return (
                    (entry.gameMode.includes("Marathon")) &&
                    (entry.avglen === 1)
                );
            });
        }
        return data.filter(entry => {
            if (entry.width <= 2 && entry.height <= 2) return false; //no 2x2 solves

            if (request.gameMode === "All Solve Types") return true; //ALL without filters
            if (request.gameMode === entry.gameMode) return true; //ALL if specific gamemode is selected

            if (request.gameMode === "Standard Singles") {
                return entry.avglen === 1 && entry.gameMode === "Standard"; //NxM records
            }

            if (request.gameMode === "Interesting") {
                if (entry.gameMode === "BLD") return true; //BLD is always interesting
                const interestingAvgLens = [1, 5, 12, 25, 50, 100]; //Only important averages
                const interestingMarathons = [10, 25, 42, 50, 100]; //Only important marathons
                if (entry.width !== entry.height) return false; //No NxM solves are interesting
                if (entry.gameMode === "Width relay" || entry.gameMode === "Height relay") return false; //No weird relays (EUT is interesting tho)
                if (entry.gameMode.startsWith("Marathon ")) {
                    const marathonNumber = parseInt(entry.gameMode.split(" ")[1]);
                    if (!interestingMarathons.includes(marathonNumber)) return false;
                }
                if (entry.gameMode === "Standard") {
                    return interestingAvgLens.includes(entry.avglen);
                }
                return entry.avglen === 1; //If gamemode is not standard, only singles are interesting
            }
            return false;
        });
    }
    if (request.width === "All") {
        // For NxM records, don't filter by avglen - we want to analyze all available averages
        return data.filter(entry => {
            return (
                ((entry.width > 2) || (entry.height > 2)) &&
                (request.gameMode === entry.gameMode) &&
                (request.nameFilter === "" || entry.nameFilter.toLowerCase() === request.nameFilter.toLowerCase())
            );
        });
    }
    if (request.width === squaresSheetType) {
        if (request.gameMode === allMarathons) {
            return data.filter(entry => {
                return (
                    (entry.width > 2) && (entry.height > 2) &&
                    (entry.width === entry.height) &&
                    (entry.gameMode.includes("Marathon")) &&
                    (request.nameFilter === "" || entry.nameFilter.toLowerCase() === request.nameFilter.toLowerCase()) &&
                    (entry.avglen === 1)
                );
            });
        }
        return data.filter(entry => {
            return (
                (entry.width > 2) && (entry.height > 2) &&
                (entry.width === entry.height) &&
                (request.gameMode === entry.gameMode) &&
                (request.nameFilter === "" || entry.nameFilter.toLowerCase() === request.nameFilter.toLowerCase())
            );
        });
    }
    if (request.gameMode === allMarathons) {
        return data.filter(entry => {
            return (
                (entry.gameMode.includes("Marathon")) &&
                (request.width === entry.width) &&
                (request.height === entry.height) &&
                (entry.avglen === 1)
            );
        });
    }
    return data.filter(entry => {
        return (
            (request.width === entry.width) &&
            (request.height === entry.height) &&
            (request.gameMode === entry.gameMode)
        );
    });
}

function getSolutionForScore(item, callback) {
    const loadingAnimation = document.getElementById("loadingAnimation");
    const contentDiv = document.getElementById("contentDiv");
    document.body.style.pointerEvents = 'none';

    loadAnimation(loadingAnimation, contentDiv);
    getSolveData(user_token, item.time, item.moves, item.timestamp)
        .then(solveData => {
            unloadAnimation(loadingAnimation, contentDiv);;
            document.body.style.pointerEvents = 'auto';

            callback(null, solveData); // Call the callback with no error and the solution data
        })
        .catch(error => {
            unloadAnimation(loadingAnimation, contentDiv);
            console.error("Error retrieving solution:", error);
            document.body.style.pointerEvents = 'auto';

            callback("-1", null); // Call the callback with the error indicator "-1"
        });
}

//USAGE
//getSolutionForScore(item, (error, solveData) => {
//    if (error) {
//        console.log("Failed to get solution, error:", error);
//    } else {
//        console.log("Solution data:", solveData);
//    }
//});


//"Public" function to compress array to a URL-safe-string
function compressArrayToString(inputArray) {
    const jsonString = JSON.stringify(inputArray);
    const compressedArray = pako.deflate(new TextEncoder().encode(jsonString), { level: 9 });
    const compressedString = btoa(String.fromCharCode(...compressedArray));
    return encodeURIComponent(compressedString);
}

//"Public" function to decompress string, compressed with compressArrayToString function into array
function decompressStringToArray(compressedString) {
    try {
        const decodedString = decodeURIComponent(compressedString);
        const compressedArray = new Uint8Array(atob(decodedString).split('').map(char => char.charCodeAt(0)));
        const jsonString = new TextDecoder().decode(pako.inflate(compressedArray));
        return JSON.parse(jsonString);
    } catch (error) {
        alert(errorDecompressingURL);
        window.location.href = window.location.origin + window.location.pathname;
    }
}

//_________________End of "Public" functions of this module_________________//

//_________________"Private" functions for loadCompressedJSON_________________

function getHighestTimestampValue(arr) {
    if (arr.length === 0) {
        return undefined;
    }

    let highestTimestamp = arr[0].timestamp;
    const currentTime = Date.now();

    for (let i = 1; i < arr.length; i++) {
        let currentTimestamp = arr[i].timestamp;
        if (currentTimestamp > currentTime) {
            currentTimestamp = -1;
            arr[i].timestamp = -1;
        }
        if (currentTimestamp > highestTimestamp) {
            highestTimestamp = currentTimestamp;
        }
    }

    return highestTimestamp;
}

//_________________"Private" functions for loadCompressedJSON ends_________________
