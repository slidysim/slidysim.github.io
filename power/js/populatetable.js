
import { tiersNew, categoriesNew, tiersOld, categoriesOld, data } from "./data.js?v=1.0.108";

let powerData;
let tiers;
let categories;
let num_tiers;
let num_categories;
let oldTiers;
let userFinalTierMap;


function format(time) {
    if (time == -1) {
        return "";
    }

    var t = time;
    var seconds = Math.floor(t / 1000);
    var millis = t % 1000;


    var result = seconds + "." + millis.toString().padStart(3, "0");
    // Remove unnecessary trailing zeros after the decimal point
    result = result.replace(/\.?0+$/, ''); // Remove trailing zeros & dot if necessary
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


function populate_table(table){
    var results_table = document.getElementById("results-table");

    // remove the previous table, if there was one
    while(results_table.hasChildNodes()){
        results_table.removeChild(results_table.firstChild);
    }
    // Insert wrapper div before results_table
    // which user do we need to add to the table next?
    var next_user = 0;

        // Categories table
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
        tier_events_row.children[0].textContent = "Name";
        tier_events_row.children[0].style.minWidth = "100px";
        tier_events_row.children[1].textContent = "Place";
        tier_events_row.children[2].textContent = "Power";
        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[j].replace(/ /g, '<br>');
            tier_events_row.appendChild(div);
        }
        

    for(var i=num_tiers-1; i>0; i--){
        const tier = tiers[i];
        const tier_name = tier["name"].toLowerCase().replace(" ","-");

        // table of all results of users in this tier
        var tier_table = document.createElement("table");
        tier_table.id = tier_name + "-table";
        results_table.appendChild(tier_table);

        // set up the header rows
        var tier_head = document.createElement("thead"); // header containing the following three rows
        var tier_req_row = document.createElement("tr"); // row containing the results required for the tier
        var tier_events_row = document.createElement("tr"); // row containing names of the categories

        tier_head.className = "table-header";
        tier_req_row.className = "req-row";
        tier_events_row.className = "events-row";
        tier_table.appendChild(tier_head);
        
        tier_events_row.style.display = 'none';
        tier_head.appendChild(tier_req_row);
        tier_head.appendChild(tier_events_row);


        // tier name row
        var tier_name_div = document.createElement("td");

        // fill up the whole width of the table (columns = username, place, power, categories)
        tier_name_div.colSpan = num_categories+3;
        tier_name_div.textContent = tier["name"];
        const name = tier["name"].toLowerCase().replace(" ","-");
        let attrName = name;
        if (oldTiers) {
            attrName += "OLD";
        }
        // tier requirements row
        for(var j=0; j<3; j++){
            const tdel = document.createElement("td");
            tdel.setAttribute("tierf", attrName);
            tier_req_row.appendChild(tdel);
        }

        tier_req_row.children[0].innerHTML = tier["name"].replace(/ /g, '<br>');
        tier_req_row.children[0].style.minWidth = "100px";
        tier_req_row.children[1].textContent = tier["power"];
        tier_req_row.children[2].textContent = tier["limit"];
        if (tier["limit"] == 9999999) {
            tier_req_row.children[2].textContent = "∞";
        }

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(tier["times"][j]);
            div.setAttribute("tierf", attrName);
            tier_req_row.appendChild(div);
        }

        // tier events row
        for(var j=0; j<3; j++){
            tier_events_row.appendChild(document.createElement("td"));
        }
        tier_events_row.children[0].textContent = "Name";
        tier_events_row.children[0].style.minWidth = "100px";
        tier_events_row.children[1].textContent = "Place";
        tier_events_row.children[2].textContent = "Power";

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[j].replace(/ /g, '<br>');
            tier_events_row.appendChild(div);
        }

        // add the users to the table
        while(true){
            const user = table[next_user];
            // if the user is undefined or the user's power is too low, stop adding new rows
            if (user === undefined) {
                break;
            }
            // if the user's power is too low, stop adding new rows
            if(user[2] < tier["limit"] || user[2] == 0){ // second condition should not matter, but i want to be sure
                break;
            }
            if(userFinalTierMap[user[0]] != tier["name"]){
                break;
            }

            // create a new row and the cells for the username, place, power
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
            let attrName = tier_name;
            if (oldTiers) {
                attrName += "OLD";
            }
            name_div.setAttribute("tier", attrName);
            place_div.setAttribute("tier", attrName);
            power_div.setAttribute("tier", attrName);

                if(user[2] > tiers[i+1]["limit"]){
                power_div.setAttribute("class", "player-power power_req_reached");
                power_div.setAttribute("title", "Missing one score of the higher tier to rank up.");
                }


            tier_table.appendChild(user_row);
            user_row.appendChild(name_div);
            user_row.appendChild(place_div);
            user_row.appendChild(power_div);
            if (oldTiers) {
                const dynamicSum = getDynamicSum(user.slice(3));
                if (dynamicSum > 10000){
                    if (dynamicSum > 500000){
                        power_div.innerHTML += `<br><span style="fontSize=10px;color:cyan">${dynamicSum}</span>`;
                    } else {
                        power_div.innerHTML += `<br><span style="fontSize=10px;">${dynamicSum}</span>`;
                    }
                }
                
            }
            // add the users results
            for(var j=0; j<num_categories; j++){
                let time = user[j+3];

                var div = document.createElement("td");
                div.textContent = format(time);

                user_row.appendChild(div);

                const t = result_tier(j, time);

                // tier is -1 if below the first rank
                if(t != -1){
                    const name = tiers[t]["name"].toLowerCase().replace(" ","-");
                    let attrName = name;
                    if (oldTiers) {
                        attrName += "OLD";
                    }
                    div.setAttribute("tier", attrName);
                }
            }

            next_user++;
        }
    }
}

export function show_results_from_date(date){
    if(date in data){
        //const str = decompress(data[date]);
        //const table = JSON.parse(str);
        //populate_table(table);
        //console.log(powerData);
        populate_table(powerData);
        // show the selected date on the button
        var date_button = document.getElementById("date-button");
        if (oldTiers) {
            date_button.innerHTML = "Classic Power Rankings";
        } else {
            date_button.innerHTML = "Eggag Power Rankings";
        }
    }
}
window.addEventListener('message', (event) => {
    const [eventPowerData, eventOldTiers, eventuserFinalTierMap] = event.data;
    //console.log(eventPowerData, eventOldTiers);
    powerData = eventPowerData;
    oldTiers = eventOldTiers;
    userFinalTierMap = eventuserFinalTierMap;
    var dates = Object.keys(data);
    var latest = dates[dates.length-1];
    
    if (oldTiers) {
        tiers = tiersOld;
        categories = categoriesOld;
    } else {
        tiers = tiersNew;
        categories = categoriesNew;
    }
    num_tiers = tiers.length;
    num_categories = categories.length;
    show_results_from_date(latest);
    
    // Egg tier replacements
const eggTiers = {
    'Beginner': 'Rotten Egg',
    'Bronze I': 'Soft-Boiled I',
    'Bronze II': 'Soft-Boiled II',
    'Bronze III': 'Soft-Boiled III',
    'Silver I': 'Hard-Boiled I',
    'Silver II': 'Hard-Boiled II',
    'Silver III': 'Hard-Boiled III',
    'Gold I': 'Scrambled I',
    'Gold II': 'Scrambled II',
    'Gold III': 'Scrambled III',
    'Platinum I': 'Sunny Side I',
    'Platinum II': 'Sunny Side II',
    'Platinum III': 'Sunny Side III',
    'Diamond I': 'Omelette I',
    'Diamond II': 'Omelette II',
    'Diamond III': 'Omelette III', // Typo kept for character :)
    'Master I': 'Poached I',
    'Master II': 'Poached II',
    'Master III': 'Poached III',
    'Grandmaster I': 'Egg I',
    'Grandmaster II': 'Egg II',
    'Grandmaster III': 'Egg III',
    'Ascended': 'Eggag'
};

// Find all tier cells by checking content
document.querySelectorAll('td').forEach(td => {
    // Get text content with spaces instead of <br>
    const text = td.innerText.replace(/\n/g, ' ').trim();
    
    // Check if this is one of our tier names
    if (eggTiers[text]) {
        // Split the replacement at the first space
        const [first, ...rest] = eggTiers[text].split(' ');
        const second = rest.join(' ');
        
        // Rebuild with <br> if needed
        td.innerHTML = first + (second ? '<br>' + second : '');
    }
});

const eggStyle = document.createElement('style');
eggStyle.textContent = `
/* Egg-themed color overrides */
[tier="ascended"], [tierf="ascended"] {
    background: linear-gradient(135deg, #ffcccc, #ff6666) !important;
    color: #330000 !important;
    text-shadow: 0 0 8px #ff9999 !important;
}

[tier="grandmaster-iii"], [tierf="grandmaster-iii"] {
    background: linear-gradient(135deg, #ffccff, #ff99ff) !important;
    color: #4d004d !important;
}

[tier="grandmaster-ii"], [tierf="grandmaster-ii"] {
    background: linear-gradient(135deg, #ffddff, #ffbbff) !important;
    color: #660066 !important;
}

[tier="grandmaster-i"], [tierf="grandmaster-i"] {
    background: linear-gradient(135deg, #ffeeff, #ffddff) !important;
    color: #800080 !important;
}

/* Master tiers - Poached egg whites */
[tier="master-iii"], [tierf="master-iii"] {
    background: linear-gradient(135deg, #ffffff, #f0f0f0) !important;
    color: #666666 !important;
    text-shadow: 0 0 5px rgba(0,0,0,0.1) !important;
}

[tier="master-ii"], [tierf="master-ii"] {
    background: linear-gradient(135deg, #f8f8f8, #e8e8e8) !important;
    color: #555555 !important;
}

[tier="master-i"], [tierf="master-i"] {
    background: linear-gradient(135deg, #f0f0f0, #e0e0e0) !important;
    color: #444444 !important;
}

/* Diamond tiers - Omelette yellows */
[tier="diamond-iii"], [tierf="diamond-iii"] {
    background: linear-gradient(135deg, #fffae6, #ffeb99) !important;
    color: #664400 !important;
}

[tier="diamond-ii"], [tierf="diamond-ii"] {
    background: linear-gradient(135deg, #fff5cc, #ffe066) !important;
    color: #663300 !important;
}

[tier="diamond-i"], [tierf="diamond-i"] {
    background: linear-gradient(135deg, #fff0b3, #ffd633) !important;
    color: #662200 !important;
}

/* Platinum tiers - Sunny side up */
[tier="platinum-iii"], [tierf="platinum-iii"] {
    background: linear-gradient(135deg, #fff5e6, #ffcc80) !important;
    color: #803300 !important;
}

[tier="platinum-ii"], [tierf="platinum-ii"] {
    background: linear-gradient(135deg, #ffebcc, #ffb84d) !important;
    color: #802600 !important;
}

[tier="platinum-i"], [tierf="platinum-i"] {
    background: linear-gradient(135deg, #ffe0b3, #ffa31a) !important;
    color: #801a00 !important;
}

/* Gold tiers - Scrambled eggs */
[tier="gold-iii"], [tierf="gold-iii"] {
    background: linear-gradient(135deg, #fff2cc, #ffdb4d) !important;
    color: #4d3800 !important;
}

[tier="gold-ii"], [tierf="gold-ii"] {
    background: linear-gradient(135deg, #ffe699, #ffcc00) !important;
    color: #4d3300 !important;
}

[tier="gold-i"], [tierf="gold-i"] {
    background: linear-gradient(135deg, #ffd966, #ffbf00) !important;
    color: #4d2e00 !important;
}

/* Silver tiers - Egg shells */
[tier="silver-iii"], [tierf="silver-iii"] {
    background: linear-gradient(135deg, #f5f5f5, #d9d9d9) !important;
    color: #333333 !important;
}

[tier="silver-ii"], [tierf="silver-ii"] {
    background: linear-gradient(135deg, #f0f0f0, #cccccc) !important;
    color: #3d3d3d !important;
}

[tier="silver-i"], [tierf="silver-i"] {
    background: linear-gradient(135deg, #ebebeb, #bfbfbf) !important;
    color: #474747 !important;
}

/* Bronze tiers - Brown eggs */
[tier="bronze-iii"], [tierf="bronze-iii"] {
    background: linear-gradient(135deg, #f2e6d9, #d9b38c) !important;
    color: #331a00 !important;
}

[tier="bronze-ii"], [tierf="bronze-ii"] {
    background: linear-gradient(135deg, #ebd9c6, #cc9966) !important;
    color: #3d1f00 !important;
}

[tier="bronze-i"], [tierf="bronze-i"] {
    background: linear-gradient(135deg, #e6ccb3, #bf8040) !important;
    color: #472300 !important;
}

/* Beginner - Rotten egg */
[tier="beginner"], [tierf="beginner"] {
    background: linear-gradient(135deg, #e6f2e6, #99cc99) !important;
    color: #003300 !important;
}

/* Unranked - Raw egg */
[tier="unranked"], [tierf="unranked"] {
    background: linear-gradient(135deg, #f9f9f9, #e6e6e6) !important;
    color: #666666 !important;
}

tr.req-row {
    opacity: 0.9 !important;
}

`;
document.head.appendChild(eggStyle);


});