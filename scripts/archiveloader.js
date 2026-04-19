// archiveLoader.js
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
            //if (this.archiveCache.has(dateWithPrefix)) {
            //    return this.archiveCache.get(dateWithPrefix);
            //}

            const archiveUrl = this.getGitHubArchiveUrl(dateWithPrefix);
            const response = await fetch(archiveUrl);
            if (!response.ok) {
                throw new Error(`Failed to load archive: ${response.status}`);
            }

            const compressedBuffer = await response.arrayBuffer();
            const decompressedData = await this.decompressLZMA(compressedBuffer);
            const archive = JSON.parse(decompressedData);
            
            this.archiveCache.set(dateWithPrefix, archive);
            return archive;
            
        } catch (error) {
            console.error(`Error loading archive ${dateWithPrefix}:`, error);
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
        
        console.log(`Found ${availableArchives.length} archives:`, availableArchives);
        
        if (!isArchPage) {
            latestWebArchive = availableArchives.find(archive => archive.includes('web'));
            console.log('Latest web archive:', latestWebArchive);
        } else {
            archiveDate = availableArchives[0];
            console.log('Latest archiveDate:', archiveDate);
        }
        
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
    if (!archiveLoader) return;
    const datesToPreload = datesWithPrefix || availableArchives.slice(0, 3);
    await archiveLoader.preloadArchives(datesToPreload);
}
