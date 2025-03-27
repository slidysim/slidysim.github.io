/** @OnlyCurrentDoc */
class Tier {
    constructor(gain, required, dynamic, times = {}) {
      this.gain = gain;
      this.required = required;
      this.requiredDynamic = dynamic;
      this.times = times;
    }
  }
  

  function getDynamicSum(all30timesInOrder) {
    const categories = [
      "3x3 ao5",
      "3x3 ao12",
      "3x3 ao50",
      "3x3 ao100",
      "3x3 x10",
      "3x3 x42",
      "4x4 single",
      "4x4 ao5",
      "4x4 ao12",
      "4x4 ao50",
      "4x4 ao100",
      "4x4 x10",
      "4x4 x42",
      "4x4 relay",
      "5x5 single",
      "5x5 ao5",
      "5x5 ao12",
      "5x5 ao50",
      "5x5 relay",
      "6x6 single",
      "6x6 ao5",
      "6x6 ao12",
      "6x6 relay",
      "7x7 single",
      "7x7 ao5",
      "7x7 relay",
      "8x8 single",
      "8x8 ao5",
      "9x9 single",
      "10x10 single"
    ];
    
    let sum = 0;
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const time = all30timesInOrder[i];
      
      // Skip if time is null, undefined, or empty (assuming valid times are numbers > 0)
      if (time == null || time === "") continue;
      
      sum += getDynamicPower(category, time/1000, false);
    }
    
    return sum;
  }

  function categoryData_(times) {
    return {
      "3x3 ao5": times[0],
      "3x3 ao12": times[1],
      "3x3 ao50": times[2],
      "3x3 ao100": times[3],
      "3x3 x10": times[4],
      "3x3 x42": times[5],
      "4x4 single": times[6],
      "4x4 ao5": times[7],
      "4x4 ao12": times[8],
      "4x4 ao50": times[9],
      "4x4 ao100": times[10],
      "4x4 x10": times[11],
      "4x4 x42": times[12],
      "4x4 relay": times[13],
      "5x5 single": times[14],
      "5x5 ao5": times[15],
      "5x5 ao12": times[16],
      "5x5 ao50": times[17],
      "5x5 relay": times[18],
      "6x6 single": times[19],
      "6x6 ao5": times[20],
      "6x6 ao12": times[21],
      "6x6 relay": times[22],
      "7x7 single": times[23],
      "7x7 ao5": times[24],
      "7x7 relay": times[25],
      "8x8 single": times[26],
      "8x8 ao5": times[27],
      "9x9 single": times[28],
      "10x10 single": times[29],
    }
  }
  
  data = {
    "Beginner": new Tier(
      1,
      0,
      0,
      categoryData_([4.3,
        6.3,
        7.7,
        8.2,
        105,
        540,
        12,
        20,
        23,
        28,
        29,
        310,
        1450,
        28.5,
        42,
        60,
        65,
        70,
        90,
        100,
        125,
        140,
        240,
        185,
        230,
        460,
        307,
        355,
        460,
        666])),
    "Bronze": new Tier(
      3,
      10,
      20,
      categoryData_([2.8,
        4.1,
        5,
        5.3,
        68,
        350.,
        7.5,
        13,
        15,
        18.5,
        19,
        200,
        950,
        18.5,
        27,
        38.5,
        41,
        46,
        59,
        65,
        82,
        92,
        155,
        120,
        150,
        300,
        200,
        230,
        300,
        430
      ])),
    "Silver": new Tier(
      7,
      33,
      50,
      categoryData_([1.8,
        2.65,
        3.2,
        3.45,
        44,
        230,
        5,
        8.5,
        10,
        12,
        12.5,
        130,
        625,
        12,
        17,
        25,
        26.5,
        30,
        38,
        42,
        53,
        60,
        100,
        78,
        98,
        195,
        130,
        150,
        195,
        280,])),
    "Gold": new Tier(
      20,
      100,
      200,
      categoryData_([1.45,
        2.1,
        2.55,
        2.75,
        35,
        185,
        4,
        6.75,
        8,
        9.5,
        10,
        105,
        500,
        9.5,
        14,
        20,
        21,
        24,
        30,
        33,
        42,
        48,
        80,
        62,
        78,
        155,
        103,
        120,
        155,
        215,
        20,
      ])),
    "Platinum": new Tier(
      50,
      500,
      1000,
      categoryData_([1.15,
        1.7,
        2.05,
        2.2,
        27.5,
        148,
        3.25,
        5.4,
        6.5,
        7.6,
        8,
        83,
        400,
        7.6,
        11,
        15.5,
        17,
        19.5,
        23.5,
        26,
        33,
        38,
        63,
        49,
        62,
        125,
        82,
        97,
        125,
        180,
      ])),
    "Diamond": new Tier(
      150,
      900,
      2000,
      categoryData_([1,
        1.5,
        1.8,
        1.9,
        24,
        130,
        2.85,
        4.7,
        5.7,
        6.7,
        7.05,
        73,
        350,
        6.7,
        9.5,
        13.5,
        15,
        17,
        20.5,
        22.5,
        29,
        33,
        55,
        43,
        54,
        110,
        72,
        85,
        110,
        155
      ])),
    "Master": new Tier(
      400,
      4000,
      8000,
      categoryData_([0.9,
        1.3,
        1.6,
        1.65,
        21,
        115,
        2.5,
        4.1,
        5,
        5.9,
        6.2,
        64,
        305,
        5.9,
        8.2,
        11.5,
        13.1,
        15,
        18.2,
        20,
        25.5,
        29,
        48,
        38,
        47,
        97,
        63,
        74,
        96,
        135
      ])),
    "Grandmaster": new Tier(
      1000,
      12000,
      24000,
      categoryData_([0.8,
        1.15,
        1.4,
        1.45,
        18.5,
        100,
        2.2,
        3.6,
        4.4,
        5.2,
        5.45,
        56,
        270,
        5.2,
        7.2,
        10,
        11.5,
        13,
        16,
        17.5,
        22.5,
        25.5,
        42,
        33,
        41,
        85,
        55,
        65,
        84,
        120
      ])),
    "Nova": new Tier(
      3000,
      40000,
      66666,
      categoryData_([0.7,
        1,
        1.25,
        1.3,
        16.5,
        88,
        1.9,
        3.2,
        3.85,
        4.55,
        4.8,
        50,
        240,
        4.6,
        6.3,
        9,
        10.4,
        11.5,
        14,
        15.5,
        20,
        22.5,
        37,
        29,
        36,
        75,
        48,
        57,
        74,
        106])
    ),
    "Ascended": new Tier(
      6666,
      100000,
      111111,
      categoryData_([0.62,
        0.85,
        1.1,
        1.15,
        14.5,
        78,
        1.7,
        2.8,
        3.4,
        4,
        4.25,
        44,
        215,
        4.1,
        5.6,
        8.1,
        9.2,
        10.2,
        12.5,
        13.5,
        17.5,
        20,
        32.5,
        25.5,
        32,
        66,
        42,
        50,
        65,
        93])),
    "Aleph": new Tier(8080,
      208080,
      234567,
      categoryData_([0.55,
        0.75,
        0.95,
        1,
        13,
        70,
        1.5,
        2.5,
        3,
        3.5,
        3.7,
        38,
        185,
        3.6,
        5,
        7.1,
        8.1,
        9,
        11,
        12,
        15.5,
        17.2,
        28,
        22.5,
        28,
        57,
        38,
        45,
        57,
        81])),
    "Gamma": new Tier(10101,
      256000,
      300000,
      categoryData_([0.45,
        0.65,
        0.85,
        0.9,
        11.5,
        62,
        1.35,
        2.2,
        2.65,
        3.1,
        3.3,
        33.5,
        165,
        3.2,
        4.5,
        6.2,
        7.2,
        8,
        9.7,
        10.6,
        13.5,
        15,
        25,
        20,
        24.5,
        50,
        33.5,
        40,
        50,
        72])),
  }
  
  
  function getTimes_(category) {
    return Object.values(data).map(
      e => e.times[category]
    )
  }
  
  function getPowerRequirements_() {
    return Object.values(data).map(
      e => e.required
    )
  }
  
  function getDynamicPowerRequirements_() {
    return Object.values(data).map(
      e => e.requiredDynamic
    )
  }
  
  /**
   * @customfunction
   */
  function getRequiredPower(tier) {
    if (tier === "N/A") {
      return 0;
    }
    let val = data[tier];
    if (!val) throw Error("Not a Tier: ", "" + tier);
    return val.required;
  }
  
  /**
   * @customfunction
   */
  function getPowerGain(tier) {
    if (tier === "N/A") {
      return 0;
    }
    let val = data[tier];
    if (!val) throw Error("Not a Tier: ", "" + tier);
    return val.gain;
  }
  
  /**
   * @customfunction
   */
  function getTier(category, time) {
    if (time === 0 || time.length === 0) {
      return "N/A";
    }
    let tiers = [null].concat(Object.keys(data));
    let times = getTimes_(category);
    let tier = 1;
    while (time <= times[tier]) {
      tier++;
    }
    return tiers[tier];
  }
  
  /**
   * @customfunction
   */
  function getOverallTier(power=12, dynamic = false){
    let tiers = Object.keys(data);
    let reqs; 
    let tier = 0;
  
    if (dynamic) {
      reqs = getDynamicPowerRequirements_().concat(Infinity);
    } else {
      reqs = getPowerRequirements_().concat(Infinity);
    }
  
    while (power >= reqs[tier+1]) {
      tier++;
    }
    return tiers[tier];
  }
  
  
  /**
   * Calculates dynamic power for a time and category.
   * 
   * @param {string} category The leaderboard category.
   * @param {double} time The time in seconds to 1 ms precision.
   * @param {boolean} doublePrecision Return arbitrary precision double. 
   * @return An analog power representation.
   * @customfunction
   */
  const getDynamicPower = (category, time, doublePrecision=false) => {
    if (time < 0.001) {
      return 0;
    }
    const tiers = [null].concat(Object.keys(data));
    const times = getTimes_(category);
  
    let iterTierIndex = 1;
    let extremaTimes = [times[0], times[1]];
    let extremaTierPower = [getPowerGain(tiers[1]), getPowerGain(tiers[2])];
  
    // Determine the threshold times of the current and next tier.
    while (time <= times[iterTierIndex]) {
      extremaTimes[0] = times[iterTierIndex];
      extremaTierPower[0] = getPowerGain(tiers[iterTierIndex + 1]);
  
      if (iterTierIndex == times.length - 1) {
        extremaTimes[1] = 1e-3;
        extremaTierPower[1] = 50000;
      } else {
        extremaTimes[1] = times[iterTierIndex + 1];
        extremaTierPower[1] = getPowerGain(tiers[iterTierIndex + 2]);
      }
      iterTierIndex++;
    }
  
    const ratio = (extremaTimes[0] - time) / (extremaTimes[0] - extremaTimes[1]);
    
    // Get offset (current tier power) and amount to add (next tier power * ratio).
    const offset = extremaTierPower[0];
    const summand = (extremaTierPower[1] - offset) * ratio;
  
    return (doublePrecision ? offset + summand : Math.floor(offset + summand));
  
  }
  
  