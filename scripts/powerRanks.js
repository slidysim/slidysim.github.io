let userFinalTierMap = {}; // Player name -> Final Tier name
let powerSwitchStates = {}; // Saved switch states from power iframe

const funTiers = ['Gamma+', 'G++', "Egg"];

function getScoreTier(time, index, tiers) {
    for (let i = tiers.length - 1; i >= 0; i--) {
        const tier = tiers[i];
        if (time <= tier.times[index]) {
            return tier;
        }
    }
    return tiers[0]; // Default Unranked
}

function calculatePlayerPower(savedPlayerScores, tiers, fmc=false) {
    // dynamic power logic moved to power/js/dynamicPower.js

    const players = [];
    let isOldPower = false;

    for (const player of savedPlayerScores) {
        const playerTimes = [];
        let totalPower = 0;
        let highestScoreTiers = [];

        // Calculate total power and collect each score's tier
        player.scores.forEach((score, index) => {
            let time;
            if (fmc){
                time = score.scoreInfo.moves;
            } else {
                time = score.scoreInfo.time;
            }
            if (typeof time !== 'number' || isNaN(time)) {
                playerTimes.push(-1);
                highestScoreTiers.push(tiers[0]);
            } else {
                playerTimes.push(time);
                const tier = getScoreTier(time, index, tiers);
                let addedPower = tier.power;
                if (funTiers.includes(tier.name)){
                    addedPower = 10101;
                    isOldPower = true;
                }
                totalPower += addedPower;
                highestScoreTiers.push(tier);
            }
        });
        if (totalPower === 303030 && isOldPower) {
            totalPower = PowerCalc.getDynamicSum(playerTimes)
        }
        // Determine player's supposed tier by total power
        let supposedTierIndex = 0;
        for (let i = tiers.length - 1; i >= 0; i--) {
            if (totalPower >= tiers[i].limit) {
                supposedTierIndex = i;
                break;
            }
        }

        // Try checking tiers from supposed down to lowest
        let finalTierIndex = supposedTierIndex;
        while (finalTierIndex >= 0) {
            const currentTier = tiers[finalTierIndex];
            const hasGoodScore = highestScoreTiers.some(scoreTier =>
                tiers.indexOf(scoreTier) >= finalTierIndex
            );

            if (hasGoodScore) {
                userFinalTierMap[player.name] = currentTier.name;
                break;
            }
            finalTierIndex--; // Drop down
        }

        if (finalTierIndex < 0) {
            userFinalTierMap[player.name] = tiers[0].name;
            finalTierIndex = 0; // For sorting
        }
        // Store player info
        players.push({
            name: player.name,
            totalPower,
            times: playerTimes,
            finalTierIndex // Store tier index for sorting
        });
    }

    // Sort:
    // 1. By final tier index (descending: higher tier first)
    // 2. Within same tier, by total power (descending)
    players.sort((a, b) => {
        if (b.finalTierIndex !== a.finalTierIndex) {
            return b.finalTierIndex - a.finalTierIndex;
        }
        return b.totalPower - a.totalPower;
    });
    
        // Return formatted output (unchanged structure)
    return players.map((player, index) => [
        player.name,
        index + 1,
        player.totalPower,
        ...player.times
    ]);
}

function getPowerData(){
    loadingPower = true;
    //request.displayType = "Standard";
    //controlType = "unique";
    request.width = "Rankings3";
    request.height = "Rankings3";
    request.leaderboardType = "time";
    request.gameMode = "Standard";
    request.nameFilter = "";
    if(gettingOldPower){
        customRankList=[ { "id": "3x3 ao5", "width": 3, "height": 3, "avglen": 5, "gameMode": "Standard" }, { "id": "3x3 ao12", "width": 3, "height": 3, "avglen": 12, "gameMode": "Standard" }, { "id": "3x3 ao50", "width": 3, "height": 3, "avglen": 50, "gameMode": "Standard" }, { "id": "3x3 ao100", "width": 3, "height": 3, "avglen": 100, "gameMode": "Standard" }, { "id": "3x3 x10", "width": 3, "height": 3, "avglen": 1, "gameMode": "Marathon 10" }, { "id": "3x3 x42", "width": 3, "height": 3, "avglen": 1, "gameMode": "Marathon 42" }, { "id": "4x4 single", "width": 4, "height": 4, "avglen": 1, "gameMode": "Standard" }, { "id": "4x4 ao5", "width": 4, "height": 4, "avglen": 5, "gameMode": "Standard" }, { "id": "4x4 ao12", "width": 4, "height": 4, "avglen": 12, "gameMode": "Standard" }, { "id": "4x4 ao50", "width": 4, "height": 4, "avglen": 50, "gameMode": "Standard" }, { "id": "4x4 ao100", "width": 4, "height": 4, "avglen": 100, "gameMode": "Standard" }, { "id": "4x4 x10", "width": 4, "height": 4, "avglen": 1, "gameMode": "Marathon 10" }, { "id": "4x4 x42", "width": 4, "height": 4, "avglen": 1, "gameMode": "Marathon 42" }, { "id": "4x4 relay", "width": 4, "height": 4, "avglen": 1, "gameMode": "2-N relay" }, { "id": "5x5 single", "width": 5, "height": 5, "avglen": 1, "gameMode": "Standard" }, { "id": "5x5 ao5", "width": 5, "height": 5, "avglen": 5, "gameMode": "Standard" }, { "id": "5x5 ao12", "width": 5, "height": 5, "avglen": 12, "gameMode": "Standard" }, { "id": "5x5 ao50", "width": 5, "height": 5, "avglen": 50, "gameMode": "Standard" }, { "id": "5x5 relay", "width": 5, "height": 5, "avglen": 1, "gameMode": "2-N relay" }, { "id": "6x6 single", "width": 6, "height": 6, "avglen": 1, "gameMode": "Standard" }, { "id": "6x6 ao5", "width": 6, "height": 6, "avglen": 5, "gameMode": "Standard" }, { "id": "6x6 ao12", "width": 6, "height": 6, "avglen": 12, "gameMode": "Standard" }, { "id": "6x6 relay", "width": 6, "height": 6, "avglen": 1, "gameMode": "2-N relay" }, { "id": "7x7 single", "width": 7, "height": 7, "avglen": 1, "gameMode": "Standard" }, { "id": "7x7 ao5", "width": 7, "height": 7, "avglen": 5, "gameMode": "Standard" }, { "id": "7x7 relay", "width": 7, "height": 7, "avglen": 1, "gameMode": "2-N relay" }, { "id": "8x8 single", "width": 8, "height": 8, "avglen": 1, "gameMode": "Standard" }, { "id": "8x8 ao5", "width": 8, "height": 8, "avglen": 5, "gameMode": "Standard" }, { "id": "9x9 single", "width": 9, "height": 9, "avglen": 1, "gameMode": "Standard" }, { "id": "10x10 single", "width": 10, "height": 10, "avglen": 1, "gameMode": "Standard" } ];
    } else {
        if(gettingFMCPower){
            request.leaderboardType = "move";
            customRankList=[
                {id:"3x3 ao50",width:3,height:3,avglen:50,gameMode:"Standard"},
                {id:"3x3 ao100",width:3,height:3,avglen:100,gameMode:"Standard"},
                {id:"4x4 ao12",width:4,height:4,avglen:12,gameMode:"Standard"},
                {id:"4x4 ao50",width:4,height:4,avglen:50,gameMode:"Standard"},
                {id:"4x4 ao100",width:4,height:4,avglen:100,gameMode:"Standard"},
                {id:"5x5 ao5",width:5,height:5,avglen:5,gameMode:"Standard"},
                {id:"5x5 ao12",width:5,height:5,avglen:12,gameMode:"Standard"},
                {id:"6x6 single",width:6,height:6,avglen:1,gameMode:"Standard"},
                {id:"6x6 ao5",width:6,height:6,avglen:5,gameMode:"Standard"},
                {id:"7x7 single",width:7,height:7,avglen:1,gameMode:"Standard"},
                {id:"7x7 ao5",width:7,height:7,avglen:5,gameMode:"Standard"},
                {id:"8x8 single",width:8,height:8,avglen:1,gameMode:"Standard"},
                {id:"9x9 single",width:9,height:9,avglen:1,gameMode:"Standard"},
                {id:"10x10 single",width:10,height:10,avglen:1,gameMode:"Standard"},
                {id:"16x16 single",width:16,height:16,avglen:1,gameMode:"Standard"},
            ];

        } else {
        customRankList=[{id:"3x3 ao12",width:3,height:3,avglen:12,gameMode:"Standard"},{id:"3x3 ao50",width:3,height:3,avglen:50,gameMode:"Standard"},{id:"3x3 ao100",width:3,height:3,avglen:100,gameMode:"Standard"},{id:"3x3 x42",width:3,height:3,avglen:1,gameMode:"Marathon 42"},{id:"4x4 ao5",width:4,height:4,avglen:5,gameMode:"Standard"},{id:"4x4 ao12",width:4,height:4,avglen:12,gameMode:"Standard"},{id:"4x4 ao50",width:4,height:4,avglen:50,gameMode:"Standard"},{id:"4x4 ao100",width:4,height:4,avglen:100,gameMode:"Standard"},{id:"4x4 x10",width:4,height:4,avglen:1,gameMode:"Marathon 10"},{id:"5x5 single",width:5,height:5,avglen:1,gameMode:"Standard"},{id:"5x5 ao5",width:5,height:5,avglen:5,gameMode:"Standard"},{id:"5x5 ao12",width:5,height:5,avglen:12,gameMode:"Standard"},{id:"5x5 ao50",width:5,height:5,avglen:50,gameMode:"Standard"},{id:"6x6 single",width:6,height:6,avglen:1,gameMode:"Standard"},{id:"6x6 ao5",width:6,height:6,avglen:5,gameMode:"Standard"},{id:"6x6 ao12",width:6,height:6,avglen:12,gameMode:"Standard"},{id:"6x6 relay",width:6,height:6,avglen:1,gameMode:"2-N relay"},{id:"7x7 single",width:7,height:7,avglen:1,gameMode:"Standard"},{id:"7x7 ao5",width:7,height:7,avglen:5,gameMode:"Standard"},{id:"7x7 ao12",width:7,height:7,avglen:12,gameMode:"Standard"},{id:"7x7 relay",width:7,height:7,avglen:1,gameMode:"2-N relay"},{id:"8x8 single",width:8,height:8,avglen:1,gameMode:"Standard"},{id:"8x8 ao5",width:8,height:8,avglen:5,gameMode:"Standard"},{id:"9x9 single",width:9,height:9,avglen:1,gameMode:"Standard"},{id:"9x9 ao5",width:9,height:9,avglen:5,gameMode:"Standard"},{id:"10x10 single",width:10,height:10,avglen:1,gameMode:"Standard"},{id:"10x10 ao5",width:10,height:10,avglen:5,gameMode:"Standard"},{id:"12x12 single",width:12,height:12,avglen:1,gameMode:"Standard"},{id:"16x16 single",width:16,height:16,avglen:1,gameMode:"Standard"},{id:"20x20 single",width:20,height:20,avglen:1,gameMode:"Standard"}];
        }
    }
    sendMyRequest();
    
}

function loadPower() {
    let powerData;
    if(gettingOldPower){
        powerData = calculatePlayerPower(savedPlayerScores, tiersOld);
    } else {
        if(gettingFMCPower){
            powerData = calculatePlayerPower(savedPlayerScores, FMCtiers, fmc=true);
        } else {
            powerData = calculatePlayerPower(savedPlayerScores, tiers);
        }
    }
    const contentDiv = document.getElementById('contentDiv');
    contentDiv.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.id = "power-iframe";
    iframe.src = 'power.html';
    contentDiv.insertAdjacentElement('afterend', iframe);
    iframe.onload = () => {
        //console.log(powerData);
        iframe.contentWindow.postMessage([powerData, gettingOldPower, gettingFMCPower, userFinalTierMap, tiers, FMCtiers, tiersOld, categoriesNew, categoriesOld, categoriesFMC, powerSwitchStates], '*');
    }
    loadingPower = false;
}

window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "powerSwitchState") {
        powerSwitchStates = event.data.state;
    }
});
