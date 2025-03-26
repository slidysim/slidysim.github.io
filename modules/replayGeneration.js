//Module for making replay animation of sliding puzzle inside "overlay" container

/*DEPENDENCIES
dataDisplaying.js
dataFetching.js
fringeColors.js
gridsAnalysis.js
optimalSolver.js
slidingPuzzle.js
*/

function toggleSettingsVisibility() {
    settingsButton = document.getElementById("settingsButton");
    if (popupContainerSettings.style.display === "none") {
        popupContainerSettings.style.display = "block";
        settingsButton.textContent = hideStatsText;
        if (window.innerWidth < 1000){
            changeOveralyStyle(mobile=true, showWarning=!warningWasShown);
        }
    } else {
        popupContainerSettings.style.display = "none";
        settingsButton.textContent = showStatsText;
    }
}

function readSolveData(input) {
    try {
        const binaryData = atob(input);
        const binaryArray = Uint8Array.from(binaryData, (c) => c.charCodeAt(0));
        const decompressed = pako.inflate(binaryArray, { to: 'string' });
         //console.log(decompressed);
        let moveTimesMatch = decompressed.match(/\[.*?\]/);
        let moveTimes = moveTimesMatch ? moveTimesMatch[0] : -1;

        if (moveTimes !== -1) {
            moveTimes = moveTimes.slice(1, -1);

            moveTimes = moveTimes.split(';').map(segment => 
                segment.split(',').map(Number)
            );
            if (moveTimes[0].length === 1){
                moveTimes = -1;
            }
        }
        
        let remainingDecompressed = decompressed.replace(moveTimesMatch ? moveTimesMatch[0] : '', '');

        const parts = remainingDecompressed.split(';');
        const result = {
            solutions: parts[0] || -1,
            times: parts[1] || -1,
            moves: parts[2] || -1,
            tps: parts[3] || -1,
            bld_times: parts[4] || -1,
            move_times: moveTimes,
        };
        
        return result;
    } catch (error) {
        return -1;
    }
}

function generateRelaySizes(maxWidth, maxHeight) {
    const sizes = [];

    const minSize = Math.min(maxWidth, maxHeight);

    for (let size = minSize; size >= 2; size--) {
        sizes.push({ width: size, height: size });
    }

    return sizes;
}

function generateHeightSizes(width, maxHeight) {
    const sizes = [];

    for (let height = maxHeight; height >= 2; height--) {
        sizes.push({ width: width, height: height });
    }

    return sizes;
}

function generateWidthSizes(maxWidth, height) {
    const sizes = [];

    for (let width = maxWidth; width >= 2; width--) {
        sizes.push({ width: width, height: height });
    }

    return sizes;
}

function generateEUTsizes( maxWidth, maxHeight) {
    const sizes = [];

    for (let height = maxHeight; height >= 2; height--) {
        for (let width = maxWidth; width >= 2; width--) {
            sizes.push({ width: width, height: height });
        }
    }

    return sizes;
}

function handleSavedReplayWrapperDec(decompressedArray) {
    decompressedArray[6] = deserializeScoreTitle(decompressedArray[6]); // Deserialize scoreTitle at index 6
    console.log(JSON.stringify(decompressedArray));
    handleSavedReplay(...decompressedArray);
}

function handleSavedReplayWrapper(compressedString) {
    let decompressedArray = decompressStringToArray(compressedString);
    handleSavedReplayWrapperDec(decompressedArray);
}

function serializeScoreTitle(scoreTitle) {
    return scoreTitle instanceof Element ? scoreTitle.outerHTML : scoreTitle;
}

function deserializeScoreTitle(scoreTitleHtml) {
    const template = document.createElement('template');
    template.innerHTML = scoreTitleHtml.trim();
    return template.content.firstChild;
}

// Initialize clipboard copy preference
if (localStorage.getItem('clipboardCopyEnabled') === null) {
    localStorage.setItem('clipboardCopyEnabled', 'true');
}
function toggleClipboardCopy() {
    const isCopyEnabled = localStorage.getItem('clipboardCopyEnabled');
    const newState = isCopyEnabled === 'false' ? 'true' : 'false';
    localStorage.setItem('clipboardCopyEnabled', newState);
    console.log(`Clipboard copy is now ${newState === 'true' ? 'enabled' : 'disabled'}`);
    return newState === 'true';
}

function handleSavedReplay(item, solveData, event, tps, width, height, scoreTitle, videoLinkForReplay, scoreTier, isWR) {
    const link = window.location.origin + "/replay?r=" + compressArrayToString([item, solveData, event, tps, width, height, serializeScoreTitle(scoreTitle), videoLinkForReplay, scoreTier, isWR]);
    console.log(link);
    const isCopyEnabled = localStorage.getItem('clipboardCopyEnabled') === 'true';
    if (isCopyEnabled) {
        navigator.clipboard.writeText(link).then(() => {
            console.log("Link copied to clipboard");
        }).catch(err => {
            console.error("Failed to copy link: ", err);
        });
    } else {
        console.log("Clipboard copy is disabled");
    }
    const data = readSolveData(solveData);
    if (data === -1) {
        alert("Could not get data :(\nYour page is probably outdated.\nRefreshing...");
        updateServer(user_token, last_displayType, last_controlType, last_pbType);
        return;
    }

    let bld_times = [];
    if (item.gameMode === "BLD") {
        bld_times = data.bld_times.split(",");
    }
    const generate_replays = (data.solutions !== -1);
    let solution_list;
    let move_times
    if (generate_replays) {
        solution_list = data.solutions.split(",");
        move_times = data.move_times;
        if (solution_list.length === 1) {
            let scoreTitleNew = scoreTitle.cloneNode(true);
            if (item.gameMode === "BLD") {
                scoreTitleNew.insertAdjacentHTML('afterbegin', 
                    `[BLD solve] Full time: ${data.times} | Memo: [${formatTime(parseInt((bld_times[0]*1000).toFixed(3)))}]<br>`);
            }
            scoreTitleNew.insertAdjacentHTML('afterbegin', `${width}x${height} `);
            if (videoLinkForReplay !== -1){
                scoreTitleNew.addEventListener('click', function () {
                    window.open(videoLinkForReplay, '_blank');
                });
            }
            makeReplay(solution_list[0], event, tps, width, height, scoreTitleNew, -1, move_times[0]);
            return;
        }
    }

    const old_overlay = document.getElementById('solve_data_overlay');
    if (old_overlay) {
        old_overlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = "solve_data_overlay";
    overlay.style.position = 'fixed';
    overlay.style.top = '250px';
    overlay.style.left = '100px';
    overlay.style.width = 'auto';
    overlay.style.fontSize = "16px";
    overlay.style.maxHeight = '50%';
    overlay.style.overflowY = 'auto';
    overlay.style.backgroundColor = 'rgba(11,11,11,0.95)';
    overlay.style.color = '#fff';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '8px';
    overlay.style.boxShadow = '0 4px 4px rgba(0, 0, 0, 0.2), 0 0 5px cyan'; // Add neon glow effect
    overlay.style.zIndex = '1000';
    // Custom scrollbar styles
    overlay.style.scrollbarWidth = 'thin'; // For Firefox
    overlay.style.scrollbarColor = '#444 #222'; // For Firefox
    
    // Add a style tag for WebKit browsers
    const style = document.createElement('style');
    style.textContent = `
      #solve_data_overlay::-webkit-scrollbar {
        width: 8px;
      }
      #solve_data_overlay::-webkit-scrollbar-track {
        background: #222;
      }
      #solve_data_overlay::-webkit-scrollbar-thumb {
        background-color: #444;
        border-radius: 10px;
      }
      #solve_data_overlay::-webkit-scrollbar-thumb:hover {
        background-color: #666;
      }
    `;
    document.head.appendChild(style);
    
    // Create the hide icon
    const hideIcon = document.createElement('span');
    hideIcon.textContent = '▲';
    hideIcon.style.position = 'absolute';
    hideIcon.style.top = '5px';
    hideIcon.style.right = '5px';
    hideIcon.style.cursor = 'pointer';
    hideIcon.style.fontSize = '16px';
    hideIcon.onclick = () => {
        const isSmall = overlay.style.height === '30px'; 
        overlay.style.height = isSmall ? 'auto' : '30px';
        hideIcon.textContent = isSmall ? '▲' : '▼';
        overlay.classList.toggle('hidden', !isSmall);
    };
    
    // Add the hide icon to the overlay
    overlay.appendChild(hideIcon);
    document.body.appendChild(overlay);
    
    // Draggable functionality
    let isDragging = false;
    let offsetX, offsetY;
    
    const startDrag = (e) => {
        const isSmall = overlay.style.height === '30px'; // Check if overlay is small
        if (isSmall){
            isDragging = true;
            offsetX = (e.clientX || e.touches[0].clientX) - overlay.getBoundingClientRect().left;
            offsetY = (e.clientY || e.touches[0].clientY) - overlay.getBoundingClientRect().top;
            overlay.style.cursor = 'grabbing'; // Change cursor to grabbing
            document.addEventListener('touchmove', preventDefault, { passive: false });
        }
    };
    
    const drag = (e) => {
        if (isDragging) {
            overlay.style.left = `${(e.clientX || e.touches[0].clientX) - offsetX}px`;
            overlay.style.top = `${(e.clientY || e.touches[0].clientY) - offsetY}px`;
        }
    };
    
    const stopDrag = () => {
        isDragging = false;
        overlay.style.cursor = 'auto'; // Reset cursor
    
        // Enable scrolling
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventDefault);
    };
    
    // Prevent default touchmove behavior to stop scrolling
    const preventDefault = (e) => {
        e.preventDefault();
    };
    
    overlay.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    overlay.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);
    
    const styleScroll = document.createElement('style');
    styleScroll.textContent = `
      #solve_data_overlay.hidden {
        overflow-y: hidden !important; // Disable scrolling
      }
    `;
    document.head.appendChild(styleScroll);
    
    
    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = '#black';
    closeButton.style.border = 'none';
    closeButton.style.padding = '5px 10px';
    closeButton.style.marginBottom = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.borderRadius = '4px';
    closeButton.style.boxShadow = "none";
    closeButton.onclick = () => {
        closeReplay();
        const old_overlay = document.getElementById('solve_data_overlay');
        if (old_overlay) {
            old_overlay.remove();
        }
    }
    // Create an "Auto Play" button
    const autoPlayButton = document.createElement('button');
    autoPlayButton.innerText = 'Auto Play';
    autoPlayButton.style.backgroundColor = '#111';
    autoPlayButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2), 0 0 5px cyan';
    autoPlayButton.style.color = 'white';
    autoPlayButton.style.border = 'none';
    autoPlayButton.style.padding = '5px 10px';
    autoPlayButton.style.marginBottom = '10px';
    autoPlayButton.style.cursor = 'pointer';
    autoPlayButton.style.borderRadius = '4px';
    autoPlayButton.onclick = () => {
        autoPlay();
    };
    const times_list = data.times.split(",");
    const moves_list = data.moves.split(",");
    const tps_list = data.tps.split(",");
    let sizes_list = [];
    let isRelay = false;
    const sizeGenerators = {
        "2-N relay": generateRelaySizes,
        "Everything-up-to relay": generateEUTsizes,
        "Height relay": generateHeightSizes,
        "Width relay": generateWidthSizes,
    };
    if (sizeGenerators[item.gameMode] && item.avglen === 1) {
        sizes_list = sizeGenerators[item.gameMode](width, height);
        isRelay = true;
    }

    const non_standard_type = (isRelay || item.gameMode.includes("Marathon"));
    let movesFormatted;
    if (item.avglen > 1){
        movesFormatted = (item.moves/1000).toFixed(3);
    } else{
        movesFormatted = (item.moves/1000).toFixed(0);
    }
    const linesContainer = document.createElement('div');
    const numItems = times_list.length;
    let avgText = "";
    if (item.avglen > 1){
        avgText = ` ao${item.avglen}`;
    }
    const gameModeNormal = item.gameMode.replace("Everything-up-to relay", "EUT relay");
    const scoreName = `${width}x${height} ${gameModeNormal} ${(formatTime(item.time))} (${movesFormatted} / ${(item.tps/1000).toFixed(3)})${avgText}`;
    const header = document.createElement('div');

    header.innerHTML = `${scoreTitle.innerHTML}<br>${width}x${height} ${gameModeNormal}<br>${(formatTime(item.time))} (${movesFormatted} / ${(item.tps/1000).toFixed(3)})${avgText}`;
    
    if (!generate_replays) {
        header.innerHTML += "<br>{Solutions not available}";
    }
   header.classList.add(scoreTier);
   if (isWR) {
    header.classList.add("WRPB");
   }
    if (videoLinkForReplay !== -1 && !generate_replays){
        header.addEventListener('click', function () {
            window.open(videoLinkForReplay, '_blank');
        });
    } else {
        header.innerHTML = header.innerHTML.replace(/<img[^>]*>/g, ''); 
    }
    let selectedLineID = 0;
    linesContainer.appendChild(header);
    linesContainer.appendChild(document.createElement("br"));
    let cummulitive_data_list = [{"time": 0, "moves": 0}];
    for (let i = 0; i < numItems; i++) {
        const line = document.createElement('div');
        line.style.marginBottom = '5px';
        line.style.cursor = generate_replays ? 'pointer' : 'default';
        let text = "";
        let id = `#${i + 1} `;
        if (isRelay) {
            id = `${sizes_list[i].width}x${sizes_list[i].height}`
        }
        text += `${id}&emsp;${formatTime(parseInt((times_list[i]*1000).toFixed(3)))} (${moves_list[i]} / ${tps_list[i]})`;
        if (item.gameMode === "BLD") {
            text += `<br>Memo: [${formatTime(parseInt((bld_times[i]*1000).toFixed(3)))}]`;
        }
        line.innerHTML = text;
        const scoreTitleNew = scoreTitle.cloneNode(true);
        scoreTitleNew.appendChild(document.createElement('br'));
        let solveText = document.createTextNode(`${id} solve of ${scoreName}`);
        scoreTitleNew.appendChild(solveText);
        if (item.gameMode === "BLD") {
            scoreTitleNew.insertAdjacentHTML('afterbegin', 
                `Full time: ${formatTime(parseInt((times_list[i]*1000).toFixed(3)))} | Memo: [${formatTime(parseInt((bld_times[i]*1000).toFixed(3)))}]<br>`);
        }
        if (videoLinkForReplay !== -1){
            scoreTitleNew.addEventListener('click', function () {
                window.open(videoLinkForReplay, '_blank');
            });
        }
        
        
        if (generate_replays) {
            let replWidth = width;
            let replHeight = height;
            if (isRelay){
                replWidth = sizes_list[i].width;
                replHeight = sizes_list[i].height;
            }
            line.onclick = () => {
                selectedLineID = i;
                const displaySettingsRemember = (popupContainerSettings.style.display === "block");
                const allLinesElements = linesContainer.querySelectorAll('div');
                allLinesElements.forEach((l) => {
                    l.style.backgroundColor = '';
                });

                makeReplay(solution_list[i], event, tps_list[i] * 1000, replWidth, replHeight, scoreTitleNew, -1, move_times[i], cummulitive_data_list[i], true);
                if(displaySettingsRemember){
                    toggleSettingsVisibility();
                }
                line.style.backgroundColor = "#444";
            };
            //initial replay
            if (i === 0 ){
                makeReplay(solution_list[0], event, tps_list[0] * 1000, replWidth, replHeight, scoreTitleNew, -1, move_times[0],  cummulitive_data_list[i], true);
                line.style.backgroundColor = "#444";
            }
            if (non_standard_type){
                const newtime = cummulitive_data_list[i].time + parseInt(times_list[i]*1000);
                const newmoves = cummulitive_data_list[i].moves + parseInt(moves_list[i]);
                cummulitive_data_list.push({"time": newtime, "moves": newmoves}); 
            } else{
                cummulitive_data_list.push({"time": 0, "moves": 0});
            }
        }

        linesContainer.appendChild(line);
    }
    overlay.appendChild(closeButton);
    if (generate_replays){
        overlay.appendChild(autoPlayButton);
    }
    overlay.appendChild(linesContainer);
    
    document.body.appendChild(overlay);
    const allLines = Array.from(linesContainer.querySelectorAll('div')).slice(1);
    let pause_end = 5;
    let pause_start = 10;
    if(item.avglen > 1){
        pause_end = 250;
        pause_start = 500;
    }
    if (item.gameMode === "BLD"){
        pause_start = 5;
    }

    let forceStop = false; // Define forceStop as a global variable outside the function.
    let manualStop = false;
    function autoPlay() {
        let currentIndex = selectedLineID;
        let intervalId;
    
        // If the autoplay is already running, set forceStop to true and stop it.
        if (autoPlayButton && autoPlayButton.textContent === "Autoplay is running") {
            manualStop = true;
            forceStop = true;
            stopAutoPlay();
            return;
        }
        if (currentIndex === (allLines.length - 1)){
            currentIndex = 0; //start over
        }
        // Reset forceStop for a new run
        forceStop = false;
    
        // Set button text during autoplay without disabling it.
        if (autoPlayButton) {
            autoPlayButton.textContent = "Autoplay is running";
        }
    
        function initialClick() {
            if (forceStop) return;
            allLines[currentIndex].click();
            const playButton = document.querySelector('.play-button');
            if (playButton) {
                setTimeout(() => {
                    if (forceStop) {
                        console.log("Force stop before first click.");
                        clearInterval(intervalId);
                        intervalId = null;
                        return;
                    }
                    playButton.click();
                    currentIndex++;
                    startChecking();
                }, 500); // Delays the click by 500 ms
            }  else {
                console.log("Could not find button for initial click");
                stopAutoPlay();
            }
        }
    
        function startChecking() {
            intervalId = setInterval(() => {
                if (forceStop || !document.getElementById("solve_data_overlay")) {
                    forceStop = true;
                    console.log("Force stop activated. Clearing interval.");
                    clearInterval(intervalId);
                    intervalId = null;
                    return;
                }
                if (replayStatus === "DEAD" || replayStatus === "PENDING") {
                    console.log("Replay died or paused");
                    stopAutoPlay();
                } else if (replayStatus === "FINISHED") {
                    clearInterval(intervalId);
                    handleRewind();
                }
            }, 10);
        }
    
        function handleRewind() {
            if (forceStop) {
                console.log("Force stop during rewind. Exiting.");
                stopAutoPlay();
                return;
            }
    
            if (currentIndex < allLines.length) {
                setTimeout(() => {
                    if (forceStop) {
                        console.log("Force stop before clicking line.");
                        stopAutoPlay();
                        return;
                    }
    
                    allLines[currentIndex].click();
                    currentIndex++;
                    setTimeout(() => {
                        if (forceStop) {
                            console.log("Force stop during play. Exiting.");
                            stopAutoPlay();
                            return;
                        }
    
                        const playButton = document.querySelector('.play-button');
                        if (playButton) {
                            playButton.click();
                            setTimeout(startChecking, 10); // Resume checking after clicking the play button.
                        } else {
                            console.log("Button not found");
                            stopAutoPlay();
                        }
                    }, pause_start);
                }, pause_end);
            } else {
                console.log("End autoplay if no more lines are available");
                stopAutoPlay(); // End autoplay if no more lines are available.
            }
        }
    
        function stopAutoPlay() {
            forceStop = true; // Ensure any running processes are stopped.
            clearInterval(intervalId);
            intervalId = null; // Ensure no interval remains active.
            if (autoPlayButton) {
                autoPlayButton.textContent = "Auto play";
            }
            
            console.log("Autoplay has been stopped.");
            if (manualStop){
                try{
                    allLines[currentIndex].click();
                } catch (error){
                    console.log("Couldn not recent initial replay position.");
                }
            }
        }
    
        // Start the process by clicking the play button first.
        initialClick();
    }
    
}


//"Public" function to make replay of the puzzle (event - click event on a button if there was one)
function makeReplay(solution, event = -1, tps, width = -1, height = -1, scoreTitle = "Custom", customScramble = -1, customMoveTimes = -1, cummulitive_data = -1, nodelay=false) {
    //console.log(customMoveTimes);
    let showWarning = false;
    currentWindowWidth = window.innerWidth;
    let isCustom = scoreTitle == "Custom";
    if (event !== -1 && typeof event === 'object' && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
        if (!warningWasShown){
            showWarning = true;
        }
    }
    overlay.style.display = 'flex';
    let scrambleMatrix;
    if (customScramble === -1) {
        if (width === -1 || height === -1) {
            scrambleMatrix = parseScrambleGuess(solution);
            width = scrambleMatrix[0].length;
            height = scrambleMatrix.length
        } else {
            scrambleMatrix = parseScramble(width, height, solution);
        }
    } else {
        scrambleMatrix = scrambleToPuzzle(customScramble);
        width = scrambleMatrix[0].length;
        height = scrambleMatrix.length
    }
    const cycledNumbers = getCyclesNumbers(scrambleMatrix, expandSolution(solution));
    let gridsData;
    if (!autoDetectGridsCheckbox_last) {
        gridsData = analyseGridsInitial(scrambleMatrix, expandSolution(solution), cycledNumbers);
    } else {
        gridsData = {
            "enableGridsStatus": -1,
            "width": width,
            "height": height,
            "offsetW": 0,
            "offsetH": 0
        }
    }
    let gridsStates;
    try{
        gridsStates = generateGridsStats(gridsData);
    }
    catch (error){
        gridsData = {
            "enableGridsStatus": -1,
            "width": width,
            "height": height,
            "offsetW": 0,
            "offsetH": 0
        }
        gridsStates = generateGridsStats(gridsData);
    }
    const allFringeSchemes = getAllFringeSchemes(gridsStates);
    let delay;
    if (nodelay){
        delay = 0
    } else{
        delay = 500;
    }
    renderMatrix(scrambleMatrix, allFringeSchemes, gridsStates[0], isCustom, showWarning);
    if (!constantTPSCheckbox_last) {
        animateMatrix(scoreTitle = scoreTitle, scrambleMatrix, solution, tps, allFringeSchemes, gridsStates, fasterLong = 0, firstMoveDelay = delay, customMoveTimes = customMoveTimes, cummulitive_data = cummulitive_data);
    } else {
        animateMatrix(scoreTitle = scoreTitle, scrambleMatrix, solution, tps, allFringeSchemes, gridsStates, fasterLong = 1, firstMoveDelay = delay, customMoveTimes = customMoveTimes, cummulitive_data = cummulitive_data);
    }
}

//"Public" function to check for a solvedata of a custom replay in URL as "r" parameter
function customReplayCheck() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("r")) {
        loadingDataNormally = false;
        const customReplayData = decompressStringToArray(urlParams.get("r"));
        if (customReplayData.length < 10){
            const customSolution = customReplayData[0];
            const customTPS = customReplayData[1];
            const customReplayScramble = customReplayData[2];
            const fakeTimes = customReplayData[3];
            const customReplayMatrix = scrambleToPuzzle(customReplayScramble);
            makeReplay(customSolution, -1, customTPS, customReplayMatrix[0].length, customReplayMatrix.length, "Custom", customReplayScramble, fakeTimes);
        } else {
            handleSavedReplayWrapperDec(customReplayData);
        }
    }
}


//"Public" function to generate URL based on custom replay data
function shareReplay(solution, tps, stringScramble, fakeTimes) {
    return window.location.origin + window.location.pathname + "?r=" + compressArrayToString([solution, tps, stringScramble, fakeTimes]);
}

//"Public" function to close replay (also starts loading leaderboard data for case of URL-replay)
function closeReplay() {
    overlay.style.display = 'none';
    replayStatus = "DEAD";
    solve_data_overlay = document.getElementById('solve_data_overlay');
    if (solve_data_overlay) {
        document.body.removeChild(solve_data_overlay);
    }
    
    if (typeof stopAnimationF === 'function') {
        stopAnimationF();
    }
    if (!loadingDataNormally) {
        loadingDataNormally = true;
        //loadingPlaceHolder.style.display = "flex";
       // loadCompressedJSON(leaderboardDataPath, processJSON);
       main(true);
    }
}

//_________________End of "Public" functions of this module_________________//

//_________________"Private" functions for makeReplay_________________


function getMoveTimes() {
    var userInput = prompt(moveTimesAsk);
    var numbers = userInput.split(",").map(item => parseFloat(item.trim()));
    return numbers;
}

function renderMatrix(matrix, allFringeSchemes, state, isCustom=false, showWarning=false) {
    width = matrix[0].length;
    height = matrix.length;
    const minSquareWidthPx = 32;
    if (width >= 20 ||  height >= 20 || (currentWindowWidth < 1000 && (height > 10 || width > 10 || isCustom))){
        changeOveralyStyle(mobile=true, showWarning=showWarning);
    } else {
        changeOveralyStyle(mobile=false)
    }
    popupContainer.innerHTML = '';
    for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
        const row = matrix[rowIndex];
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const number = row[colIndex];
            const square = document.createElement('div');
            square.className = 'square';
            if (width >= 20 ||  height >= 20){
                square.style.width = `${minSquareWidthPx}px`;
                square.style.height = `${minSquareWidthPx}px`;
                square.style.fontSize = `${parseInt(minSquareWidthPx/2)}px`;
            }
            else{
                if (width > 10 || height > 10) {
                    const maxSize = Math.max(width, height);
                    const calculatedSquareSize = 35 / maxSize + "vw";
                    const caclulatedFontSize = 17 / maxSize + "vw";
                    square.style.width = `max(${calculatedSquareSize}, ${minSquareWidthPx}px)`;
                    square.style.height = `max(${calculatedSquareSize}, ${minSquareWidthPx}px)`;
                    square.style.fontSize = `max(${caclulatedFontSize}, ${parseInt(minSquareWidthPx/2)}px)`;
                }
            }
            if (number !== 0) {
                square.textContent = number;
                let colorsMatrix;
                if (state.mainColors.length === 1) {
                    //apply fringe
                    boxWidth = state.mainColors[0].width;
                    boxHeight = state.mainColors[0].height;
                    offsetW = state.mainColors[0].offsetW;
                    offsetH = state.mainColors[0].offsetH;
                    const key = `${boxWidth}x${boxHeight}`;
                    colorsMatrix = allFringeSchemes[key];
                    applyColorAny(colorsMatrix, square, number, boxWidth, boxHeight, offsetW, offsetH, width);
                } else {
                    //apply grids based on type
                    state.mainColors.forEach(function (colorState) {
                        let gridsColor;
                        if (colorState.type === cTMap["grids1"]) {
                            gridsColor = redGrids;
                        }
                        if (colorState.type === cTMap["grids2"]) {
                            gridsColor = blueGrids;
                        }
                        boxWidth = colorState.width;
                        boxHeight = colorState.height;
                        offsetW = colorState.offsetW;
                        offsetH = colorState.offsetH;
                        colorsMatrix = getMonoColors(gridsColor, boxWidth, boxHeight);
                        applyColorAny(colorsMatrix, square, number, boxWidth, boxHeight, offsetW, offsetH, width);
                    });
                    state.secondaryColors.forEach(function (secondaryColor) {
                        boxWidth = secondaryColor.width;
                        boxHeight = secondaryColor.height;
                        offsetW = secondaryColor.offsetW;
                        offsetH = secondaryColor.offsetH;
                        if (secondaryColor.type === cTMap["fringe"]) {
                            const key = `${boxWidth}x${boxHeight}`;
                            colorsMatrix = allFringeSchemes[key];
                        }
                        if (secondaryColor.type === cTMap["grids1"]) {
                            colorsMatrix = getMonoColors(redGrids, boxWidth, boxHeight);
                        }
                        if (secondaryColor.type === cTMap["grids2"]) {
                            colorsMatrix = getMonoColors(blueGrids, boxWidth, boxHeight);
                        }
                        applyColorAny(colorsMatrix, square, number, boxWidth, boxHeight, offsetW, offsetH, width, secondary = true);
                    });
                }

            }
            rowElement.appendChild(square);
        }
        popupContainer.appendChild(rowElement);
    }
}

function changeOveralyStyle(mobile=true, showWarning=false){
    if (mobile){
        if(showWarning){
            warningWasShown = true;
        }
        overlay.style.position = "static";
        overlay.style.top = "0%";
        overlay.style.left = "0%";
        overlay.style.transform= "none";
        overlay.style.padding= "0%";
        overlay.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
        if (window.matchMedia("(min-width: 1280px)").matches) {
            overlay.style.position = "relative";
            overlay.style.left = "50%";
            overlay.style.transform = "translateX(-50%)";
        }
        return;
    }
    overlay.style.position = "fixed";
    overlay.style.top = "50%";
    overlay.style.left = "50%";
    overlay.style.transform= "translate(-50%, -50%)";
    overlay.style.padding= "20px";
}

function applyColorAny(colorsMatrix, square, number, width, height, offsetW, offsetH, mainWidth, secondary = false) {
    const row = Math.floor((number - offsetH * mainWidth - 1) / mainWidth);
    const col = (number - offsetW - 1) % mainWidth;
    if (row < height && col < width && row >= 0 && col >= 0) {
        if (secondary) {
            const color = colorsMatrix[row][col];
            const rectangle = document.createElement('div');
            rectangle.className = 'rectangle';
            rectangle.style.backgroundColor = color;
            square.appendChild(rectangle);
        } else {
            square.style.backgroundColor = colorsMatrix[row][col];
        }
    }
}

function animateMatrix(scoreTitle, matrix, solution, tps, allFringeSchemes, gridsStates, fasterLong = 0, firstMoveDelay = 500, customMoveTimes = -1, cummulitive_data = -1) {
    clearOptimalSolver();
    const longerFasterFactor = 2;
    let isCustomReplay = false;
    const stringScramble = puzzleToScramble(matrix);
    recOveralyContainer.style.display = "flex";
    if (solution === "") {
        recOveralyContainer.style.display = "none";
    }
    if (scoreTitle === "Custom") {
        isCustomReplay = true;
        scoreTitle = document.createElement("span");
        scoreTitle.innerHTML = `${customReplayTitleText} ${matrix[0].length}x${matrix.length} ${slidingPuzzleStringOne}`;
    }
    let k_width = fasterLong;
    let k_height = fasterLong;
    if (fasterLong === 0) {
        k_width = matrix[0].length / longerFasterFactor;
        k_height = matrix.length / longerFasterFactor;
    }
    const startingDelayMS = firstMoveDelay;
    const md = calculateManhattanDistance(matrix);
    let startTime;
    const intervalTimeMS = 1;
    if (typeof stopAnimationF === 'function') {
        stopAnimationF();
    }
    solution = expandSolution(solution);
    const repeatedLengths = getRepeatedLengths(solution);
    const solLen = solution.length;
    //const baseDelayInMS = 1000000 / tps;
    const baseDelayInMS = 1000000*solLen/(tps*(solLen-1));
    const delayForMove = baseDelayInMS * (solLen-1) / (solLen-1 - repeatedLengths.repeatedWidth - repeatedLengths.repeatedHeight + repeatedLengths.repeatedWidth / k_width + repeatedLengths.repeatedHeight / k_height);
    const shortDelayWidth = delayForMove / k_width;
    const shortDelayHeight = delayForMove / k_height;
    let delays = [delayForMove];
    let fakeTimes = [0];
    for (let moveIndex = 1; moveIndex < solLen; moveIndex++) {
        if (solution[moveIndex] === solution[moveIndex - 1]) {
            if ('DU'.includes(solution[moveIndex])) delays.push(shortDelayHeight);
            if ('RL'.includes(solution[moveIndex])) delays.push(shortDelayWidth);
        } else {
            delays.push(delayForMove);
        }
        fakeTimes[moveIndex] = fakeTimes[moveIndex - 1] + delays[moveIndex];
    }
    if (customMoveTimes !== -1){
        fakeTimes = customMoveTimes;
    }
    let index = 0;
    let animationID = null;
    let lastState = null;
    function reverseLastMove() {
        const previousMoveIndex = index - 1;
        const moveRevrsed = mapReverseMove[solution[previousMoveIndex]];
        matrix = updateMatrix(matrix, moveRevrsed);
        state = getGridsState(gridsStates, previousMoveIndex);
        if (lastState !== state) {
            renderMatrix(matrix, allFringeSchemes, state, isCustomReplay || !(popupContainerSettings.style.display === "none"), !warningWasShown);
            lastState = state;
        }
        index--;
    }
    function makeMove() {
        let move = solution[index];
        let nextIndex = index + 1;
        matrix = updateMatrix(matrix, move);
        const state = gridsStates[nextIndex - 1];
        if (state) {
            renderMatrix(matrix, allFringeSchemes, state, isCustomReplay || !(popupContainerSettings.style.display === "none"), !warningWasShown);
        }
        index = nextIndex;
        return move;
    }
    function updateAnimation() {
        const currentTime = new Date()
            .getTime();
        const elapsedTime = currentTime - startTime;
        if (tps < 1000) {
            nextMoveCounter.innerHTML = nextMoveCoutDownTextTwo;
        } else {
            nextMoveCounter.innerHTML = "";
        }

        while (elapsedTime > fakeTimes[index]) {
            rewindSlider.value = index + 1;
            makeMove();
            updateRewindSliderMoves();
            if (index === solLen) {
                renderMatrix(matrix, allFringeSchemes, gridsStates[0], isCustomReplay || !(popupContainerSettings.style.display === "none"), !warningWasShown);
                popupContainer.insertBefore(scoreHeader, popupContainer.firstChild);
                stopAnimation();
                makeReplayButton();
                break;
            }
        }
    }
    const rewindSlider = document.createElement('input');
    rewindSlider.id = 'rewindSlider';
    rewindSlider.type = 'range';
    rewindSlider.max = solLen;
    rewindSlider.value = 0;
    rewindContainer.innerHTML = '';
    popupContainerSettings.innerHTML = '';
    popupContainerCustom.innerHTML = '';
    popupContainerCustom.style.display = "none";
    const nextMoveCounter = document.createElement('div');
    nextMoveCounter.style.margin = "5px";
    nextMoveCounter.style.fontSize = "13px";
    rewindContainer.appendChild(nextMoveCounter);
    const rewindSliderMovesLabel = document.createElement('div');
    rewindSliderMovesLabel.id = 'rewindSliderMovesLabel';
    rewindSliderMovesLabel.textContent = 'Moves: 0';
    const rewindSliderMovesTable = document.createElement('table');
    rewindSliderMovesTable.id = 'rewindSliderMovesTable';
    const tableHeaders = document.createElement('tr');
    const statsHeader = document.createElement('th');
    statsHeader.textContent = statsHeaderText;
    const currentHeader = document.createElement('th');
    currentHeader.textContent = currentHeaderText;
    const allHeader = document.createElement('th');
    allHeader.textContent = allHeaderText;
    tableHeaders.appendChild(statsHeader);
    tableHeaders.appendChild(allHeader);
    tableHeaders.appendChild(currentHeader);
    const currentTPSRow = document.createElement('tr');
    const currentTPSRowLabel = document.createElement('td');
    currentTPSRowLabel.textContent = PBTypeStrings[2];
    const currentTPSValue = document.createElement('td');
    const AllTPSValue = document.createElement('td');
    const currentMovesRow = document.createElement('tr');
    const currentMovesLabel = document.createElement('td');
    currentMovesLabel.textContent = PBTypeStrings[1];
    const currentMovesValue = document.createElement('td');
    const allMovesValue = document.createElement('td');
    const currentMDRow = document.createElement('tr');
    const currentMDLabel = document.createElement('td');
    currentMDLabel.textContent = MDString;
    const currentMDValue = document.createElement('td');
    const allMDValue = document.createElement('td');
    const currentMMDRow = document.createElement('tr');
    const currentMMDLabel = document.createElement('td');
    currentMMDLabel.textContent = mmdString;
    const currentMMDValue = document.createElement('td');
    const allMMDValue = document.createElement('td');
    const timeRow = document.createElement('tr');
    const timeLabel = document.createElement('td');
    timeLabel.textContent = PBTypeStrings[0];
    const timeCurrentValue = document.createElement('td');
    const timeAllValue = document.createElement('td');
    currentTPSRow.appendChild(currentTPSRowLabel);
    currentTPSRow.appendChild(AllTPSValue);
    currentTPSRow.appendChild(currentTPSValue);
    currentMovesRow.appendChild(currentMovesLabel);
    currentMovesRow.appendChild(allMovesValue);
    currentMovesRow.appendChild(currentMovesValue);
    currentMDRow.appendChild(currentMDLabel);
    currentMDRow.appendChild(allMDValue);
    currentMDRow.appendChild(currentMDValue);
    currentMMDRow.appendChild(currentMMDLabel);
    currentMMDRow.appendChild(allMMDValue);
    currentMMDRow.appendChild(currentMMDValue);
    timeRow.appendChild(timeLabel);
    timeRow.appendChild(timeAllValue);
    timeRow.appendChild(timeCurrentValue);
    rewindSliderMovesTable.appendChild(tableHeaders);
    rewindSliderMovesTable.appendChild(currentMovesRow);
    rewindSliderMovesTable.appendChild(currentMDRow);
    rewindSliderMovesTable.appendChild(currentMMDRow);
    rewindSliderMovesTable.appendChild(currentTPSRow);
    rewindSliderMovesTable.appendChild(timeRow);
    if (solution !== "") {
        popupContainerSettings.appendChild(rewindSliderMovesTable);
        if (width > 10 && height > 10) {
            const cubicEstSpan = document.createElement('div');
            cubicEstSpan.textContent = "Cubic estimate (10x10): " + formatTime(getCubicEstimate(fakeTimes[solLen-1], width, height));
            cubicEstSpan.style.fontSize = '12px';
            cubicEstSpan.style.marginTop = '5px';
            popupContainerSettings.appendChild(cubicEstSpan);
        }
        solutionContainer = document.createElement("div");
        solutionContainer.id = "solutionContainer";
        scrambleContainer = document.createElement("div");
        popupContainerSettings.appendChild(scrambleContainer);
        popupContainerSettings.appendChild(solutionContainer);
        scrambleContainer.id = "scrambleContainer";
    }
    const originalScramble = puzzleToScramble(matrix);
    rewindContainer.appendChild(rewindSlider);
    rewindContainer.appendChild(rewindSliderMovesLabel);
    const autoDetectGridsCheckbox = document.createElement("input");
    autoDetectGridsCheckbox.type = "checkbox";
    autoDetectGridsCheckbox.id = "autoDetectGridsCheckbox";
    autoDetectGridsCheckbox.checked = autoDetectGridsCheckbox_last;
    autoDetectGridsCheckbox.addEventListener("change", function () {
        autoDetectGridsCheckbox_last = autoDetectGridsCheckbox.checked;
        if (!isCustomReplay) {
            makeReplay(solution, -1, tps, matrix[0].length, matrix.length, scoreTitle, stringScramble, customMoveTimes, cummulitive_data);
        } else {
            makeReplay(solution, -1, tps, matrix[0].length, matrix.length, "Custom", stringScramble, customMoveTimes, cummulitive_data);
        }
    });
    const autoDetectGridsCheckboxLabel = document.createElement("label");
    autoDetectGridsCheckboxLabel.textContent = forceFringeCBtext;
    autoDetectGridsCheckboxLabel.htmlFor = "autoDetectGridsCheckbox";
    //console.log(gridsStates);
    //const gridNumbers = Object.keys(gridsStates);
    const gridNumbers = Object.keys(gridsStates).filter(key => {
        const activeZone = gridsStates[key].activeZone;
        return activeZone.width+1 >= matrix[0].length / 2 && activeZone.height+1 >= matrix.length / 2;
    });
    if (gridNumbers.length > 1) {
        const girdButtonsHeader = document.createElement("h1");
        girdButtonsHeader.style.fontSize = "14px";
        girdButtonsHeader.textContent = gridsShortCutsHeader;
        girdButtonsHeader.style.backgroundColor = "#111";
        girdButtonsHeader.style.borderRadius = "10px";
        girdButtonsHeader.style.padding = "5px";
        gridNumbers.push(solLen-1);
        popupContainerSettings.appendChild(girdButtonsHeader);
        let lastGridsTime = 0;
        let lastGridsMoves = 0;
        for (const key of gridNumbers.slice(1)) {
            const button = document.createElement("button");
            let newMoves = parseInt(key, 10) + 1;
            if (customMoveTimes !== -1) {
                newTime = customMoveTimes[key];
                splitTime = newTime - lastGridsTime;
                splitMoves = newMoves - lastGridsMoves;
                button.textContent = `${formatTime(newTime)} | ${formatTime(splitTime)} (${splitMoves} / ${(splitMoves*1000/splitTime).toFixed(1)})`;
                lastGridsTime = newTime;
            } else {
                button.textContent = `${newMoves} (+${newMoves - lastGridsMoves})`;
            }
            lastGridsMoves = newMoves;
            button.style.padding = '6px';
            button.style.marginLeft = '1px';
            button.style.marginTop = 0;
            button.style.marginRight = '1px';
            button.style.display = 'inline';
            button.addEventListener("click", () => {
                rewindSlider.value = newMoves;
                manualMoving();
            });
            popupContainerSettings.appendChild(button);
            popupContainerSettings.appendChild(document.createElement("br"));
        }
        popupContainerSettings.appendChild(document.createElement("br"));
    }
    popupContainerSettings.appendChild(autoDetectGridsCheckbox);
    popupContainerSettings.appendChild(autoDetectGridsCheckboxLabel);
    const constantTPSCheckbox = document.createElement("input");
    constantTPSCheckbox.type = "checkbox";
    constantTPSCheckbox.id = "constantTPSCheckbox";
    constantTPSCheckbox.checked = constantTPSCheckbox_last;
    constantTPSCheckbox.addEventListener("change", function () {
        constantTPSCheckbox_last = constantTPSCheckbox.checked;
        if (!isCustomReplay) {
            makeReplay(solution, -1, tps, matrix[0].length, matrix.length, scoreTitle);
        } else {
            makeReplay(solution, -1, tps, matrix[0].length, matrix.length, "Custom", stringScramble);
        }
    });
    const constantTPSCheckboxLabel = document.createElement("label");
    constantTPSCheckboxLabel.textContent = constantTPSCheckboxText;
    constantTPSCheckboxLabel.htmlFor = "constantTPSCheckbox";
    //popupContainerSettings.appendChild(constantTPSCheckbox);
   // popupContainerSettings.appendChild(constantTPSCheckboxLabel);

    let moveTimesButton = document.createElement("button");
    moveTimesButton.textContent = moveTimesButtonText;
    moveTimesButton.addEventListener("click", function (event) {
        makeReplay(solution, event, tps, matrix[0].length, matrix.length, "Custom", stringScramble, customMoveTimes = getMoveTimes());
    });
    moveTimesButton.style.marginTop = "30px";
    if (customMoveTimes !== -1){
        moveTimesButton.innerHTML = moveTimesButtonTextChanged;
    }
    popupContainerSettings.appendChild(moveTimesButton);
    if (!isCustomReplay) {
        createCustomBasedOnThatButton = document.createElement("button");
        createCustomBasedOnThatButton.textContent = createCustomReplayButtonText;
        createCustomBasedOnThatButton.addEventListener("click", function (event) {
            makeReplay(solution, event, tps, matrix[0].length, matrix.length, "Custom", stringScramble, customMoveTimes);
        });
        popupContainerSettings.appendChild(createCustomBasedOnThatButton);
    } else {
        //custom replay mode
        popupContainerCustom.style.display = "block";
        const customHeader = document.createElement("div");
        customHeader.textContent = customReplaySettingsHeader;
        popupContainerCustom.appendChild(customHeader);
        customHeader.style.fontWeight = "bold";
        let newSolution;
        let newWidth = -1;
        let newHeight = -1;
        let customScramble = -1;
        let newTPS = tps;
        function changeReplay() {
            let sol = customSoltuionArea.value
            if (sol.includes("?r=")){
                const customReplayData = decompressStringToArray(new URL(sol).searchParams.get('r'));
                const customSolution = customReplayData[0];
                const customTPS = customReplayData[1];
                const customReplayScramble = customReplayData[2];
                const fakeTimes = customReplayData[3];
                const customReplayMatrix = scrambleToPuzzle(customReplayScramble);
                makeReplay(customSolution, -1, customTPS, customReplayMatrix[0].length, customReplayMatrix.length, "Custom", customReplayScramble, fakeTimes);
                return;
            } 
            newSolution = customSoltuionArea.value.replace(/[^RULD0123456789]/g, '').replace(/\s/g, '');
            let invalidScrambleState = false;
            if (customScrambleArea.value !== '') {
                const pattern = /(\d+)x(\d+)/;
                const match = customScrambleArea.value.match(pattern);
                if (match && parseInt(match[1]) >= 2 && parseInt(match[2]) >= 2) {
                    newWidth = parseInt(match[1]);
                    newHeight = parseInt(match[2]);
                } else {
                    let newCustomScrambleValue = customScrambleArea.value.replace(/\s+/g, ' ').trim();
                    if (validateScramble(newCustomScrambleValue)) {
                        customScramble = newCustomScrambleValue;
                    } else {
                        invalidScrambleState = true;
                        alert(errorInvalidScramble);
                    }
                }
            } else {
                customScramble = -1;
            }
            const typedNewTPS = parseFloat(tpsInputArea.value);
            if (!isNaN(typedNewTPS)) {
                newTPS = Math.floor(typedNewTPS * 1000);
            } else {
                alert(errorInvalidTPS);
            }
            if (newSolution.length > 0 && !invalidScrambleState) {
                try {
                    makeReplay(newSolution, -1, newTPS, newWidth, newHeight, "Custom", customScramble);
                } catch (error) {
                    if (error.message.includes("Invalid move") || error.message.includes("Unexpected move character")) {
                        alert(errorNotApplicable + error.message);
                    } else {
                        alert(errorSolutionUnexpected);
                    }
                }
            }
        }
        const customSoltuionArea = document.createElement("textarea");
        customSoltuionArea.value = compressSolution(solution);
        customSoltuionArea.classList.add("text-input");
        customSoltuionArea.style.maxWidth = "400px";
        customSoltuionArea.style.minHeight = "150px";
        customSoltuionArea.placeholder = solutioncustomPlaceholder;
        customSoltuionArea.addEventListener("change", changeReplay);
        const TPSInputSpan = document.createElement("span");
        TPSInputSpan.textContent = TPSinputPlaceholder;
        const tpsInputArea = document.createElement("input");
        tpsInputArea.classList.add("inputText");
        tpsInputArea.type = "text";
        tpsInputArea.style.width = "50px"
        tpsInputArea.placeholder = PBTypeStrings[2];
        tpsInputArea.value = tps / 1000;
        tpsInputArea.addEventListener("change", changeReplay);
        const customScrambleArea = document.createElement("textarea");
        if (solution !== "") {
            customScrambleArea.value = stringScramble;
        }
        customScrambleArea.classList.add("text-input");
        customScrambleArea.style.maxWidth = "400px";
        customScrambleArea.style.minHeight = "100px";
        customScrambleArea.style.marginTop = "30px";
        customScrambleArea.placeholder = customScramblePlaceholder;
        customScrambleArea.addEventListener("change", changeReplay);
        const shareReplayButton = document.createElement("button");
        shareReplayButton.textContent = copyReplayButtonText;
        shareReplayButton.addEventListener("click", function () {
            const shareReplayLink = shareReplay(solution, newTPS, stringScramble, customMoveTimes);
            // const shareReplayLink = `[${matrix[0].length}x${matrix.length} solve - ${replayScoreStringSpan.textContent}](${shareReplay(solution, newTPS, stringScramble, customMoveTimes)})`;
            navigator.clipboard.writeText(shareReplayLink)
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
        popupContainerCustom.appendChild(customScrambleArea);
        popupContainerCustom.appendChild(TPSInputSpan);
        popupContainerCustom.appendChild(tpsInputArea);
        popupContainerCustom.appendChild(customSoltuionArea);
        if (solution !== "") {
            popupContainerCustom.appendChild(shareReplayButton);
        }
        if (matrix.length === 4 && matrix[0].length === 4 && solution !== "") {
            let puzzleToSolve = originalScramble;
            let newFakeSize = "4x4";
            /* Does not work because not always the same... shame
            if (matrix.length !== 4 || matrix[0].length !== 4){
                puzzleToSolve = puzzleToScramble(expandMatrix(scrambleToPuzzle(originalScramble), 4, 4));
                console.log(puzzleToSolve);
                newFakeSize = `${matrix[0].length}x${matrix.length}`;
            }*/
            if (alreadyOptimalReplay) {
                alreadyOptimalReplay = false;
                const optimalSpan = document.createElement("h1");
                optimalSpan.style.fontSize = "16px";
                optimalSpan.textContent = optSolverAfterOptimalTitle;
                popupContainerCustom.appendChild(optimalSpan);
            } else {
                optimalButton = document.createElement("button");
                popupContainerCustom.appendChild(optimalButton);
                optimalButton.textContent = optSolverGetOptimal;
                optimalButton.addEventListener("click", solveOptimally);
                let solutionDelay = 3000;
                function solveOptimally() {
                    solvingScrambleState = true;
                    optimalButton.textContent = `${optSolverWait} ${(solutionDelay / 1000).toFixed(0)} ${optSolverWaitTwo}`;
                    customSoltuionArea.disabled = true;
                    customScrambleArea.disabled = true;
                    tpsInputArea.disabled = true;
                    optimalButton.disabled = true;
                    fetchOptimalSolutions(puzzleToSolve, solutionDelay)
                        .then((iframeContent) => {
                            if (solvingScrambleState) {
                                solvingScrambleState = false;
                                const solution = iframeContent[0];
                                if (solution[0] !== "\n") {
                                    if (solution !== "-1") {
                                        if (iframeContent[0].length === solLen) {
                                            optimalButton.textContent = optSolverAlreadyOpt;
                                            customSoltuionArea.disabled = false;
                                            customScrambleArea.disabled = false;
                                            tpsInputArea.disabled = false;
                                        } else {
                                            customSoltuionArea.value = iframeContent[0];
                                            customScrambleArea.value = newFakeSize;
                                            alreadyOptimalReplay = true;
                                            changeReplay();
                                        }
                                    } else {
                                        optimalButton.style.display = "none";
                                        const optimalSpan = document.createElement("h1");
                                        optimalSpan.style.fontSize = "16px";
                                        optimalSpan.textContent = optSolverTimeoutError;
                                        popupContainerCustom.appendChild(optimalSpan);
                                        customSoltuionArea.disabled = false;
                                        customScrambleArea.disabled = false;
                                        tpsInputArea.disabled = false;
                                    }
                                } else {
                                    customSoltuionArea.disabled = false;
                                    customScrambleArea.disabled = false;
                                    tpsInputArea.disabled = false;
                                    optimalButton.disabled = false;
                                    optimalButton.textContent = optSolverMoreTimeButton;
                                    solutionDelay += 6000;
                                }
                            }
                        })
                }
            }
        }
    }
    const scoreHeader = document.createElement("h2");
    scoreHeader.style.backgroundColor = "rgb(22, 22, 22)";
    scoreHeader.style.borderRadius = "15px";
    scoreHeader.style.padding = "5px";
    
    const replayScoreStringSpan = document.createElement("span");
    replayScoreStringSpan.textContent = `${formatTime(Math.round(fakeTimes[solLen - 1]))} / ${solLen} / ${(tps / 1000).toFixed(3)}`;
    scoreHeader.appendChild(replayScoreStringSpan);
    scoreHeader.appendChild(document.createElement("br"));
    scoreHeader.appendChild(scoreTitle);
    scoreHeader.appendChild(document.createElement("br"));
    
    const messageSpan = document.createElement("span");
    messageSpan.style.fontSize = "15px"; // Adjust the font size as needed
    messageSpan.style.fontWeight = "100";
    messageSpan.style.color = "rgba(255, 255, 255, 0.8)"; // Light text color
    messageSpan.style.textShadow = customMoveTimes !== -1
    ? "0 0 8px rgba(0, 255, 0, 0.8), 0 0 12px rgba(0, 255, 0, 0.6), 0 0 16px rgba(0, 255, 0, 0.4)" // Softer neon green glow
    : "0 0 8px rgba(255, 0, 0, 0.8), 0 0 12px rgba(255, 0, 0, 0.6), 0 0 16px rgba(255, 0, 0, 0.4)"; // Softer neon red glow

    // Original egg-themed phrases
    const eggEmoji = "🥚"; // Egg emoji
    const accurateMessage = `This replay is movetimes accurate!`;
    const inaccurateMessage = `This replay is NOT movetimes accurate.`;
    
    // Create span elements for the wobbling eggs
    const eggSpanAccurate = document.createElement("span");
    eggSpanAccurate.textContent = eggEmoji;
    eggSpanAccurate.style.fontSize = "15px"; // Increase the font size for wobbling eggs
    eggSpanAccurate.style.animation = 'wobble 1s infinite'; // Apply wobble animation
    eggSpanAccurate.style.display = 'inline-block'; // Make sure it's treated as a block for animation
    
    const eggSpanInaccurate = document.createElement("span");
    eggSpanInaccurate.textContent = eggEmoji;
    eggSpanInaccurate.style.fontSize = "15px"; // Increase the font size for wobbling eggs
    eggSpanInaccurate.style.animation = 'wobble 5s infinite'; // Apply wobble animation
    eggSpanInaccurate.style.display = 'inline-block'; // Make sure it's treated as a block for animation
    
    // Create the message text without the eggs
    const messageText = document.createElement("span");
    messageText.style.opacity = "0.9"
    messageText.style.fontSize = "15px"; // Adjust the font size as needed
    messageSpan.style.fontWeight = "100";
    messageText.style.color = "rgba(255, 255, 255, 0.8)"; // Light text color
    
    messageText.textContent = customMoveTimes !== -1 
        ? accurateMessage 
        : inaccurateMessage;
    
    // Create keyframes for the wobble animation
    const keyframes = `
    @keyframes wobble {
        0% { transform: rotate(0deg); }
        15% { transform: rotate(30deg); }
        30% { transform: rotate(-30deg); }
        45% { transform: rotate(30deg); }
        60% { transform: rotate(-30deg); }
        75% { transform: rotate(30deg); }
        100% { transform: rotate(0deg); }
    }
    `;
    
    // Create a style element and append the keyframes
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(keyframes));
    document.head.appendChild(style);
    
    // Append the text and wobbling eggs to the messageSpan
    messageSpan.appendChild(messageText);
    messageSpan.appendChild(customMoveTimes !== -1 ? eggSpanAccurate : eggSpanInaccurate);
    
    // Append the scoreHeader to the desired parent element
    scoreHeader.appendChild(messageSpan);
    document.body.appendChild(scoreHeader);
    
    
    
    
    

scoreHeader.appendChild(messageSpan);
    popupContainer.insertBefore(scoreHeader, popupContainer.firstChild);
    function updateRewindSliderMoves() {
        popupContainer.insertBefore(scoreHeader, popupContainer.firstChild);
        const solvedSolution = compressSolution(solution.substring(0, index));
        const restSolution = solution.substring(index);
        const formattedSolution = `<span style="color:green">${solvedSolution}</span><span style="color:gray">${restSolution}</span>`
        solutionContainer.innerHTML = formattedSolution;
        scrambleContainer.innerHTML = `<span style="color:green">${originalScramble}</span><br><span style="color:gray">${puzzleToScramble(matrix)}</span>`
        const currentMoves = rewindSlider.value;
        const movesPercentage = (currentMoves * 100 / solLen).toFixed(1) + "%";
        const allMoves = solLen;
        rewindSliderMovesLabel.textContent = `${PBTypeStrings[1]}: ${currentMoves}/${solLen} (${movesPercentage})`;
        currentMovesValue.innerHTML = `${currentMoves}<br>(${movesPercentage})`;
        const currentMD = calculateManhattanDistance(matrix);
        const solvedMD = md - currentMD;
        const solvedPercentage = (solvedMD * 100 / md).toFixed(1) + "%";
        const allMD = md;
        currentMDValue.innerHTML = `${solvedMD}<br>(${solvedPercentage})`;
        allMDValue.textContent = `${allMD}`;
        const mmd = (solvedMD <= 0) ? highStringStats : (currentMoves / solvedMD);
        const allMMD = (solLen / allMD);
        const mmdPercentage = mmd === highStringStats ? highStringStats : ((mmd * 100 / allMMD) - 100).toFixed(1) + "%";
        currentMMDValue.innerHTML = `${mmd === highStringStats ? highStringStats : mmd.toFixed(3)}<br>(${mmdPercentage})`;
        allMMDValue.textContent = `${allMMD.toFixed(3)}`;
        const allTime = formatTime(Math.round(fakeTimes[solLen-1]), false);
        timeCurrentValue.textContent = (currentMoves === "0") ? aproxValueStats + " 0.000" : `${aproxValueStats} ${formatTime(Math.round(fakeTimes[index-1]), false)}`;
        timeAllValue.textContent = allTime;
        const predictedMovecount = (mmd === highStringStats) ? "" : "(" + (mmd * md).toFixed(0) + "?)";
        allMovesValue.textContent = `${allMoves} ${predictedMovecount}`;
        let currentTPSCalculated = (currentMoves * 1000 / fakeTimes[index-1]);
        if (currentTPSCalculated > 99){
            currentTPSCalculated = ">99tps"
        } else {
            currentTPSCalculated = currentTPSCalculated.toFixed(3);
        }
        currentTPSValue.textContent = (currentMoves === "0") ? aproxValueStats + " 0.000" : `${aproxValueStats} ${currentTPSCalculated}`;
        AllTPSValue.textContent = (tps / 1000).toFixed(3);
        if (customMoveTimes !== -1){
            if (cummulitive_data === -1){
                messageText.innerHTML = `${timeCurrentValue.textContent}&emsp;(${currentMoves}&emsp;/&emsp;${currentTPSValue.textContent.replace("Infinity", "Inf.")})`;
            } else{
                let timeWithOffest;
                let movesWithOffest;
                let tpsWithOffset;
                basetime = Math.round(fakeTimes[index-1]);
                if (currentMoves === "0") {
                    if (cummulitive_data.time === 0){
                        timeWithOffest = "0.000";
                        tpsWithOffset = "0.000";
                    } else{
                        timeWithOffest = formatTime(cummulitive_data.time);
                        tpsWithOffset = (parseInt(cummulitive_data.moves)*1000 / cummulitive_data.time).toFixed(3);
                    }
                } else{
                    timeWithOffest = formatTime(basetime + cummulitive_data.time);
                    tpsWithOffset = (((parseInt(cummulitive_data.moves)+ parseInt(currentMoves))*1000 ) / (basetime +cummulitive_data.time)).toFixed(3);
                }
                
                movesWithOffest = parseInt(currentMoves) + parseInt(cummulitive_data.moves);

                messageText.innerHTML = `${timeWithOffest}&emsp;(${movesWithOffest}&emsp;/&emsp;${tpsWithOffset.replace("Infinity", "Inf.")})`;
            }
        }
    }
    rewindSlider.addEventListener('input', manualMoving);
    const animationButton = document.createElement('button');
    const settingsButton = document.createElement('button');
    settingsButton.id = "settingsButton";
    const nextMoveButton = document.createElement('button');
    const prevMoveButton = document.createElement('button');
    nextMoveButton.textContent = ">"
    prevMoveButton.textContent = "<"

    settingsButton.style.border = "0.1vh solid #fff";
    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'closeReplayButton');
    closeButton.textContent = closeReaplyText;
    closeButton.style.backgroundColor = "rgb(200, 0, 0)";
    closeButton.style.border = "0.1vh solid #000";
    closeButton.style.boxShadow = "none";
    closeButton.addEventListener('click', closeReplay);
    if (popupContainerSettings.style.display === "none") {
        settingsButton.textContent = showStatsText;
    } else {
        settingsButton.textContent = hideStatsText;
    }

    settingsButton.addEventListener('click', toggleSettingsVisibility)
    makeStopButton();
    popupContainerSettings.style.display = "none";
    settingsButton.textContent = showStatsText;
    function toggleAnimationButton() {
        if (index === solLen && animationID === null) {
            makeStartButton();
            for (let moveAmount = index; moveAmount > 0; moveAmount--) {
                reverseLastMove();
            }
            rewindSlider.value = 0;
            updateRewindSliderMoves();
            index = 0;
        } else {
            if (animationID !== null) {
                stopAnimation();
                makeStartButton();
            } else {
                resumeAnimation();
                makeStopButton();
            }
        }
    }
    function makeReplayButton() {
        replayStatus = "FINISHED";
        animationButton.textContent = replayButtonText;
        animationButton.classList.remove('pause-button');
        animationButton.classList.add('play-button');
    }
    function makeStartButton() {
        replayStatus = "PENDING";
        animationButton.textContent = playButtonText;
        animationButton.classList.remove('pause-button');
        animationButton.classList.add('play-button');
    }
    function makeStopButton() {
        replayStatus = "PLAYING";
        animationButton.textContent = pauseButtonText;
        animationButton.classList.remove('play-button');
        animationButton.classList.add('pause-button');
    }
    animationButton.addEventListener('click', toggleAnimationButton);
    nextMoveButton.addEventListener('click', function(){oneManual(1)});
    prevMoveButton.addEventListener('click', function(){oneManual(-1)});
    function oneManual(step){
        stopAnimation();
        rewindSlider.value = parseInt(rewindSlider.value) + step;
        manualMoving();
    }

    rewindContainer.appendChild(prevMoveButton);
    prevMoveButton.style.width = "150px";
    nextMoveButton.style.width = "150px";
    rewindContainer.appendChild(nextMoveButton);
    rewindContainer.appendChild(document.createElement('br'));
    rewindContainer.appendChild(animationButton);
    rewindContainer.appendChild(settingsButton);
    

    if (solution === "") {
        popupContainerSettings.style.display = "none";
        popupContainerCustom.appendChild(closeButton);
    } else {
        rewindContainer.appendChild(closeButton);
    }
    function resumeAnimation() {
        startTime = new Date().getTime();
        if (index !== 0) {
            startTime = startTime - fakeTimes[index-1]
        }
         
        animationID = setInterval(updateAnimation, intervalTimeMS);
    }
    

    function manualMoving() {
        stopAnimation();
        nextMoveCounter.innerHTML = "";
        const sliderValue = parseInt(rewindSlider.value);
        if (sliderValue === solLen) {
            lastState = gridsStates[0];
            renderMatrix(matrix, allFringeSchemes, lastState, isCustomReplay || !(popupContainerSettings.style.display === "none"), !warningWasShown);
            makeReplayButton();
        } else {
            makeStartButton();
        }
        const previousIndex = index;
        if (previousIndex < sliderValue) {
            for (let moveAmount = previousIndex; moveAmount < sliderValue; moveAmount++) {
                makeMove();
            }
        } else if (previousIndex > sliderValue) {
            for (let moveAmount = previousIndex; moveAmount > sliderValue; moveAmount--) {
                reverseLastMove();
            }
        }
        updateRewindSliderMoves();
    }
    if (solution !== "") {
        updateRewindSliderMoves();
    }
    makeStartButton();
    function stopAnimation() {
        if (animationID !== null) {
            clearInterval(animationID);
            animationID = null;
        }
    }
    stopAnimationF = stopAnimation;
    if (!(popupContainerSettings.style.display === "none")){
        changeOveralyStyle(mobile=true, showWarning=!warningWasShown);
    }
}

function updateMatrix(matrix, movetype) {
    const width = matrix[0].length;
    const height = matrix.length;
    const zeroPos = findZero(matrix, width, height);
    updateScreen(zeroPos, movetype);
    return moveMatrix(matrix, movetype, zeroPos, width, height);
}

function updateScreen(zeroPos, movetype) {
    const zeroRow = zeroPos[0];
    const zeroCol = zeroPos[1];
    const squares = document.querySelectorAll('.square');
    const square1 = squares[zeroRow * width + zeroCol];
    const square2 =
        movetype === 'R' ? squares[zeroRow * width + zeroCol - 1] :
            movetype === 'L' ? squares[zeroRow * width + zeroCol + 1] :
                movetype === 'U' ? squares[(zeroRow + 1) * width + zeroCol] :
                    movetype === 'D' ? squares[(zeroRow - 1) * width + zeroCol] :
                        null;
    if (square2) {
        [square1.style.backgroundColor, square2.style.backgroundColor] = [square2.style.backgroundColor, square1.style.backgroundColor];
        [square1.innerHTML, square2.innerHTML] = [square2.innerHTML, square1.innerHTML];
    }
}

//_________________"Private" functions for makeReplay ends_________________

function loadCustomReplay(replayData) {
    console.log("Received replay data:", replayData);
    const customReplayData = decompressStringToArray(replayData);
    if (customReplayData.length < 10){
        const customSolution = customReplayData[0];
        const customTPS = customReplayData[1];
        const customReplayScramble = customReplayData[2];
        const fakeTimes = customReplayData[3];
        const customReplayMatrix = scrambleToPuzzle(customReplayScramble);
        makeReplay(customSolution, -1, customTPS, customReplayMatrix[0].length, customReplayMatrix.length, "Custom", customReplayScramble, fakeTimes);
    } else {
        handleSavedReplayWrapperDec(customReplayData);
    }
}
