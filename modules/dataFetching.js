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
        leaderboardData = customScores || res.scoresParsed || [];
        fullUniqueNames = customUserList || res.userList.sort();
        if (initial) {
            addListenersToElements();
        }
        updateSuggestions();
        directUpdate();
        if (initial) {
            document.getElementById("controlsDiv").style.opacity = "1";
            customRanksCheck();
            initial = false;
        }
    }
}

function getCategoryKey(s) {
    return `${s.width}-${s.height}-${s.leaderboardType}-${s.controls}-${s.gameMode}-${s.displayType}-${s.nameFilter}-${s.avglen}`;
}

function isBetter(web, live, type) {
    const webVal = type === "tps" ? web.tps : (type === "move" ? web.moves : web.time);
    const liveVal = type === "tps" ? live.tps : (type === "move" ? live.moves : live.time);
    if (webVal === -1) return false;
    if (liveVal === -1) return true;
    return type === "tps" ? webVal > liveVal : webVal < liveVal;
}

function mergeWebPBs(liveData, webData) {
    const map = new Map(liveData.map(s => [getCategoryKey(s), s]));
    webData.forEach(w => {
        const key = getCategoryKey(w);
        const l = map.get(key);
        if (!l || isBetter(w, l, w.leaderboardType)) map.set(key, w);
    });
    return Array.from(map.values());
}

function updateServer(auth_token, displayType, controlType, pbType) {
    const loadingAnimation = document.getElementById("loadingAnimation");
    const contentDiv = document.getElementById("contentDiv");
    latestRecordTime = new Date();
    loadAnimation(loadingAnimation, contentDiv);
    document.body.style.pointerEvents = 'none';

    if (webLeaderboardEnabled && archiveDate === "LIVE") {
        archiveDate = "LIVE";
        getScoresWrapper(auth_token, displayType, controlType, pbType, (err, liveRes) => {
            if (err) {
                console.log("Error when fetching live scores:", err);
                return;
            }
            archiveDate = latestWebArchive;
            getScoresWrapper(auth_token, displayType, controlType, pbType, (webErr, webRes) => {
                if (!webErr && webRes.scoresParsed && liveRes.scoresParsed) {
                    const merged = mergeWebPBs(liveRes.scoresParsed, webRes.scoresParsed);
                    const mergedUserList = [...new Set([...liveRes.userList, ...webRes.userList])].sort();
                    archiveDate = "LIVE";
                    handleScoresResponse(err, liveRes, merged, mergedUserList);
                } else {
                    console.log("Error when fetching or merging web scores:", err);
                    return;
                }
            });
        });
    } else {
        getScoresWrapper(auth_token, displayType, controlType, pbType, handleScoresResponse);
    }
}

function removeBannedScores(scores) {
    const bannedScores = [
        {nameFilter: "MOKA", tps: 181512},
        {nameFilter: "robotmania", tps: 9999000, leaderboardType: "tps", gameMode: "Marathon 42"}
    ];
    
    return scores.filter(score => 
        !bannedScores.some(banned => {
            // Check every property in the banned score object
            return Object.keys(banned).every(key => banned[key] === score[key]);
        })
    );
}

function directUpdate() {
    leaderboardData = removeBannedScores(leaderboardData);
    //console.log("direct update called");
    document.getElementById('power-iframe')?.remove();
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
    usernameInput.style.display = 'none';
    radio_allGameModsLabel.style.display = 'none';
    radio_allGameModsLabelInteresting.style.display = 'none';
    radio_allGameModsLabelNMSingles.style.display = 'none';
    tierLimiterTab.style.display = 'none';
    tooltip.classList.remove(...tooltip.classList);
    solveTypeDiv.style.display = 'block';
    let sheetType = request.height;
    if ((request.gameMode === "All Solve Types" || request.gameMode === "Interesting" || request.gameMode === "Standard Singles") && (sheetType !== "History")) {
        radiostandardgamemode.checked = true;
        request.gameMode = "Standard";
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
            return (
                ((entry.width > 2) || (entry.height > 2)) && (
                    (request.gameMode === "All Solve Types") ||
                    (request.gameMode === entry.gameMode) ||
                    (request.gameMode === "Interesting" &&
                        ( //intesrting are only squares
                            (entry.width === entry.height)
                        ) &&
                        ( //limitations on avglen based on gamemode
                            (entry.gameMode === "Standard") || //no limitations on standard
                            (entry.gameMode === "BLD") || //no limitations on BLD
                            (entry.avglen === 1) //for all other check that it is not average
                        ) &&
                        ( //limitations for bad marathons
                            (!entry.gameMode.includes("Marathon")) || //not a marathon
                            (entry.gameMode === "Marathon 10") || //allow marathon 10
                            (entry.gameMode === "Marathon 42") || //alow marathon 42
                            (entry.gameMode.length > 11) //11 means any marathon 100 or longer ("Marathon 100" string length)
                        )
                    ) ||
                    (request.gameMode === "Standard Singles") &&
                    (
                        (entry.avglen === 1) &&
                        (entry.gameMode === "Standard")
                    )
                )
            );
        });
    }
    if (request.width === "All") {
        return data.filter(entry => {
            return (
                ((entry.width > 2) || (entry.height > 2)) &&
                (request.gameMode === entry.gameMode) &&
                (entry.avglen === 1) &&
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
