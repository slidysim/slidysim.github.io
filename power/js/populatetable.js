import {FMCtiers, tiersNew, categoriesNew, tiersOld, categoriesOld, categoriesFMC, data } from "./data.js?v=1.0.126";

let powerData;
let tiers;
let categories;
let num_tiers;
let num_categories;
let oldTiers;
let userFinalTierMap;
let fmcPower;

// Egg-themed tier name mapping for MODERN rankings only
const eggTierNames = {
    'Beginner': '🥚 Fresh Egg',
    'Bronze I': '🍳 Fried I',
    'Bronze II': '🍳 Fried II',
    'Bronze III': '🍳 Fried III',
    'Silver I': '🥚 Poached I',
    'Silver II': '🥚 Poached II',
    'Silver III': '🥚 Poached III',
    'Gold I': '🍳 Scrambled I',
    'Gold II': '🍳 Scrambled II',
    'Gold III': '🍳 Scrambled III',
    'Platinum I': '🥚 Deviled I',
    'Platinum II': '🥚 Deviled II',
    'Platinum III': '🥚 Deviled III',
    'Diamond I': '🍳 Omelette I',
    'Diamond II': '🍳 Omelette II',
    'Diamond III': '🍳 Omelette III',
    'Master I': '🥚 Benedict I',
    'Master II': '🥚 Benedict II',
    'Master III': '🥚 Benedict III',
    'Grandmaster I': '🍳 Eggstraordinary I',
    'Grandmaster II': '🍳 Eggstraordinary II',
    'Grandmaster III': '🍳 Eggstraordinary III',
    'Ascended': '🐔 Egglord'
};

function format(time) {
    if (time == -1) {
        return "";
    }

    var t = time;
    var seconds = Math.floor(t / 1000);
    var millis = t % 1000;

    var result = seconds + "." + millis.toString().padStart(3, "0");
    result = result.replace(/\.?0+$/, '');
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

function getEggTierName(originalName) {
    if (!oldTiers && !fmcPower) {
        return eggTierNames[originalName] || originalName;
    }
    return originalName;
}

// Create floating eggs in random places (lightweight, no lag)
function createFloatingEggs() {
    const container = document.createElement('div');
    container.id = "floating-eggs";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    container.style.overflow = "hidden";
    document.body.appendChild(container);

    const emojis = ['🥚', '🍳', '🐔', '🥚', '🍳'];
    for (let i = 0; i < 28; i++) {
        const egg = document.createElement('div');
        egg.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        egg.style.position = "absolute";
        egg.style.fontSize = `${18 + Math.random() * 28}px`;
        egg.style.left = `${Math.random() * 100}vw`;
        egg.style.top = `${Math.random() * 120}vh`;
        egg.style.opacity = 0.4 + Math.random() * 0.25;
        egg.style.transform = `rotate(${Math.random() * 360}deg)`;
        egg.style.animation = `floatEgg ${12 + Math.random() * 18}s linear infinite`;
        egg.style.animationDelay = `-${Math.random() * 25}s`;
        container.appendChild(egg);
    }
}

function populate_table(table){
    var results_table = document.getElementById("results-table");

    while(results_table.hasChildNodes()){
        results_table.removeChild(results_table.firstChild);
    }

    var next_user = 0;

    // Sticky top header
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
    tier_events_row.children[0].textContent = "🍳 Chef 🍳";
    tier_events_row.children[0].style.minWidth = "100px";
    tier_events_row.children[1].textContent = "🥚 Rank 🥚";
    tier_events_row.children[2].textContent = "⚡ Power ⚡";

    for(var j=0; j<num_categories; j++){
        var div = document.createElement("td");
        div.innerHTML = categories[j].replace(/ /g, '<br>');
        tier_events_row.appendChild(div);
    }

    const fragment = document.createDocumentFragment();

    for(var i=num_tiers-1; i>0; i--){
        const tier = tiers[i];
        const tier_name = tier["name"].toLowerCase().replace(/ /g, "-");
        const eggName = getEggTierName(tier["name"]);

        var tier_table = document.createElement("table");
        tier_table.id = tier_name + "-table";
        fragment.appendChild(tier_table);

        var tier_head = document.createElement("thead");
        var tier_req_row = document.createElement("tr");
        tier_head.className = "table-header";
        tier_req_row.className = "req-row";
        tier_table.appendChild(tier_head);
        tier_head.appendChild(tier_req_row);

        const name = tier_name;
        let attrName = name;
        if (oldTiers) attrName += "OLD";
        
        for(var j=0; j<3; j++){
            const tdel = document.createElement("td");
            tdel.setAttribute("tierf", attrName);
            tier_req_row.appendChild(tdel);
        }

        tier_req_row.children[0].innerHTML = eggName.replace(/ /g, '<br>');
        tier_req_row.children[0].style.minWidth = "100px";
        tier_req_row.children[1].textContent = tier["power"];
        tier_req_row.children[2].textContent = tier["limit"] == 9999999 ? "∞" : tier["limit"];

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(tier["times"][j]);
            div.setAttribute("tierf", attrName);
            tier_req_row.appendChild(div);
        }

        while(true){
            const user = table[next_user];
            if (user === undefined) break;
            if(user[2] < tier["limit"] && tier["limit"]>1) break;
            if(userFinalTierMap[user[0]] != tier["name"]){
                if (tier["name"] != "Beginner") break;
            }

            var user_row = document.createElement("tr");
            var name_div = document.createElement("td");
            var place_div = document.createElement("td");
            var power_div = document.createElement("td");

            name_div.textContent = user[0];
            place_div.textContent = user[1];
            power_div.textContent = user[2];

            user_row.className = "player-row";
            name_div.className = "player";
            place_div.className = "player-place";
            power_div.className = "player-power";

            let sectionAttrName = tier_name;
            if (oldTiers) sectionAttrName += "OLD";
            name_div.setAttribute("tier", sectionAttrName);
            place_div.setAttribute("tier", sectionAttrName);
            power_div.setAttribute("tier", sectionAttrName);

            if((i !== tiers.length - 1) && (user[2] > tiers[i+1]["limit"])){
                power_div.setAttribute("class", "player-power power_req_reached");
                power_div.setAttribute("title", "🐣 READY TO HATCH! 🐣");
            }

            user_row.appendChild(name_div);
            user_row.appendChild(place_div);
            user_row.appendChild(power_div);
            
            if (oldTiers) {
                const dynamicSum = getDynamicSum(user.slice(3));
                if (dynamicSum > 303030){
                    if (dynamicSum > 500000){
                        power_div.innerHTML += `<br><span style="fontSize=10px;color:gold">${dynamicSum}</span>`;
                    } else {
                        power_div.innerHTML += `<br><span style="fontSize=10px;">${dynamicSum}</span>`;
                    }
                }
            }
            
            for(var j=0; j<num_categories; j++){
                let time = user[j+3];
                var div = document.createElement("td");
                div.textContent = format(time);
                const t = result_tier(j, time);
                if(t != -1){
                    const name = tiers[t]["name"].toLowerCase().replace(/ /g, "-");
                    let attrName = name;
                    if (oldTiers) attrName += "OLD";
                    div.setAttribute("tier", attrName);
                }
                user_row.appendChild(div);
            }
            tier_table.appendChild(user_row);
            next_user++;
        }
    }

    results_table.appendChild(fragment);
    results_table.offsetHeight;

    // ✨ RAPID LIGHTBULB FLASH on every tier requirement row
    document.querySelectorAll('.req-row').forEach(row => {
        const duration = 5 + Math.random() * 10;   // super fast 0.55s – 1.3s
        const delay = Math.random() * 1.2;
        row.style.setProperty('animation', `reqLightbulb ${duration}s ease-in-out infinite`, 'important');
        row.style.setProperty('animation-delay', `-${delay}s`, 'important');
    });
}

export function show_results_from_date(date){
    if(date in data){
        populate_table(powerData);
        var date_button = document.getElementById("date-button");
        if (oldTiers) {
            date_button.innerHTML = "Classic Power Rankings";
        } else {
            if (fmcPower){
                date_button.innerHTML = "FMC Power Rankings";
            } else {
                date_button.innerHTML = "🥚🍳🐔 EGG RANKINGS 🐔🍳🥚";
            }
        }
    }
}

window.addEventListener('message', (event) => {
    const [eventPowerData, eventOldTiers, gettingFMCPower, eventuserFinalTierMap] = event.data;
    powerData = eventPowerData;
    oldTiers = eventOldTiers;
    userFinalTierMap = eventuserFinalTierMap;
    fmcPower = gettingFMCPower;
    var dates = Object.keys(data);
    var latest = dates[dates.length-1];
    
    if (oldTiers) {
        tiers = tiersOld;
        categories = categoriesOld;
    } else {
        if (fmcPower) {
            tiers = FMCtiers;
            categories = categoriesFMC;
        } else {
            tiers = tiersNew;
            categories = categoriesNew;
        }
    }
    num_tiers = tiers.length;
    num_categories = categories.length;
    show_results_from_date(latest);
});

setTimeout(() => {
    if (!oldTiers && !fmcPower) {
        const eggStyle = document.createElement('style');
        eggStyle.textContent = `
            /* EPIC DARK MODE */
            body {
                background: linear-gradient(135deg, #0a0f1a 0%, #0c121f 100%) !important;
                color: #fff5e6 !important;
            }

            /* FIXED + FLASHY EGG TIER COLORS */
            [tier="beginner"], [tierf="beginner"] {
                background: radial-gradient(circle at 30% 20%, #fff9d9, #f0e6b8) !important;
                color: #2c2100 !important;
                box-shadow: 0 0 18px #ffeb9e !important;
                font-weight: bold !important;
            }
            [tier="bronze-iii"], [tierf="bronze-iii"],
            [tier="bronze-ii"], [tierf="bronze-ii"],
            [tier="bronze-i"], [tierf="bronze-i"] {
                background: radial-gradient(circle at 30% 20%, #ffcc66, #e89e3a) !important;
                color: #2c1f00 !important;
                box-shadow: 0 0 18px #ffbb44 !important;
            }
            [tier="silver-iii"], [tierf="silver-iii"],
            [tier="silver-ii"], [tierf="silver-ii"],
            [tier="silver-i"], [tierf="silver-i"] {
                background: radial-gradient(circle at 30% 20%, #e8f0ff, #c8d8f0) !important;
                color: #1f2a3a !important;
                box-shadow: 0 0 18px #a8c0ff !important;
            }
            [tier="gold-iii"], [tierf="gold-iii"],
            [tier="gold-ii"], [tierf="gold-ii"],
            [tier="gold-i"], [tierf="gold-i"] {
                background: radial-gradient(circle at 30% 20%, #ffeb3b, #f5c400) !important;
                color: #2c1f00 !important;
                box-shadow: 0 0 20px #ffeb3b !important;
            }
            [tier="platinum-iii"], [tierf="platinum-iii"],
            [tier="platinum-ii"], [tierf="platinum-ii"],
            [tier="platinum-i"], [tierf="platinum-i"] {
                background: radial-gradient(circle at 30% 20%, #ff8c42, #e65c1a) !important;
                color: #fff !important;
                box-shadow: 0 0 20px #ff8c42 !important;
            }
            [tier="diamond-iii"], [tierf="diamond-iii"],
            [tier="diamond-ii"], [tierf="diamond-ii"],
            [tier="diamond-i"], [tierf="diamond-i"] {
                background: radial-gradient(circle at 30% 20%, #a8f0ff, #66d4ff) !important;
                color: #002233 !important;
                box-shadow: 0 0 22px #66f0ff !important;
            }
            [tier="master-iii"], [tierf="master-iii"],
            [tier="master-ii"], [tierf="master-ii"],
            [tier="master-i"], [tierf="master-i"] {
                background: radial-gradient(circle at 30% 20%, #ffeb99, #e8c866) !important;
                color: #2c2100 !important;
                box-shadow: 0 0 22px #ffeb99 !important;
            }
            [tier="grandmaster-iii"], [tierf="grandmaster-iii"],
            [tier="grandmaster-ii"], [tierf="grandmaster-ii"],
            [tier="grandmaster-i"], [tierf="grandmaster-i"] {
                background: radial-gradient(circle at 30% 20%, #ff66aa, #ffcc22) !important;
                color: #1a0a00 !important;
                box-shadow: 0 0 25px #ff66aa, 0 0 12px #ffcc22 !important;
            }
            [tier="ascended"], [tierf="ascended"] {
                background: radial-gradient(circle at 30% 20%, #ff0077, #ffee02) !important;
                color: #0a001a !important;
                box-shadow: 0 0 60px #ff0000, 0 0 15px #fffb00 inset !important;
                font-weight: bold !important;
            }
            [tier="unranked"], [tierf="unranked"] {
                background: #2a2a2a !important;
                color: #aaa !important;
            }

            /* FLASHY HOVER */
            .player-row:hover td {
                animation: eggWobble 0.25s ease-in-out infinite !important;
                filter: brightness(1.15) !important;
                cursor: pointer !important;
            }

            /* HEADERS */
            .events-row td {
                background: #1a1f2a !important;
                color: #ffdd99 !important;
                font-weight: bold !important;
                font-size: 1.05em !important;
                text-shadow: 0 0 8px #ffcc66 !important;
            }

            .req-row td:first-child {
                font-weight: bold !important;
                font-size: 1.05em !important;
                text-shadow: 0 0 6px #ffdd88 !important;
            }

            /* ✨ RAPID LIGHTBULB FLASHING (colors automatically match each row's tier color) */
            @keyframes reqLightbulb {
                0%, 42%, 58%, 100% {
                    filter: brightness(1);
                    box-shadow: 0 0 18px currentColor;
                }
                45%, 52% {
                    filter: brightness(3.2);
                    box-shadow: 0 0 65px currentColor,
                                0 0 38px #ffffff,
                                0 0 22px #ffffaa;
                }
            }

            /* FLOATING EGG KEYFRAMES */
            @keyframes floatEgg {
                0%   { transform: translateY(0) rotate(0deg); }
                50%  { transform: translateY(-35px) rotate(12deg); }
                100% { transform: translateY(-80px) rotate(-8deg); }
            }

            @keyframes eggWobble {
                0%, 100% { transform: translateX(0) rotate(0deg); }
                25% { transform: translateX(-3px) rotate(-3deg); }
                75% { transform: translateX(3px) rotate(3deg); }
            }

            /* TOOLTIP */
            [title]:hover::after {
                content: attr(title);
                position: absolute;
                background: #ffaa44;
                color: #1a0a00;
                padding: 6px 14px;
                border-radius: 30px;
                font-size: 12px;
                font-weight: bold;
                white-space: nowrap;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                box-shadow: 0 0 15px #ffaa44;
                animation: eggWobble 0.3s ease-in-out;
                pointer-events: none;
            }
        `;
        document.head.appendChild(eggStyle);

        // Spawn the floating eggs
        createFloatingEggs();
    }
}, 100);