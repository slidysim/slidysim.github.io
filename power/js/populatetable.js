let powerData;
import { tiers, categories, data } from "./data.js";

const num_tiers = tiers.length;
const num_categories = categories.length;

function decompress(str){
    const pako = window.pako;
    var arr = pako.inflate(atob(str));
    var decoder = new TextDecoder();
    return decoder.decode(arr);
}

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

function best_result_tier(row){
    let best_tier = 0;
    for(let i = 3; i < row.length; i++){
      let cur_tier = result_tier(i-3, row[i]);
      if (cur_tier > best_tier) best_tier = cur_tier;
    }
    return best_tier;
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

        // tier requirements row
        for(var j=0; j<3; j++){
            const tdel = document.createElement("td");
            tdel.setAttribute("tierf", name);
            tier_req_row.appendChild(tdel);
        }

        tier_req_row.children[0].innerHTML = tier["name"].replace(/ /g, '<br>');
        tier_req_row.children[0].style.minWidth = "100px";
        tier_req_row.children[1].textContent = tier["power"];
        tier_req_row.children[2].textContent = tier["limit"];

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(tier["times"][j]);
            div.setAttribute("tierf", name);
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
            if(best_result_tier(user) < i)break; // best tier isn't high enough

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

            name_div.setAttribute("tier", tier_name);
            place_div.setAttribute("tier", tier_name);
            power_div.setAttribute("tier", tier_name);
            
            if(user[2] > tiers[i+1]["limit"]){
              power_div.setAttribute("class", "player-power power_req_reached");
              power_div.setAttribute("title", "Missing one score of the higher tier to rank up.");
            }

            tier_table.appendChild(user_row);
            user_row.appendChild(name_div);
            user_row.appendChild(place_div);
            user_row.appendChild(power_div);

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
                    div.setAttribute("tier", name);
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
        date_button.innerHTML = "Power Rankings";
    }
}
window.addEventListener('message', (event) => {
    powerData = event.data;
    var dates = Object.keys(data);
    var latest = dates[dates.length-1];
    show_results_from_date(latest);
});


