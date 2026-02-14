let canvas, ctx;

function createCanvas() {
    // Remove the old canvas if it exists
    if (canvas) {
        canvas.remove();
    }

    // Create a new canvas and append it
    canvas = document.createElement('canvas');
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.margin = "0";
    canvas.style.padding = "0";
    canvas.style.border = "none";
    canvas.style.opacity = "0.5";
    document.body.appendChild(canvas);

    // Get the drawing context
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial canvas creation
createCanvas();

// Update canvas size on window resize
window.addEventListener('resize', createCanvas);
const eggWords = [
    "EGG", "EGGAG", "EGGON", "EGGENGAGEG", 
    "GAMMA", "BETA", "ALEPH", "ASCENDED",
    "VOVKER", "DPH", "DPHDMN", "JZE", "DAANBE", "DAWIDLUNA", "KOLUNOA", "C0WMANGLR", "LEGGENDARY", "GOTTAGITGUD",
    "EFF", "THEMATSVALK", "SQ", "TNUM10", "SCYTER", "SOUP", "SKYSTEP", "XLII", "GOODEGGNING", "QQWREF", "XMENG", "IOTA", "ROBOTMANIA", "BOINK", "XSEDIM",
    "YAYTSO", 
    "OEUF",
    "HUEVO",
    "UOVO",
    "EIER",
    "ÄGG",
    "JAJKO",
    "VEZ",
    "JAJCE",
    "TOJÁS",
    "卵",
    "계란",
    "ไข่",
    "OU",
    "YUMURTA",
    "ЯЙЦО",
    "LUAN",
    "AVGO",
    "EGGS",
    "EI",
    "MUNA",
    "JIDAN",
    "OVA",
    "OVOS",
    "JAJA",
    "OVUM",
    "IBON",
    "AYA",
    "卵白",
    "AJJA",
    "EGG",
    "JAITSA",
    "ÁG",
    "ОЕГГ",
    "BI",
]


const specialChars = "@#$%^&*()[]{}<>!?".split('');
const fontSize = 16;
const lineSpacing = 1; // Control the vertical spacing between characters
const wordSpacing = 5; // Number of blank lines between words
const columns = Math.floor(canvas.width / fontSize);

const drops = new Array(columns).fill(1);
const words = new Array(columns).fill(null).map(() => {
    return eggWords[Math.floor(Math.random() * eggWords.length)].split('');
});

function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'cyan';
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((y, index) => {
        const word = words[index];
        const charIndex = y % (word.length + wordSpacing);
        let char;

        // Show characters of the word, then blank spaces for separation
        if (charIndex < word.length) {
            // Show the current character of the word
            char = word[charIndex];

            // Randomly replace with a special character for extra variation
            if (Math.random() > 0.9) {
                char = specialChars[Math.floor(Math.random() * specialChars.length)];
            }
        } else {
            // Show a space during the separation period
            char = ' ';
        }

        const x = index * fontSize;
        const adjustedY = y * fontSize * lineSpacing;

        ctx.fillText(char, x, adjustedY);

        // Randomly reset drop position to the top with some variation
        if (adjustedY > canvas.height && Math.random() > 0.975) {
            drops[index] = 0;
            // Pick a new random word for this column when it resets
            words[index] = eggWords[Math.floor(Math.random() * eggWords.length)].split('');
        }

        drops[index]++;
    });
}

setInterval(draw, 50);