document.documentElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.documentElement.classList.add('dropreplay');
});

document.documentElement.addEventListener('dragleave', () => {
    document.documentElement.classList.remove('dropreplay');
});
document.documentElement.addEventListener('drop', (e) => {
    e.preventDefault();
    document.documentElement.classList.remove('dropreplay');
    const files = e.dataTransfer.files;
    [...files].forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            sol=event.target.result;
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
        };
        reader.readAsText(file);
    });
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
    document.documentElement.addEventListener(eventName, (e) => e.preventDefault());
});
