// archiveLoader.js
class LeaderboardArchiveLoader {
    constructor() {
        this.archiveCache = new Map();
        this.githubRepo = 'dphdmn/slidyarch'; 
        this.githubBranch = 'main'; 
    }

    /**
     * Get the raw GitHub URL for a specific archive file
     * @param {string} date - Date in YYYYMMDD format
     * @returns {string} GitHub raw content URL
     */
    getGitHubArchiveUrl(date) {
        return `https://raw.githubusercontent.com/${this.githubRepo}/${this.githubBranch}/archives/leaderboard_${date}.lzma`;
    }

    /**
     * Load and decompress archive from GitHub
     * @param {string} date - Date in YYYYMMDD format (e.g., "20241102")
     * @returns {Promise<Object>} Decompressed archive data
     */
    async loadArchive(date) {
        try {
            // Check cache first
            if (this.archiveCache.has(date)) {
                console.log(`Using cached archive for ${date}`);
                return this.archiveCache.get(date);
            }

            const archiveUrl = this.getGitHubArchiveUrl(date);
            console.log(`Loading archive from: ${archiveUrl}`);

            // Fetch the LZMA compressed file
            const response = await fetch(archiveUrl);
            if (!response.ok) {
                throw new Error(`Failed to load archive: ${response.status} ${response.statusText}`);
            }

            // Get the compressed data as ArrayBuffer
            const compressedBuffer = await response.arrayBuffer();
            
            // Decompress using LZMA.js
            const decompressedData = await this.decompressLZMA(compressedBuffer);
            
            const archive = JSON.parse(decompressedData);
            
            // Cache the decompressed archive
            this.archiveCache.set(date, archive);
            
            console.log(`Archive loaded for ${date}: ${Object.keys(archive.data).length} combinations`);
            
            return archive;
            
        } catch (error) {
            console.error(`Error loading archive for date ${date}:`, error);
            throw error;
        }
    }

    async decompressLZMA(arrayBuffer) {
        const compressedStream = new Response(arrayBuffer).body;
        const decompressedStream = new xzwasm.XzReadableStream(compressedStream);
        const decompressedResponse = new Response(decompressedStream);
        const outputBuffer = await decompressedResponse.arrayBuffer();
        const text = new TextDecoder().decode(outputBuffer);
        return text;
    }

    /**
     * Get specific combination data from loaded archive
     * @param {string} date - Date in YYYYMMDD format
     * @param {number} displayType - Display type (1-20)
     * @param {number} controlType - Control type (0-3)
     * @param {number} pbType - PB type (1-3)
     * @returns {Promise<string>} The raw response data for that combination
     */
    async getCombinationData(date, displayType, controlType, pbType) {
        try {
            const key = `${displayType}_${controlType}_${pbType}`;
            const archive = await this.loadArchive(date);
            
            if (archive.data && archive.data[key]) {
                return archive.data[key];
            } else {
                throw new Error(`Combination ${key} not found in archive for date ${date}`);
            }
            
        } catch (error) {
            console.error(`Error getting data for ${displayType}_${controlType}_${pbType}:`, error);
            throw error;
        }
    }

    async getCombination(date, displayType, controlType, pbType) {
        try {
            const rawData = await this.getCombinationData(date, displayType, controlType, pbType);
            return rawData;
        } catch (error) {
            console.error(`Error parsing JSON for ${displayType}_${controlType}_${pbType}:`, error);
            throw error;
        }
    }

    /**
     * Get all available combinations from an archive
     * @param {string} date - Date in YYYYMMDD format
     * @returns {Promise<string[]>} Array of combination keys
     */
    async listCombinations(date) {
        try {
            const archive = await this.loadArchive(date);
            return Object.keys(archive.data);
        } catch (error) {
            console.error('Error listing combinations:', error);
            throw error;
        }
    }

    /**
     * Get archive metadata (timestamp)
     * @param {string} date - Date in YYYYMMDD format
     * @returns {Promise<string>} Archive creation timestamp
     */
    async getArchiveTimestamp(date) {
        try {
            const archive = await this.loadArchive(date);
            return archive.timestamp;
        } catch (error) {
            console.error('Error getting archive timestamp:', error);
            throw error;
        }
    }

    /**
     * Preload multiple archives into cache
     * @param {string[]} dates - Array of dates in YYYYMMDD format
     */
    async preloadArchives(dates) {
        const loadPromises = dates.map(date => this.loadArchive(date));
        await Promise.all(loadPromises);
        console.log(`Preloaded ${dates.length} archives`);
    }

    /**
     * Clear cache for specific dates or all dates
     * @param {string|string[]} dates - Specific date(s) to clear, or omit to clear all
     */
    clearCache(dates = null) {
        if (dates === null) {
            this.archiveCache.clear();
            console.log('Cleared all cached archives');
        } else {
            const dateArray = Array.isArray(dates) ? dates : [dates];
            dateArray.forEach(date => this.archiveCache.delete(date));
            console.log(`Cleared cache for dates: ${dateArray.join(', ')}`);
        }
    }

    /**
     * Get cache information
     * @returns {Object} Cache stats
     */
    getCacheInfo() {
        return {
            cachedDates: Array.from(this.archiveCache.keys()),
            cacheSize: this.archiveCache.size
        };
    }
}

// Initialize archive system
async function initArchive() {
    try {
        // 1. Initialize archive loader
        archiveLoader = new LeaderboardArchiveLoader();
        archiveLoader.githubRepo = 'dphdmn/slidyarch';
        archiveLoader.githubBranch = 'main';
        
        console.log('Archive loader initialized');
        
        // 2. Get list of available archive files from GitHub
        const response = await fetch('https://api.github.com/repos/dphdmn/slidyarch/contents/archives');
        if (!response.ok) {
            throw new Error(`Failed to fetch archive list: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Filter for .lzma files and extract dates
        availableArchives = files
            .filter(file => file.name.endsWith('.lzma'))
            .map(file => {
                // Extract date from filename: leaderboard_YYYYMMDD.lzma
                const dateMatch = file.name.match(/leaderboard_(\d{8})\.lzma/);
                return dateMatch ? dateMatch[1] : null;
            })
            .filter(date => date !== null)
            .sort()
            .reverse(); // Most recent first
        
        console.log(`Found ${availableArchives.length} archives:`, availableArchives);
        availableArchives.sort((a, b) => b.localeCompare(a));
        archiveDate = availableArchives[0];
        console.log('Latest archiveDate:', archiveDate);
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

async function getScoresArch(date, displayType, controlType, pbType) {
    return archiveLoader.getCombination(date, displayType, controlType, pbType);
}

// Optional: Preload specific archives for faster access
async function preloadArchives(dates = null) {
    if (!archiveLoader) {
        console.error('Archive loader not initialized');
        return;
    }
    
    const datesToPreload = dates || availableArchives.slice(0, 3); // Preload first 3 by default
    await archiveLoader.preloadArchives(datesToPreload);
    console.log(`Preloaded archives: ${datesToPreload.join(', ')}`);
}
archivePage = true;