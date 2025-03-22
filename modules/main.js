//Core script of the leaderboard project

/*DEPENDENCIES
dataFetching.js
replayGeneration.js
*/

async function main(bypass = false) {
    if (!bypass){
        customReplayCheck();
    }
    if (loadingDataNormally) {
        try {
            await verifyLogin(); // Wait for the async function to finish
            if (logged_in_as === "vovker" || logged_in_as === "dphdmn"){
               // document.getElementById("enableDebugMode").style.display = "inline";
                document.getElementById("admin_link").style.display = "inline";
            }
            console.log("Updating server (initial)");
            //updateServer(user_token, "Standard", "unique", "time");
            getPowerData();
           
        } catch (error) {
            console.error("Error during login verification:", error);
        }
    }
}
main();