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
            await initArchive(archivePage);
            console.log(latestWebArchive);
            console.log(latestLMArchive);

            // The standalone archive page is gone; we always run in "live" LB
            // mode and let the user opt into archive time-travel via the date
            // slider. archiveDate starts at "LIVE".
            archiveDate = "LIVE";
            archiveMode = "live";

            // Wire up the archive date slider (nav button + slider bar). This
            // also rebuilds the slider's date list from the freshly-loaded
            // archive lists. Safe to call even if DOM isn't ready yet because
            // archiveSlider.js checks element existence.
            if (typeof ensureArchiveSliderReady === 'function') {
                ensureArchiveSliderReady();
            }

            // Normal live login check
            await verifyLogin();

            // Show admin link for specific users
            if (logged_in_as === "vovker" || logged_in_as === "dphdmn" || logged_in_as === "daanbe") {
                document.getElementById("admin_link").style.display = "block";
            }

            console.log("Updating server (initial)");
            getPowerData();

        } catch (error) {
            console.error("Error during login verification:", error);
        }
    }
}

main();
