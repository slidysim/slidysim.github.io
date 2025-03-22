let userFinalTierMap = {}; // Player name -> Final Tier name

function getScoreTier(time, index, tiers) {
    for (let i = tiers.length - 1; i >= 0; i--) {
        const tier = tiers[i];
        if (time <= tier.times[index]) {
            return tier;
        }
    }
    return tiers[0]; // Default Unranked
}

function calculatePlayerPower(savedPlayerScores, tiers) {
    const players = [];

    for (const player of savedPlayerScores) {
        const playerTimes = [];
        let totalPower = 0;
        let highestScoreTiers = [];

        // Calculate total power and collect each score's tier
        player.scores.forEach((score, index) => {
            const time = score.scoreInfo.time;
            if (typeof time !== 'number' || isNaN(time)) {
                playerTimes.push(-1);
                highestScoreTiers.push(tiers[0]);
            } else {
                playerTimes.push(time);
                const tier = getScoreTier(time, index, tiers);
                totalPower += tier.power;
                highestScoreTiers.push(tier);
            }
        });

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


let tiers = [{"name": "Unranked", "alias": "u", "power": 0, "limit": 0, "times": [86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999]}, {"name": "Beginner", "alias": "b", "power": 1, "limit": 1, "times": [6500, 7500, 8000, 335000, 21000, 23000, 25000, 26000, 240000, 45000, 55000, 60000, 65000, 85000, 95000, 100000, 180000, 120000, 135000, 145000, 300000, 180000, 195000, 260000, 280000, 360000, 390000, 720000, 1500000, 2820000]}, {"name": "Bronze I", "alias": "b1", "power": 5, "limit": 30, "times": [4000, 4500, 4800, 210000, 14700, 16000, 17500, 18300, 170000, 30000, 38000, 42000, 44000, 55000, 65000, 70000, 118000, 87000, 100000, 109000, 240000, 135000, 150000, 190000, 205000, 270000, 300000, 500000, 1140000, 2160000]}, {"name": "Bronze II", "alias": "b2", "power": 25, "limit": 150, "times": [3100, 3600, 3900, 170000, 10800, 12000, 14000, 14500, 130000, 22500, 29000, 32000, 34000, 45000, 54000, 58000, 94000, 70000, 82000, 90000, 190000, 110000, 125000, 160000, 175000, 220000, 240000, 420000, 930000, 1800000]}, {"name": "Bronze III", "alias": "b3", "power": 50, "limit": 400, "times": [2600, 3000, 3250, 150000, 8500, 9700, 11200, 11700, 105000, 17500, 23000, 25000, 27000, 37000, 44000, 48000, 76000, 56000, 66000, 73000, 145000, 92000, 105000, 135000, 150000, 180000, 200000, 360000, 780000, 1500000]}, {"name": "Silver I", "alias": "s1", "power": 125, "limit": 1000, "times": [2200, 2600, 2800, 133000, 7000, 8000, 9300, 9750, 88000, 14000, 19000, 21000, 23000, 31000, 36000, 40000, 65000, 49000, 58000, 64000, 125000, 80000, 91000, 120000, 132000, 157000, 172000, 310000, 680000, 1320000]}, {"name": "Silver II", "alias": "s2", "power": 250, "limit": 2500, "times": [1850, 2250, 2400, 120000, 5900, 6800, 8000, 8400, 76000, 11500, 15700, 17500, 20000, 26500, 32000, 35000, 55000, 43000, 52000, 56000, 110000, 70000, 80000, 105000, 117000, 137000, 150000, 270000, 600000, 1140000]}, {"name": "Silver III", "alias": "s3", "power": 400, "limit": 4000, "times": [1650, 2000, 2150, 110000, 5200, 6000, 7000, 7350, 68000, 10000, 14000, 15500, 17000, 23500, 29000, 31500, 50000, 39000, 47500, 51000, 101000, 63000, 73000, 96000, 107000, 124000, 137000, 240000, 545000, 1030000]}, {"name": "Gold I", "alias": "g1", "power": 555, "limit": 6666, "times": [1450, 1750, 1900, 100000, 4600, 5350, 6250, 6500, 61000, 9300, 12700, 14200, 15500, 21000, 26500, 29000, 45000, 36000, 44000, 47000, 94000, 57000, 67000, 88000, 98000, 112000, 125000, 217000, 495000, 940000]}, {"name": "Gold II", "alias": "g2", "power": 700, "limit": 10000, "times": [1300, 1600, 1720, 92000, 4100, 4850, 5700, 5950, 56000, 8400, 11700, 13000, 14200, 19000, 24000, 26500, 41000, 33500, 41000, 44000, 87000, 53000, 62000, 81000, 90000, 104000, 116000, 204000, 460000, 880000]}, {"name": "Gold III", "alias": "g3", "power": 875, "limit": 14000, "times": [1200, 1500, 1600, 86000, 3800, 4500, 5300, 5550, 52000, 7700, 10800, 12000, 13200, 17500, 22000, 24200, 38000, 31000, 38000, 41000, 81000, 49000, 58000, 75000, 84000, 98000, 110000, 192000, 435000, 830000]}, {"name": "Platinum I", "alias": "p1", "power": 1111, "limit": 18500, "times": [1100, 1400, 1500, 82000, 3500, 4200, 4950, 5150, 48500, 7100, 10000, 11000, 12300, 16000, 20600, 22500, 35500, 29000, 35500, 38000, 75000, 46000, 54000, 70000, 79000, 92000, 103000, 182000, 411000, 780000]}, {"name": "Platinum II", "alias": "p2", "power": 1400, "limit": 25000, "times": [1000, 1300, 1390, 79000, 3250, 3900, 4600, 4800, 45500, 6600, 9300, 10300, 11400, 14700, 19300, 21000, 33000, 27000, 33000, 35500, 70000, 43000, 50000, 66000, 75000, 87000, 97000, 172000, 388000, 740000]}, {"name": "Platinum III", "alias": "p3", "power": 1850, "limit": 33333, "times": [900, 1200, 1280, 76000, 3050, 3650, 4300, 4500, 42500, 6150, 8600, 9500, 10600, 13500, 18000, 19600, 31000, 25000, 30500, 33000, 66000, 40000, 47000, 62000, 71000, 82000, 91000, 163000, 367000, 700000]}, {"name": "Diamond I", "alias": "d1", "power": 2500, "limit": 50000, "times": [850, 1100, 1170, 73000, 2800, 3400, 4000, 4200, 40000, 5700, 8000, 8900, 9800, 12500, 17000, 18500, 29000, 23500, 28500, 30500, 63000, 37500, 44000, 58500, 67000, 77000, 85000, 155000, 345000, 660000]}, {"name": "Diamond II", "alias": "d2", "power": 3500, "limit": 70000, "times": [800, 1050, 1120, 70000, 2670, 3150, 3750, 3950, 37500, 5300, 7500, 8300, 9200, 11700, 16100, 17500, 27400, 22000, 27000, 29000, 60000, 35500, 41500, 55000, 63000, 73000, 81000, 147000, 330000, 630000]}, {"name": "Diamond III", "alias": "d3", "power": 5000, "limit": 100000, "times": [750, 1000, 1060, 67500, 2550, 3000, 3550, 3720, 36000, 4900, 7100, 7900, 8750, 11000, 15300, 16700, 26000, 21000, 25700, 27500, 57000, 34000, 39500, 52000, 60000, 70000, 78000, 140000, 317000, 600000]}, {"name": "Master I", "alias": "m1", "power": 6666, "limit": 140000, "times": [710, 950, 1000, 65000, 2420, 2850, 3400, 3550, 34500, 4500, 6700, 7500, 8300, 10300, 14500, 15800, 24700, 20000, 24500, 26300, 54500, 32500, 38000, 49500, 57000, 67500, 75500, 133000, 304000, 580000]}, {"name": "Master II", "alias": "m2", "power": 8500, "limit": 185000, "times": [670, 900, 950, 62500, 2300, 2730, 3250, 3400, 33000, 4200, 6350, 7150, 7900, 9700, 13700, 15000, 23500, 19000, 23500, 25300, 52000, 31200, 36500, 47000, 54000, 65000, 73000, 126000, 292000, 560000]}, {"name": "Master III", "alias": "m3", "power": 11500, "limit": 250000, "times": [640, 850, 900, 60000, 2170, 2600, 3100, 3230, 31500, 3900, 6000, 6800, 7500, 9250, 12900, 14100, 22500, 18200, 22500, 24200, 49500, 30000, 35000, 45000, 51500, 62500, 70500, 120000, 280000, 540000]}, {"name": "Grandmaster I", "alias": "gm1", "power": 16000, "limit": 360000, "times": [610, 800, 850, 57500, 2050, 2470, 2950, 3050, 30500, 3650, 5700, 6450, 7150, 8800, 12200, 13400, 21600, 17500, 21600, 23200, 47500, 28800, 33800, 43200, 49500, 60000, 68000, 115000, 270000, 520000]}, {"name": "Grandmaster II", "alias": "gm2", "power": 24000, "limit": 525000, "times": [580, 750, 800, 55500, 1950, 2350, 2820, 2920, 29500, 3400, 5400, 6100, 6800, 8400, 11600, 12800, 20700, 16700, 20800, 22300, 45700, 27600, 32600, 41500, 47500, 57500, 65500, 110000, 260000, 500000]}, {"name": "Grandmaster III", "alias": "gm3", "power": 33333, "limit": 750000, "times": [550, 700, 750, 53500, 1850, 2250, 2700, 2800, 28500, 3150, 5100, 5800, 6500, 8000, 11000, 12200, 20000, 16000, 20000, 21500, 44000, 26500, 31500, 40000, 46000, 55000, 63000, 105000, 250000, 480000]}, {"name": "Ascended", "alias": "a", "power": 50000, "limit": 1000000, "times": [480, 600, 650, 50000, 1650, 2000, 2400, 2500, 26000, 2600, 4400, 5200, 5800, 7000, 9500, 10700, 18000, 14000, 18000, 19500, 40000, 24000, 28500, 36000, 42000, 50000, 58000, 95000, 225000, 440000]}];
let tiersOld = [{"name": "Unranked", "alias": "u", "power": 0, "limit": 0, "times": [86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999, 86399999]}, { "name": "Beginner", "alias": "b", "power": 1, "limit": 1, "times": [4300, 6300, 7700, 8200, 105000, 540000, 12000, 20000, 23000, 28000, 29000, 310000, 1450000, 28500, 42000, 60000, 65000, 70000, 90000, 100000, 125000, 140000, 240000, 185000, 230000, 460000, 307000, 355000, 460000, 666000] }, { "name": "Bronze", "alias": "br", "power": 3, "limit": 10, "times": [2800, 4100, 5000, 5300, 68000, 350000, 7500, 13000, 15000, 18500, 19000, 200000, 950000, 18500, 27000, 38500, 41000, 46000, 59000, 65000, 82000, 92000, 155000, 120000, 150000, 300000, 200000, 230000, 300000, 430000] }, { "name": "Silver", "alias": "s", "power": 7, "limit": 33, "times": [1800, 2650, 3200, 3450, 44000, 230000, 5000, 8500, 10000, 12000, 12500, 130000, 625000, 12000, 17500, 25000, 26500, 30000, 38000, 42000, 53000, 60000, 100000, 78000, 98000, 195000, 130000, 150000, 195000, 280000] }, { "name": "Gold", "alias": "g", "power": 20, "limit": 100, "times": [1450, 2100, 2550, 2750, 35000, 185000, 4000, 6750, 8000, 9500, 10000, 105000, 500000, 9500, 14000, 20000, 21000, 24000, 30000, 33000, 42000, 48000, 80000, 62000, 78000, 155000, 103000, 120000, 155000, 225000] }, { "name": "Platinum", "alias": "p", "power": 50, "limit": 500, "times": [1150, 1700, 2050, 2200, 27500, 148000, 3250, 5400, 6500, 7600, 8000, 83000, 400000, 7600, 11000, 15500, 17000, 19500, 23500, 26000, 33000, 38000, 63000, 49000, 62000, 125000, 82000, 97000, 125000, 180000] }, { "name": "Diamond", "alias": "d", "power": 150, "limit": 900, "times": [1000, 1500, 1800, 1900, 24000, 130000, 2850, 4700, 5700, 6700, 7050, 73000, 350000, 6700, 9500, 13500, 15000, 17000, 20500, 22500, 29000, 33000, 55000, 43000, 54000, 110000, 72000, 85000, 110000, 155000] }, { "name": "Master", "alias": "m", "power": 400, "limit": 4000, "times": [900, 1300, 1600, 1650, 21000, 115000, 2500, 4100, 5000, 5900, 6200, 64000, 305000, 5900, 8200, 11500, 13100, 15000, 18200, 20000, 25500, 29000, 48000, 38000, 47000, 97000, 63000, 74000, 96000, 135000] }, { "name": "Grandmaster", "alias": "gm", "power": 1000, "limit": 12000, "times": [800, 1150, 1400, 1450, 18500, 100000, 2200, 3600, 4400, 5200, 5450, 56000, 270000, 5200, 7200, 10000, 11500, 13000, 16000, 17500, 22500, 25500, 42000, 33000, 41000, 85000, 55000, 65000, 84000, 120000] }, { "name": "Nova", "alias": "n", "power": 3000, "limit": 40000, "times": [700, 1000, 1250, 1300, 16500, 88000, 1900, 3200, 3850, 4550, 4800, 50000, 240000, 4600, 6300, 9000, 10400, 11500, 14000, 15500, 20000, 22500, 37000, 29000, 36000, 75000, 48000, 57000, 74000, 106000] }, { "name": "Ascended", "alias": "a", "power": 6666, "limit": 100000, "times": [620, 850, 1100, 1150, 14500, 78000, 1700, 2800, 3400, 4000, 4250, 44000, 215000, 4100, 5600, 8100, 9200, 10200, 12500, 13500, 17500, 20000, 32500, 25500, 32000, 66000, 42000, 50000, 65000, 93000] }, { "name": "Aleph", "alias": "al", "power": 8080, "limit": 208080, "times": [550, 750, 950, 1000, 13000, 70000, 1500, 2500, 3000, 3500, 3700, 38000, 185000, 3600, 5000, 7100, 8100, 9000, 11000, 12000, 15500, 17200, 28000, 22500, 28000, 57000, 38000, 45000, 57000, 81000] }, { "name": "Gamma", "alias": "ga", "power": 10101, "limit": 256000, "times": [450, 650, 850, 900, 11500, 62000, 1350, 2200, 2650, 3100, 3300, 33500, 165000, 3200, 4500, 6200, 7200, 8000, 9700, 10600, 13500, 15000, 25000, 20000, 24500, 50000, 33500, 40000, 50000, 72000] }, { "name": "Gamma+", "alias": "gp", "power": 12345, "limit": 333333, "times": [400, 550, 750, 800, 10500, 56000, 1250, 2000, 2450, 2900, 3000, 30000, 150000, 2800, 4000, 5500, 6500, 7100, 8500, 9500, 12000, 13500, 22000, 18000, 22000, 45000, 29000, 35000, 45000, 60000] }, { "name": "G++", "alias": "gpp", "power": 16384, "limit": 9999999, "times": [350, 500, 700, 750, 10000, 52000, 1150, 1800, 2300, 2800, 2900, 28000, 140000, 2500, 3500, 5000, 6000, 6500, 7500, 8500, 11000, 12500, 20000, 16500, 20000, 42000, 26000, 32000, 42000, 53000] } ];

function getPowerData(){
    loadingPower = true;
    request.displayType = "Standard";
    controlType = "unique";
    request.width = "Rankings3";
    request.height = "Rankings3";
    request.leaderboardType = "time";
    request.gameMode = "Standard";
    request.nameFilter = "";
    if(gettingOldPower){
        customRankList=[ { "id": "3x3 ao5", "width": 3, "height": 3, "avglen": 5, "gameMode": "Standard" }, { "id": "3x3 ao12", "width": 3, "height": 3, "avglen": 12, "gameMode": "Standard" }, { "id": "3x3 ao50", "width": 3, "height": 3, "avglen": 50, "gameMode": "Standard" }, { "id": "3x3 ao100", "width": 3, "height": 3, "avglen": 100, "gameMode": "Standard" }, { "id": "3x3 x10", "width": 3, "height": 3, "avglen": 1, "gameMode": "Marathon 10" }, { "id": "3x3 x42", "width": 3, "height": 3, "avglen": 1, "gameMode": "Marathon 42" }, { "id": "4x4 single", "width": 4, "height": 4, "avglen": 1, "gameMode": "Standard" }, { "id": "4x4 ao5", "width": 4, "height": 4, "avglen": 5, "gameMode": "Standard" }, { "id": "4x4 ao12", "width": 4, "height": 4, "avglen": 12, "gameMode": "Standard" }, { "id": "4x4 ao50", "width": 4, "height": 4, "avglen": 50, "gameMode": "Standard" }, { "id": "4x4 ao100", "width": 4, "height": 4, "avglen": 100, "gameMode": "Standard" }, { "id": "4x4 x10", "width": 4, "height": 4, "avglen": 1, "gameMode": "Marathon 10" }, { "id": "4x4 x42", "width": 4, "height": 4, "avglen": 1, "gameMode": "Marathon 42" }, { "id": "4x4 relay", "width": 4, "height": 4, "avglen": 1, "gameMode": "2-N relay" }, { "id": "5x5 single", "width": 5, "height": 5, "avglen": 1, "gameMode": "Standard" }, { "id": "5x5 ao5", "width": 5, "height": 5, "avglen": 5, "gameMode": "Standard" }, { "id": "5x5 ao12", "width": 5, "height": 5, "avglen": 12, "gameMode": "Standard" }, { "id": "5x5 ao50", "width": 5, "height": 5, "avglen": 50, "gameMode": "Standard" }, { "id": "5x5 relay", "width": 5, "height": 5, "avglen": 1, "gameMode": "2-N relay" }, { "id": "6x6 single", "width": 6, "height": 6, "avglen": 1, "gameMode": "Standard" }, { "id": "6x6 ao5", "width": 6, "height": 6, "avglen": 5, "gameMode": "Standard" }, { "id": "6x6 ao12", "width": 6, "height": 6, "avglen": 12, "gameMode": "Standard" }, { "id": "6x6 relay", "width": 6, "height": 6, "avglen": 1, "gameMode": "2-N relay" }, { "id": "7x7 single", "width": 7, "height": 7, "avglen": 1, "gameMode": "Standard" }, { "id": "7x7 ao5", "width": 7, "height": 7, "avglen": 5, "gameMode": "Standard" }, { "id": "7x7 relay", "width": 7, "height": 7, "avglen": 1, "gameMode": "2-N relay" }, { "id": "8x8 single", "width": 8, "height": 8, "avglen": 1, "gameMode": "Standard" }, { "id": "8x8 ao5", "width": 8, "height": 8, "avglen": 5, "gameMode": "Standard" }, { "id": "9x9 single", "width": 9, "height": 9, "avglen": 1, "gameMode": "Standard" }, { "id": "10x10 single", "width": 10, "height": 10, "avglen": 1, "gameMode": "Standard" } ];
    } else {
        customRankList=[{id:"3x3 ao12",width:3,height:3,avglen:12,gameMode:"Standard"},{id:"3x3 ao50",width:3,height:3,avglen:50,gameMode:"Standard"},{id:"3x3 ao100",width:3,height:3,avglen:100,gameMode:"Standard"},{id:"3x3 x42",width:3,height:3,avglen:1,gameMode:"Marathon 42"},{id:"4x4 ao5",width:4,height:4,avglen:5,gameMode:"Standard"},{id:"4x4 ao12",width:4,height:4,avglen:12,gameMode:"Standard"},{id:"4x4 ao50",width:4,height:4,avglen:50,gameMode:"Standard"},{id:"4x4 ao100",width:4,height:4,avglen:100,gameMode:"Standard"},{id:"4x4 x10",width:4,height:4,avglen:1,gameMode:"Marathon 10"},{id:"5x5 single",width:5,height:5,avglen:1,gameMode:"Standard"},{id:"5x5 ao5",width:5,height:5,avglen:5,gameMode:"Standard"},{id:"5x5 ao12",width:5,height:5,avglen:12,gameMode:"Standard"},{id:"5x5 ao50",width:5,height:5,avglen:50,gameMode:"Standard"},{id:"6x6 single",width:6,height:6,avglen:1,gameMode:"Standard"},{id:"6x6 ao5",width:6,height:6,avglen:5,gameMode:"Standard"},{id:"6x6 ao12",width:6,height:6,avglen:12,gameMode:"Standard"},{id:"6x6 relay",width:6,height:6,avglen:1,gameMode:"2-N relay"},{id:"7x7 single",width:7,height:7,avglen:1,gameMode:"Standard"},{id:"7x7 ao5",width:7,height:7,avglen:5,gameMode:"Standard"},{id:"7x7 ao12",width:7,height:7,avglen:12,gameMode:"Standard"},{id:"7x7 relay",width:7,height:7,avglen:1,gameMode:"2-N relay"},{id:"8x8 single",width:8,height:8,avglen:1,gameMode:"Standard"},{id:"8x8 ao5",width:8,height:8,avglen:5,gameMode:"Standard"},{id:"9x9 single",width:9,height:9,avglen:1,gameMode:"Standard"},{id:"9x9 ao5",width:9,height:9,avglen:5,gameMode:"Standard"},{id:"10x10 single",width:10,height:10,avglen:1,gameMode:"Standard"},{id:"10x10 ao5",width:10,height:10,avglen:5,gameMode:"Standard"},{id:"12x12 single",width:12,height:12,avglen:1,gameMode:"Standard"},{id:"16x16 single",width:16,height:16,avglen:1,gameMode:"Standard"},{id:"20x20 single",width:20,height:20,avglen:1,gameMode:"Standard"}];
    }
    sendMyRequest();
    
}

function loadPower() {
    let powerData;
    if(gettingOldPower){
        powerData = calculatePlayerPower(savedPlayerScores, tiersOld);
    } else {
        powerData = calculatePlayerPower(savedPlayerScores, tiers);
    }
    const contentDiv = document.getElementById('contentDiv');
    contentDiv.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.id = "power-iframe";
    iframe.src = 'power.html';
    contentDiv.insertAdjacentElement('afterend', iframe);
    iframe.onload = () => {
        //console.log(powerData);
        iframe.contentWindow.postMessage([powerData, gettingOldPower, userFinalTierMap], '*');
    }
    loadingPower = false;
}