//rankings that is "main", and custom ranking examples

const rankListMain = [{
    id: "3x3 ao50",
    width: 3,
    height: 3,
    avglen: 50,
    gameMode: "Standard"
},
{
    id: "3x3 ao100",
    width: 3,
    height: 3,
    avglen: 100,
    gameMode: "Standard"
},
{
    id: "3x3 x42",
    width: 3,
    height: 3,
    avglen: 1,
    gameMode: "Marathon 42"
},
{
    id: "4x4 ao12",
    width: 4,
    height: 4,
    avglen: 12,
    gameMode: "Standard"
},
{
    id: "4x4 ao50",
    width: 4,
    height: 4,
    avglen: 50,
    gameMode: "Standard"
},
{
    id: "4x4 ao100",
    width: 4,
    height: 4,
    avglen: 100,
    gameMode: "Standard"
},
{
    id: "4x4 x10",
    width: 4,
    height: 4,
    avglen: 1,
    gameMode: "Marathon 10"
},
{
    id: "5x5 ao5",
    width: 5,
    height: 5,
    avglen: 5,
    gameMode: "Standard"
},
{
    id: "5x5 ao12",
    width: 5,
    height: 5,
    avglen: 12,
    gameMode: "Standard"
},
{
    id: "5x5 ao50",
    width: 5,
    height: 5,
    avglen: 50,
    gameMode: "Standard"
},
{
    id: "6x6 single",
    width: 6,
    height: 6,
    avglen: 1,
    gameMode: "Standard"
},
{
    id: "6x6 ao5",
    width: 6,
    height: 6,
    avglen: 5,
    gameMode: "Standard"
},
{
    id: "6x6 ao12",
    width: 6,
    height: 6,
    avglen: 12,
    gameMode: "Standard"
},
{
    id: "7x7 single",
    width: 7,
    height: 7,
    avglen: 1,
    gameMode: "Standard"
},
{
    id: "7x7 ao5",
    width: 7,
    height: 7,
    avglen: 5,
    gameMode: "Standard"
},
{
    id: "7x7 relay",
    width: 7,
    height: 7,
    avglen: 1,
    gameMode: "2-N relay"
},
{
    id: "8x8 single",
    width: 8,
    height: 8,
    avglen: 1,
    gameMode: "Standard"
},
{
    id: "8x8 ao5",
    width: 8,
    height: 8,
    avglen: 5,
    gameMode: "Standard"
},
{
    id: "9x9 single",
    width: 9,
    height: 9,
    avglen: 1,
    gameMode: "Standard"
},
{
    id: "10x10 single",
    width: 10,
    height: 10,
    avglen: 1,
    gameMode: "Standard"
}
];

const customRankButtonsExamples = [
{
    "DPH 20":"3x3 ao50, 3x3 ao100, 3x3 x42, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 5x5 ao5, 5x5 ao12, 5x5 ao50, 6x6 single, 6x6 ao5, 6x6 ao12, 7x7 single, 7x7 ao5, 7x7 relay, 8x8 single, 8x8 ao5, 9x9 single, 10x10 single"
},    
{
    "MAIN 30":"3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x42, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 5x5 single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 6x6 Single, 6x6 ao5, 6x6 ao12, 6x6 relay, 7x7 Single, 7x7 ao5, 7x7 ao12, 7x7 relay, 8x8 Single, 8x8 ao5, 9x9 Single, 9x9 ao5, 10x10 Single, 10x10 ao5, 12x12 Single, 16x16 Single, 20x20 Single"
},
{
    "EXTENDED 50":"3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x10, 3x3 x42, 3x3 x100, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 4x4 x42, 4x4 Eut, 5x5 single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 ao100, 5x5 x10, 5x5 relay, 5x5 Eut, 6x6 Single, 6x6 ao5, 6x6 ao12, 6x6 ao50, 6x6 relay, 6x6 Eut, 7x7 Single, 7x7 ao5, 7x7 ao12, 7x7 ao50, 7x7 relay, 7x7 Eut, 8x8 Single, 8x8 ao5, 8x8 ao12, 9x9 Single, 9x9 ao5, 9x9 ao12, 10x10 Single, 10x10 ao5, 10x10 ao12, 10x10 relay, 11x11 Single, 12x12 Single, 13x13 Single, 14x14 Single, 15x15 Single, 16x16 Single, 20x20 Single"
},
{
    "SMALL 30":"3x3 ao5, 3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x10, 3x3 x42, 3x3 x100, 4x4 single, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 4x4 x42, 4x4 relay, 4x4 Eut, 5x5 single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 ao100, 5x5 x10, 5x5 relay, 5x5 Eut, 6x6 Single, 6x6 ao5, 6x6 ao12, 6x6 ao50, 6x6 relay, 6x6 Eut"
},
{
    "LARGE 30":"7x7 Single, 7x7 ao5, 7x7 ao12, 7x7 ao50, 7x7 ao100, 7x7 relay, 7x7 Eut, 8x8 Single, 8x8 ao5, 8x8 ao12, 8x8 ao50, 8x8 relay, 9x9 Single, 9x9 ao5, 9x9 ao12, 9x9 relay, 10x10 Single, 10x10 ao5, 10x10 ao12, 10x10 relay, 11x11 Single, 12x12 Single, 13x13 Single, 14x14 Single, 15x15 Single, 16x16 Single, 17x17 Single, 18x18 Single, 19x19 Single, 20x20 Single"
},
//{
//    "EXT. 40": "3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x42, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 4x4 x42, 5x5 Single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 ao100, 5x5 x5, 5x5 x10, 5x5 relay, 5x5 Eut, 6x6 Single, 6x6 ao5, 6x6 ao12, 6x6 relay, 7x7 Single, 7x7 ao5, 7x7 ao12, 7x7 relay, 8x8 Single, 8x8 ao5, 8x8 ao12, 8x8 relay, 9x9 Single, 9x9 ao5, 10x10 Single, 10x10 ao5, 10x10 relay, 12x12 Single, 16x16 Single, 20x20 Single, 30x30 Single"
//},
//{
//    "ADV. 69": "3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x10, 3x3 x25, 3x3 x42, 3x3 x100, 3x3 bld-ao5, 3x3 bld-ao12, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 4x4 x25, 4x4 x42, 4x4 x100, 4x4 Eut, 4x4 bld, 5x5 Single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 ao100, 5x5 x3, 5x5 x5, 5x5 x10, 5x5 relay, 5x5 Eut, 6x6 Single, 6x6 ao5, 6x6 ao12, 6x6 ao50, 6x6 ao100, 6x6 x3, 6x6 x10, 6x6 relay, 6x6 Eut, 7x7 Single, 7x7 ao5, 7x7 ao12, 7x7 ao50, 7x7 x3, 7x7 relay, 7x7 Eut, 8x8 Single, 8x8 ao5, 8x8 ao12, 8x8 x3, 8x8 relay, 9x9 Single, 9x9 ao5, 9x9 ao12, 9x9 relay, 10x10 Single, 10x10 ao5, 10x10 ao12, 10x10 relay, 11x11 Single, 12x12 Single, 13x13 Single, 14x14 Single, 15x15 Single, 16x16 Single, 17x17 Single, 18x18 Single, 19x19 Single, 20x20 Single, 30x30 Single"
//},
{
    "Old 30": "3x3 ao5, 3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x10, 3x3 x42, 4x4 single, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x10, 4x4 x42, 4x4 relay, 5x5 single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 relay, 6x6 single, 6x6 ao5, 6x6 ao12, 6x6 relay, 7x7 single, 7x7 ao5, 7x7 relay, 8x8 single, 8x8 ao5, 9x9 single, 10x10 single"
},
{
    "Old 100": "3x3 ao5, 3x3 ao12, 3x3 ao50, 3x3 ao100, 3x3 x5, 3x3 x10, 3x3 x42, 3x3 x100, 3x3 rel-ao5, 3x3 rel-ao12, 3x3 Wrel-ao5, 3x3 Wrel-ao12, 3x3 Hrel-ao5, 3x3 Hrel-ao12, 3x3 Eut-ao5, 3x3 Eut-ao12, 3x3 Eut-ao50, 4x4 single, 4x4 ao5, 4x4 ao12, 4x4 ao50, 4x4 ao100, 4x4 x5, 4x4 x10, 4x4 x42, 4x4 x100, 4x4 relay, 4x4 rel-ao5, 4x4 rel-ao12, 4x4 Wrel, 4x4 Wrel-ao5, 4x4 Wrel-ao12, 4x4 Hrel, 4x4 Hrel-ao5, 4x4 Hrel-ao12, 4x4 Eut, 4x4 Eut-ao5, 4x4 Eut-ao12, 5x5 single, 5x5 ao5, 5x5 ao12, 5x5 ao50, 5x5 ao100, 5x5 x5, 5x5 x10, 5x5 x42, 5x5 relay, 5x5 rel-ao5, 5x5 rel-ao12, 5x5 Wrel, 5x5 Wrel-ao5, 5x5 Wrel-ao12, 5x5 Hrel, 5x5 Hrel-ao5, 5x5 Hrel-ao12, 5x5 Eut, 5x5 Eut-ao5, 5x5 Eut-ao12, 6x6 single, 6x6 ao5, 6x6 ao12, 6x6 ao50, 6x6 ao100, 6x6 x5, 6x6 x10, 6x6 relay, 6x6 rel-ao5, 6x6 Wrel, 6x6 Wrel-ao5, 6x6 Hrel, 6x6 Hrel-ao5, 6x6 Eut, 6x6 Eut-ao5, 7x7 single, 7x7 ao5, 7x7 ao12, 7x7 ao50, 7x7 x5, 7x7 relay, 7x7 rel-ao5, 7x7 Wrel, 7x7 Wrel-ao5, 7x7 Hrel, 7x7 Hrel-ao5, 8x8 single, 8x8 ao5, 8x8 ao12, 8x8 x5, 8x8 relay, 8x8 Wrel, 8x8 Hrel, 9x9 single, 9x9 ao5, 9x9 relay, 10x10 single, 10x10 ao5, 10x10 relay, 12x12 single, 16x16 single, 20x20 single"
},
{
    "Simple": "3x3 ao12, 3x3 ao50, 3x3 ao100, 4x4 ao5, 4x4 ao12, 4x4 ao50, 5x5 ao5, 5x5 ao12, 6x6 single, 6x6 ao5, 6x6 ao12, 7x7 single, 7x7 ao5, 8x8 single, 9x9 single, 10x10 single"
},
{
    "FMC": "3x3 ao50, 3x3 ao100, 4x4 ao12, 4x4 ao50, 4x4 ao100, 5x5 ao5, 5x5 ao12, 6x6 single, 6x6 ao5, 7x7 single, 7x7 ao5, 8x8 single, 9x9 single, 10x10 single, 16x16 single"
},
{
    "11 - 20": "11x11, 12x12, 13x13, 14x14, 15x15, 16x16, 17x17, 18x18, 19x19, 20x20"
},
{
    "NxM <= 10x10": "2x6, 2x7, 2x8, 2x9, 2x10, 3x4, 3x5, 3x6, 3x7, 3x8, 3x9, 3x10, 4x3, 4x4, 4x5, 4x6, 4x7, 4x8, 4x9, 4x10, 5x3, 5x4, 5x5, 5x6, 5x7, 5x8, 5x9, 5x10, 6x2, 6x3, 6x4, 6x5, 6x6, 6x7, 6x8, 6x9, 6x10, 7x2, 7x3, 7x4, 7x5, 7x6, 7x7, 7x8, 7x9, 7x10, 8x2, 8x3, 8x4, 8x5, 8x6, 8x7, 8x8, 8x9, 8x10, 9x2, 9x3, 9x4, 9x5, 9x6, 9x7, 9x8, 9x9, 9x10, 10x2, 10x3, 10x4, 10x5, 10x6, 10x7, 10x8, 10x9, 10x10"
},

];
