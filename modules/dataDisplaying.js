//Module to create sheets of processed leaderboard data

/*DEPENDENCIES
dataFetching.js
dataProcessing.js
replayGeneration.js
userInteractions.js
*/

function resetContentDivLayout(contentDiv) {
    contentDiv.style.position = '';
    contentDiv.style.paddingLeft = '';
    contentDiv.style.paddingRight = '';
    contentDiv.style.paddingTop = '';
    contentDiv.style.minHeight = '0px';
    contentDiv.style.overflowX = '';
}

function greekLetterSpan(tierName) {
    if (tierName === "Any" || tierName === "WRs only") {
        return tierName;
    }
    // Create a mapping of tier names to their corresponding letters, classes, and glow colors
    const tierMap = {
        kappa: { letter: 'κ', class: 'kappa', glow: '#afafaf' },
        iota: { letter: 'ι', class: 'iota', glow: '#23958b' },
        theta: { letter: 'θ', class: 'theta', glow: '#b9f2ff' },
        eta: { letter: 'η', class: 'eta', glow: '#85fa85' },
        zeta: { letter: 'ζ', class: 'zeta', glow: '#ffaaf4' },
        epsilon: { letter: 'ε', class: 'epsilon', glow: '#ffff00' },
        delta: { letter: 'δ', class: 'delta', glow: '#a14dff' },
        gamma: { letter: 'γ', class: 'gamma', glow: '#ff2262' },
        beta: { letter: 'β', class: 'beta', glow: '#00ff00' },
        alpha: { letter: 'α', class: 'alpha', glow: '#00ffff' }
    };

    // Check if the tierName exists in the mapping
    if (tierMap[tierName]) {
        // Create a span element
        const span = document.createElement('span');

        // Set the class for base styling
        span.className = tierMap[tierName].class;

        // Set the letter as the text content
        span.textContent = tierMap[tierName].letter;

        // Apply glowing effect using inline style for text-shadow
        span.style.textShadow = `
            0 0 5px ${tierMap[tierName].glow},
            0 0 10px ${tierMap[tierName].glow},
            0 0 15px ${tierMap[tierName].glow}
        `;

        span.style.fontSize = '18px';

        // Return the span element
        return span;
    } else {
        console.error('Invalid tier name:', tierName);
        return null;
    }
}

//"Public" function to create card-style sheets (normal or square WRs), sheetType = Squares / -1
function createSheet(sortedLists, sheetType) {
    const noNameFilter = (request.nameFilter === "");
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList.remove("content");
    contentDiv.innerHTML = "";
    resetContentDivLayout(contentDiv);
    NxNWRsContainer.innerHTML = "";
    let tiersData;
    let tiersMap;
    let headersCount = Object.keys(sortedLists).length;;
    generateFormattedString(request);
    const mainHeaders = Object.keys(sortedLists);
    if (Object.values(sortedLists)
        .every(list => list.length === 0)) {
        contentDiv.innerHTML = notFoundError;
        return;
    }
    if (sheetType === squaresSheetType) {
        tiersData = calculateNxMTiers(combinedList);
        if (noNameFilter) {
            const totalCount = tiersData.scoresCount.length > 0 ? tiersData.scoresCount[0][1] : 0;
            if (totalCount > 0) {
                contentDiv.style.position = 'relative';
                createScoresAmountTable(contentDiv, tiersData);
                const wrs = contentDiv.lastChild;
                const wrsWidth = wrs.offsetWidth;
                if (wrsWidth > 0) {
                    wrs.style.position = 'absolute';
                    wrs.style.left = '0';
                    wrs.style.top = '0';
                    wrs.style.width = wrsWidth + 'px';
                    const wrsTop = wrs.offsetTop;
                    const wrsHeight = wrs.offsetHeight;
                    const pad = (wrsWidth + 15) + 'px';
                    contentDiv.style.paddingLeft = pad;
                    contentDiv.style.paddingRight = pad;
                    contentDiv.style.minHeight = (wrsTop + wrsHeight + 15) + 'px';
                }
            }
        }
        tiersMap = tiersData.tiersMap;
    }
    contentDiv.classList = "content";

    // Collect all unique puzzle sizes for square sheet
    let uniqueSizes = [];
    if (sheetType === squaresSheetType) {
        const sizeSet = new Set();
        mainHeaders.forEach(header => {
            sortedLists[header].forEach(item => {
                sizeSet.add(item.width + "x" + item.height);
            });
        });
        uniqueSizes = Array.from(sizeSet).sort((a, b) => {
            const [aW, aH] = a.split('x').map(Number);
            const [bW, bH] = b.split('x').map(Number);
            const aTotal = aW * aH;
            const bTotal = bW * bH;
            return aTotal - bTotal || aW - bW;
        });
    }

    // Determine max number of rows across all tables
    let maxRowCount = 0;

    if (sheetType === squaresSheetType) {
        maxRowCount = uniqueSizes.length;
    } else {
        mainHeaders.forEach(header => {
            if (sortedLists[header].length > maxRowCount) {
                maxRowCount = sortedLists[header].length;
            }
        });
    }
    // Create left helper column container
    const leftColumnContainer = document.createElement('div');
    leftColumnContainer.classList.add('table-container');
    leftColumnContainer.classList.add('left-column-container');
    contentDiv.appendChild(leftColumnContainer);

    // Add h1 header to match data tables height
    const leftHeaderSpacer = document.createElement('h1');
    leftHeaderSpacer.classList.add('left-header-spacer');
    leftHeaderSpacer.title = 'Click to toggle transposed view';
    if (normalSheetTransposed) {
        leftHeaderSpacer.classList.add('transposed');
    }
    // Add click handler for transposed view toggle
    leftHeaderSpacer.addEventListener('click', function() {
        normalSheetTransposed = !normalSheetTransposed;
        if (normalSheetTransposed) {
            leftHeaderSpacer.classList.add('transposed');
        } else {
            leftHeaderSpacer.classList.remove('transposed');
        }
        createSheet(sortedLists, sheetType);
    });
    leftColumnContainer.appendChild(leftHeaderSpacer);

    const leftTable = document.createElement('table');
    leftTable.classList.add("normalCardTable");
    leftTable.classList.add('left-column-table');
    leftColumnContainer.appendChild(leftTable);

    // Add header to left table
    const leftHeaderRow = document.createElement('tr');
    leftHeaderRow.classList.add('left-header-row');
    leftTable.appendChild(leftHeaderRow);

    // Determine left column content based on transposed mode
    let leftColumnItems;
    let leftHeaderText = "#";
    
    if (normalSheetTransposed && mainHeaders.length > 1) {
        // In transposed mode: left column shows the same headers as the table rows (Single, ao5, ao12, etc.)
        leftColumnItems = mainHeaders;
        leftHeaderText = "Type";
    } else if (sheetType === squaresSheetType) {
        // Normal squares mode: left column shows puzzle sizes
        leftColumnItems = uniqueSizes;
        leftHeaderText = "Size";
    } else {
        // Normal non-squares mode: left column shows rank numbers
        leftColumnItems = Array.from({length: maxRowCount}, (_, i) => i + 1);
        leftHeaderText = "#";
    }

    // Add header cell to leftHeaderRow
    const leftHeaderCell = document.createElement('th');
    leftHeaderCell.textContent = leftHeaderText;
    leftHeaderRow.appendChild(leftHeaderCell);

    // Pre-generate ALL left column rows
    leftColumnItems.forEach((item, i) => {
        const leftRow = document.createElement('tr');

        let cellValue = item || "";

        const cell = createTableCell(cellValue);

        // Add click handler for puzzle size selection (only in normal mode for squares)
        if (!normalSheetTransposed && sheetType === squaresSheetType && uniqueSizes[i]) {
            cell.classList.add("clickable");
            cell.addEventListener("click", function () {
                let newSize = uniqueSizes[i];
                changePuzzleSize(newSize);
            });
        }
        
        // Add click handler for marathon mode selection (both transposed and normal modes)
        if (request.gameMode === allMarathons && typeof item === 'string' && item.includes('x')) {
            cell.classList.add("clickable");
            cell.addEventListener("click", function () {
                //console.log(cell, item);
                // Extract marathon number from header (e.g., "x10" -> 10)
                const match = item.match(/x(\d+)/);
                if (match && match[1]) {
                    customMarathonInput.value = match[1];
                    request.gameMode = "Marathon " + match[1];
                    radioCustom.checked = true;
                    sendMyRequest();
                }
            });
        }

        leftRow.appendChild(cell);
        leftTable.appendChild(leftRow);
    });

    // Helper function to create a table row for an item (shared between normal and transposed modes)
    function createTableRowForItem(item, header, itemIndex, isNullItem = false) {
        let percentageCurrent = 100;
        const isAverage = (header !== "Single");
        let mytableid = 0;
        let bestValue;
        
        const tableRow = document.createElement('tr');
        let scoreType = request.leaderboardType;
        let mainValue;
        let tierNameForReplay;
        let isWRforReplay = false;
        let reverse = false;
        
        if (isNullItem) {
            // Create empty row for missing item
            const nameCell = document.createElement('td');
            nameCell.classList.add('gap-cell');
            nameCell.textContent = sheetType === squaresSheetType ? uniqueSizes[itemIndex] : (itemIndex + 1);
            tableRow.appendChild(nameCell);

            const scoreCell = document.createElement('td');
            scoreCell.classList.add('gap-cell');
            scoreCell.textContent = header;
            tableRow.appendChild(scoreCell);
            return { row: tableRow, percentageCurrent: 100 };
        }
        
        if (scoreType === "move") {
            scoreType = "Moves"
            mainValue = item.moves;
        }
        if (scoreType === "time") {
            scoreType = "Time"
            mainValue = item.time;
        }
        if (scoreType === "tps") {
            scoreType = "TPS"
            mainValue = item.tps;
            reverse = true;
        }
        if (scoreType === "FMC" || scoreType === "FMC MTM") {
            mainValue = item.time;
        }
        
        let thisScoreInvalid = false;
        let displayedName = appendFlagIconToNickname(item.nameFilter);
        let limitsString = '';
        let percentageInfoForNormal = "";
        
        if (sheetType !== squaresSheetType) {
            // For non-squares sheet, calculate percentage based on first item in list
            const firstItem = sortedLists[header]?.[0];
            if (firstItem) {
                let firstMainValue;
                if (scoreType === "Moves") firstMainValue = firstItem.moves;
                else if (scoreType === "TPS") firstMainValue = firstItem.tps;
                else firstMainValue = firstItem.time;
                
                const percentage = calculatePercentage(mainValue, firstMainValue, reverse);
                percentageInfoForNormal = percentage.toFixed(1) + "% ";
                const tierName = getClassBasedOnPercentage(percentage, percentageTable);
                tableRow.classList.add(tierName);
                tierNameForReplay = tierName;
                if (percentage === 100) {
                    isWRforReplay = true;
                    percentageInfoForNormal = "WR "
                    tableRow.classList.add("WRPB");
                }
            }
        } else {
            if (!noNameFilter) {
                bestValue = getBestValue(WRsDataForPBs[header], scoreType, item.width, item.height);
                limitsString = `<p>${item.width}x${item.height} ${header} ${requirementsString} (${request.gameMode}):</p>`
                const limit = getScoreLimitExact(100, bestValue, reverse);
                const limitVisual = getScoreLimit(100, bestValue, reverse, scoreType, isAverage);
                if (limit !== limitVisual) {
                    limitsString += `<p><span class="alpha WRPB">100%: ${limitVisual} (${limit})</span></p>`;
                } else {
                    limitsString += `<p><span class="alpha WRPB">100%: ${limitVisual}</span></p>`;
                }
                for (const key in percentageTable) {
                    if (percentageTable.hasOwnProperty(key)) {
                        const percentageValue = percentageTable[key];
                        const limit = getScoreLimitExact(percentageValue, bestValue, reverse);
                        const limitVisual = getScoreLimit(percentageValue, bestValue, reverse, scoreType, isAverage);
                        const categoryName = key.charAt(0).toUpperCase() + key.slice(1);
                        if (limit !== limitVisual) {
                            limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual} (${limit})</span></p>`;
                        } else {
                            limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual}</span></p>`;
                        }
                    }
                }
                const percentage = calculatePercentage(mainValue, bestValue, reverse);
                percentageCurrent = percentage;
                const tierName = getClassBasedOnPercentage(percentage, percentageTable);
                tierNameForReplay = tierName;
                tableRow.classList.add(tierName);
                if (mainValue === bestValue) {
                    displayedName = "WR";
                    isWRforReplay = true;
                    tableRow.classList.add("WRPB");
                } else {
                    displayedName = `${percentage.toFixed(3)}%`;
                }
            } else {
                isWRforReplay = true;
                tierNameForReplay = "alpha";
                tableRow.classList.add(tiersMap[item.nameFilter]);
            }
            if (isInvalid(mainValue, scoreType)) {
                thisScoreInvalid = true;
                tableRow.style.color = 'gray';
            }
        }
        
        let scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
        const nameCellElement = createTableCellScore([displayedName, percentageInfoForNormal + getControlsAndDate(item.timestamp, item.controls)], 'name', "grayColor");
        tableRow.appendChild(nameCellElement);
        const scoreCellElement = createTableCellScore(scoreString, 'score', "grayColor");
        tableRow.appendChild(scoreCellElement);
        tableRow.classList.add("shadowFun");
        
        if (!thisScoreInvalid) {
            if (sheetType !== squaresSheetType || noNameFilter) {
                nameCellElement.classList.add("clickable");
                nameCellElement.addEventListener("click", function () {
                    if (request.width == request.height) {
                        radioNxNWRs.checked = true;
                        changePuzzleSize(radioNxNWRs.value);
                    } else {
                        radioNxMWRs.checked = true;
                        changePuzzleSize(radioNxMWRs.value);
                    }
                    changeNameFilter(item.nameFilter);
                });
            }
            if (sheetType === squaresSheetType && !noNameFilter) {
                nameCellElement.addEventListener('mouseover', () => {
                    tooltip.innerHTML = limitsString;
                    tooltip.style.display = 'block';
                });
                nameCellElement.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.pageX - 170) + 'px';
                    tooltip.style.top = (e.pageY - 470) + 'px';
                });
                nameCellElement.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });
            }
        }
        
        tableRow.addEventListener('mouseover', () => {
            tableRow.classList.add("highlightedCell");
        });
        
        if (!debugMode) {
            const videolink = videoLinkCheck(item.videolink);
            let makeyoutubelink = false;
            if (item.isWeb) {
                scoreCellElement.firstChild.innerHTML = webElement + scoreCellElement.firstChild.textContent;
            }
            if (item.isLM) {
                scoreCellElement.firstChild.innerHTML = lmElement + scoreCellElement.firstChild.textContent;
            }
            if (videolink) {
                scoreCellElement.classList.add("clickable");
                scoreCellElement.firstChild.innerHTML = youtubeElement + scoreCellElement.firstChild.textContent;
                makeyoutubelink = true;
            }
            if (item.solve_data_available) {
                makeyoutubelink = false;
                scoreCellElement.classList.add("clickable");
                let videoLinkForReplay = -1;
                if (videolink) {
                    videoLinkForReplay = videolink;
                    scoreCellElement.firstChild.innerHTML = redEggElement + scoreCellElement.firstChild.textContent;
                } else {
                    scoreCellElement.firstChild.innerHTML = eggElement + scoreCellElement.firstChild.textContent;
                }
                const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, tierNameForReplay, isWRforReplay, scoreType);
                scoreCellElement.addEventListener('click', function (event) {
                    getSolutionForScore(item, (error, solveData) => {
                        if (error) {
                            alert("Error while loading solvedata! Maybe server died for a second...", error);
                        } else {
                            handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, tierNameForReplay, isWRforReplay);
                        }
                    });
                });
            }
            if (makeyoutubelink) {
                scoreCellElement.addEventListener('click', function () {
                    window.open(videolink, '_blank');
                });
            }
        } else {
            if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn") {
                scoreCellElement.classList.add("clickable");
                scoreCellElement.firstChild.textContent = getScoreIDIcon + scoreCellElement.firstChild.textContent;
                scoreCellElement.addEventListener('click', function () {
                    promptForVideoLink(item.time, item.moves, item.timestamp);
                });
            }
        }
        
        if (["Time", "FMC", "FMC MTM"].includes(scoreType) && (item.time > 59999 || (item.moves > 100000 && isAverage))) {
            scoreCellElement.addEventListener('mouseover', () => {
                tooltip.textContent = formatTime(item.time) + " (" + (item.moves / 1000).toFixed(3) + " moves)";
                tooltip.style.display = 'block';
            });
            scoreCellElement.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX - 150) + 'px';
                tooltip.style.top = (e.pageY - 40) + 'px';
            });
        }
        if (scoreType === "Moves" && item.moves > 100000 && isAverage) {
            scoreCellElement.addEventListener('mouseover', () => {
                tooltip.textContent = (item.moves / 1000).toFixed(3);
                tooltip.style.display = 'block';
            });
            scoreCellElement.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX - 150) + 'px';
                tooltip.style.top = (e.pageY - 20) + 'px';
            });
        }
        
        tableRow.addEventListener('mouseout', () => {
            tableRow.classList.remove("highlightedCell");
        });
        scoreCellElement.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        return { row: tableRow, percentageCurrent };
    }

    // Check if we should use transposed view
    if (normalSheetTransposed && mainHeaders.length > 1) {
        // Transposed view: each table represents one row (puzzle size for squares, rank for non-squares)
        // and contains rows for each average type (Single, ao5, ao12)
        
        // Determine what to iterate over based on sheet type
        const transposedItems = sheetType === squaresSheetType ? uniqueSizes : Array.from({length: maxRowCount}, (_, i) => i + 1);
        
        // Create a table for each item
        transposedItems.forEach((itemKey, itemIndex) => {
            const tableContainer = document.createElement('div');
            tableContainer.classList.add('table-container');
            contentDiv.appendChild(tableContainer);
            
            const headerElement = document.createElement('h1');
            headerElement.textContent = itemKey;
            
            // Add click handler for puzzle size selection (only for squares)
            if (sheetType === squaresSheetType) {
                headerElement.classList.add('clickable');
                headerElement.addEventListener('click', function () {
                    changePuzzleSize(itemKey);
                });
            }
            
            // Add click handler for marathon mode selection (in transposed mode for all marathons)
            if (request.gameMode === allMarathons && typeof itemKey === 'string' && itemKey.includes('x')) {
                headerElement.classList.add('clickable');
                headerElement.addEventListener('click', function () {
                    const match = itemKey.match(/x(\d+)/);
                    if (match && match[1]) {
                        customMarathonInput.value = match[1];
                        request.gameMode = "Marathon " + match[1];
                        radioCustom.checked = true;
                        sendMyRequest();
                    }
                });
            }
            
            tableContainer.appendChild(headerElement);
            tableContainer.classList.add("cardContainer");
            
            const table = document.createElement('table');
            table.classList.add("normalCardTable");
            tableContainer.appendChild(table);
            
            // NO header row in transposed view - just data rows
            
            // Add rows for each header (Single, ao5, ao12, etc.)
            mainHeaders.forEach((header, headerIndex) => {
                let item;
                if (sheetType === squaresSheetType) {
                    item = sortedLists[header]?.find(it => (it.width + "x" + it.height) === itemKey) || null;
                } else {
                    item = sortedLists[header]?.[itemIndex] || null;
                }
                const result = createTableRowForItem(item, header, itemIndex, item === null);
                if (item !== null && (noNameFilter || result.percentageCurrent >= getTierPercentageLimit())) {
                    table.appendChild(result.row);
                } else if (item === null) {
                    table.appendChild(result.row);
                }
            });
        });
    } else {
        // Normal view: original implementation
        mainHeaders.forEach((header, headerIndex) => {
            if (sortedLists[header].length > 0) {
                const tableContainer = document.createElement('div');
                tableContainer.classList.add('table-container');
                contentDiv.appendChild(tableContainer);
                const headerElement = document.createElement('h1');
                headerElement.textContent = header;
                
                // Add click handler for marathon mode selection (in normal mode for all marathons)
                if (request.gameMode === allMarathons && typeof header === 'string' && header.includes('x')) {
                    headerElement.classList.add('clickable');
                    headerElement.addEventListener('click', function () {
                        const match = header.match(/x(\d+)/);
                        if (match && match[1]) {
                            customMarathonInput.value = match[1];
                            request.gameMode = "Marathon " + match[1];
                            radioCustom.checked = true;
                            sendMyRequest();
                        }
                    });
                }
                
                tableContainer.appendChild(headerElement);
                tableContainer.classList.add("cardContainer");
                const table = document.createElement('table');
                table.classList.add("normalCardTable");
                tableContainer.appendChild(table);
                const tableHeaderRow = document.createElement('tr');
                if (sheetType !== squaresSheetType || noNameFilter) {
                    tableHeaderRow.innerHTML = cardHeadersNormal;
                } else {
                    tableHeaderRow.innerHTML = cardHeadersTier;
                }

                // Determine items to process
                let itemsToProcess;
                if (sheetType === squaresSheetType) {
                    itemsToProcess = uniqueSizes.map(size => {
                        return sortedLists[header].find(it => (it.width + "x" + it.height) === size) || null;
                    });
                } else {
                    itemsToProcess = sortedLists[header];
                }

                itemsToProcess.forEach((item, itemIndex) => {
                    const result = createTableRowForItem(item, header, itemIndex, item === null);
                    if (item !== null && (noNameFilter || result.percentageCurrent >= getTierPercentageLimit())) {
                        table.appendChild(result.row);
                    } else if (item === null) {
                        table.appendChild(result.row);
                    }
                });

            } else {
                headersCount--;
            }
        });
    }
    
    // Update select sizes after rendering
    updateSelectSizes();
}

function createNMSlider() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = '#12121205';
    container.style.paddingTop = "10px";
    container.style.paddingBottom = "10px";
    container.style.color = 'cyan';

    let inputElement;

    if (false) {
        container.appendChild(document.createTextNode("Epic Vovker Number Input"));

        inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.min = 0;
        inputElement.value = n_m_size_limit;

        // Basic styling
        inputElement.style.width = '10%';
        inputElement.style.outline = 'none';
        inputElement.style.border = '2px solid #00FF00';
        inputElement.style.textAlign = 'center';
        inputElement.style.background = "black";
        inputElement.style.color = "#00FF00";
        inputElement.style.fontFamily = 'monospace';
        inputElement.style.fontSize = '1.2em';

        // Epic hacker neon effects
        inputElement.style.boxShadow = '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00';
        inputElement.style.borderRadius = '5px';
        inputElement.style.padding = '10px';
        inputElement.style.transition = '0.3s ease';


    } else {
        inputElement = document.createElement('input');
        inputElement.type = 'range';
        inputElement.min = 0;
        inputElement.max = 200;
        inputElement.step = 50;
        inputElement.value = n_m_size_limit;
        inputElement.style.width = '80%';
        inputElement.style.outline = 'none';
        inputElement.style.border = 'none';
    }

    const valueDisplay = document.createElement('div');
    valueDisplay.addEventListener('click', () => {
        // Prompt user for a number input, ensuring it's above 10
        const userInput = prompt("Enter a custom limit (must be above 10):");
        n_m_size_limit = parseInt(userInput, 10);

        // Check if input is valid (greater than 10 or equal to 0)
        if (n_m_size_limit > 10 || n_m_size_limit === 0) {
            changeSliderText();
            sendMyRequest();
        } else {
            alert("Invalid number. Please enter a value above 10 next time.");
        }
    });
    // Add hover effect with JavaScript
    valueDisplay.addEventListener('mouseover', () => {
        valueDisplay.style.textShadow = '0 0 20px cyan, 0 0 40px cyan';
        if (logged_in_as === "vovker") {
            valueDisplay.textContent = "Click to enter custom value, vovker";
        } else {
            valueDisplay.textContent = "Click to enter custom value";
        }
    });

    valueDisplay.addEventListener('mouseout', () => {
        valueDisplay.style.textShadow = '0 0 5px cyan, 0 0 10px cyan';
        changeSliderText();
    });
    valueDisplay.style.cursor = 'pointer';
    valueDisplay.style.marginTop = '10px';
    valueDisplay.style.textAlign = 'center';
    valueDisplay.style.fontSize = '1.5em';
    valueDisplay.style.textShadow = '0 0 5px cyan, 0 0 10px cyan';

    function changeSliderText() {
        let val = n_m_size_limit;
        if (val !== 0) {
            valueDisplay.textContent = `Tiles limit: ${val}`;
        } else {
            valueDisplay.textContent = `No limit for tiles`;
        }
    }

    changeSliderText();

    inputElement.addEventListener('change', () => {
        n_m_size_limit = parseInt(inputElement.value);
        if (n_m_size_limit > 10 || n_m_size_limit === 0) {
            changeSliderText();
            sendMyRequest();
        } else {
            alert("invalid number");
        }
    });

    if (inputElement.type === 'range') {
        inputElement.addEventListener('input', () => {
            changeSliderText();
        });
    }

    container.appendChild(inputElement);
    container.appendChild(valueDisplay);

    return container;
}

// Function to create avglen (average length) radio buttons for NxM sheet
function createNxMAvglenSelector() {
    const container = document.createElement('div');
    container.id = 'nxm-avglen-selector';
    container.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 10px; padding: 10px; background-color: #12121205; margin-bottom: 10px; flex-wrap: wrap;';
    
    const label = document.createElement('span');
    label.textContent = 'Average: ';
    label.style.cssText = 'color: #aaa; font-size: 14px;';
    container.appendChild(label);
    
    // Create radio button group
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-button-container';
    radioGroup.style.cssText = 'display: flex; gap: 5px; margin: 0; flex-wrap: wrap; justify-content: center;';
    
    // Get available avglens and create radio buttons
    const avglens = NxMAvglenOptions.length > 0 ? NxMAvglenOptions : [1];
    
    avglens.forEach(avglen => {
        const radioBtn = document.createElement('div');
        radioBtn.className = 'form_radio_btn';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.id = `avglen-${avglen}`;
        input.name = 'nxm-avglen';
        input.value = avglen;
        
        if (avglen === NxMAvglenSelected) {
            input.checked = true;
        }
        
        const labelEl = document.createElement('label');
        labelEl.htmlFor = `avglen-${avglen}`;
        labelEl.className = 'avglenLabel';
        
        // Format label text
        if (avglen === 1) {
            labelEl.textContent = 'Single';
        } else {
            labelEl.textContent = `ao${avglen}`;
        }
        
        // Style for avglen labels
        labelEl.style.cssText = 'padding: 5px 12px; line-height: 24px; font-size: 13px;';
        
        input.addEventListener('change', function() {
            if (this.checked) {
                NxMAvglenSelected = avglen;
                // Re-process and re-render the NxM sheet with the new avglen
                sendMyRequest();
            }
        });
        
        radioBtn.appendChild(input);
        radioBtn.appendChild(labelEl);
        radioGroup.appendChild(radioBtn);
    });
    
    container.appendChild(radioGroup);
    
    return container;
}

//"Public" function to create NxM matrix sheet (can also display PBs)
function createSheetNxM(WRList) {
    copyOfWRList = JSON.parse(JSON.stringify(WRList));
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    resetContentDivLayout(contentDiv);
    generateFormattedString(request);
    if (copyOfWRList.length === 0) {
        contentDiv.innerHTML = notFoundError;
        return;
    }
    tiersData = calculateNxMTiers(NxMRecords, true);
    tiersMap = tiersData.tiersMap;
    contentDiv.appendChild(createNMSlider());
    if (NxMAvglenOptions.length > 1) {
        contentDiv.appendChild(createNxMAvglenSelector());
    }
    if (request.nameFilter === "") {
        const totalCount = tiersData.scoresCount.length > 0 ? tiersData.scoresCount[0][1] : 0;
        if (totalCount > 0) {
            contentDiv.style.position = 'relative';
            createScoresAmountTable(contentDiv, tiersData);
            const wrs = contentDiv.lastChild;
            const wrsWidth = wrs.offsetWidth;
            if (wrsWidth > 0) {
                wrs.style.position = 'absolute';
                wrs.style.left = '0';
                wrs.style.marginTop = '20px';
                wrs.style.width = wrsWidth + 'px';
                const wrsTop = wrs.offsetTop;
                const wrsHeight = wrs.offsetHeight;
                const pad = (wrsWidth + 15) + 'px';
                contentDiv.style.paddingLeft = pad;
                contentDiv.style.paddingRight = pad;
                contentDiv.style.minHeight = (wrsTop + wrsHeight + 15) + 'px';
            }
        }
    }
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.classList.add("bigContainer");
    contentDiv.appendChild(tableContainer);
    const table = document.createElement('table');
    tableContainer.appendChild(table);
    table.classList.add("NxMTable");
    let allSizes = getAllSizes(copyOfWRList, NxMstyleDPH);
    const tableHeaderRow = document.createElement('tr');
    const th = document.createElement('th');
    if (NxMstyleDPH) {
        th.textContent = NxMSwappedString;
    } else {
        th.textContent = NxMNormalString;
    }
    th.classList.add("clickable");
    th.addEventListener("click", function () {
        NxMstyleDPH = !NxMstyleDPH;
        if (NxMSelected !== totalWRsAmount) {
            createSheetNxM(NxMRecords.filter(item => item.nameFilter === NxMSelected && item.avglen === NxMAvglenSelected));
        } else {
            createSheetNxM(NxMRecords);
        }
        updateSelectSizes();
    });
    tableHeaderRow.appendChild(th);
    for (const widthValue of allSizes["width"]) {
        const th = document.createElement('th');
        th.textContent = widthValue.toString();
        tableHeaderRow.appendChild(th);
    }
    table.appendChild(tableHeaderRow);
    allSizes["height"].forEach(height => {
        const row = document.createElement('tr');
        const thHeight = document.createElement('th');
        thHeight.textContent = height.toString();
        row.appendChild(thHeight);
        allSizes["width"].forEach(width => {
            let cell = document.createElement('td');
            var result;
            if (NxMstyleDPH) {
                result = copyOfWRList.find(item => item.width === height && item.height === width);
            } else {
                result = copyOfWRList.find(item => item.width === width && item.height === height);
            }
            if (result) {
                let mainValue;
                let scoreType = request.leaderboardType;
                let reverse = false;
                if (scoreType === "move") {
                    scoreType = "Moves"
                    mainValue = result.moves;
                }
                if (scoreType === "time") {
                    scoreType = "Time"
                    mainValue = result.time;
                }
                if (scoreType === "tps") {
                    scoreType = "TPS"
                    mainValue = result.tps;
                    reverse = true;
                }
                if (scoreType === "FMC" || scoreType === "FMC MTM") {
                    // Both FMC types use time for comparison
                    mainValue = result.time;
                }
                let recordisInvalid = isInvalid(mainValue, scoreType);
                if (recordisInvalid) {
                    result.nameFilter = invalidPlaceHolderString;
                }
                let bestValue;
                let percentage = 100;
                let tierName = "alpha";
                let isWR = true;
                if (request.nameFilter !== "") {
                    bestValue = getBestValue(WRsDataForPBs, scoreType, result.width, result.height);
                    percentage = calculatePercentage(mainValue, bestValue, reverse);
                    if (percentage < getTierPercentageLimit()) {
                        recordisInvalid = true;
                    }
                    tierName = getClassBasedOnPercentage(percentage, percentageTable);
                    isWR = (mainValue === bestValue);
                    let displayedName;

                    if (isWR) {
                        //displayedName = "WR";
                        displayedName = "";
                    } else {
                        //displayedName = `${percentage.toFixed(1)}%`;
                        displayedName = "";
                    }
                    let scoreString = getScoreStringNxM(result.time, result.moves, result.tps, scoreType, isAverage = false, displayedName);
                    cell = createTableCellScore(scoreString, 'score', "kappa");
                    cell.classList.add(tierName);
                    if (isWR) {
                        cell.classList.add("WRPB");
                    }
                } else {
                    let scoreString = getScoreStringNxM(result.time, result.moves, result.tps, scoreType, isAverage = false, result.nameFilter);
                    cell = createTableCellScore(scoreString, 'score', tiersMap[result.nameFilter]);
                    cell.classList.add(tiersMap[result.nameFilter]);
                }
                if (recordisInvalid) {
                    if (NxMstyleDPH) {
                        cell.textContent = height + "x" + width;
                    } else {
                        cell.textContent = width + "x" + height;
                    }
                    cell.style.color = "#555";
                    cell.style.fontSize = "12px";
                    cell.setAttribute("class", "");
                } else {
                    let newSize = result.width + "x" + result.height;
                    if (!debugMode) {
                        const videolink = videoLinkCheck(result.videolink);
                        if (result.isWeb) {
                            cell.firstChild.innerHTML = webElement + cell.firstChild.textContent;
                        }
                        if (result.isLM) {
                            cell.firstChild.innerHTML = lmElement + cell.firstChild.textContent;
                        }
                        let makeyoutubelink = false;
                        if (videolink) {
                            cell.classList.add("clickable");
                            cell.firstChild.innerHTML = youtubeElement + cell.firstChild.textContent;
                            makeyoutubelink = true;
                        }
                        if (true//request.gameMode === "Standard") {
                        ) {//const solution = getSolutionForScore(result);
                            if (result.solve_data_available) {
                                makeyoutubelink = false;
                                let videoLinkForReplay = -1;
                                if (videolink) {
                                    videoLinkForReplay = videolink;
                                    cell.firstChild.innerHTML = redEggElement + cell.firstChild.textContent;
                                } else {
                                    //cell.firstChild.innerHTML = eggElement + cell.firstChild.textContent;
                                }
                                cell.classList.add("clickable");

                                const scoreTitle = getScoreTitle(videoLinkForReplay, result.width, result.height, result.displayType, result.nameFilter, result.controls, result.timestamp, tierName, isWR, scoreType);
                                cell.addEventListener('click', function (event) {
                                    getSolutionForScore(result, (error, solveData) => {
                                        if (error) {
                                            alert(error);
                                        } else {
                                            //makeReplay(solution, event, result.tps, result.width, result.height, scoreTitle);
                                            handleSavedReplay(result, solveData, event, result.tps, result.width, result.height, scoreTitle, videoLinkForReplay, tierName, isWR);
                                        }
                                    });
                                });
                            }
                        }
                        if (makeyoutubelink) {
                            cell.addEventListener('click', function () {
                                window.open(videolink, '_blank');
                            });
                        }
                    }
                    else {
                        if (result.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn") {
                            cell.classList.add("clickable");
                            cell.firstChild.textContent = getScoreIDIcon + cell.firstChild.textContent;
                            cell.addEventListener('click', function () {
                                promptForVideoLink(result.time, result.moves, result.timestamp);
                            });
                        }
                    }
                    let extraInfo = "";
                    if (["Time", "FMC", "FMC MTM"].includes(scoreType) && result.time > 59999) {
                        extraInfo = " " + formatTime(result.time);
                    }
                    if (request.nameFilter !== "") {
                        if (isWR) {
                            extraInfo += "<br>WR";
                        } else {
                            extraInfo += `<br>${percentage.toFixed(7)}%`;
                        }
                    }
                    cell.addEventListener('mouseover', () => {
                        tooltip.innerHTML = newSize + "<br>" + getControlsAndDate(result.timestamp, result.controls) + "<br>" + extraInfo;
                        cell.classList.add("highlightedCell");
                        tooltip.style.display = 'block';
                    });
                    cell.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 120) + 'px';
                        tooltip.style.top = (e.pageY - 100) + 'px';
                    });
                    cell.addEventListener('mouseout', () => {
                        cell.classList.remove("highlightedCell");
                        tooltip.style.display = 'none';
                    });
                    cell.style.textWeight = "bold";
                }
            } else {
                cell.textContent = NxMstyleDPH ? `${height}x${width}` : `${width}x${height}`;
                if (n_m_size_limit > 0 && width * height > n_m_size_limit) {
                    cell.style.opacity = 0;
                }
                cell.style.color = "#555";
                cell.style.fontSize = "12px";
            }
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

//"Public" function to create Kinch/Popular rankings sheet.
//Full Power-style re-implementation: sticky events-row header, per-tier
//req-row tables, [tier]/[tierf] greek-tier colors, 5 switches (Hide Empty,
//Hide Reqs, Color Best, True Tiers, Nerf), Chart.js tier-distribution chart,
//score tooltip with source info, icons (web/lm circles, youtube, exe eggs).
//Only Kinch (Rankings3) + Popular (Rankings2) are affected — createSheet,
//createSheetNxM, createSheetHistory, the Power iframe, and all shared
//CSS/classes/data-pipeline are untouched.
var kinchPlayerScores = null;
var kinchScoreType = "Time";
var kinchReverse = false;
var kinchValidCategories = [];
var kinchTierChart = null;
var kinchChartCategories = []; // selected categories for chart category mode
var kinchSortColumn = null;   // null = no sort, 0=name, 1=place, 2=kinch, 3+ = category
var kinchSortAsc = true;

function createSheetRankings(playerScores) {
    savedPlayerScores = playerScores;
    let reverse = request.leaderboardType === "tps";
    const scoreTypeDisplayMap = { "move":"Moves","time":"Time","tps":"TPS","FMC":"FMC","FMC MTM":"FMC MTM" };
    let scoreType = scoreTypeDisplayMap[request.leaderboardType] || request.leaderboardType;

    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    resetContentDivLayout(contentDiv);
    contentDiv.style.overflow = "visible";
    generateFormattedString(request);

    if (playerScores.length === 0) { contentDiv.innerHTML = notFoundError; return; }
    if (loadingPower) { loadPower(); return; }

    // Destroy old chart instance if it exists (canvas was removed on page switch)
    if (kinchTierChart) {
        try { kinchTierChart.destroy(); } catch (e) {}
        kinchTierChart = null;
    }
    // Reset chart categories on page switch
    kinchChartCategories = [];

    // Store for re-renders triggered by switch toggles
    kinchPlayerScores = playerScores;
    kinchScoreType = scoreType;
    kinchReverse = reverse;

    // --- .kinch-view wrapper ---
    const view = document.createElement("div");
    view.className = "kinch-view";
    contentDiv.appendChild(view);

    // --- toolbar (Popular controls + switches + chart toggle) ---
    const toolbar = document.createElement("div");
    toolbar.className = "kinch-toolbar";
    view.appendChild(toolbar);
    if (request.width === "Rankings2") { createCustomSlider(toolbar); }
    kinchBuildSwitches(toolbar);

    const chartBtn = document.createElement("button");
    chartBtn.className = "kinch-chart-btn";
    chartBtn.textContent = "Chart";
    chartBtn.addEventListener("click", function () {
        kinchChartVisible = !kinchChartVisible;
        var c = document.getElementById("kinch-chart-container");
        if (c) {
            c.style.display = kinchChartVisible ? "block" : "none";
            chartBtn.classList.toggle("active", kinchChartVisible);
            if (kinchChartVisible) {
                kinchLoadChartJS(function () {
                    kinchUpdateChart();
                    // Chart.js needs a resize after the container becomes visible
                    requestAnimationFrame(function () {
                        if (kinchTierChart) kinchTierChart.resize();
                    });
                });
            }
        }
    });
    toolbar.appendChild(chartBtn);

    // --- chart container (hidden by default) ---
    const chartContainer = document.createElement("div");
    chartContainer.id = "kinch-chart-container";
    chartContainer.style.display = "none";
    chartContainer.innerHTML =
        '<div class="chart-controls">' +
            '<div class="spacer"></div>' +
            '<span id="kinch-chart-title"></span>' +
            '<div class="spacer" style="display:flex;align-items:center;gap:8px;justify-content:flex-end;">' +
                '<span>Skip</span>' +
                '<input type="range" id="kinch-chart-ignore" value="0" min="0">' +
                '<span id="kinch-chart-ignore-val">0</span>' +
                '<div style="position:relative;display:inline-block;">' +
                    '<span id="kinch-chart-category-trigger">Overall ▾</span>' +
                    '<div id="kinch-chart-category-panel"></div>' +
                '</div>' +
                '<label><input type="checkbox" id="kinch-switch-cumulative" checked> Cumulative</label>' +
                '<label><input type="checkbox" id="kinch-switch-percent" checked> Percent</label>' +
            '</div>' +
        '</div>' +
        '<canvas id="kinch-tier-chart"></canvas>';
    view.appendChild(chartContainer);
    kinchWireChartControls();

    // --- results table ---
    const resultsTable = document.createElement("div");
    resultsTable.className = "results-table";
    resultsTable.id = "kinch-results-table";
    view.appendChild(resultsTable);

    // --- score tooltip (Power-style, single global element) ---
    var tooltip = document.getElementById("kinch-score-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "kinch-score-tooltip";
        document.body.appendChild(tooltip);
    }
    tooltip.style.display = "none";

    // --- render the table ---
    kinchRenderTable(resultsTable);

    // --- apply initial switch states ---
    kinchApplyHideReqs();
    if (kinchColorBest) kinchApplyColorBest();
    if (kinchDontFormat) kinchApplyDontFormat();
    // Percent toggle is always active for kinch; hide it from view
    var kinchPctCb = document.getElementById("kinch-switch-percent");
    if (kinchPctCb) { kinchPctCb.checked = true; kinchPctCb.disabled = true; }

    // --- restore chart if it was visible ---
    if (kinchChartVisible) {
        chartContainer.style.display = "block";
        chartBtn.classList.add("active");
        kinchLoadChartJS(function () { kinchUpdateChart(); });
    }
}

//Returns the tier keys in descending order (alpha first, kappa last) from the active percentageTable.
function kinchGetTierOrder() {
    return Object.keys(percentageTable); // alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa
}

//Filters the category list to those with a real WR (bestValue !== defaultScore && !isInvalid).
function kinchGetValidCategories(playerScores) {
    if (!playerScores || playerScores.length === 0) return [];
    var cats = playerScores[0].scores;
    var valid = [];
    for (var i = 0; i < cats.length; i++) {
        var id = cats[i].id;
        var bv = bestValues[id];
        if (bv !== defaultScore && !isInvalid(bv, kinchScoreType)) valid.push(cats[i]);
    }
    return valid;
}

//Returns true if the category id matches one of the "impossible in LM" categories.
//For time mode: 4x4 relay, 12x12 single, 16x16 single, 20x20 single (per Power's nerf list).
function kinchIsNerfedCategory(catId) {
    var nerfList = ["4x4 relay", "12x12 single", "16x16 single", "20x20 single"];
    return nerfList.indexOf(catId) !== -1;
}

//Transforms playerScores based on switch states (nerf, true-tiers).
//Returns a new array; does not mutate the original savedPlayerScores.
function kinchTransformScores(playerScores) {
    var validCats = kinchGetValidCategories(playerScores);
    var cats = validCats;
    if (kinchNerf) {
        cats = validCats.filter(function (c) { return !kinchIsNerfedCategory(c.id); });
    }
    var tierOrder = kinchGetTierOrder(); // alpha..kappa
    var result = [];
    for (var i = 0; i < playerScores.length; i++) {
        var ps = playerScores[i];
        var newScores = [];
        var sum = 0, count = 0;
        var worstTierIdx = -1;
        var hasAllCats = true;
        for (var j = 0; j < validCats.length; j++) {
            var cat = validCats[j];
            if (kinchNerf && kinchIsNerfedCategory(cat.id)) continue;
            // find this player's score for this category
            var sd = null;
            for (var k = 0; k < ps.scores.length; k++) {
                if (ps.scores[k].id === cat.id) { sd = ps.scores[k]; break; }
            }
            if (!sd || sd.scoreInfo === defaultScore || typeof sd.scoreInfo !== "object") {
                hasAllCats = false;
                newScores.push({ id: cat.id, score: defaultScore, scoreInfo: defaultScore, scorePercentage: 0, scoreTier: "kappa" });
                continue;
            }
            newScores.push(sd);
            sum += sd.scorePercentage;
            count++;
            var tierIdx = tierOrder.indexOf(sd.scoreTier);
            if (tierIdx > worstTierIdx) worstTierIdx = tierIdx;
        }
        var power = count > 0 ? sum / count : 0;
        var tier;
        if (kinchTrueTiers) {
            if (!hasAllCats) {
                tier = "kappa"; // incomplete players go to the bottom in true mode
            } else {
                tier = worstTierIdx >= 0 ? tierOrder[worstTierIdx] : "kappa";
            }
        } else {
            tier = getClassBasedOnPercentage(power, percentageTable);
        }
        result.push({ name: ps.name, scores: newScores, power: power, tier: tier });
    }
    result.sort(function (a, b) { return b.power - a.power; });
    return result;
}

//Builds the 5 switch pills + mobile hamburger inside the toolbar.
function kinchBuildSwitches(toolbar) {
    var hamburger = document.createElement("button");
    hamburger.id = "kinch-mobile-switch-btn";
    hamburger.textContent = "☰";
    toolbar.appendChild(hamburger);

    var dropdown = document.createElement("div");
    dropdown.id = "kinch-switch-dropdown";
    toolbar.appendChild(dropdown);

    var switches = [
        { id: "kinch-switch-true",  label: "True Tiers",    state: kinchTrueTiers,  tt: "Off: All players are shown\nOn: Group players by their worst category tier" },
        { id: "kinch-switch-empty", label: "Hide Empty",    state: kinchHideEmpty,  tt: "Off: All tiers are shown\nOn: Empty tiers are hidden" },
        { id: "kinch-switch-reqs",  label: "Hide Reqs",     state: kinchHideReqs,   tt: "Off: All requirements are shown\nOn: Only the leaderboard rows are shown" },
        { id: "kinch-switch-noformat", label: "Dont Format", state: kinchDontFormat, tt: "Off: Normal icons and formatting\nOn: Hide all icons (eggs, flags, web/lm dots, youtube), plain time format" }
    ];

    for (var i = 0; i < switches.length; i++) {
        (function (sw) {
            var label = document.createElement("label");
            label.className = "kinch-switch";
            label.setAttribute("data-tt", sw.tt);
            label.innerHTML = '<input type="checkbox" id="' + sw.id + '"' + (sw.state ? " checked" : "") + '><span class="checkbox-text">' + sw.label + "</span>";
            dropdown.appendChild(label);
            var cb = label.querySelector("input");
            cb.addEventListener("change", function () {
                var checked = cb.checked;
                switch (sw.id) {
                    case "kinch-switch-true":  kinchTrueTiers = checked;  kinchRerender(); break;
                    case "kinch-switch-empty": kinchHideEmpty = checked;  kinchRerender(); break;
                    case "kinch-switch-reqs":  kinchHideReqs = checked;   kinchApplyHideReqs(); break;
                    case "kinch-switch-noformat": kinchDontFormat = checked; kinchApplyDontFormat(); kinchRerender(); break;
                }
            });
            // tooltip on hover for switch labels
            label.addEventListener("mouseenter", function (e) {
                var tip = document.getElementById("kinch-score-tooltip");
                if (!tip) return;
                var lines = sw.tt.split("\n");
                var html = lines.map(function (ln) {
                    var idx = ln.indexOf(": ");
                    if (idx !== -1) return "<span>" + ln.substring(0, idx) + "</span>" + ln.substring(idx);
                    return ln;
                }).join("<br>");
                tip.innerHTML = html;
                tip.style.display = "block";
                var rect = label.getBoundingClientRect();
                var left = rect.left + rect.width / 2 - tip.offsetWidth / 2;
                var top = rect.bottom + 4;
                if (left + tip.offsetWidth > window.innerWidth - 8) left = window.innerWidth - tip.offsetWidth - 8;
                if (left < 8) left = 8;
                if (top + tip.offsetHeight > window.innerHeight - 8) top = rect.top - tip.offsetHeight - 4;
                tip.style.left = left + "px";
                tip.style.top = top + "px";
            });
            label.addEventListener("mouseleave", function () {
                var tip = document.getElementById("kinch-score-tooltip");
                if (tip) tip.style.display = "none";
            });
        })(switches[i]);
    }

    // mobile hamburger toggle
    hamburger.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });
    document.addEventListener("click", function () { dropdown.classList.remove("open"); });
    dropdown.addEventListener("click", function (e) { e.stopPropagation(); });
}

//Re-renders the table from savedPlayerScores with current switch states.
function kinchRerender() {
    var resultsTable = document.getElementById("kinch-results-table");
    if (!resultsTable || !kinchPlayerScores) return;
    resultsTable.innerHTML = "";
    kinchRenderTable(resultsTable);
    kinchApplyHideReqs();
    if (kinchColorBest) kinchApplyColorBest();
    if (kinchDontFormat) kinchApplyDontFormat();
    // redraw chart if visible
    var container = document.getElementById("kinch-chart-container");
    if (container && container.style.display !== "none" && window.Chart) kinchUpdateChart();
}

//Sorting: click a header cell to sort by that column (always descending = best first).
//Second click resets sorting (ascending removed entirely).
function kinchSetupSortableHeader(cell, col) {
    cell.style.cursor = "pointer";
    cell.addEventListener("click", function () {
        if (kinchSortColumn === col) {
            kinchSortColumn = null;
            kinchSortAsc = true;
        } else {
            kinchSortColumn = col;
            kinchSortAsc = false;
        }
        kinchRerender();
    });
}

//Returns the sort key for a playerScore + column index.
//col 0=name, 1=place, 2=kinch, 3+ = category
function kinchGetSortKey(ps, col) {
    if (col === 0) return ps.name.toLowerCase();
    if (col === 1) return 0; // place — sorting by place uses original order (power desc)
    if (col === 2) return ps.power;
    // category column (col >= 3)
    var catIdx = col - 3;
    var cat = kinchValidCategories[catIdx];
    if (!cat) return 0;
    for (var i = 0; i < ps.scores.length; i++) {
        if (ps.scores[i].id === cat.id) {
            return ps.scores[i].scoreInfo !== defaultScore && typeof ps.scores[i].scoreInfo === "object"
                ? ps.scores[i].scorePercentage : -1;
        }
    }
    return -1;
}

//Builds the sticky events-row wrapper + per-tier req-row tables + player rows.
function kinchRenderTable(resultsTable) {
    var transformed = kinchTransformScores(kinchPlayerScores);
    kinchValidCategories = kinchGetValidCategories(kinchPlayerScores);
    if (kinchNerf) {
        kinchValidCategories = kinchValidCategories.filter(function (c) { return !kinchIsNerfedCategory(c.id); });
    }
    if (kinchValidCategories.length === 0) {
        resultsTable.innerHTML = '<div style="padding:40px;color:#888;">No valid categories.</div>';
        return;
    }

    var tierOrder = kinchGetTierOrder(); // alpha..kappa (descending)
    var numCats = kinchValidCategories.length;

    // --- sticky wrapper (events-row only, like Power) ---
    var stickyWrap = document.createElement("div");
    stickyWrap.className = "kinch-sticky-wrapper";
    var stickyTable = document.createElement("table");
    stickyWrap.appendChild(stickyTable);
    var stickyHead = document.createElement("thead");
    stickyHead.className = "table-header";
    stickyTable.appendChild(stickyHead);
    var eventsRow = document.createElement("tr");
    eventsRow.className = "events-row";
    stickyHead.appendChild(eventsRow);

    // 3 fixed columns: Name | # | Kinch — all sortable (col 0=name, 1=place, 2=kinch)
    // When sorting is active, Name header becomes "Reset sorting" (like Power)
    var thName = document.createElement("td");
    thName.className = "player";
    if (kinchSortColumn !== null) {
        thName.textContent = "Reset sorting";
        thName.style.cursor = "pointer";
        thName.style.minWidth = "132px";
        thName.addEventListener("click", function () {
            kinchSortColumn = null;
            kinchSortAsc = true;
            kinchRerender();
        });
    } else {
        thName.textContent = "Name" + (kinchSortColumn === 0 ? (kinchSortAsc ? " ▲" : " ▼") : "");
        thName.style.minWidth = "132px";
        kinchSetupSortableHeader(thName, 0);
    }
    eventsRow.appendChild(thName);

    var thPlace = document.createElement("td");
    thPlace.textContent = "#" + (kinchSortColumn === 1 ? (kinchSortAsc ? " ▲" : " ▼") : "");
    kinchSetupSortableHeader(thPlace, 1);
    eventsRow.appendChild(thPlace);

    var thPower = document.createElement("td");
    thPower.textContent = "Kinch" + (kinchSortColumn === 2 ? (kinchSortAsc ? " ▲" : " ▼") : "");
    kinchSetupSortableHeader(thPower, 2);
    eventsRow.appendChild(thPower);

    // per-category headers (sortable)
    for (var c = 0; c < numCats; c++) {
        (function (cat, colIdx) {
            var th = document.createElement("td");
            th.innerHTML = cat.id.replace(/ /g, "<br>");
            if (kinchSortColumn === colIdx) th.innerHTML += kinchSortAsc ? " ▲" : " ▼";
            th.style.cursor = "pointer";
            kinchSetupSortableHeader(th, colIdx);
            eventsRow.appendChild(th);
        })(kinchValidCategories[c], c + 3);
    }
    resultsTable.appendChild(stickyWrap);

    // --- if sorting is active, render ONE global table with all players sorted ---
    if (kinchSortColumn !== null) {
        var sortedPlayers = transformed.slice();
        sortedPlayers.sort(function (a, b) {
            var va = kinchGetSortKey(a, kinchSortColumn);
            var vb = kinchGetSortKey(b, kinchSortColumn);
            // -1 (no score) always sorts last
            if (va === -1 && vb !== -1) return 1;
            if (vb === -1 && va !== -1) return -1;
            if (typeof va === "string" && typeof vb === "string") {
                return kinchSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return kinchSortAsc ? va - vb : vb - va;
        });

        // Assign place numbers based on Kinch% rank (power descending),
        // NOT the sorted order. In True Tiers mode, places follow the
        // true tier grouping order.
        var placeMap = {};
        var sortedByPower = transformed.slice().sort(function (a, b) { return b.power - a.power; });
        for (var pi = 0; pi < sortedByPower.length; pi++) {
            placeMap[sortedByPower[pi].name] = pi + 1;
        }

        var globalTable = document.createElement("table");
        globalTable.id = "kinch-sorted-table";
        resultsTable.appendChild(globalTable);
        var gTbody = document.createElement("tbody");
        globalTable.appendChild(gTbody);
        for (var sp = 0; sp < sortedPlayers.length; sp++) {
            var ps = sortedPlayers[sp];
            var sRow = document.createElement("tr");
            sRow.className = "player-row";
            gTbody.appendChild(sRow);

            // Name column
            var sNameCell = document.createElement("td");
            sNameCell.className = "player sortable-player";
            sNameCell.setAttribute("tier", ps.tier);
            if (kinchDontFormat) { sNameCell.textContent = ps.name; }
            else { sNameCell.innerHTML = appendFlagIconToNickname(ps.name); }
            (function (playerName) {
                sNameCell.addEventListener("click", function () {
                    radioNxNWRs.checked = true;
                    changePuzzleSize(radioNxNWRs.value);
                    changeNameFilter(playerName);
                });
            })(ps.name);
            sRow.appendChild(sNameCell);

            // # column — place based on Kinch% rank, not sort position
            var sPlaceCell = document.createElement("td");
            sPlaceCell.className = "player-place";
            sPlaceCell.setAttribute("tier", ps.tier);
            sPlaceCell.textContent = placeMap[ps.name] || (sp + 1);
            sRow.appendChild(sPlaceCell);

            // Kinch% column
            var sPowerCell = document.createElement("td");
            sPowerCell.className = "player-power";
            sPowerCell.setAttribute("tier", ps.tier);
            sPowerCell.textContent = ps.power.toFixed(3) + "%";
            sRow.appendChild(sPowerCell);

            var sScoreMap = {};
            for (var ss = 0; ss < ps.scores.length; ss++) sScoreMap[ps.scores[ss].id] = ps.scores[ss];
            for (var svc = 0; svc < kinchValidCategories.length; svc++) {
                sRow.appendChild(kinchBuildScoreCell(sScoreMap[kinchValidCategories[svc].id], kinchScoreType, kinchValidCategories[svc], ps.tier));
            }
        }
        return;
    }

    // --- per-tier tables (descending: alpha first, kappa last) ---
    var place = 0;
    for (var t = 0; t < tierOrder.length; t++) {
        var tier = tierOrder[t];
        var threshold = percentageTable[tier];

        // collect players in this tier
        var tierPlayers = [];
        for (var p = 0; p < transformed.length; p++) {
            if (transformed[p].tier === tier) {
                place++;
                tierPlayers.push({ ps: transformed[p], placeNum: place });
            }
        }

        // hide-empty: skip empty tiers entirely
        if (kinchHideEmpty && tierPlayers.length === 0) continue;

        var tierTable = document.createElement("table");
        tierTable.id = "kinch-" + tier + "-table";
        tierTable.style.contentVisibility = "auto";
        tierTable.style.containIntrinsicSize = "auto 200px";
        resultsTable.appendChild(tierTable);

        var thead = document.createElement("thead");
        thead.className = "table-header";
        tierTable.appendChild(thead);

        // req-row: tier name + threshold + >threshold% + per-category score limits
        var reqRow = document.createElement("tr");
        reqRow.className = "req-row";
        thead.appendChild(reqRow);

        // req-row: Tier Name | Greek Symbol | Threshold%
        var tdTierName = document.createElement("td");
        tdTierName.className = "player";
        tdTierName.setAttribute("tierf", tier);
        tdTierName.style.minWidth = "132px";
        var tierDisplayName = tier.charAt(0).toUpperCase() + tier.slice(1);
        if (kinchTrueTiers) tierDisplayName = "True " + tierDisplayName;
        tdTierName.textContent = tierDisplayName;
        reqRow.appendChild(tdTierName);

        var tdSymbol = document.createElement("td");
        tdSymbol.className = "req-symbol";
        tdSymbol.setAttribute("tierf", tier);
        var symbolSpan = greekLetterSpan(tier);
        if (symbolSpan) {
            tdSymbol.appendChild(symbolSpan);
        } else {
            tdSymbol.textContent = tier;
        }
        reqRow.appendChild(tdSymbol);

        var tdReq = document.createElement("td");
        tdReq.className = "req-limit";
        tdReq.setAttribute("tierf", tier);
        tdReq.textContent = threshold + "%";
        reqRow.appendChild(tdReq);

        for (var c2 = 0; c2 < numCats; c2++) {
            var cat2 = kinchValidCategories[c2];
            var tdLimit = document.createElement("td");
            tdLimit.className = "req-limit";
            tdLimit.setAttribute("tierf", tier);
            var info2 = parseId(cat2.id);
            var isAvg = (info2.avglen !== 1);
            tdLimit.textContent = getScoreLimit(threshold, bestValues[cat2.id], kinchReverse, kinchScoreType, isAvg);
            (function (td, catId, thr, tier) {
                td.addEventListener("mouseenter", function () {
                    var tip = document.getElementById("kinch-score-tooltip");
                    if (!tip) return;
                    tip.innerHTML = exactLimitString + "<br><span style=\"color:" + kinchGetTierColor(tier) + "\">" + tier + "</span> " + catId + ":<br>" + getScoreLimitExact(thr, bestValues[catId], kinchReverse);
                    tip.style.display = "block";
                    var rect = td.getBoundingClientRect();
                    var left = rect.left, top = rect.bottom + 4;
                    if (left + tip.offsetWidth > window.innerWidth - 8) left = window.innerWidth - tip.offsetWidth - 8;
                    if (left < 8) left = 8;
                    if (top + tip.offsetHeight > window.innerHeight - 8) top = rect.top - tip.offsetHeight - 4;
                    tip.style.left = left + "px";
                    tip.style.top = top + "px";
                });
                td.addEventListener("mouseleave", function () {
                    var tip = document.getElementById("kinch-score-tooltip");
                    if (tip) tip.style.display = "none";
                });
            })(tdLimit, cat2.id, threshold, tier);
            reqRow.appendChild(tdLimit);
        }

        // player rows
        var tbody = document.createElement("tbody");
        tierTable.appendChild(tbody);
        for (var tp = 0; tp < tierPlayers.length; tp++) {
            (function (entry, tierSlug) {
                var ps = entry.ps;
                var row = document.createElement("tr");
                row.className = "player-row";
                tbody.appendChild(row);

                // Name column
                var nameCell = document.createElement("td");
                nameCell.className = "player sortable-player";
                nameCell.setAttribute("tier", tierSlug);
                if (kinchDontFormat) { nameCell.textContent = ps.name; }
                else { nameCell.innerHTML = appendFlagIconToNickname(ps.name); }
                nameCell.addEventListener("click", function () {
                    radioNxNWRs.checked = true;
                    changePuzzleSize(radioNxNWRs.value);
                    changeNameFilter(ps.name);
                });
                row.appendChild(nameCell);

                // # column (place number)
                var placeCell = document.createElement("td");
                placeCell.className = "player-place";
                placeCell.setAttribute("tier", tierSlug);
                placeCell.textContent = entry.placeNum;
                row.appendChild(placeCell);

                // Kinch% column
                var powerCell = document.createElement("td");
                powerCell.className = "player-power";
                powerCell.setAttribute("tier", tierSlug);
                powerCell.textContent = ps.power.toFixed(3) + "%";
                row.appendChild(powerCell);

                // per-category score cells
                var scoreMap = {};
                for (var s = 0; s < ps.scores.length; s++) scoreMap[ps.scores[s].id] = ps.scores[s];
                for (var vc = 0; vc < kinchValidCategories.length; vc++) {
                    row.appendChild(kinchBuildScoreCell(scoreMap[kinchValidCategories[vc].id], kinchScoreType, kinchValidCategories[vc], tierSlug));
                }
            })(tierPlayers[tp], tier);
        }
    }
}

//Builds a single score <td> for one player × one category.
//Preserves all icons (web/lm circles, youtube, exe replay eggs), sets the
//[tier] attribute for background coloring, and attaches a Power-style
//viewport-clamped tooltip with tier name glow + target + diff + rank/total + source.
function kinchBuildScoreCell(scoreData, scoreType, catInfo, tableTier) {
    var cell = document.createElement("td");
    var noScore = !scoreData || !scoreData.scoreInfo || scoreData.scoreInfo === defaultScore || typeof scoreData.scoreInfo !== "object";
    if (noScore) {
        cell.className = "kinch-empty-cell";
        cell.textContent = "—";
        return cell;
    }

    var item = scoreData.scoreInfo;
    var isAverage = (item.avglen !== 1);
    var scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
    cell.setAttribute("tier", scoreData.scoreTier);

    // tooltip data
    var tierOrder = kinchGetTierOrder();
    var tierIdx = tierOrder.indexOf(scoreData.scoreTier);
    var nextTier = tierIdx > 0 ? tierOrder[tierIdx - 1] : null; // tier above (lower index = higher tier)
    var nextThreshold = nextTier ? percentageTable[nextTier] : null;
    var bestValue = bestValues[scoreData.id];
    var targetStr = "";
    var diffStr = "";
    if (nextTier && nextThreshold !== null) {
        var target = getScoreLimit(nextThreshold, bestValue, kinchReverse, scoreType, isAverage);
        targetStr = target;
        // diff = target - playerScore (for time/moves, lower is better; for tps, higher is better)
        var playerVal = scoreData.score;
        if (kinchReverse) {
            // tps: higher is better. target is higher. diff = target - player
            diffStr = (playerVal > 0 ? ((parseFloat(target) - (playerVal / 1000)).toFixed(3)) : "");
        } else {
            // time/moves: lower is better. target is lower. diff = player - target
            diffStr = ((playerVal / 1000) - parseFloat(target)).toFixed(3);
        }
        var sign = parseFloat(diffStr) >= 0 ? "+" : "";
        diffStr = sign + diffStr;
    }
    var rank = 0, total = kinchValidCategories.length;
    // compute rank: player's best category = rank 1, worst = rank N
    // (simplified: use scorePercentage to rank — higher % = better = lower rank number)
    // We'll compute a rough rank from the scorePercentage relative to the player's other scores
    // For now, just show the percentage
    var pct = scoreData.scorePercentage;

    // tooltip HTML (Power-style with tier glow + source info)
    var tipHTML = '<span class="tip-tier" tierf="' + scoreData.scoreTier + '">' + scoreData.scoreTier.charAt(0).toUpperCase() + scoreData.scoreTier.slice(1) + "</span>";
    if (nextTier && targetStr) {
        tipHTML += ' → ' + targetStr + ' (' + diffStr + ') for <span tierf="' + nextTier + '">' + nextTier.charAt(0).toUpperCase() + nextTier.slice(1) + '</span>';
    }
    tipHTML += '<br>Score: ' + pct.toFixed(3) + '%';

    // score breakdown
    var breakdown = "";
    if (["Time","FMC","FMC MTM"].includes(scoreType)) {
        breakdown = formatTime(item.time) + ' (' + (item.moves/1000).toFixed(3).replace(/\.?0+$/,'') + ' / ' + normalizeTPS(item.tps) + ')';
    } else if (scoreType === "Moves") {
        breakdown = (item.moves/1000).toFixed(3).replace(/\.?0+$/,'') + ' (' + formatTime(item.time) + ' / ' + normalizeTPS(item.tps) + ')';
    } else if (scoreType === "TPS") {
        breakdown = normalizeTPS(item.tps) + ' (' + formatTime(item.time) + ' / ' + (item.moves/1000).toFixed(3).replace(/\.?0+$/,'') + ')';
    }
    tipHTML += '<br>' + breakdown;
    tipHTML += '<br>' + scoreData.id + byString + item.nameFilter;
    tipHTML += '<br>' + getControlsAndDate(item.timestamp, item.controls);
    // source info (exe info stuff)
    var sourceLabel = "Exe";
    if (item.isWeb && !item.isLM) sourceLabel = "Web";
    else if (item.isLM && !item.isWeb) sourceLabel = "LM";
    else if (item.isLM && item.isWeb) sourceLabel = "Web+LM";
    tipHTML += '<br>Source: ' + sourceLabel;

    // main value span (no <br> + empty secondary — Kinch cells only show the score)
    var mainValue = document.createElement("span");
    mainValue.className = "score-main";
    mainValue.textContent = scoreString[0];
    cell.appendChild(mainValue);

    if (scoreData.scorePercentage === 100) cell.classList.add("WRPB");

    if (scoreString[0].includes("NaN")) {
        cell.className = "kinch-empty-cell";
        cell.textContent = "-";
        return cell;
    }

    // icons (web/lm circles, youtube, exe eggs)
    if (!debugMode && !kinchDontFormat) {
        var videolink = videoLinkCheck(item.videolink);
        var makeYT = false;
        if (item.isWeb) mainValue.innerHTML = webElement + mainValue.textContent;
        if (item.isLM) mainValue.innerHTML = lmElement + mainValue.textContent;
        if (videolink) {
            cell.classList.add("kinch-clickable");
            mainValue.innerHTML = youtubeElement + mainValue.textContent;
            makeYT = true;
        }
        if (item.solve_data_available) {
            makeYT = false;
            var videoLinkForReplay = -1;
            if (videolink) {
                videoLinkForReplay = videolink;
                mainValue.innerHTML = redEggElement + mainValue.textContent;
            } else {
                mainValue.innerHTML = eggElement + mainValue.textContent;
            }
            cell.classList.add("kinch-clickable");
            var scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, scoreData.scoreTier, scoreData.scorePercentage === 100, scoreType);
            cell.addEventListener("click", function (event) {
                getSolutionForScore(item, function (err, solveData) {
                    if (err) { alert(err); }
                    else { handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, scoreData.scoreTier, scoreData.scorePercentage === 100); }
                });
            });
        }
        if (makeYT) {
            cell.addEventListener("click", function () { window.open(videolink, "_blank"); });
        }
    } else if (!kinchDontFormat) {
        if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn") {
            cell.classList.add("kinch-clickable");
            mainValue.textContent = getScoreIDIcon + mainValue.textContent;
            cell.addEventListener("click", function () { promptForVideoLink(item.time, item.moves, item.timestamp); });
        }
    }

    // tooltip handlers (Power-style: fixed position, viewport-clamped)
    cell.addEventListener("mouseenter", function () {
        var tip = document.getElementById("kinch-score-tooltip");
        if (!tip) return;
        tip.innerHTML = tipHTML;
        tip.style.display = "block";
        var rect = cell.getBoundingClientRect();
        var left = rect.left, top = rect.bottom + 4;
        if (left + tip.offsetWidth > window.innerWidth - 8) left = window.innerWidth - tip.offsetWidth - 8;
        if (left < 8) left = 8;
        if (top + tip.offsetHeight > window.innerHeight - 8) top = rect.top - tip.offsetHeight - 4;
        if (top < 8) top = 8;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
    });
    cell.addEventListener("mouseleave", function () {
        var tip = document.getElementById("kinch-score-tooltip");
        if (tip) tip.style.display = "none";
    });

    return cell;
}

//Hide Reqs: toggles the <thead> of every per-tier table (but NOT the sticky wrapper).
function kinchApplyHideReqs() {
    var tables = document.querySelectorAll(".kinch-view .results-table table");
    tables.forEach(function (table, idx) {
        var thead = table.querySelector("thead");
        if (!thead) return;
        if (idx === 0) return; // sticky wrapper — no req-row to hide
        thead.style.display = kinchHideReqs ? "none" : "";
    });
}

//Color Best: for each player-row cell, if the cell's [tier] is BELOW the
//table's tier, grey it out; if ABOVE, bold it. (Mirrors Power's changeTable.)
function kinchApplyColorBest() {
    var tierOrder = kinchGetTierOrder(); // alpha..kappa (best..worst)
    var tables = document.querySelectorAll(".kinch-view .results-table table");
    tables.forEach(function (table) {
        var tableId = table.id || "";
        var tableTier = tableId.replace("kinch-","").replace("-table","");
        if (!tableTier || tierOrder.indexOf(tableTier) === -1) return;
        var tableTierIdx = tierOrder.indexOf(tableTier);
        var cells = table.querySelectorAll(".player-row td[tier]");
        cells.forEach(function (cell) {
            var cellTier = cell.getAttribute("tier");
            var cellTierIdx = tierOrder.indexOf(cellTier);
            if (cellTierIdx === -1) return;
            if (cellTierIdx < tableTierIdx) {
                // cell's tier is ABOVE (better than) the table's tier → bold
                cell.style.fontWeight = "800";
            } else if (cellTierIdx > tableTierIdx) {
                // cell's tier is BELOW (worse than) the table's tier → grey
                cell.style.backgroundColor = "#555";
                cell.style.color = "#bbb";
            }
        });
    });
}

//Clears Color Best styling (restores natural [tier] colors).
function kinchClearColorBest() {
    var cells = document.querySelectorAll(".kinch-view .results-table .player-row td[tier]");
    cells.forEach(function (cell) {
        cell.style.fontWeight = "";
        cell.style.backgroundColor = "";
        cell.style.color = "";
    });
}

//Dynamically loads Chart.js from CDN, then calls callback.
function kinchLoadChartJS(callback) {
    if (window.Chart) { callback(); return; }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
    s.onload = callback;
    s.onerror = function () { console.error("Failed to load Chart.js"); };
    document.head.appendChild(s);
}

//Wires the chart control event handlers (skip slider, category dropdown, cumulative/percent).
function kinchWireChartControls() {
    var ignore = document.getElementById("kinch-chart-ignore");
    var ignoreVal = document.getElementById("kinch-chart-ignore-val");
    if (ignore) {
        ignore.addEventListener("input", function () {
            if (ignoreVal) ignoreVal.textContent = ignore.value;
            var container = document.getElementById("kinch-chart-container");
            if (container && container.style.display !== "none") {
                kinchUpdateChart();
                requestAnimationFrame(function () { if (kinchTierChart) kinchTierChart.resize(); });
            }
        });
    }
    var cum = document.getElementById("kinch-switch-cumulative");
    if (cum) cum.addEventListener("change", function () { kinchUpdateChart(); });
    var pct = document.getElementById("kinch-switch-percent");
    if (pct) pct.addEventListener("change", function () { kinchUpdateChart(); });
    var trigger = document.getElementById("kinch-chart-category-trigger");
    var panel = document.getElementById("kinch-chart-category-panel");
    if (trigger && panel) {
        trigger.addEventListener("click", function (e) {
            e.stopPropagation();
            panel.style.display = panel.style.display === "block" ? "none" : "block";
        });
        document.addEventListener("click", function () { panel.style.display = "none"; });
        panel.addEventListener("click", function (e) { e.stopPropagation(); });
    }
}

//Populates the chart category dropdown with one checkbox per valid category.
function kinchPopulateCategoryPanel() {
    var panel = document.getElementById("kinch-chart-category-panel");
    if (!panel) return;
    panel.innerHTML = "";
    for (var i = 0; i < kinchValidCategories.length; i++) {
        (function (cat) {
            var label = document.createElement("label");
            label.style.cssText = 'display:block;padding:2px 8px;color:#ddd;font-size:11px;cursor:pointer;white-space:nowrap;';
            var cb = document.createElement("input");
            cb.type = "checkbox";
            cb.value = cat.id;
            cb.checked = kinchChartCategories.indexOf(cat.id) !== -1;
            cb.style.cssText = 'vertical-align:middle;margin:0 4px 0 0;accent-color:#555;cursor:pointer;';
            cb.addEventListener("change", function () {
                if (cb.checked) { if (kinchChartCategories.indexOf(cat.id) === -1) kinchChartCategories.push(cat.id); }
                else { var idx = kinchChartCategories.indexOf(cat.id); if (idx !== -1) kinchChartCategories.splice(idx, 1); }
                kinchUpdateCategoryTrigger();
                kinchUpdateChart();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(" " + cat.id));
            panel.appendChild(label);
        })(kinchValidCategories[i]);
    }
}

function kinchUpdateCategoryTrigger() {
    var trigger = document.getElementById("kinch-chart-category-trigger");
    if (!trigger) return;
    trigger.textContent = kinchChartCategories.length === 0 ? "Overall ▾" : kinchChartCategories.length + " categor" + (kinchChartCategories.length === 1 ? "y ▾" : "ies ▾");
}

//Builds/updates the Chart.js tier-distribution bar chart.
//Overall mode: count .player-row per tier table.
//Category mode: count players per scoreTier for each selected category.
//Supports Cumulative, Percent, and Skip.
function kinchUpdateChart() {
    if (!window.Chart) return;
    var canvas = document.getElementById("kinch-tier-chart");
    if (!canvas) return;
    var container = document.getElementById("kinch-chart-container");
    if (!container || container.style.display === "none") return;

    kinchPopulateCategoryPanel();
    kinchUpdateCategoryTrigger();

    var tierOrder = kinchGetTierOrder(); // alpha..kappa (best..worst)
    // reverse for display: worst (kappa) leftmost, best (alpha) rightmost
    var displayTiers = tierOrder.slice().reverse(); // kappa..alpha

    var cumBtn = document.getElementById("kinch-switch-cumulative");
    var pctBtn = document.getElementById("kinch-switch-percent");
    var ignoreInput = document.getElementById("kinch-chart-ignore");
    var isCumulative = cumBtn ? cumBtn.checked : false;
    var isPercent = pctBtn ? pctBtn.checked : false;
    var ignoreN = ignoreInput ? parseInt(ignoreInput.value) || 0 : 0;

    var datasets = [];
    var labels = displayTiers.map(function (t) { return t.charAt(0).toUpperCase() + t.slice(1); });
    var labelColors = displayTiers.map(function (t) { return kinchGetTierColor(t); });
    var barColors = displayTiers.map(function (t) { return kinchGetTierColor(t); });

    var isCategoryMode = kinchChartCategories.length > 0;

    if (isCategoryMode) {
        // category mode: one dataset per selected category
        var transformed = kinchTransformScores(kinchPlayerScores);
        for (var ci = 0; ci < kinchChartCategories.length; ci++) {
            var catId = kinchChartCategories[ci];
            var counts = displayTiers.map(function () { return 0; });
            for (var p = 0; p < transformed.length; p++) {
                var ps = transformed[p];
                for (var s = 0; s < ps.scores.length; s++) {
                    if (ps.scores[s].id === catId && ps.scores[s].scoreInfo !== defaultScore && typeof ps.scores[s].scoreInfo === "object") {
                        var tierIdx = displayTiers.indexOf(ps.scores[s].scoreTier);
                        if (tierIdx !== -1) counts[tierIdx]++;
                        break;
                    }
                }
            }
            datasets.push({
                label: catId,
                data: counts,
                backgroundColor: barColors,
                borderColor: barColors,
                borderWidth: 1,
                borderRadius: 3
            });
        }
    } else {
        // overall mode: count .player-row per tier table
        var counts = displayTiers.map(function (t) {
            var table = document.getElementById("kinch-" + t + "-table");
            return table ? table.querySelectorAll(".player-row").length : 0;
        });
        datasets.push({ label: "Players", data: counts, backgroundColor: barColors, borderColor: barColors, borderWidth: 1, borderRadius: 3 });
    }

    // STEP 1: Apply skip FIRST (like Power) — removes lowest tiers before
    // computing percent/cumulative. This way percentages are relative to
    // the non-skipped total, and cumulative+percent starts at 100%.
    if (ignoreN > 0) {
        var n = Math.min(ignoreN, labels.length);
        labels = labels.slice(n);
        labelColors = labelColors.slice(n);
        for (var d = 0; d < datasets.length; d++) {
            datasets[d].data = datasets[d].data.slice(n);
            datasets[d].backgroundColor = datasets[d].backgroundColor.slice(n);
            datasets[d].borderColor = datasets[d].borderColor.slice(n);
        }
    }

    // STEP 2: Capture RAW integer counts and compute totals (post-skip).
    var rawData2D = datasets.map(function (ds) { return ds.data.slice(); });
    var totals = datasets.map(function (ds) { return ds.data.reduce(function (a, b) { return a + b; }, 0); });

    // STEP 3: Apply percent (divide by post-skip total)
    if (isPercent) {
        for (var d2 = 0; d2 < datasets.length; d2++) {
            var tot = totals[d2] || 1;
            datasets[d2].data = datasets[d2].data.map(function (v) { return v / tot * 100; });
        }
    }

    // STEP 4: Apply cumulative (sum from END = highest tier, backward)
    if (isCumulative) {
        for (var d3 = 0; d3 < datasets.length; d3++) {
            var sum = 0;
            for (var i = datasets[d3].data.length - 1; i >= 0; i--) {
                sum += datasets[d3].data[i];
                datasets[d3].data[i] = sum;
            }
        }
    }

    // build title
    var titleParts = [];
    if (kinchTrueTiers) titleParts.push("True");
    if (isCumulative) titleParts.push("Cumulative");
    if (isPercent) titleParts.push("Percent");
    if (isCategoryMode) { titleParts.push("Category Distribution:"); titleParts.push(kinchChartCategories.join(", ")); }
    else { titleParts.push("Tier Distribution"); }
    if (ignoreN > 0) titleParts.push("(skip " + ignoreN + ")");
    var titleEl = document.getElementById("kinch-chart-title");
    if (titleEl) titleEl.textContent = titleParts.join(" ");

    // update slider max
    if (ignoreInput) ignoreInput.max = Math.max(0, tierOrder.length - 1);

    // y-axis max for percent+cumulative
    var yMax = (isPercent && isCumulative) ? 100 : undefined;

    // build or update chart (Power-style: update in-place to avoid re-animation)
    var canUpdate = kinchTierChart && !kinchTierChart._destroyed &&
        kinchTierChart.__isCategoryMode === isCategoryMode &&
        kinchTierChart.data.datasets.length === datasets.length &&
        kinchTierChart.data.datasets.every(function(ds, i) { return ds.label === datasets[i].label; });

    if (canUpdate) {
        kinchTierChart.data.labels = labels;
        datasets.forEach(function(ds, di) {
            kinchTierChart.data.datasets[di].data = ds.data;
            kinchTierChart.data.datasets[di].backgroundColor = ds.backgroundColor;
            kinchTierChart.data.datasets[di].borderColor = ds.borderColor;
            kinchTierChart.data.datasets[di].hoverBackgroundColor = ds.hoverBackgroundColor;
            kinchTierChart.data.datasets[di].hoverBorderColor = ds.hoverBorderColor;
        });
        kinchTierChart.options.scales.x.ticks.color = labelColors;
        if (yMax !== undefined) kinchTierChart.options.scales.y.max = yMax;
        else delete kinchTierChart.options.scales.y.max;
        kinchTierChart.__rawData = rawData2D;
        kinchTierChart.__rawTotals = totals;
        kinchTierChart.__isPercent = isPercent;
        kinchTierChart.__isCumulative = isCumulative;
        kinchTierChart.__isCategoryMode = isCategoryMode;
        kinchTierChart.__isTrueTiers = kinchTrueTiers;
        kinchTierChart.update();
    } else {
        if (kinchTierChart) { kinchTierChart.destroy(); kinchTierChart = null; }
        var ctx = canvas.getContext("2d");
        // Custom datalabels plugin — draws count + percentage on each bar
        var kinchDataLabelsPlugin = {
            id: 'kinch-datalabels',
            afterDatasetsDraw: function (chart) {
                var ctx = chart.ctx;
                var totalBars = 0;
                chart.data.datasets.forEach(function (ds) { totalBars += ds.data.length; });
                if (totalBars > 67) return;
                ctx.save();
                ctx.textAlign = 'center';
                var isTrueTiers = chart.__isTrueTiers;
                chart.data.datasets.forEach(function (dataset, di) {
                    var meta = chart.getDatasetMeta(di);
                    var rawData = chart.__rawData || [];
                    var rawBarData = rawData[di] || [];
                    var rawTotal = (chart.__rawTotals && chart.__rawTotals[di]) || 0;
                    var isCum = chart.__isCumulative;
                    var isPct = chart.__isPercent;
                    meta.data.forEach(function (bar, i) {
                        var val = dataset.data[i];
                        if (val === 0) return;
                        // displayVal = the RAW integer count (or cumulative sum of raw counts)
                        var rawVal = rawBarData[i] !== undefined ? rawBarData[i] : 0;
                        var displayVal;
                        if (isCum) {
                            // cumulative sum of RAW counts from this tier to the highest
                            var cumSum = 0;
                            for (var jj = rawBarData.length - 1; jj >= i; jj--) cumSum += (rawBarData[jj] || 0);
                            displayVal = cumSum;
                        } else {
                            displayVal = rawVal;
                        }
                        // pct = displayVal / rawTotal (the FULL total, pre-skip)
                        var pct = rawTotal > 0 ? displayVal / rawTotal * 100 : 0;
                        // count (bold, light) — always an integer
                        var labelStr = isTrueTiers ? 'True ' + displayVal : '' + displayVal;
                        ctx.font = 'bold 11px monospace';
                        ctx.fillStyle = '#ddd';
                        ctx.shadowColor = 'rgba(0,0,0,0.8)';
                        ctx.shadowBlur = 3;
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(labelStr, bar.x, bar.y - 22);
                        // percentage (tier-colored) — 1 decimal, capped at 100 for cumulative+percent
                        var bgArr = dataset.backgroundColor;
                        var pctColor = (Array.isArray(bgArr) && bgArr[i]) || '#999';
                        ctx.font = '9px monospace';
                        ctx.fillStyle = pctColor;
                        ctx.shadowBlur = 0;
                        ctx.textBaseline = 'top';
                        var displayPct = (isCum && isPct) ? Math.min(pct, 100) : pct;
                        ctx.fillText(displayPct.toFixed(1) + '%', bar.x, bar.y - 22 + 5);
                    });
                });
                ctx.restore();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }
        };

        kinchTierChart = new Chart(ctx, {
            type: "bar",
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 300 },
                layout: { padding: { top: 60, bottom: 8 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgb(20,20,20)",
                        titleColor: "#ddd", bodyColor: "#bbb",
                        borderColor: "#333", borderWidth: 1, padding: 8,
                        titleFont: { size: 10, weight: "bold" },
                        bodyFont: { size: 10 },
                        callbacks: {
                            title: function (items) { return items[0].label; },
                            label: function (item) {
                                var chart = item.chart;
                                var di = item.datasetIndex;
                                var ii = item.dataIndex;
                                var rawData = chart.__rawData || [];
                                var rawVal = (rawData[di] && rawData[di][ii] !== undefined) ? rawData[di][ii] : item.raw;
                                var isCum = chart.__isCumulative;
                                var displayVal;
                                if (isCum) {
                                    var cumSum = 0;
                                    var rawArr = rawData[di] || [];
                                    for (var jj = rawArr.length - 1; jj >= ii; jj--) cumSum += (rawArr[jj] || 0);
                                    displayVal = cumSum;
                                } else {
                                    displayVal = rawVal;
                                }
                                var rawTotal = (chart.__rawTotals && chart.__rawTotals[di]) || 0;
                                var pct = rawTotal > 0 ? displayVal / rawTotal * 100 : 0;
                                var isPct = chart.__isPercent;
                                var suffix = isPct ? "%" : "";
                                var prefix = chart.__isTrueTiers ? 'True ' : '';
                                return prefix + item.dataset.label + ': ' + (isPct ? displayVal.toFixed(1) : displayVal) + suffix + ' (' + pct.toFixed(1) + '%)';
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: labelColors, maxRotation: 45, font: { size: 10, weight: "bold" } }, grid: { color: "#2a2a2a" } },
                    y: { beginAtZero: true, ticks: { color: "#999", precision: 0, font: { size: 10 } }, grid: { color: "#2a2a2a" }, max: yMax }
                }
            },
            plugins: [kinchDataLabelsPlugin]
        });
        kinchTierChart.__rawData = rawData2D;
        kinchTierChart.__rawTotals = totals;
        kinchTierChart.__isPercent = isPercent;
        kinchTierChart.__isCumulative = isCumulative;
        kinchTierChart.__isCategoryMode = isCategoryMode;
        kinchTierChart.__isTrueTiers = kinchTrueTiers;
    }
}

//Returns the CSS color for a greek tier (for chart bars/labels).
function kinchGetTierColor(tier) {
    var colors = {
        alpha: "#00ffff", beta: "#00ff00", gamma: "#ff2262", delta: "#a14dff",
        epsilon: "#ffff00", zeta: "#ffaaf4", eta: "#85fa85", theta: "#b9f2ff",
        iota: "#23958b", kappa: "#afafaf"
    };
    return colors[tier] || "#999";
}

//"Public" function to create Latest records sheet
function createSheetHistory(recordsList, recordsListWR, showAll = false) {
    let reverse = request.leaderboardType === "tps";

    const scoreTypeMap = {
        "move": "Moves",
        "time": "Time",
        "tps": "TPS",
        "FMC": "FMC",
        "FMC MTM": "FMC MTM"
    };

    let scoreType = scoreTypeMap[request.leaderboardType] || request.leaderboardType;
    let mainList = recordsList;
    if (mainList.length <= 2000) {
        showAll = true;
    }
    if (!showAll) {
        mainList = mainList.slice(0, 2000);
    }
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.className = "NxMContent centeredHistory";
    contentDiv.innerHTML = "";
    generateFormattedString(request);
    if (mainList.length === 0) {
        contentDiv.innerHTML = notFoundError;
    } else {
        const groupedRecords = groupRecordsByTimestamp(mainList);
        let tableCount = 0;
        let cellsTotalCounter = 0;

        for (const [interval, records] of Object.entries(groupedRecords)) {
            if (records.length > 0 && !tableIsEmpty(records, recordsListWR, scoreType)) {
                const tableContainer = document.createElement('div');
                tableContainer.classList.add('table-container');
                tableContainer.classList.add("history-container");
                const table = document.createElement('table');
                table.classList.add("historyRecordsTable");
                const headers = historyTableHeaders;
                const intervalHeaderRow = document.createElement('tr');
                intervalHeaderRow.classList.add('interval-header');
                intervalHeaderRow.classList.add('clickable');
                tableContainer.insertBefore(intervalHeaderRow, tableContainer.firstChild);
                const intervalHeaderCell = document.createElement('th');
                intervalHeaderCell.colSpan = headers.length;
                intervalHeaderCell.textContent = `${interval} ${showHistoryString}`;
                intervalHeaderRow.appendChild(intervalHeaderCell);
                intervalHeaderCell.addEventListener('click', () => {
                    const currentDisplay = table.style.display;
                    table.style.display = currentDisplay === 'none' ? 'table' : 'none';
                    intervalHeaderCell.textContent = currentDisplay === 'none' ? `${interval}` : `${interval} ${showHistoryString}`;
                    if (table.dataset.populated !== 'true') {
                        populateTableHistory(records, recordsListWR, scoreType, table, reverse);
                        table.dataset.populated = 'true';
                    }
                });
                const headersRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = headerText;
                    headersRow.appendChild(headerCell);
                });
                table.appendChild(headersRow);
                if (showAll || cellsTotalCounter < 50) {
                    intervalHeaderCell.textContent = `${interval}`;
                    cellsTotalCounter += populateTableHistory(records, recordsListWR, scoreType, table, reverse);
                    table.dataset.populated = 'true';
                    table.style.display = 'table';
                } else {
                    table.style.display = 'none';
                }
                tableCount++;
                tableContainer.appendChild(table);
                contentDiv.appendChild(tableContainer);
            }
        }
        if (!showAll) {
            var allButton = document.createElement("button");
            allButton.textContent = showAllHistoryString;
            allButton.addEventListener("click", function () {
                createSheetHistory(recordsList, recordsListWR, showAll = true);
                updateSelectSizes();
            });
            contentDiv.appendChild(allButton);
        }
    }
    if (contentDiv.innerHTML === "") {
        contentDiv.innerHTML = notFoundError;
    }
}

var kinchOriginalFormatTime = formatTime;

function dontFormat() {
    formatTime = function (milliseconds, cut = false) {
        return (milliseconds / 1000).toFixed(3);
    }
    sendMyRequest();
    const images = document.querySelectorAll('img');
    images.forEach(img => img.remove());
}

function kinchApplyDontFormat() {
    if (kinchDontFormat) {
        formatTime = function (milliseconds, cut) {
            return (milliseconds / 1000).toFixed(3);
        };
    } else {
        formatTime = kinchOriginalFormatTime;
    }
}

//"Public" (helper) function to format time from ms
function formatTime(milliseconds, cut = false) {
    const hours = Math.floor(milliseconds / 3600000);
    const remainingMillis = milliseconds % 3600000;
    const minutes = Math.floor(remainingMillis / 60000);
    const remainingSeconds = Math.floor((remainingMillis % 60000) / 1000);
    const millisecondsPart = remainingMillis % 1000;
    if (cut) {
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        } else if (minutes > 0) {
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        } else {
            return `${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        }
    } else {
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        } else {
            return `${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        }
    }
}

//"Public" (helper) function to format timestamp (with time included)
function formatTimestampWithTime(timestamp) {
    if (timestamp === -1) {
        return invalidTimestampStringHistory;
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1)
        .padStart(2, '0');
    const day = String(date.getDate())
        .padStart(2, '0');
    const hours = String(date.getHours())
        .padStart(2, '0');
    const minutes = String(date.getMinutes())
        .padStart(2, '0');
    const seconds = String(date.getSeconds())
        .padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

//"Public" (helper) function to format timestamp compared to current Time
function getTimeAgo(timestamp) {
    const currentTime = new Date().getTime();
    const recordTime = new Date(timestamp).getTime();
    const timeDifference = currentTime - recordTime;

    // Convert time difference to seconds
    const seconds = Math.floor(timeDifference / 1000);

    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 48) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}


//"Public" (helper) function to get current limit of scores to display
function getTierPercentageLimit() {
    if (tierLimit === "Any") {
        return 0;
    }
    if (tierLimit === "WRs only") {
        return 100;
    }
    return percentageTable[tierLimit];
}

//"Public" function to update styles of filters (displayType, leaderboardType, controlType)
function updateSelectSizes() {
    displayTypeSelect.style.width = `${getTextOfSelectLength(displayTypeSelect) + 1}ch`;
    leaderboardTypeSelect.style.width = `${getTextOfSelectLength(leaderboardTypeSelect) + 1}ch`;
    controlTypeSelect.style.width = `${getTextOfSelectLength(controlTypeSelect) + 1}ch`;
    if (request.displayType === "Standard") {
        displayTypeSelect.style.color = "white";
    } else {
        displayTypeSelect.style.color = "#ff2262";
    }
    if (controlType === "unique") {
        controlTypeSelect.style.color = "white";
    } else {
        controlTypeSelect.style.color = "#ff2262";
    }
    if (request.leaderboardType === "time") {
        leaderboardTypeSelect.style.color = "white";
    } else {
        leaderboardTypeSelect.style.color = "#ff2262";
    }
    function changeOptionTextColor(select, optionValue, color) {
        const options = select.getElementsByTagName("option");
        for (const option of options) {
            if (option.value === optionValue) {
                option.style.color = color;
            }
        }
    }
    changeOptionTextColor(displayTypeSelect, "Standard", "white");
    changeOptionTextColor(controlTypeSelect, "unique", "white");
    changeOptionTextColor(leaderboardTypeSelect, "time", "white");
}

//"Public" function to add tooltip for the element
function addTooltip(element, text) {
    element.addEventListener("mouseover", function () {
        const tooltip = document.createElement("div");
        tooltip.innerHTML = text;
        element.appendChild(tooltip);
        tooltip.classList.add("normalToolTipStyle");
        element.addEventListener("mouseout", function (e) {
            if (element.contains(tooltip)) {
                element.removeChild(tooltip);
            }
        });
    });
}

//"Public" function to create example buttons for custom rankings
function makeExampleButtons(customRankButtonsExamples) {
    var row = document.createElement('div');
    row.className = 'kinch-row';

    var textContainer = document.getElementById('containerCustomRanksText');
    if (textContainer) row.appendChild(textContainer);

    var actions = document.createElement('div');
    actions.className = 'kinch-actions';

    var select = document.createElement('select');
    select.id = 'presetsDropdown';
    select.style.borderRadius = '0px';
    select.style.appearance = 'none';
    select.style.webkitAppearance = 'none';
    select.style.MozAppearance = 'none';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = 'Presets';
    select.appendChild(placeholder);

    var defaultSet = false;
    for (var i = 0; i < customRankButtonsExamples.length; i++) {
        var obj = customRankButtonsExamples[i];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var opt = document.createElement('option');
                opt.value = obj[key];
                opt.textContent = key;
                select.appendChild(opt);
                if (!defaultSet && key === 'MAIN 30') {
                    defaultSet = true;
                    customRankingsArea.value = obj[key];
                }
            }
        }
    }

    select.addEventListener('change', function () {
        if (this.value) {
            customRankingsArea.value = this.value;
            if (!loadingPower) changeCustomRanks();
        }
    });

    actions.appendChild(select);

    var buttonShare = document.createElement('button');
    buttonShare.textContent = shareCustomRanksText;
    buttonShare.className = 'pause-button';
    buttonShare.addEventListener('click', function () {
        navigator.clipboard.writeText(shareCustomRanks())
            .then(function () {
                var msg = document.createElement('div');
                msg.textContent = linkCopiedSuccsess;
                msg.style.position = 'fixed';
                msg.style.background = 'rgba(0, 0, 0, 0.7)';
                msg.style.color = 'white';
                msg.style.padding = '10px';
                msg.style.borderRadius = '5px';
                msg.style.textAlign = 'center';
                msg.style.top = '50%';
                msg.style.left = '50%';
                msg.style.transform = 'translate(-50%, -50%)';
                msg.style.zIndex = '999';
                document.body.appendChild(msg);
                setTimeout(function () {
                    msg.style.transition = 'opacity 0.5s';
                    msg.style.opacity = '0';
                    setTimeout(function () { document.body.removeChild(msg); }, 500);
                }, 1000);
            })
            .catch(function (err) { console.error('Copy failed: ', err); });
    });

    actions.appendChild(buttonShare);
    row.appendChild(actions);

    rankingTabs.innerHTML = '';
    rankingTabs.appendChild(row);

    if (defaultSet && !loadingPower) changeCustomRanks();
}

//"Public" function to calculate percentage of the score based on best value
function calculatePercentage(value, bestValue, reverse) {
    if (value < 0.001) {
        return 100;
    } else {
        return reverse ? (value / bestValue) * 100 : (bestValue / value) * 100;
    }
}

//"Public" function to calculate class based on score percentage
function getClassBasedOnPercentage(percentage, percentageTable) {
    let className = "kappa";
    for (const cls in percentageTable) {
        if (percentage >= percentageTable[cls]) {
            className = cls;
            break;
        }
    }
    return className;
}

//_________________End of "Public" functions of this module_________________//

//_________________"Private" functions (multiple usage)_________________

function getBestValue(data, scoreType, width, height) {
    let bestValue = null;

    const valueMap = {
        "Moves": (item) => item.moves,
        "Time": (item) => item.time,
        "TPS": (item) => item.tps,
        "FMC": (item) => item.time,
        "FMC MTM": (item) => item.time
    };

    const getValue = valueMap[scoreType];

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.width === width && item.height === height && getValue) {
            bestValue = getValue(item);
            break;
        }
    }
    return bestValue;
}

function getScoreTitle(videolink, width, height, displayType, username, controls, timestamp, scoreTier, isWR, scoreType) {
    tierTitleSpan = document.createElement("span");
    tierTitleSpan.classList.add(scoreTier);
    if (isWR) {
        tierTitleSpanWR = document.createElement("span");
        tierTitleSpanWR.classList.add("WRPB");
        tierTitleSpanWR.textContent = "[WR] ";
        tierTitleSpan.appendChild(tierTitleSpanWR);
    }
    let display_type_string = ""
    if (displayType !== "Standard") {
        display_type_string = `${displayType} display type `
    }
    tierTitleSpan.innerHTML += `${display_type_string}Solve by ${username}<br>${scoreType} PB | ${controls} | ${formatTimestamp(timestamp)}`;

    if (videolink !== -1) {
        tierTitleSpan.classList.add("clickable");
        tierTitleSpan.addEventListener('click', function () {
            window.open(videolink, '_blank');
        });
        tierTitleSpan.innerHTML = youtubeElement + tierTitleSpan.innerHTML;
    }
    return tierTitleSpan;
}

function getScoreString(time, moves, tps, scoreType, isAverage) {
    result = normalizeValues(time, moves, tps, isAverage);
    time = result["time"];
    moves = result["moves"];
    tps = result["tps"];

    const scoreConfig = {
        "Moves": { primary: moves, secondary: `${time} / ${tps}` },
        "Time": { primary: time, secondary: `${moves} / ${tps}` },
        "TPS": { primary: tps, secondary: `${time} / ${moves}` },
        "FMC": { primary: time, secondary: `${moves} / ${tps}` },
        "FMC MTM": { primary: time, secondary: `${moves} / ${tps}` }
    };

    const config = scoreConfig[scoreType];
    if (config) {
        return [config.primary, config.secondary];
    }
}

function createTableCellScore(scoreString, className, secondaryClass) {
    const cell = document.createElement('td');
    cell.className = className;

    const mainValue = document.createElement('span');
    mainValue.className = 'score-main';
    mainValue.innerHTML = scoreString[0];

    const secondaryValue = document.createElement('span');
    secondaryValue.className = `score-secondary ${secondaryClass}`;
    secondaryValue.textContent = scoreString[1];

    cell.appendChild(mainValue);
    cell.appendChild(document.createElement('br'));
    cell.appendChild(secondaryValue);
    return cell;
}

function getControlsAndDate(timestamp, controls) {
    return "(" + controls + " / " + formatTimestamp(timestamp) + ")";
}

function createScoresAmountTable(tableContainer, amountTiersInfo) {
    function selectRecordsFilter(columnName) {
        NxMSelected = columnName;
        if (request.width === squaresSheetType) {
            if (columnName !== totalWRsAmount) {
                const filteredNxNRecords = {};
                Object.keys(NxNRecords)
                    .forEach(key => {
                        filteredNxNRecords[key] = NxNRecords[key].filter(item => item.nameFilter === columnName);
                    });
                createSheet(filteredNxNRecords, squaresSheetType);
            } else {
                createSheet(NxNRecords, squaresSheetType);
            }
        } else {
            if (columnName !== totalWRsAmount) {
                createSheetNxM(NxMRecords.filter(item => item.nameFilter === columnName && item.avglen === NxMAvglenSelected));
            } else {
                createSheetNxM(NxMRecords);
            }
        }
        updateSelectSizes();
    }
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.color = '#ccc';
    table.style.fontSize = '13px';
    table.style.fontFamily = 'Arial';
    for (let i = 0; i < amountTiersInfo.scoresCount.length; i++) {
        const [name, count] = amountTiersInfo.scoresCount[i];
        const row = table.insertRow(-1);
        row.style.cursor = 'pointer';
        const nameCell = row.insertCell(0);
        nameCell.textContent = name;
        nameCell.style.borderBottom = '1px solid #333';
        nameCell.style.padding = '3px 10px';
        nameCell.style.whiteSpace = 'nowrap';
        const countCell = row.insertCell(1);
        countCell.textContent = count;
        countCell.style.borderBottom = '1px solid #333';
        countCell.style.padding = '3px 10px';
        countCell.style.whiteSpace = 'nowrap';
        if (name !== totalWRsAmount) {
            const tier = amountTiersInfo.tiersMap[name] || 'kappa';
            nameCell.classList.add(tier);
        }
        if (NxMSelected === name) {
            row.style.backgroundColor = "#222";
        }
        row.addEventListener('click', () => {
            selectRecordsFilter(name);
        });
        row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'rgba(255,255,255,0.05)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = NxMSelected === name ? '#222' : '';
        });
    }
    if (table.rows.length > 0) {
        const lastCells = table.rows[table.rows.length - 1].cells;
        for (let i = 0; i < lastCells.length; i++) {
            lastCells[i].style.borderBottom = 'none';
        }
    }
    container.appendChild(table);
    tableContainer.appendChild(container);
}

function normalizeValues(time, moves, tps, isAverage) {
    return result = {
        "time": normalizeTime(time),
        "moves": normalizeMoves(moves, isAverage),
        "tps": normalizeTPS(tps)
    };
}

function normalizeTime(time) {
    if (time === -1) {
        return unknownStatsShortString;
    } else {
        return formatTime(time, cut = true);
    }
}

function normalizeMoves(moves, isAverage) {
    if (moves === -1) {
        return unknownStatsShortString;
    } else {
        if (!isAverage) {
            return (moves / 1000).toFixed(0);
        } else {
            if (moves % 1000 === 0) {
                return (moves / 1000).toFixed(0);
            } else {
                if (moves > 100000) {
                    return Math.floor(moves / 1000) + "~";
                } else {
                    return (moves / 1000).toFixed(3);
                }
            }
        }
    }
}

function normalizeTPS(tps) {
    if (tps === -1) {
        return tps = unknownStatsShortString;
    } else {
        tps = (tps / 1000).toFixed(3);
        if (tps > 1000) {
            tps = "∞";
        }
        return tps;
    }
}

function formatTimestamp(timestamp) {
    if (timestamp === -1) {
        return unknownStatsShortString;
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1)
        .toString()
        .padStart(2, '0');
    const day = date.getDate()
        .toString()
        .padStart(2, '0');
    const formattedDate = `${year}.${month}.${day}`;
    return formattedDate;
}

function calculateNxMTiers(WRList, filterByAvglen = false) {
    const filteredList = filterByAvglen ? WRList.filter(record => record.avglen === NxMAvglenSelected) : WRList;
    const nameSet = new Set(filteredList.map(record => record.nameFilter));
    const tiersMap = {};
    const scoresCount = {};
    nameSet.forEach(name => {
        const filteredRecords = filteredList.filter(record => record.nameFilter === name);
        const validScores = filteredRecords.filter(record => !isInvalidScore(record));
        if (validScores.length > 0) {
            const count = validScores.length;
            scoresCount[name] = count;
        }
    });
    const sortedNames = Object.keys(scoresCount).sort((a, b) => scoresCount[b] - scoresCount[a]);
    sortedNames.forEach((name, index) => {
        const tier = tierstable[index] || 'kappa';
        tiersMap[name] = tier;
    });
    const scoreCountOutput = Object.entries({
        ...scoresCount,
        [totalWRsAmount]: Object.values(scoresCount)
            .reduce((acc, val) => acc + val, 0)
    }).sort(([keyA], [keyB]) => keyA === totalWRsAmount ? -1 : keyB === totalWRsAmount ? 1 : scoresCount[keyB] - scoresCount[keyA]);
    return {
        "tiersMap": tiersMap,
        "scoresCount": scoreCountOutput
    };
}

function isInvalidScore(result) {
    const scoreType = request.leaderboardType;

    const valueMap = {
        "move": result.moves,
        "time": result.time,
        "tps": result.tps,
        "FMC": result.time,
        "FMC MTM": result.time
    };

    const formattedType = {
        "move": "Moves",
        "time": "Time",
        "tps": "TPS"
    }[scoreType] || scoreType;

    return isInvalid(valueMap[scoreType], formattedType);
}

function getScoreLimitExact(precentage, bestscore, reverse) {
    precentage = precentage / 100;
    if (bestscore === defaultScore || precentage === 0) {
        return tierLabels[0];
    }
    if (reverse) {
        return (Math.floor(precentage * bestscore) / 1000)
            .toFixed(3);
    } else {
        return (Math.floor(bestscore / precentage) / 1000)
            .toFixed(3);
    }
}

function getScoreLimit(precentage, bestscore, reverse, scoreType, isAverage) {
    precentage = precentage / 100;
    let value;
    if (bestscore === defaultScore || precentage === 0) {
        return tierLabels[0];
    }
    if (reverse) {
        value = Math.floor(precentage * bestscore);
    } else {
        value = Math.floor(bestscore / precentage);
    }

    // Time-based score types (Time, FMC, FMC MTM) use normalizeTime
    if (scoreType === "Time" || scoreType === "FMC" || scoreType === "FMC MTM") {
        return normalizeTime(value);
    }
    if (scoreType === "Moves") {
        return normalizeMoves(value, isAverage);
    }
    if (scoreType === "TPS") {
        return normalizeTPS(value);
    }
}
function generateFormattedString(request) {
    const worldRecordsTexts = getLocalizedWorldRecordsText();
    const selects = generateAllSelects(request.width);

    const pageConfig = getPageConfig(request.width);

    let headerHTML = buildHeader(selects.pbType, request);

    // Add game mode to header for squaresSheet and All pages
    if (!pageConfig.isCustomSize &&
        request.width !== "History" &&
        !String(request.width).includes("Rankings") &&
        request.gameMode !== "Standard") {

        let mode = formatGameModeForDisplay(request.gameMode, request.width);
        if (mode) {
            headerHTML += ` <span class="gamma" style="font-weight: 700;">${mode}</span>`;
        }
    }

    const contentHTML = buildPageContent(pageConfig, request, worldRecordsTexts);
    const controlsHTML = buildControlsRow(selects.displayType, selects.controlType);
    const refreshButton = buildRefreshButton();
    const timestampHTML = buildTimestampSection();

    const finalHTML = `${headerHTML} ${contentHTML} ${refreshButton} ${controlsHTML} ${timestampHTML}`;

    renderAndSetup(finalHTML, request);
}

function getPageConfig(width) {
    const configs = {
        [squaresSheetType]: {
            className: 'epsilon',
            textWithName: () => `PBs by <span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span> on NxN`,
            textNoName: (wr) => `${wr.worldRecordsOnNNtext}`,
            puzzleWord: 'sliding puzzles',
            showCount: true
        },
        'All': {
            className: 'alpha',
            textWithName: () => `PBs by <span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span> on NxM`,
            textNoName: (wr) => `${wr.worldRecordsOnNMtext}`,
            puzzleWord: 'sliding puzzles',
            showCount: true
        },
        'Rankings': {
            className: 'beta',
            text: 'Main™ Rankings of 3x3 - 10x10',
            puzzleWord: 'sliding puzzles'
        },
        'Rankings2': {
            className: 'beta',
            text: 'Most Popular Categories of',
            puzzleWord: 'sliding puzzles'
        },
        'Rankings3': {
            className: 'beta',
            text: 'Kinch Rankings of',
            puzzleWord: 'sliding puzzles'
        },
        'History': {
            className: 'delta',
            text: 'Latest Records of',
            puzzleWord: 'sliding puzzles',
            showNameSpan: true
        }
    };

    return configs[width] || {
        className: 'pinktext',
        puzzleWord: 'sliding puzzle',
        isCustomSize: true
    };
}

function formatGameModeForDisplay(gameMode, width) {
    if (gameMode === "Standard") return null;

    if (gameMode === allMarathons) {
        return "all marathons";
    }

    const cleanMode = width === squaresSheetType ? gameMode.replace(" of", "") : gameMode;

    const modeMap = {
        '2-N relay': 'relay',
        'Width relay': 'width relay',
        'Height relay': 'height relay',
        'Everything-up-to relay': 'EUT relay',
        'BLD': 'blindfolded'
    };

    if (modeMap[cleanMode]) {
        return modeMap[cleanMode];
    }

    if (cleanMode.startsWith('Marathon')) {
        const number = cleanMode.replace('Marathon', '').trim();
        return `x${number} marathon`;
    }

    return cleanMode;
}


function formatGameModeText(gameMode, forHistoryPage = false) {
    if (gameMode === "Standard") return "";

    let text = gameMode;

    // Map to display text
    if (text === "2-N relay") text = "relay";
    else if (text === "Width relay") text = "width relay";
    else if (text === "Height relay") text = "height relay";
    else if (text === "Everything-up-to relay") text = "EUT relay";
    else if (text === "BLD") text = forHistoryPage ? "blindfolded" : "(blindfolded)";
    else if (text === allMarathons) text = "all marathons";
    else if (text.startsWith("Marathon")) {
        const num = text.replace("Marathon", "").trim();
        text = `x${num} marathon${forHistoryPage ? "s" : ""}`;
    }

    return text;
}

function buildHeader(pbSelect, request) {
    const parts = [`<span style="font-weight: 900;">${pbSelect}</span>`];
    return parts.join(' ');
}

function buildPageContent(config, request, wrTexts) {
    const width = request.width;
    const hasNameFilter = request.nameFilter.length > 0;
    const gameMode = request.gameMode;

    // History page
    if (width === "History") {
        let prefix = "latest Standard Records";
        if (gameMode !== "Standard") {
            const modeText = formatGameModeText(gameMode, true);
            prefix = `Latest ${modeText} Records`;
        }
        let text = prefix;
        if (hasNameFilter) {
            text += ` by <span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span>`;
        }
        return `<span class="delta" style="font-weight: 900;">${text}</span>`;
    }

    // Rankings pages
    if (width === "Rankings") {
        return `<span class="beta" style="font-weight: 900;">Main™ Rankings of 3x3 - 10x10</span> sliding puzzles`;
    }
    if (width === "Rankings2") {
        return `<span class="beta" style="font-weight: 900;">Most Popular Categories of</span> sliding puzzles`;
    }
    if (width === "Rankings3") {
        return `<span class="beta" style="font-weight: 900;">Kinch Rankings of</span> sliding puzzles`;
    }

    // NxN sheet
    if (width === squaresSheetType) {
        if (hasNameFilter) {
            return `PBs by <span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span> on NxN sliding puzzles`;
        }
        const parts = [`<span class="epsilon" style="font-weight: 900;">${wrTexts.worldRecordsOnNNtext}</span> sliding puzzles`];
        if (NxMSelected !== totalWRsAmount) {
            parts.push(`by <span class="pinktext">${NxMSelected}</span>`);
        }
        return parts.join(' ');
    }

    // NxM sheet
    if (width === "All") {
        if (hasNameFilter) {
            return `PBs by <span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span> on NxM sliding puzzles`;
        }
        const parts = [`<span class="epsilon" style="font-weight: 900;">${wrTexts.worldRecordsOnNMtext}</span> sliding puzzles`];
        if (NxMSelected !== totalWRsAmount) {
            parts.push(`by <span class="pinktext">${NxMSelected}</span>`);
        }
        return parts.join(' ');
    }

    // Normal page with NxM
    if (gameMode !== "Standard") {
        const modeText = formatGameModeText(gameMode, false);
        if (gameMode === allMarathons) {
            return `Leaderboard for <span class="gamma" style="font-weight: 700;">All </span> <span class="pinktext" style="font-weight: 900;">${width}x${request.height}</span><span class="gamma" style="font-weight: 700;"> marathons</span>`;
        }
        return `Leaderboard for <span class="pinktext" style="font-weight: 900;">${width}x${request.height}</span> <span class="gamma" style="font-weight: 700;">${modeText}</span>`;
    }

    return `Leaderboard for <span class="pinktext" style="font-weight: 900;">${width}x${request.height}</span> sliding puzzle`;
}

function buildControlsRow(displaySelect, controlSelect) {
    return `<br><h2>Done with ${displaySelect} display type, using <span class="pinktext" style="font-weight: 700;">${controlSelect}</span> controls</h2>`;
}

function buildTimestampSection() {
    // The standalone archive page is gone. The date slider (toggled by the
    // nav date button) now handles archive selection. This function renders
    // a SHORT combined status line that summarises which sources are merged
    // for the current view — much shorter than the old
    // "(including web data backup: DD.MM.YYYY) (including LM data backup: DD.MM.YYYY)".
    //
    //   Live mode:    "Last update: X ago · exe live · web DD.MM.YYYY · lm DD.MM.YYYY"
    //   Archive mode: "Archives: exe DD.MM.YYYY · web DD.MM.YYYY · lm DD.MM.YYYY"
    // (each type only shown if its toggle is on; "N/A" shown if no archive
    //  exists for that type at the selected date.)

    if (archiveMode === 'archive' || (archiveMode !== 'live' && archiveDate !== 'LIVE')) {
        const parts = buildArchiveStatusParts();
        setupLiveUpdateTimer('');
        return `<span class="leaderboardUpdateSpan">Archives: ${parts.join(' · ')}</span>`;
    }

    const timeAgo = getTimeAgo(latestRecordTime);
    const parts = buildArchiveStatusParts();
    const suffix = parts.length ? ' · ' + parts.join(' · ') : '';
    let fallbackMsg = '';
    if (exeLeaderboardEnabled && exeFallbackArchive) {
        fallbackMsg = '<br><span style="color:#ffaa00;font-size:0.85em">⚠ Exe live server unavailable, using latest archive as fallback</span>';
    }
    setupLiveUpdateTimer(suffix);

    return `<span class="leaderboardUpdateSpan">Last leaderboard update: <span style="color: #ffffff">${timeAgo}</span>${suffix}${fallbackMsg}</span>`;
}

// Build the per-type status segments used by both buildTimestampSection and
// the slider's source-status line. Returns an array of HTML strings, one per
// enabled type, in exe → web → lm order. Types whose toggle is off are
// omitted entirely (cleaner than showing "off"). Types whose toggle is on but
// have no available archive at the selected date (or whose live fetch failed)
// show "N/A".
function buildArchiveStatusParts() {
    const parts = [];
    if (exeLeaderboardEnabled) {
        if (archiveMode === 'live' && (!selectedArchiveDates || !selectedArchiveDates.exe)) {
            // Live exe mode. Only show "live" if the fetch actually succeeded;
            // if the server was down, show N/A instead.
            if (lastFetchOk && lastFetchOk.exe) {
                parts.push('<span style="color:#44dd44">exe live</span>');
            } else {
                parts.push('<span style="color:#ff6666">exe N/A</span>');
            }
        } else if (exeFallbackArchive && lastFetchOk && lastFetchOk.exe) {
            parts.push('<span style="color:#ffaa00">exe ' + archiveNameToDotted(exeFallbackArchive) + ' (fallback)</span>');
        } else if (selectedArchiveDates && selectedArchiveDates.exe) {
            parts.push('<span style="color:#00ffff">exe ' + archiveNameToDotted(selectedArchiveDates.exe) + '</span>');
        } else {
            parts.push('<span style="color:#ff6666">exe N/A</span>');
        }
    }
    if (webLeaderboardEnabled) {
        if (selectedArchiveDates && selectedArchiveDates.web && lastFetchOk && lastFetchOk.web) {
            parts.push('<span style="color:#00ffff">web ' + archiveNameToDotted(selectedArchiveDates.web) + '</span>');
        } else {
            parts.push('<span style="color:#ff6666">web N/A</span>');
        }
    }
    if (lmLeaderboardEnabled) {
        if (selectedArchiveDates && selectedArchiveDates.lm && lastFetchOk && lastFetchOk.lm) {
            parts.push('<span style="color:#00ffff">lm ' + archiveNameToDotted(selectedArchiveDates.lm) + '</span>');
        } else {
            parts.push('<span style="color:#ff6666">lm N/A</span>');
        }
    }
    return parts;
}

function generateAllSelects(width) {
    const isSpecial = width === squaresSheetType || width === "All" || String(width).includes("Rankings");
    const controlValues = isSpecial ? controlTypeSelectValuesUnique : controlTypeSelectValues;
    const controlTexts = isSpecial ? controlTypeSelectStringsUnique : controlTypeSelectStrings;

    return {
        pbType: createSelectHTML("pbTypeSelect", PBTypeValues, PBTypeStrings),
        displayType: createSelectHTML("displayType", displayTypeOptions, displayTypeOptions),
        controlType: createSelectHTML("controlTypeSelect", controlValues, controlTexts)
    };
}

function getLocalizedWorldRecordsText() {
    if (currentCountry === 'worldwide') {
        return { worldRecordsOnNNtext: worldRecordsOnNN, worldRecordsOnNMtext: worldRecordsOnNM };
    }
    return {
        worldRecordsOnNNtext: worldRecordsOnNN.replace("World", currentCountry),
        worldRecordsOnNMtext: worldRecordsOnNM.replace("World", currentCountry)
    };
}

function renderAndSetup(html, request) {
    if (request.gameMode === allMarathons && request.width === "All") {
        leaderboardName.innerHTML = "All Marathons option is not supported for NxM sheet, please select other settings";
        return;
    }

    leaderboardName.innerHTML = html;

    attachSelectEvents(request);

    const nameSpan = document.getElementById('nameSpanHeader');
    if (nameSpan && request.nameFilter) {
        addNameFilterButton(nameSpan, request.nameFilter);
    }

    if (loadingPower) {
        modifyHeaderForPowerMode();
    }
}

// Helper functions kept same
function createSelectHTML(id, values, texts) {
    if (values.length !== texts.length) return '';
    const options = values.map((v, i) => `<option value="${v}">${texts[i]}</option>`).join('');
    return `<select id="${id}">${options}</select>`;
}

function buildRefreshButton() {
    const handler = loadingPower
        ? 'loadingPower=true;updateServer(user_token,last_displayType,last_controlType,last_pbType)'
        : 'updateServer(user_token,last_displayType,last_controlType,last_pbType)';

    return `<style>.glow-button{background:black;border:none;cursor:pointer;border-radius:5px;padding:5px;transition:box-shadow 0.3s;outline:none}.glow-button:hover{background-color:white;box-shadow:0 0 50px cyan}</style><button class="glow-button" onclick="${handler}"><span style="font-size:24px;color:white;">&#x267B;</span></button>`;
}

function formatWebArchiveSuffix(archive) {
    const d = archive.replace('web_', '');
    return ` (including web data backup: ${d.substring(6, 8)}.${d.substring(4, 6)}.${d.substring(0, 4)})`;
}

function formatLMArchiveSuffix(archive) {
    const d = archive.replace(/^LM_/i, '');
    return ` (including LM data backup: ${d.substring(6, 8)}.${d.substring(4, 6)}.${d.substring(0, 4)})`;
}

function setupLiveUpdateTimer(suffix) {
    clearInterval(window.leaderboardInterval);
    // In archive mode there's no live "last update" to track — the snapshot
    // date is fixed. Don't start the interval so we don't overwrite the
    // "Archives: ..." message after 10 seconds.
    if (archiveMode === 'archive') {
        window.leaderboardInterval = null;
        return;
    }
    window.leaderboardInterval = setInterval(() => {
        const span = document.querySelector(".leaderboardUpdateSpan");
        if (span) {
            span.innerHTML = `Last leaderboard update: <span style="color:#ffffff">${getTimeAgo(latestRecordTime)}</span>${suffix}`;
        }
    }, 10000);
}

function attachSelectEvents(request) {
    // Get elements AFTER they exist in DOM
    displayTypeSelect = document.getElementById("displayType");
    leaderboardTypeSelect = document.getElementById("pbTypeSelect");
    controlTypeSelect = document.getElementById("controlTypeSelect");

    // Define handlers exactly as in original
    function displayTypeChanged() {
        let currentValue = displayTypeSelect.value;
        changeDisplayType(currentValue);
        displayTypeSelect.style.width = `${getTextOfSelectLength(displayTypeSelect) + 1}ch`;
    }

    function leaderboardTypeChanged() {
        let currentValue = leaderboardTypeSelect.value;
        changeLeaderboardType(currentValue);
        leaderboardTypeSelect.style.width = `${getTextOfSelectLength(leaderboardTypeSelect) + 1}ch`;
    }

    function controlTypeChanged() {
        let currentValue = controlTypeSelect.value;
        changeControls(currentValue);
        controlTypeSelect.style.width = `${getTextOfSelectLength(controlTypeSelect) + 1}ch`;
    }

    // Apply loadingPower wrapper if needed (exactly as original)
    if (loadingPower) {
        const originalDisplayTypeChanged = displayTypeChanged;
        displayTypeChanged = function () {
            loadingPower = true;
            originalDisplayTypeChanged();
            getPowerData();
        };

        const originalControlTypeChanged = controlTypeChanged;
        controlTypeChanged = function () {
            loadingPower = true;
            originalControlTypeChanged();
            getPowerData();
        };
    }

    // Attach listeners and set values
    displayTypeSelect.addEventListener("change", displayTypeChanged);
    displayTypeSelect.value = request.displayType;

    leaderboardTypeSelect.addEventListener("change", leaderboardTypeChanged);
    leaderboardTypeSelect.value = request.leaderboardType;

    controlTypeSelect.addEventListener("change", controlTypeChanged);
    controlTypeSelect.value = controlType;
}

function wrapHandler(select, callback, usePower) {
    return function () {
        if (usePower) loadingPower = true;
        callback(select.value);
        select.style.width = `${getTextOfSelectLength(select) + 1}ch`;
        if (usePower) getPowerData();
    };
}

function addNameFilterButton(container, name) {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.style.fontSize = "16px";
    btn.addEventListener('click', () => {
        changeNameFilter("");
    });
    container.appendChild(btn);
}

function modifyHeaderForPowerMode() {
    const header = document.getElementById("leaderboardName");
    if (header) {
        header.removeChild(header.firstChild);
        header.removeChild(header.firstChild);
        header.removeChild(header.firstChild);
        header.firstChild.textContent = header.firstChild.textContent.replace("sliding puzzles", "Slidysim Power Rankings");
    }
}

function initArchiveDropdown(selector, usePower) {
    if (!availableArchives?.length) return;

    const container = document.querySelector(selector);
    if (!container) return;

    container.querySelector("select")?.remove();

    const select = document.createElement("select");
    select.style.cssText = "margin-left:5px;color:#fff;background:#333;border:1px solid #aaa";

    availableArchives.forEach(archive => {
        const opt = document.createElement("option");
        opt.value = archive;
        opt.textContent = formatArchiveDisplay(archive);
        if (archive === archiveDate) opt.selected = true;
        select.appendChild(opt);
    });

    select.addEventListener("change", () => {
        archiveDate = select.value;
        //console.log(usePower ? "Fetching power data for archive " + archiveDate : "Updating server for archive " + archiveDate);
        usePower ? getPowerData() : updateServer(user_token, last_displayType, last_controlType, last_pbType);
    });

    container.appendChild(select);
}

function formatArchiveDisplay(archive) {
    const match = archive.match(/(leaderboard_|exe_|web_|LM_|lm_)(\d{8})/);
    if (!match) return archive;

    const type = match[1].replace('_', '').toLowerCase();
    const d = match[2];
    const label = (type === 'leaderboard' || type === 'exe') ? '[exe]' : (type === 'lm') ? '[LM]' : '[web]';

    return `${label} ${d.slice(6, 8)}.${d.slice(4, 6)}.${d.slice(0, 4)}`;
}

function getTextOfSelectLength(mySelect) {
    return mySelect.options[mySelect.selectedIndex].textContent.length;
}







//_________________"Private" functions (multiple usage) ends_________________

//_________________"Private" functions for createSheet_________________

function createTableCell(item, className) {
    const cell = document.createElement('td');
    cell.className = className;

    // Create a text node and append it to the cell
    const textNode = document.createTextNode(item);
    cell.appendChild(textNode);

    return cell;
}

//_________________"Private" functions for createSheet ends_________________

//_________________"Private" functions for createSheetNxM_________________

function getAllSizes(resultsList, transposed = false) {
    const widthSet = new Set(resultsList.map(result => result.width));
    const heightSet = new Set(resultsList.map(result => result.height));
    if (transposed) {
        return {
            height: [...widthSet].sort((a, b) => a - b),
            width: [...heightSet].sort((a, b) => a - b),
        };
    }
    return {
        width: [...widthSet].sort((a, b) => a - b),
        height: [...heightSet].sort((a, b) => a - b),
    };
}

function getScoreStringNxM(time, moves, tps, scoreType, isAverage, username) {
    result = normalizeValues(time, moves, tps, isAverage);
    time = result["time"];
    moves = result["moves"];
    tps = result["tps"];

    // Time-based score types (Time, FMC, FMC MTM) return time
    if (scoreType === "Time" || scoreType === "FMC" || scoreType === "FMC MTM") {
        return [time, username];
    }
    if (scoreType === "Moves") {
        return [moves, username];
    }
    if (scoreType === "TPS") {
        return [tps, username];
    }
}

//_________________"Private" functions for createSheetNxM ends_________________

//_________________"Private" functions for createSheetRankings_________________


function getClosestAllowedValue(value, allowedValues) {
    return allowedValues.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
}

//Popular-only controls (min-players slider + "only interesting" checkbox).
//Appends into the passed parent (the .kinch-toolbar) so the Popular controls
//live inside the Kinch toolbar alongside the switches + chart toggle.
function createCustomSlider(parent) {
    const wrap = document.createElement("div");
    wrap.className = "kinch-popular-controls";

    const slider = document.createElement("input");
    slider.type = "range";
    allowedCategoryCountsCategories = Array.from(allowedCategoryCounts.keys());
    slider.min = Math.min(...allowedCategoryCountsCategories);
    slider.max = Math.max(...allowedCategoryCountsCategories);

    const closestAllowedValue = getClosestAllowedValue(lastSliderValue, allowedCategoryCountsCategories);
    slider.value = closestAllowedValue;

    const getMinPlayers = (value) => allowedCategoryCounts.get(parseInt(value));

    // Compact info display: "N players · M cats" in one element
    const infoSpan = document.createElement("span");
    infoSpan.className = "kinch-popular-info";
    infoSpan.textContent = getMinPlayers(slider.value) + " players · " + slider.value + " cats";

    slider.addEventListener("input", function () {
        const cav = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = cav;
        infoSpan.textContent = getMinPlayers(slider.value) + " players · " + slider.value + " cats";
    });
    slider.addEventListener("change", function () {
        const cav = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = cav;
        lastSliderValue = cav;
        sendMyRequest();
    });

    // Slider takes the majority of the space
    wrap.appendChild(slider);
    wrap.appendChild(infoSpan);

    // Compact "Interesting" checkbox
    const onlySquaresCheckbox = document.createElement("input");
    onlySquaresCheckbox.type = "checkbox";
    onlySquaresCheckbox.id = "kinch-only-squares";
    onlySquaresCheckbox.checked = lastSquaresCB;
    onlySquaresCheckbox.addEventListener("change", function () {
        lastSquaresCB = onlySquaresCheckbox.checked;
        sendMyRequest();
    });
    const onlySquaresLabel = document.createElement("label");
    onlySquaresLabel.textContent = "Interesting";
    onlySquaresLabel.htmlFor = "kinch-only-squares";
    onlySquaresLabel.className = "kinch-popular-interesting";
    wrap.appendChild(onlySquaresCheckbox);
    wrap.appendChild(onlySquaresLabel);

    parent.appendChild(wrap);
}

//_________________"Private" functions for createSheetRankings ends_________________

//_________________"Private" functions for createSheetHistory_________________

function tableIsEmpty(records, recordsListWR, scoreType) {
    for (const item of records) {
        const tierInfo = getTier(item, recordsListWR, scoreType);
        const percentage = tierInfo[0];
        if (percentage >= getTierPercentageLimit() && !isInvalidScore(item)) {
            return false;
        }
    }
    return true;
}

function getTier(item, recordsListWR, scoreType) {
    let bestValue = getBestValueWithGameMode(recordsListWR, scoreType, item.width, item.height, item.gameMode, item.avglen);
    let reverse = scoreType === "TPS";

    // Map score types to the value they use for comparison
    const valueMap = {
        "Moves": () => item.moves,
        "Time": () => item.time,
        "TPS": () => item.tps,
        "FMC": () => item.time,
        "FMC MTM": () => item.time
    };

    const mainValue = valueMap[scoreType] ? valueMap[scoreType]() : item.time;

    const percentage = calculatePercentage(mainValue, bestValue, reverse);
    return [percentage, getClassBasedOnPercentage(percentage, percentageTable), bestValue];
}

function getBestValueWithGameMode(data, scoreType, width, height, gameMode, avglen) {
    let bestValue = null;

    const valueMap = {
        "Moves": (item) => item.moves,
        "Time": (item) => item.time,
        "TPS": (item) => item.tps,
        "FMC": (item) => item.time,
        "FMC MTM": (item) => item.time
    };

    const getValue = valueMap[scoreType];

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.width === width && item.height === height && item.gameMode === gameMode && item.avglen === avglen && getValue) {
            bestValue = getValue(item);
            break;
        }
    }
    return bestValue;
}

function groupRecordsByTimestamp(records) {
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    function isLastWeek(date, currentDate) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.abs(date - currentDate) <= 7 * oneDay;
    }

    function isEarlierThisMonth(date, currentDate) {
        return date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
    }
    const groupedRecords = {
        [todayString]: [],
        [weekString]: [],
        [monthString]: [],
    };
    for (const record of records) {
        const recordDate = new Date(record.timestamp);
        const currentDate = new Date();
        if (isSameDay(recordDate, currentDate)) {
            groupedRecords[todayString].push(record);
        } else if (isLastWeek(recordDate, currentDate)) {
            groupedRecords[weekString].push(record);
        } else if (isEarlierThisMonth(recordDate, currentDate)) {
            groupedRecords[monthString].push(record);
        } else {
            let recordMonthYear = invalidTimestampStringHistory;
            if (record.timestamp !== -1) {
                recordMonthYear = recordDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                });
            }
            if (!groupedRecords[recordMonthYear]) {
                groupedRecords[recordMonthYear] = [];
            }
            groupedRecords[recordMonthYear].push(record);
        }
    }
    const groupKeys = Object.keys(groupedRecords);
    groupKeys.sort((a, b) => {
        const firstRecordA = groupedRecords[a][0];
        const firstRecordB = groupedRecords[b][0];
        if (firstRecordA && firstRecordB) {
            return firstRecordB.timestamp - firstRecordA.timestamp;
        } else if (firstRecordA) {
            return -1; // A has records, B doesn't
        } else if (firstRecordB) {
            return 1; // B has records, A doesn't
        } else {
            return 0; // Both A and B have no records
        }
    });
    const sortedGroupedRecords = {};
    for (const key of groupKeys) {
        sortedGroupedRecords[key] = groupedRecords[key];
    }
    return sortedGroupedRecords;
}

function populateTableHistory(records, recordsListWR, scoreType, table, reverse) {
    let scoresCounter = 0;
    records.forEach(item => {
        const tierInfo = getTier(item, recordsListWR, scoreType);
        const percentage = tierInfo[0];
        if (percentage >= getTierPercentageLimit() && !isInvalidScore(item)) {
            scoresCounter++;
            const dataRow = document.createElement('tr');
            table.appendChild(dataRow);

            const tier = tierInfo[1];
            dataRow.classList.add(tier);

            // === PLAYER NAME CELL ===
            const displayedName = item.nameFilter;
            const playerNameCell = document.createElement("td");
            playerNameCell.innerHTML = appendFlagIconToNickname(displayedName);
            playerNameCell.classList.add("clickable");
            playerNameCell.addEventListener("click", function () {
                changeNameFilter(item.nameFilter);
            });
            dataRow.appendChild(playerNameCell);

            // === SCORE CELL ===
            const isAverage = (item.avglen !== 1);
            const scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
            const scoreCell = createTableCellScore(scoreString, 'score', "grayColor");

            if (!debugMode) {
                let makeyoutubelink = false;
                if (item.isWeb) {
                    scoreCell.firstChild.innerHTML = webElement + scoreCell.firstChild.textContent;
                }
                if (item.isLM) {
                    scoreCell.firstChild.innerHTML = lmElement + scoreCell.firstChild.textContent;
                }
                const videolink = videoLinkCheck(item.videolink);
                if (videolink) {
                    scoreCell.classList.add("clickable");
                    scoreCell.firstChild.innerHTML = youtubeElement + scoreCell.firstChild.textContent;
                    makeyoutubelink = true;
                }
                if (item.solve_data_available) {
                    makeyoutubelink = false;
                    let videoLinkForReplay = -1;
                    if (videolink) {
                        videoLinkForReplay = videolink;
                        scoreCell.firstChild.innerHTML = redEggElement + scoreCell.firstChild.textContent;
                    } else {
                        scoreCell.firstChild.innerHTML = eggElement + scoreCell.firstChild.textContent;
                    }
                    scoreCell.classList.add("clickable");

                    const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, tier, percentage === 100, scoreType);
                    scoreCell.addEventListener('click', (event) => {
                        getSolutionForScore(item, (error, solveData) => {
                            if (error) {
                                alert(error);
                            } else {
                                handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, tier, percentage === 100);
                            }
                        });
                    });
                }
                if (makeyoutubelink) {
                    scoreCell.addEventListener('click', function () {
                        window.open(videolink, '_blank');
                    });
                }
            } else {
                if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn") {
                    scoreCell.classList.add("clickable");
                    scoreCell.firstChild.textContent = getScoreIDIcon + scoreCell.firstChild.textContent;
                    scoreCell.addEventListener('click', function () {
                        promptForVideoLink(item.time, item.moves, item.timestamp);
                    });
                }
            }
            dataRow.appendChild(scoreCell);

            // === CATEGORY CELL ===
            const categoryCell = document.createElement('td');
            let avgpart = isAverage ? `ao${item.avglen}` : "";
            let sizePart = `${item.width}x${item.height}`;
            let mode = item.gameMode;
            let modePart = "";

            if (mode === "Standard") {
                modePart = "";
            } else if (mode.startsWith("Marathon")) {
                const num = mode.split(" ")[1];
                modePart = `x${num}`;
            } else if (mode === "2-N relay") {
                modePart = "relay";
            } else if (mode === "Width relay") {
                modePart = "Wrel";
            } else if (mode === "Height relay") {
                modePart = "Hrel";
            } else if (mode === "Everything-up-to relay") {
                modePart = "EUT";
            } else {
                modePart = mode;
            }

            let categoryString = sizePart;
            if (modePart) categoryString += ` ${modePart}`;
            if (avgpart) categoryString += ` ${avgpart}`;

            categoryCell.innerHTML = categoryString;
            categoryCell.classList.add("clickable");

            categoryCell.addEventListener("click", function () {
                for (const radio of gamemodeRadios) {
                    if (radio.value === mode) {
                        radio.checked = true;
                        break;
                    }
                }

                changeGameMode(mode);
                changePuzzleSize(sizePart);
            });
            dataRow.appendChild(categoryCell);

            // === CONTROLS CELL (with percentage) ===
            const controlsCell = document.createElement('td');
            if (percentage === 100) {
                if (currentCountry === 'worldwide') {
                    controlsCell.innerHTML = `${item.controls}<br>(WR)`;
                } else {
                    controlsCell.innerHTML = `${item.controls}<br>(NR)`;
                }
                dataRow.classList.add("WRPB");
            } else {
                controlsCell.innerHTML = `${item.controls}<br>(${percentage.toFixed(3)}%)`;
            }
            dataRow.appendChild(controlsCell);

            // === DATE CELL ===
            const dateCell = document.createElement('td');
            const timestamp = formatTimestampWithTime(item.timestamp);
            const [datePart, timePart] = timestamp.split(' ');
            dateCell.innerHTML = `${datePart}<br>${timePart}`;
            dataRow.appendChild(dateCell);

            // === ROW EVENT LISTENERS ===
            dataRow.classList.add("shadowFun");
            dataRow.addEventListener('mouseover', () => {
                dataRow.classList.add("highlightedCell");
            });
            dataRow.addEventListener('mouseout', () => {
                dataRow.classList.remove("highlightedCell");
            });
            dataRow.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });

            // Score tooltips
            if (["Time", "FMC", "FMC MTM"].includes(scoreType)) {
                if (item.time > 59999 || (item.moves > 100000 && isAverage)) {
                    scoreCell.addEventListener('mouseover', () => {
                        tooltip.textContent = formatTime(item.time) + " (" + (item.moves / 1000).toFixed(3) + " moves)";
                        tooltip.style.display = 'block';
                    });
                    scoreCell.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 150) + 'px';
                        tooltip.style.top = (e.pageY - 40) + 'px';
                    });
                }
            }
            if (scoreType === "Moves" && item.moves > 100000 && isAverage) {
                scoreCell.addEventListener('mouseover', () => {
                    tooltip.textContent = (item.moves / 1000).toFixed(3);
                    tooltip.style.display = 'block';
                });
                scoreCell.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.pageX - 150) + 'px';
                    tooltip.style.top = (e.pageY - 20) + 'px';
                });
            }
        }
    });
    return scoresCounter;
}

function getLimitString(bestValue, item, avgpart, gameMode, reverse, isAverage, scoreType) {
    let limitsString = `<p>${item.width}x${item.height} ${avgpart} ${requirementsString} (${gameMode}):</p>`
    const limit = getScoreLimitExact(100, bestValue, reverse);
    const limitVisual = getScoreLimit(100, bestValue, reverse, scoreType, isAverage);
    if (limit !== limitVisual) {
        limitsString += `<p><span class="alpha WRPB">100%: ${limitVisual} (${limit})</span></p>`;
    } else {
        limitsString += `<p><span class="alpha WRPB">100%: ${limitVisual}</span></p>`;
    }

    for (const key in percentageTable) {
        if (percentageTable.hasOwnProperty(key)) {
            const percentageValue = percentageTable[key];
            const limit = getScoreLimitExact(percentageValue, bestValue, reverse);
            const limitVisual = getScoreLimit(percentageValue, bestValue, reverse, scoreType, isAverage);
            const categoryName = key.charAt(0)
                .toUpperCase() + key.slice(1)
            if (limit !== limitVisual) {
                limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual} (${limit})</span></p>`;
            } else {
                limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual}</span></p>`;
            }
        }
    }
    return limitsString;
}

//_________________"Private" functions for createSheetHistory ends_________________
