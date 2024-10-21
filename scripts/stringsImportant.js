//strings/lists/maps that can't be changed for important reasons

const solveDataPath = "data/solveData.json";
const leaderboardDataPath = "data/leaderboard.json";
const optimalSolverURL = "https://dphdmn.github.io/15puzzleSolver/?scramble=";
const displayTypeOptions = [
    "Standard",
    "Minimal",
    "Row minimal",
    "Fringe minimal",
    "Inverse permutation",
    "Manhattan",
    "Vectors",
    "Incremental vectors",
    "Inverse vectors",
    "RGB",
    "Chess",
    "Adjacent tiles",
    "Adjacent sum",
    "Last move",
    "Fading tiles",
    "Vanish on solved",
    "Minesweeper",
    "Minimal unsolved",
    "Maximal unsolved",
    "Rows and columns"
];
const tierLabels = [
    "Any",
    "iota",
    "theta",
    "eta",
    "zeta",
    "epsilon",
    "delta",
    "gamma",
    "beta",
    "alpha",
    "WRs only"
];
const tierstable = [
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'zeta',
    'eta',
    'theta',
    'iota',
];
const controlTypeSelectValues = ["unique", "both", "mouse", "keyboard"];
const controlTypeSelectValuesUnique = ["unique", "mouse", "keyboard"];
const PBTypeValues = ["time", "move", "tps"];
const normalTableHeaders = ['Single', 'ao5', 'ao12', 'ao50', 'ao100'];
const squaresSheetType = "Squares";
const scoreTypes = {
    "time": 0,
    "move": 1,
    "tps": 2
}
const mapReverseMove = {
    R: 'L',
    L: 'R',
    U: 'D',
    D: 'U'
};
const cTMap = {
    'fringe': 1,
    'grids1': 2,
    'grids2': 3,
};
