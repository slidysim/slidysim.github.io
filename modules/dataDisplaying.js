//Module to create sheets of processed leaderboard data

/*DEPENDENCIES
dataFetching.js
dataProcessing.js
replayGeneration.js
userInteractions.js
*/

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
            createScoresAmountTable(NxNWRsContainer, tiersData);
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
                customSizeInput.value = newSize;
                radioCustomSize.value = newSize;
                radioCustomSize.checked = true;
                changePuzzleSize(newSize);
            });
        }

        // Add click handler for average type selection in transposed mode
       // if (normalSheetTransposed && mainHeaders.length > 1) {
            //cell.classList.add("clickable");
          //  cell.addEventListener("click", function () {
                // Filter by this average type (Single, ao5, ao12, etc.)
                const avglenMap = { "Single": 1, "ao5": 5, "ao12": 12, "ao25": 25, "ao50": 50, "ao100": 100 };
                const avglen = avglenMap[cellValue] || 1;
                // Trigger avglen filter - this would require additional UI logic
                // For now, just highlight/indicate selection
                //console.log("Filter by avglen: " + avglen);
         //   });
       // }

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
                    customSizeInput.value = itemKey;
                    radioCustomSize.value = itemKey;
                    radioCustomSize.checked = true;
                    changePuzzleSize(itemKey);
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
    generateFormattedString(request);
    if (copyOfWRList.length === 0) {
        contentDiv.innerHTML = notFoundError;
        return;
    }
    tiersData = calculateNxMTiers(NxMRecords, true);
    if (request.nameFilter === "") {
        createScoresAmountTable(contentDiv, tiersData);
    }
    tiersMap = tiersData.tiersMap;
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.classList.add("bigContainer");
    contentDiv.appendChild(createNMSlider());
    // Add avglen selector if there are multiple avglen options
    if (NxMAvglenOptions.length > 1) {
        contentDiv.appendChild(createNxMAvglenSelector());
    }
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

//"Public" function to create Rankings sheet
function createSheetRankings(playerScores) {
    savedPlayerScores = playerScores;
    let reverse = request.leaderboardType === "tps";

    const scoreTypeDisplayMap = {
        "move": "Moves",
        "time": "Time",
        "tps": "TPS",
        "FMC": "FMC",
        "FMC MTM": "FMC MTM"
    };

    let scoreType = scoreTypeDisplayMap[request.leaderboardType] || request.leaderboardType;
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    contentDiv.style.overflowX = "auto"
    generateFormattedString(request);
    createHideEmptyCheckbox();
    if (playerScores.length === 0) {
        contentDiv.innerHTML = notFoundError;
    } else {
        if (loadingPower) { loadPower(); return; }
        const tableContainer = document.createElement('div');
        tableContainer.classList.add('table-container');
        tableContainer.classList.add('bigContainer');
        contentDiv.appendChild(tableContainer);
        let palyerId = 0;
        for (const category in percentageTable) {
            if (percentageTable.hasOwnProperty(category)) {
                const table = document.createElement('table');
                table.classList.add("rankingCells");
                const tableHeaderRow = document.createElement('tr');
                const currentPrecentage = percentageTable[category];
                let categoryCapName = category.charAt(0).toUpperCase() + category.slice(1);

                const thElementLetter = document.createElement('th');
                thElementLetter.appendChild(greekLetterSpan(category));
                tableHeaderRow.appendChild(thElementLetter);

                const thElementName = document.createElement('th');
                thElementName.textContent = categoryCapName;
                thElementName.style.fontSize = "12px";
                tableHeaderRow.appendChild(thElementName);


                tableHeaderRow.appendChild(document.createElement('th'))
                    .textContent = ">" + currentPrecentage + "%";
                tableHeaderRow.classList.add(category);
                playerScores[0].scores.forEach(function (score) {
                    fakeScoreInfo = parseId(score.id); //fix for non-existing scores
                    var th = document.createElement('th');
                    var smallText = document.createElement('span');
                    let isAverage = (fakeScoreInfo.avglen !== 1);
                    const bestValue = bestValues[score.id];
                    const newScoreLimit = getScoreLimit(currentPrecentage, bestValue, reverse, scoreType, isAverage);
                    smallText.textContent = newScoreLimit;
                    smallText.classList.add("smallTextForCellsRanks");
                    th.innerHTML = score.id.replace(" ", "<br>");
                    th.appendChild(document.createElement('br'));
                    th.appendChild(smallText);
                    th.classList.add("clickable");
                    let newSize = fakeScoreInfo.width + "x" + fakeScoreInfo.height;
                    let newGameMode = fakeScoreInfo.gameMode;
                    th.addEventListener("click", function () {
                        customSizeInput.value = newSize;
                        radioCustomSize.value = newSize;
                        radioCustomSize.checked = true;
                        for (const radio of gamemodeRadios) {
                            if (radio.value === newGameMode) {
                                radio.checked = true;
                                break;
                            }
                        }
                        changePuzzleSize(newSize);
                        changeGameMode(newGameMode);
                    });
                    th.addEventListener('mouseover', () => {
                        tooltip.innerHTML = exactLimitString + "<br>" + category + " " + score.id + ":<br>" + getScoreLimitExact(currentPrecentage, bestValues[score.id], reverse);
                        th.classList.add("highlightedCell");
                        tooltip.classList.add(category);
                        tooltip.style.display = 'block';
                    });
                    th.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 150) + 'px';
                        tooltip.style.top = (e.pageY - 100) + 'px';
                    });
                    th.addEventListener('mouseout', () => {
                        th.classList.remove("highlightedCell");
                        tooltip.classList.remove(category);
                        tooltip.style.display = 'none';
                    });
                    if (bestValue !== defaultScore && !isInvalid(bestValue, scoreType)) {
                        tableHeaderRow.appendChild(th);
                    }
                });
                table.appendChild(tableHeaderRow);
                let beforeAddingID = palyerId;
                for (const playerScore of playerScores) {
                    if (playerScore.tier === category) {
                        palyerId++;
                        const playerTableRow = document.createElement('tr');
                        const playerPlaceCell = document.createElement('td');
                        playerPlaceCell.textContent = palyerId;
                        const playerNameCell = document.createElement('td');
                        playerNameCell.innerHTML = appendFlagIconToNickname(playerScore.name);
                        playerNameCell.classList.add("clickable");
                        playerNameCell.addEventListener("click", function () {
                            radioNxNWRs.checked = true;
                            changePuzzleSize(radioNxNWRs.value);
                            changeNameFilter(playerScore.name);
                        });
                        const playerPowerCell = document.createElement('td');
                        playerPowerCell.textContent = playerScore.power.toFixed(3) + "%";
                        playerPlaceCell.classList.add(category);
                        playerNameCell.classList.add(category);
                        playerNameCell.classList.add("nameCell");
                        playerPowerCell.classList.add(category);
                        playerNameCell.classList.add("blackBG");
                        playerPowerCell.classList.add("blackBG");
                        playerPlaceCell.classList.add("blackBG");
                        playerTableRow.appendChild(playerPlaceCell);
                        playerTableRow.appendChild(playerNameCell);
                        playerTableRow.appendChild(playerPowerCell);
                        playerScore.scores.forEach(function (scoreData) {
                            let item = scoreData.scoreInfo;
                            let isAverage = (item.avglen !== 1);
                            let scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
                            const scoreCell = createTableCellScore([scoreString[0], ""], 'score', "kappa");
                            scoreCell.classList.add(scoreData.scoreTier);
                            let extraInfo = "";
                            if (["Time", "FMC", "FMC MTM"].includes(scoreType)) {
                                extraInfo = formatTime(item.time);
                                extraInfo += ` (${(item.moves / 1000).toFixed(3).replace(/\.?0+$/, '')} / ${normalizeTPS(item.tps)})`
                                extraInfo += "<br>";
                            }
                            if (scoreType === "Moves") {
                                extraInfo = (item.moves / 1000).toFixed(3).replace(/\.?0+$/, ''); //remove extra 0
                                extraInfo += ` (${formatTime(item.time)} / ${normalizeTPS(item.tps)})`
                                extraInfo += "<br>";
                            }
                            if (scoreType === "TPS") {
                                extraInfo = normalizeTPS(item.tps);
                                extraInfo += ` (${formatTime(item.time)} / ${(item.moves / 1000).toFixed(3).replace(/\.?0+$/, '')})`
                                extraInfo += "<br>";
                            }
                            if (scoreData.scorePercentage === 100) {
                                scoreCell.classList.add("WRPB");
                                extraInfo += " [WR]<br>";
                            } else {
                                extraInfo += " " + scoreData.scorePercentage + "%<br>"
                            }
                            if (scoreString[0].includes("NaN")) {
                                scoreCell.classList.add("no-box-shadow");
                                scoreCell.innerHTML = "-";
                            } else {
                                if (!debugMode) {
                                    const videolink = videoLinkCheck(item.videolink);
                                    let makeyoutubelink = false;
                                    if (item.isWeb) {
                                        scoreCell.firstChild.innerHTML = webElement + scoreCell.firstChild.textContent;
                                    }
                                    if (videolink) {
                                        scoreCell.classList.add("clickable");
                                        scoreCell.firstChild.innerHTML = youtubeElement + scoreCell.firstChild.textContent;
                                        makeyoutubelink = true;
                                    }
                                    if (true//item.gameMode === "Standard" //&& !isAverage
                                    ) {
                                        //const solution = getSolutionForScore(item);
                                        if (item.solve_data_available) {
                                            makeyoutubelink = false;
                                            let videoLinkForReplay = -1;
                                            if (videolink) {
                                                videoLinkForReplay = videolink;
                                                scoreCell.innerHTML = redEggElement + scoreCell.textContent;
                                            } else {
                                                scoreCell.innerHTML = eggElement + scoreCell.textContent;
                                            }
                                            scoreCell.classList.add("clickable");
                                            const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, scoreData.scoreTier, scoreData.scorePercentage === 100, scoreType);
                                            scoreCell.addEventListener('click', (event) => {
                                                getSolutionForScore(item, (error, solveData) => {
                                                    if (error) {
                                                        alert(error);
                                                    } else {
                                                        //makeReplay(solution, event, item.tps, item.width, item.height, scoreTitle);
                                                        handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, scoreData.scoreTier, scoreData.scorePercentage === 100);
                                                    }
                                                });
                                            });
                                        }
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
                                scoreCell.addEventListener('mouseover', () => {
                                    tooltip.innerHTML = extraInfo + scoreData.id + byString + item.nameFilter + "<br>" + getControlsAndDate(item.timestamp, item.controls);
                                    scoreCell.classList.add("highlightedCell");
                                    tooltip.style.display = 'block';
                                    tooltip.classList.add(scoreData.scoreTier);
                                });
                                scoreCell.addEventListener('mousemove', (e) => {
                                    tooltip.style.left = (e.pageX - 200) + 'px';
                                    tooltip.style.top = (e.pageY - 100) + 'px';
                                });

                                scoreCell.addEventListener('mouseout', () => {
                                    scoreCell.classList.remove("highlightedCell");
                                    tooltip.style.display = 'none';
                                    tooltip.classList.remove(scoreData.scoreTier);
                                });
                            }
                            if (bestValues[scoreData.id] !== defaultScore && !isInvalid(bestValues[scoreData.id], scoreType)) {
                                playerTableRow.appendChild(scoreCell);
                            }
                        });
                        table.appendChild(playerTableRow);
                    }
                }
                if (palyerId === beforeAddingID) {
                    const playerTableRow = document.createElement('tr');
                    const playerPlaceCell = document.createElement('td');
                    const playerNameCell = document.createElement('td');
                    playerNameCell.textContent = emptyTierPlaceHolder;
                    const playerPowerCell = document.createElement('td');
                    playerPlaceCell.classList.add(category);
                    playerNameCell.classList.add(category);
                    playerNameCell.classList.add("nameCell");
                    playerPowerCell.classList.add(category);
                    playerTableRow.appendChild(playerPlaceCell);
                    playerTableRow.appendChild(playerNameCell);
                    playerTableRow.appendChild(playerPowerCell);
                    table.appendChild(playerTableRow);
                    if (hideEmptyTiers) {
                        table.style.display = "none";
                    }
                }
                tableContainer.appendChild(table);
            }
        }
    }
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

function dontFormat() {
    formatTime = function (milliseconds, cut = false) {
        return (milliseconds / 1000).toFixed(3);
    }
    sendMyRequest();
    const images = document.querySelectorAll('img');
    images.forEach(img => img.remove());
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
    const buttonShare = document.createElement("button");
    buttonShare.textContent = shareCustomRanksText;
    buttonShare.classList.add("pause-button");
    buttonShare.addEventListener("click", function () {
        navigator.clipboard.writeText(shareCustomRanks())
            .then(() => {
                const copiedMessage = document.createElement("div");
                copiedMessage.textContent = linkCopiedSuccsess;
                copiedMessage.style.position = "fixed";
                copiedMessage.style.background = "rgba(0, 0, 0, 0.7)";
                copiedMessage.style.color = "white";
                copiedMessage.style.padding = "10px";
                copiedMessage.style.borderRadius = "5px";
                copiedMessage.style.textAlign = "center";
                copiedMessage.style.top = "50%";
                copiedMessage.style.left = "50%";
                copiedMessage.style.transform = "translate(-50%, -50%)";
                copiedMessage.style.zIndex = "999";
                document.body.appendChild(copiedMessage);
                setTimeout(() => {
                    copiedMessage.style.transition = "opacity 0.5s";
                    copiedMessage.style.opacity = "0";
                    setTimeout(() => {
                        document.body.removeChild(copiedMessage);
                    }, 500);
                }, 1000);
            })
            .catch((error) => {
                console.error("Copy failed: ", error);
            });
    });
    const h1Container = document.createElement("h1");
    h1Container.style.margin = "0";
    rankingTabs.appendChild(h1Container);
    function createCustomRankButtons(customRankObj, container) {
        function setCustomRanks(string) {
            customRankingsArea.value = string;
            if (!loadingPower) {
                changeCustomRanks();
            }
        }
        for (const key in customRankObj) {
            if (customRankObj.hasOwnProperty(key)) {
                const buttonText = key;
                const ranksText = customRankObj[key];
                const button = document.createElement("button");
                button.textContent = buttonText;
                button.addEventListener("click", () => setCustomRanks(ranksText));
                container.appendChild(button);
                if (buttonText === "MAIN 30") {
                    button.click();
                }
            }
        }
    }
    for (const customRankObj of customRankButtonsExamples) {
        createCustomRankButtons(customRankObj, rankingTabs);
    }
    rankingTabs.appendChild(buttonShare);
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
    function transposeData(data) {
        return data[0].map((_, colIndex) => data.map(row => row[colIndex]));
    }
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.margin = '10px auto';
    const transposedData = transposeData(amountTiersInfo.scoresCount);
    const table = document.createElement('table');
    table.classList.add("WRstable");
    table.classList.add("rankingCells");
    const headerRow = table.insertRow(0);
    headerRow.style.backgroundColor = "#f2f2f2";
    headerRow.classList.add("clickable");
    for (let i = 0; i < transposedData[0].length; i++) {
        const headerCell = headerRow.insertCell(i);
        headerCell.innerHTML = transposedData[0][i];
        headerCell.style.fontSize = "13px";
        headerCell.style.fontWeight = "bold";
    }
    for (let i = 1; i < transposedData.length; i++) {
        const row = table.insertRow(i);
        row.classList.add("clickable");
        for (let j = 0; j < transposedData[i].length; j++) {
            const cell = row.insertCell(j);
            cell.style.fontSize = "20px";
            const columnName = transposedData[0][j];
            const cellValue = transposedData[i][j];
            cell.innerHTML = cellValue;
            cell.classList.add(amountTiersInfo.tiersMap[columnName]);
            headerRow.cells[j].classList.add(amountTiersInfo.tiersMap[columnName]);
            if (NxMSelected === columnName) {
                cell.style.backgroundColor = "#222";
                headerRow.cells[j].style.backgroundColor = "#222";
            }
            cell.addEventListener('click', () => {
                selectRecordsFilter(columnName);
            });
            headerRow.cells[j].addEventListener('click', () => {
                selectRecordsFilter(columnName);
            });
            cell.addEventListener('mouseover', () => {
                cell.classList.add("highlightedCell");
                headerRow.cells[j].classList.add("highlightedCell");
            });
            headerRow.cells[j].addEventListener('mouseover', () => {
                cell.classList.add("highlightedCell");
                headerRow.cells[j].classList.add("highlightedCell");
            });
            cell.addEventListener('mouseout', () => {
                cell.classList.remove("highlightedCell");
                headerRow.cells[j].classList.remove("highlightedCell");
            });
            headerRow.addEventListener('mouseout', () => {
                cell.classList.remove("highlightedCell");
                headerRow.cells[j].classList.remove("highlightedCell");
            });
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
            puzzleWord: 'sliding puzzles',
            onBefore: createCustomSlider
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
        createCustomSlider();
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
        const parts = [`<span class="alpha" style="font-weight: 900;">${wrTexts.worldRecordsOnNMtext}</span> sliding puzzles`];
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
    if (archiveDate !== "LIVE") {
        const lp = loadingPower;
        setTimeout(() => initArchiveDropdown(".leaderboardUpdateSpan", lp), 0);
        return '<span class="leaderboardUpdateSpan">Archive from </span>';
    }

    const timeAgo = getTimeAgo(latestRecordTime);
    const archiveSuffix = webLeaderboardEnabled && latestWebArchive
        ? formatWebArchiveSuffix(latestWebArchive)
        : '';

    setupLiveUpdateTimer(archiveSuffix);

    return `<span class="leaderboardUpdateSpan">Last leaderboard update: <span style="color: #ffffff">${timeAgo}</span>${archiveSuffix}</span>`;
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

function setupLiveUpdateTimer(suffix) {
    clearInterval(window.leaderboardInterval);
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
        usernameInput.value = "";
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
    const match = archive.match(/(leaderboard_|exe_|web_)(\d{8})/);
    if (!match) return archive;

    const type = match[1].replace('_', '');
    const d = match[2];
    const label = (type === 'leaderboard' || type === 'exe') ? '[exe]' : '[web]';

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

function createCustomSlider() {
    const slider = document.createElement("input");
    slider.type = "range";
    allowedCategoryCountsCategories = Array.from(allowedCategoryCounts.keys());
    slider.min = Math.min(...allowedCategoryCountsCategories);
    slider.max = Math.max(...allowedCategoryCountsCategories);

    // Find the closest allowed value for the initial slider value
    const closestAllowedValue = getClosestAllowedValue(lastSliderValue, allowedCategoryCountsCategories);
    slider.value = closestAllowedValue;

    const getMinPlayers = (value) => allowedCategoryCounts.get(parseInt(value));

    const sliderLabel = document.createElement("label");
    sliderLabel.innerHTML = `<span style="color: white;">Min. number of players: </span><span style="color: #00ff00;">${getMinPlayers(slider.value)}</span><br><span style="color: gray;font-style: italic;">${maxCategoriesForPopularString} ${slider.value}</span>`;
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.insertBefore(sliderLabel, contentDiv.firstChild);
    contentDiv.insertBefore(slider, contentDiv.firstChild);

    slider.addEventListener("input", function () {
        const closestAllowedValue = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = closestAllowedValue;
        sliderLabel.innerHTML = `<span style="color: white;">Min. number of players: </span><span style="color: #00ff00;">${getMinPlayers(slider.value)}</span><br><span style="color: #90EE90;font-style: italic;">${maxCategoriesForPopularString} ${slider.value}</span>`;
    });

    slider.addEventListener("change", function () {
        const closestAllowedValue = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = closestAllowedValue;
        lastSliderValue = closestAllowedValue;
        sendMyRequest();
    });

    sliderLabel.classList.add("sliderlabel");

    const onlySquaresCheckbox = document.createElement("input");
    onlySquaresCheckbox.type = "checkbox";
    onlySquaresCheckbox.id = "onlySquaresCheckbox";
    onlySquaresCheckbox.checked = lastSquaresCB;
    onlySquaresCheckbox.addEventListener("change", function () {
        lastSquaresCB = onlySquaresCheckbox.checked;
        sendMyRequest();
    });

    const onlySquaresLabel = document.createElement("label");
    onlySquaresLabel.textContent = onlyInterestingCategoriesPopular;
    onlySquaresLabel.htmlFor = "onlySquaresCheckbox";

    contentDiv.appendChild(onlySquaresCheckbox);
    contentDiv.appendChild(onlySquaresLabel);
    contentDiv.appendChild(document.createElement("br"));
    contentDiv.appendChild(document.createElement("br"));
}

function createHideEmptyCheckbox() {
    const hideEmptyCheckbox = document.createElement("input");
    hideEmptyCheckbox.type = "checkbox";
    hideEmptyCheckbox.id = "hideEmptyCheckbox";
    hideEmptyCheckbox.checked = hideEmptyTiers;
    hideEmptyCheckbox.addEventListener("change", function () {
        hideEmptyTiers = hideEmptyCheckbox.checked;
        sendMyRequest();
    });
    const hideEmptyCheckboxLabel = document.createElement("label");
    hideEmptyCheckboxLabel.textContent = hideEmptyTiersCheckboxText;
    hideEmptyCheckboxLabel.htmlFor = "hideEmptyCheckbox";
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.appendChild(hideEmptyCheckbox);
    contentDiv.appendChild(hideEmptyCheckboxLabel);
    contentDiv.appendChild(document.createElement("br"));
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
                customSizeInput.value = sizePart;
                radioCustomSize.value = sizePart;
                radioCustomSize.checked = true;

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
