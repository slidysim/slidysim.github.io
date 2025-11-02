//Core script of the leaderboard project

/*DEPENDENCIES
dataFetching.js
replayGeneration.js
*/

async function main(bypass = false) {
    if (!bypass) {
        customReplayCheck();
    }

    if (loadingDataNormally) {
        try {
            if (archivePage) {
                await initArchive();
            }
            if (archiveDate === "LIVE") {
                // Normal live login check
                await verifyLogin();

                // Show admin link for specific users
                if (logged_in_as === "vovker" || logged_in_as === "dphdmn" || logged_in_as === "daanbe") {
                    document.getElementById("admin_link").style.display = "inline";
                }
            } else {
                // Archive mode: skip login
                user_token = "notoken";
                logged_in_as = "Archive Enjoyer";
                document.getElementById("user_logged_in").textContent = logged_in_as;
                console.log("Running in archive mode as", logged_in_as);
            }

            console.log("Updating server (initial)");
            getPowerData();

        } catch (error) {
            console.error("Error during login verification:", error);
        }
    }
}

main();
