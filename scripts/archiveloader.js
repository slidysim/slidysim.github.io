// archiveLoader.js
//
// Loads Exe / Web / LM leaderboard archives from the slidyarch GitHub repo.
// Each archive is an .lzma (XZ) file containing a JSON object with a `data`
// map keyed by `${displayType}_${controlType}_${pbType}` and a `timestamp`.
//
// Archive naming conventions (handled by getArchiveType):
//   leaderboard_YYYYMMDD  -> exe
//   exe_YYYYMMDD          -> exe
//   web_YYYYMMDD          -> web
//   LM_YYYYMMDD           -> lm
//   lm_YYYYMMDD           -> lm
//
// The original code kept a single `availableArchives` list (any type). The
// reworked version keeps that for backwards compatibility AND splits it into
// `availableExeArchives` / `availableWebArchives` / `availableLMArchives` so
// the date slider can pick the closest-older archive per type.
class LeaderboardArchiveLoader {
    constructor() {
        this.archiveCache = new Map();
        this.githubRepo = 'dphdmn/slidyarch'; 
        this.githubBranch = 'main'; 
    }

    getGitHubArchiveUrl(dateWithPrefix) {
        return `https://raw.githubusercontent.com/${this.githubRepo}/${this.githubBranch}/archives/${dateWithPrefix}.lzma`;
    }

    async loadArchive(dateWithPrefix) {
        try {
            const cacheable = this.shouldCacheArchive(dateWithPrefix);
            if (cacheable && this.archiveCache.has(dateWithPrefix)) {
                return this.archiveCache.get(dateWithPrefix);
            }
            if (!cacheable && this.archiveCache.has(dateWithPrefix)) {
                this.archiveCache.delete(dateWithPrefix);
            }

            const archiveUrl = this.getGitHubArchiveUrl(dateWithPrefix);
            const response = await fetch(archiveUrl);
            if (!response.ok) {
                throw new Error(`Failed to load archive: ${response.status}`);
            }

            const compressedBuffer = await response.arrayBuffer();
            const decompressedData = await this.decompressLZMA(compressedBuffer);
            const archive = JSON.parse(decompressedData);
            
            if (cacheable) {
                this.archiveCache.set(dateWithPrefix, archive);
            }
            return archive;
            
        } catch (error) {
            console.error(`Error loading archive ${dateWithPrefix}:`, error);
            throw error;
        }
    }

    shouldCacheArchive(dateWithPrefix) {
        const ts = archiveNameToTimestamp(dateWithPrefix);
        if (isNaN(ts)) return true;

        const now = new Date();
        const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const utcYesterday = utcToday - 24 * 60 * 60 * 1000;
        return ts !== utcToday && ts !== utcYesterday;
    }

async decompressLZMA(arrayBuffer) {
    const compressedData = new Uint8Array(arrayBuffer);

    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(compressedData);
            controller.close();
        }
    });

    const xzStream = new xzwasm.XzReadableStream(stream);
    const reader = xzStream.getReader();

    const chunks = [];
    let totalLength = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            const chunk = new Uint8Array(value);
            chunks.push(chunk);
            totalLength += chunk.length;
        }
    }

    // Merge in one pass
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return new TextDecoder().decode(result);
}

    async getCombinationData(dateWithPrefix, displayType, controlType, pbType) {
        const key = `${displayType}_${controlType}_${pbType}`;
        const archive = await this.loadArchive(dateWithPrefix);
        if (archive?.data?.[key]) {
            return archive.data[key];
        } else {
            return "";
        }
    }

    async getCombination(dateWithPrefix, displayType, controlType, pbType) {
        const rawData = await this.getCombinationData(dateWithPrefix, displayType, controlType, pbType);
        return rawData;
    }

    async listCombinations(dateWithPrefix) {
        const archive = await this.loadArchive(dateWithPrefix);
        return Object.keys(archive.data);
    }

    async getArchiveTimestamp(dateWithPrefix) {
        const archive = await this.loadArchive(dateWithPrefix);
        return archive.timestamp;
    }

    async preloadArchives(datesWithPrefix) {
        const loadPromises = datesWithPrefix.map(date => this.loadArchive(date));
        await Promise.all(loadPromises);
    }

    clearCache(datesWithPrefix = null) {
        if (datesWithPrefix === null) {
            this.archiveCache.clear();
        } else {
            const dateArray = Array.isArray(datesWithPrefix) ? datesWithPrefix : [datesWithPrefix];
            dateArray.forEach(date => this.archiveCache.delete(date));
        }
    }

    getCacheInfo() {
        return {
            cachedDates: Array.from(this.archiveCache.keys()),
            cacheSize: this.archiveCache.size
        };
    }
}

// ============================================================
// Archive type detection + date helpers
// ============================================================

// Returns "exe" | "web" | "lm" | null for an archive name.
function getArchiveType(archiveName) {
    if (!archiveName) return null;
    if (/^(leaderboard_|exe_)/i.test(archiveName)) return 'exe';
    if (/^web_/i.test(archiveName)) return 'web';
    if (/^lm_/i.test(archiveName)) return 'lm';
    return null;
}

// Parses the YYYYMMDD suffix out of an archive name and returns it as a
// unix-MILLISECOND timestamp at UTC midnight of that day. Returns NaN on
// unparseable input.
function archiveNameToTimestamp(archiveName) {
    const m = String(archiveName).match(/(\d{4})(\d{2})(\d{2})$/);
    if (!m) return NaN;
    const [, y, mo, d] = m;
    return Date.UTC(+y, +mo - 1, +d);
}

// Formats a unix-MS timestamp as DD.MM.YYYY (UTC, matching the archive date).
function tsToDotted(ts) {
    if (ts == null || isNaN(ts)) return '';
    const d = new Date(ts);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

// Formats an archive name's date suffix as DD.MM.YYYY.
function archiveNameToDotted(archiveName) {
    return tsToDotted(archiveNameToTimestamp(archiveName));
}

// Split a flat list of archive names into per-type sorted (desc by date) lists.
// Also returns the merged `availableArchives` (desc) for backwards compat.
function splitArchivesByType(allArchives) {
    const exe = [];
    const web = [];
    const lm = [];
    (allArchives || []).forEach(name => {
        const t = getArchiveType(name);
        if (t === 'exe') exe.push(name);
        else if (t === 'web') web.push(name);
        else if (t === 'lm') lm.push(name);
    });
    const byDateDesc = (a, b) => archiveNameToTimestamp(b) - archiveNameToTimestamp(a);
    exe.sort(byDateDesc);
    web.sort(byDateDesc);
    lm.sort(byDateDesc);
    return { exe, web, lm, all: [].concat(exe, web, lm).sort(byDateDesc) };
}

// Find the archive in `list` whose date is the closest to `targetTs` without
// being AFTER it (i.e. the largest date ≤ targetTs). Returns the archive name,
// or null if no archive in the list satisfies the constraint.
//
// This implements the spec: "select the closest archive first to the timeline,
// then for other archives select the older archive options ... never take
// archives After the selected datapoint".
function findClosestOlderArchive(list, targetTs) {
    if (!list || !list.length) return null;
    let best = null;
    let bestTs = -Infinity;
    for (const name of list) {
        const ts = archiveNameToTimestamp(name);
        if (isNaN(ts)) continue;
        if (ts > targetTs) continue; // never take newer
        if (ts > bestTs) {
            bestTs = ts;
            best = name;
        }
    }
    return best;
}

// Build the slider's date list: unique timestamps that exist in ANY of the
// currently-enabled archive types. Each entry records which types have an
// archive on that exact date (for optional UI highlighting) and the underlying
// archive names. Sorted ascending by timestamp.
//
// `types` is an object like { exe: bool, web: bool, lm: bool }.
function buildSliderDates(types) {
    const map = new Map(); // ts -> { ts, archives: { exe?, web?, lm? } }
    const add = (list, type) => {
        (list || []).forEach(name => {
            const ts = archiveNameToTimestamp(name);
            if (isNaN(ts)) return;
            if (!map.has(ts)) map.set(ts, { ts, archives: {} });
            map.get(ts).archives[type] = name;
        });
    };
    if (types.exe) add(availableExeArchives, 'exe');
    if (types.web) add(availableWebArchives, 'web');
    if (types.lm) add(availableLMArchives, 'lm');
    return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
}

// ============================================================
// Initialisation (called from main.js)
// ============================================================

async function initArchive(isArchPage = true) {
    try {
        archiveLoader = new LeaderboardArchiveLoader();
        archiveLoader.githubRepo = 'dphdmn/slidyarch';
        archiveLoader.githubBranch = 'main';
        
        const response = await fetch('https://api.github.com/repos/dphdmn/slidyarch/contents/archives');
        if (!response.ok) {
            throw new Error(`Failed to fetch archive list: ${response.status}`);
        }
        
        const files = await response.json();
        
        availableArchives = files
            .filter(file => file.name.endsWith('.lzma'))
            .map(file => file.name.replace('.lzma', ''))
            .sort()
            .reverse();
        
        // Split by type for the date slider.
        const split = splitArchivesByType(availableArchives);
        availableExeArchives = split.exe;
        availableWebArchives = split.web;
        availableLMArchives = split.lm;
        
        console.log(
            `Found ${availableArchives.length} archives:`,
            `\n  exe: ${availableExeArchives.length}`,
            `\n  web: ${availableWebArchives.length}`,
            `\n  lm:  ${availableLMArchives.length}`
        );
        
        // The standalone archive page is gone; isArchPage is now always false
        // (we keep the param for signature compatibility). Set up the "latest"
        // fallback archives so live mode still merges in the most recent web/lm
        // backup exactly like before.
        latestWebArchive = availableWebArchives[0] || null;
        latestLMArchive = availableLMArchives[0] || null;
        console.log('Latest web archive:', latestWebArchive);
        console.log('Latest LM archive:', latestLMArchive);
        
        return {
            success: true,
            archives: availableArchives
        };
        
    } catch (error) {
        console.error('Failed to initialize archive system:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getScoresArch(dateWithPrefix, displayType, controlType, pbType) {
    return archiveLoader.getCombination(dateWithPrefix, displayType, controlType, pbType);
}

async function preloadArchives(datesWithPrefix = null) {
    if (!archiveLoader) return { success: false, error: 'archiveLoader not initialised' };

    // Clean up today/yesterday from cache if present (they are non-cacheable)
    try {
        const existingKeys = Array.from(archiveLoader.archiveCache.keys());
        existingKeys.forEach(k => {
            try {
                if (!archiveLoader.shouldCacheArchive(k)) {
                    archiveLoader.archiveCache.delete(k);
                }
            } catch (e) {
                // ignore malformed keys
            }
        });
    } catch (e) {
        // ignore
    }

    let datesToPreload = [];
    if (datesWithPrefix && Array.isArray(datesWithPrefix) && datesWithPrefix.length) {
        // respect explicit list but skip non-cacheable or already-cached entries
        datesToPreload = datesWithPrefix.filter(name => archiveLoader.shouldCacheArchive(name) && !archiveLoader.archiveCache.has(name));
    } else {
        // default: preload all available archives except today/yesterday and already-cached ones
        datesToPreload = (availableArchives || []).filter(name => archiveLoader.shouldCacheArchive(name) && !archiveLoader.archiveCache.has(name));
    }

    if (!datesToPreload.length) return { success: true, preloaded: 0 };

    await archiveLoader.preloadArchives(datesToPreload);
    return { success: true, preloaded: datesToPreload.length };
}
