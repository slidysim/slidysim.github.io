const dblink = "https://slidy-lb.fly.dev";
let user_token = "";
let logged_in_as = "";

const solve_type_map = {
    "Standard": 1,
    "2-N relay": 2,
    "BLD": 3,
    "Everything-up-to relay": 4,
    "Height relay": 5,
    "Width relay": 6,
    "Marathon": 7
};

const display_type_map = {
    "Adjacent sum": 1,
    "Adjacent tiles": 2,
    "Chess": 3,
    "Fading tiles": 4,
    "Fringe minimal": 5,
    "Incremental vectors": 6,
    "Inverse permutation": 7,
    "Inverse vectors": 8,
    "Last move": 9,
    "Manhattan": 10,
    "Maximal unsolved": 11,
    "Minesweeper": 12,
    "Minimal": 13,
    "Minimal unsolved": 14,
    "RGB": 15,
    "Row minimal": 16,
    "Rows and columns": 17,
    "Standard": 18,
    "Vanish on solved": 19,
    "Vectors": 20
};

const pb_type_map = {
    "time": 1,
    "move": 2,
    "tps": 3
};

const control_type_map = {
    "keyboard": 0,
    "mouse": 1,
    "both": 2,
    "unique": 3
};

function videoLinkCheck(link) {
    if (!link) {
        return null;
    }
    if (link === -1) {
        return null;
    }
    if (link.length < 5) {
        return null;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/|.+\?v=)|youtu\.?be\/)([^&]{11})$/;

    if (!youtubeRegex.test(link)) {
        console.warn("Invalid YouTube link format:", link);
        return null;
    }

    return link;
}
async function addVideo(authToken, time, moves, timestamp, videolink) {
    videolink = videoLinkCheck(videolink);
    if (!videolink){
        return "Link is invalid, can't send this to server.";
    }
    try {
        const response = await fetch(`${dblink}/api/addVideo`, {
            method: "POST",
            headers: {
                "Authorization": authToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                time: time,
                moves: moves,
                timestamp: timestamp,
                videolink: videolink
            })
        });

        const result = await response.text();

        if (response.ok) {
            console.log(result);
            return result;
        } else {
            console.log(result);
            return result;
        }
    } catch (error) {
        console.error("Error:", error);
        return "Error: " + error.message;
    }
}

function promptForVideoLink(time, moves, timestamp) {
    const message = "Please enter the YouTube video link to add\n" +
                    "Use -1 to remove the existing video\n" +
                    "Note: Only YouTube links are accepted.\n" +
                    "Abuse of the system may result in a ban from the leaderboard.";
    const videolink = prompt(message);
    
    if (videolink) {
        addVideo(user_token, time, moves, timestamp, videolink)
            .then(result => alert(result))
            .catch(error => alert("Error: " + error));
    } else {
        alert("Video link input was cancelled.");
    }
}


function generateToken(username, password) {
    const credentials = `${username}:${password}`;
    const base64Credentials = btoa(credentials);
    return `Basic ${base64Credentials}`;
}
function getUsernameFromToken(token) {
    const base64Credentials = token.split(' ')[1];
    const decodedCredentials = atob(base64Credentials);
    const username = decodedCredentials.split(':')[0];
    return username;
}

async function getSolveData(authToken, time, moves, timestamp) {
    if (time === null){
        time = 0;
    }
    if (moves === null){
        moves = 0;
    }
    const url = `${dblink}/api/getSolveData`;
  
    const headers = {
      "Authorization": authToken,
      "Content-Type": "application/json"
    };
  
    const body = JSON.stringify({
      time: time,
      moves: moves,
      timestamp: timestamp
    });
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body
      });
  
      if (response.ok) {
        const data = await response.text();
        return data;
      } else if (response.status === 404) {
        return "-1";
      } else {
        const errorText = await response.text();
        return errorText || "Unknown error occurred";
      }
    } catch (error) {
      console.error("Error fetching solve data:", error);
      return "An error occurred while fetching solve data.";
    }
  }

async function callGetScores(auth_token, display_type_text, control_type_text, pb_type_text) {
    const display_type = display_type_map[display_type_text];
    const control_type = control_type_map[control_type_text];
    const pb_type = pb_type_map[pb_type_text];

    if (
        display_type === undefined || 
        control_type === undefined || 
        pb_type === undefined
    ) {
        throw new Error('Invalid display_type, control_type, or pb_type provided.');
    }

    try {
        const response = await getScores(auth_token, display_type, control_type, pb_type);
        const { status, userList, usermap, scores } = response;
        if (!status) {
            return -1;
        }
        const scoresParsed = scores.map(entry => ({
            width: entry["size_n"],
            height: entry["size_m"],
            leaderboardType: pb_type_text,
            controls: entry["control_type"] === 1 ? "Mouse" : "Keyboard",
            gameMode: entry["solve_type"] < 7 ? { 1: "Standard", 2: "2-N relay", 3: "BLD", 4: "Everything-up-to relay", 5: "Height relay", 6: "Width relay" }[entry["solve_type"]] : `Marathon ${entry["marathon_length"]}`,
            displayType: display_type_text,
            nameFilter: usermap[entry["userid"]] || 'Unknown',
            avglen: entry["average_type"],
            time: entry["time"],
            moves: entry["moves"],
            tps: entry["tps"],
            timestamp: entry["timestamp"],
            solve_data_available: entry["solution_available"] === 1,
            videolink: entry["videolink"]
        }));
        return { scoresParsed, userList };
    } catch (error) {
        console.error('Error calling getScores:', error);
        throw error;
    }
}


async function getScores(auth_token, display_type, control_type, pb_type) {
    const url = `${dblink}/api/getScores`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': auth_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                display_type: display_type,
                control_type: control_type,
                pb_type: pb_type
            })
        });

        if (!response.ok) {
            return {
                status: false,
                message: `Error: ${response.status} ${response.statusText}`
            };
        }

        const textData = await response.text();
        const [userMapLine, ...scoreLines] = textData.split(';').filter(line => line.trim() !== '');
        const usermap = userMapLine.split(',').reduce((map, pair) => {
            const [username, id] = pair.split(':');
            if (username && id) {
                map[id] = username;
            }
            return map;
        }, {});
        const userList = Object.values(usermap);
        const scoreFields = [
            'size_n', 'size_m', 'pb_type', 'control_type', 'userid',
            'solve_type', 'marathon_length', 'average_type', 'time',
            'moves', 'tps', 'timestamp', 'solution_available','videolink'
        ];
        const scores = scoreLines.map(line => {
            const values = line.split(',');
            const scoreObject = {};

            scoreFields.forEach((field, index) => {
                if (field === "videolink"){
                    scoreObject[field] = values[index];
                } else {
                    scoreObject[field] = parseInt(values[index]) || null;
                }
            });

            return scoreObject;
        });

        return {
            status: true,
            usermap,
            userList,
            scores
        };
    } catch (error) {
        return {
            status: false,
            message: `Request failed: ${error.message}`
        };
    }
}

function getScoresWrapper(auth_token, displayType, controlType, pbType, callback) {
    callGetScores(auth_token, displayType, controlType, pbType)
        .then((result) => {
            callback(null, result);
        })
        .catch((error) => {
            console.error("An error occurred:", error);
            callback(error, null);
        });
}

async function verifyLogin() {
    const storedToken = localStorage.getItem('user_token');
    if (storedToken) {
        const response = await fetch(`${dblink}/api/protected`, {
            method: 'GET',
            headers: {
                'Authorization': storedToken
            }
        });

        if (response.ok) {
            user_token = storedToken;
            logged_in_as = getUsernameFromToken(user_token);
            const userlinkel = document.getElementById("user_logged_in");
            userlinkel.textContent = logged_in_as;
            
            userlinkel.addEventListener("click", function () {
                try{
                    usernameInput.value = logged_in_as;
                    radioNxNWRs.checked = true;
                    changePuzzleSize("NxN WRs");
                    changeNameFilter(logged_in_as);
                } catch (error){
                    console.log(error);
                }
            });
            
            return;
        } else {
            console.log("Stored token is invalid. Proceeding to prompt for credentials.");
        }
    }

    while (true) {
        const username = prompt("Enter your username (or cancel to exit):");
        if (username === null) {
            window.location.href = '/';
            return;
        }

        const password = prompt("Enter your password:");
        if (password === null) {
            window.location.href = '/';
            return;
        }

        const token = generateToken(username, password);

        try {
            const response = await fetch(`${dblink}/api/protected`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });

            if (response.ok) {
                const message = await response.text();
                user_token = token;

                localStorage.setItem('user_token', user_token);
                console.log("Login successful. Token saved to local storage.");
                setTimeout(function() {
                    window.location.reload();
                }, 2000);
                break;
            } else if (response.status === 401) {
                alert("Login failed. Please try again.");
            } else {
                alert("An error occurred. Please try again later.");
            }
        } catch (error) {
            alert("Error: " + error.message);
        }
    }
}

async function adminApiRequest(endpoint, authToken, username) {
    const response = await fetch(`${dblink}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': authToken,
            'Content-Type': 'text/plain'
        },
        body: username
    });
    return response.text();
}

// Function to create a new user
async function createUser(authToken, username) {
    return await adminApiRequest('createUser', authToken, username);
}

// Function to retrieve a user's token
async function getToken(authToken, username) {
    return await adminApiRequest('getToken', authToken, username);
}

// Function to check user registration status
async function checkUser(authToken, username) {
    const response = await adminApiRequest('checkUser', authToken, username);
    // Parse response to handle numeric status as needed
    const status = parseInt(response);
    if (!isNaN(status)) {
        return status;
    }
    return response;
}

// Function to reset a user's password
async function resetUser(authToken, username) {
    return await adminApiRequest('resetUser', authToken, username);
}

// Function to delete a user from the database
async function deleteUser(authToken, username) {
    return await adminApiRequest('deleteUser', authToken, username);
}

// Function to delete a user's scores
async function deleteUserScores(authToken, username) {
    return await adminApiRequest('deleteScores', authToken, username);
}

function logout(){
    localStorage.setItem('user_token', "");
    window.location.reload();
}