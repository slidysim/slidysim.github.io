// archiveSlider.js
//
// Implements the archive date slider that replaces the old standalone
// archive.html page. The slider lives inside lb.html, full-width, directly
// under the page header. It is hidden by default and toggled by the
// "Live" / date button in the nav (next to the Exe/Web/LM checkboxes).
//
// Behaviour summary (see README/commit message for full spec):
//
//   * Slider positions = unique dates that exist in ANY currently-enabled
//     archive type (Exe/Web/LM). The thumb snaps to those dates — you
//     cannot pick an arbitrary day.
//
//   * Picking a date D switches to "archive" mode. For each enabled type T
//     we fetch the archive in T with the largest date ≤ D (closest-older
//     or equal). If no such archive exists for T, T is silently dropped
//     from the merge and the status line shows "T N/A".
//
//   * "Live" mode = main Exe data comes from the live server. Web/LM are
//     still merged in using the closest-older archive (which, for "today",
//     is just the latest available archive of each type). The slider's
//     "Live" button returns to live mode.
//
//   * The date button in the nav shows "Live" while in live mode, or the
//     selected date (DD.MM.YYYY) while in archive mode. Clicking it toggles
//     the slider bar visibility.
//
//   * Toggling Exe/Web/LM checkboxes rebuilds the slider's date list so it
//     only contains dates from the currently-enabled types.

// ---- public API ----------------------------------------------------------

// Initialise the slider after `initArchive()` has populated the archive lists.
// Wires up the date button, slider input, Live button, and toggle listeners.
function setupArchiveSlider() {
    if (sliderReady) return;
    if (!archiveDateBtn || !archiveSlider || !archiveSliderLiveBtn) {
        console.warn('archiveSlider: required DOM elements missing, aborting');
        return;
    }
    sliderReady = true;

    // Date button: toggle slider visibility.
    archiveDateBtn.addEventListener('click', toggleArchiveSliderVisibility);

    // Slider: update label instantly while dragging, but only apply
    // the archive selection after the user stops dragging or completes
    // the interaction (change/pointerup).
    let isPointerActive = false;
    let pendingIndex = null;
    let ignoreNextChange = false;
    archiveSlider.addEventListener('input', function () {
        const ts = parseInt(archiveSlider.value, 10);
        const idx = findClosestEntryIndex(ts);
        if (idx >= 0 && sliderDates[idx]) {
            const entry = sliderDates[idx];
            archiveSlider.value = String(entry.ts);
            pendingIndex = idx;
            updateSliderLabelOnly(idx);
            updatePreviewSourceStatus(entry.ts);
        }
    });
    archiveSlider.addEventListener('pointermove', function () {
        if (!isPointerActive) return;
        const ts = parseInt(archiveSlider.value, 10);
        const idx = findClosestEntryIndex(ts);
        if (idx >= 0 && sliderDates[idx]) {
            const entry = sliderDates[idx];
            archiveSlider.value = String(entry.ts);
            pendingIndex = idx;
            updateSliderLabelOnly(idx);
            updatePreviewSourceStatus(entry.ts);
        }
    });
    function finishPointerInteraction() {
        if (!isPointerActive) return;
        isPointerActive = false;
        const idx = pendingIndex != null ? pendingIndex : findClosestEntryIndex(parseInt(archiveSlider.value, 10));
        pendingIndex = null;
        ignoreNextChange = true;
        if (idx >= 0) applySliderIndex(idx);
    }

    archiveSlider.addEventListener('pointerdown', function () {
        isPointerActive = true;
    });
    archiveSlider.addEventListener('pointerup', finishPointerInteraction);
    archiveSlider.addEventListener('pointercancel', function () {
        isPointerActive = false;
    });
    document.addEventListener('pointerup', finishPointerInteraction);
    archiveSlider.addEventListener('change', function () {
        if (ignoreNextChange) {
            ignoreNextChange = false;
            return;
        }
        if (isPointerActive) return;
        const ts = parseInt(archiveSlider.value, 10);
        const idx = findClosestEntryIndex(ts);
        if (idx < 0) return;
        applySliderIndex(idx);
    });

    // Date select dropdown: manual archive date selection.
    if (archiveSliderDateSelect) {
        archiveSliderDateSelect.addEventListener('change', function () {
            const value = archiveSliderDateSelect.value;
            if (value === 'live') {
                setArchiveLiveMode(true);
                return;
            }
            const ts = parseInt(value, 10);
            if (isNaN(ts)) return;
            const idx = findClosestEntryIndex(ts);
            if (idx < 0) return;
            applySliderIndex(idx);
        });
    }

    // Live button: return to live mode.
    archiveSliderLiveBtn.addEventListener('click', function () {
        setArchiveLiveMode(true);
    });

    // Preload all archives button: load uncached archives (skips today/yesterday)
    if (typeof archivePreloadBtn !== 'undefined' && archivePreloadBtn) {
        archivePreloadBtn.addEventListener('click', async function () {
            const btn = archivePreloadBtn;
            btn.disabled = true;
            const prevText = btn.textContent;
            btn.textContent = 'Preloading...';
            try {
                const res = await preloadArchives();
                const n = res && res.preloaded ? res.preloaded : 0;
                if (archiveSliderSourceStatus) archiveSliderSourceStatus.innerHTML = '<span class="as-status-ok">Preloaded ' + n + ' archives</span>';
            } catch (e) {
                if (archiveSliderSourceStatus) archiveSliderSourceStatus.innerHTML = '<span class="as-status-na">Preload failed</span>';
            } finally {
                btn.disabled = false;
                btn.textContent = prevText;
            }
        });
    }

    // Rebuild slider whenever Exe/Web/LM toggles change. The toggle handlers
    // in userInteraction.js already trigger a data reload, so we just need to
    // refresh the slider's date list (and clamp the current selection if it
    // no longer exists).
    if (includeExeCB) includeExeCB.addEventListener('change', rebuildSliderForCurrentTypes);
    if (includeWebCB) includeWebCB.addEventListener('change', rebuildSliderForCurrentTypes);
    if (includeLMCB) includeLMCB.addEventListener('change', rebuildSliderForCurrentTypes);

    // Build the initial date list (don't show the bar yet — user must click).
    rebuildSliderForCurrentTypes();
    // Start in live mode.
    setArchiveLiveMode(false);
}

// Exposed for main.js to call after archives are loaded.
function ensureArchiveSliderReady() {
    if (!sliderReady) setupArchiveSlider();
    else rebuildSliderForCurrentTypes();
}

// Toggle the slider bar's visibility. Called when the nav date button is clicked.
function toggleArchiveSliderVisibility() {
    archiveSliderVisible = !archiveSliderVisible;
    applySliderVisibility();
}

// Force the slider to a specific date (unix-ms). Used to programmatically
// jump (e.g. via URL hash in the future). Silently no-ops if the date isn't
// in the slider's date list.
function setArchiveDateByTimestamp(ts) {
    const idx = sliderDates.findIndex(d => d.ts === ts);
    if (idx < 0) return false;
    archiveSlider.value = String(ts);
    applySliderIndex(idx);
    return true;
}

// ---- internal helpers ----------------------------------------------------

// Rebuild the slider's date list based on currently-enabled types, then
// refresh the slider's min/max/ticks and re-clamp the current selection.
//
// NOTE: This function is wired to the Exe/Web/LM checkbox `change` events.
// Those same checkboxes also trigger `toggleWebLeaderboard` / etc. which call
// `reload()`. To avoid a double reload, this function does NOT call
// `applySliderIndex` (which would trigger its own reload). It only updates
// `selectedSliderDate` and the slider's visual position. The toggle's reload
// then picks up the updated `selectedSliderDate`.
function rebuildSliderForCurrentTypes() {
    if (!archiveSlider) return;
    const types = {
        exe: !!(includeExeCB && includeExeCB.checked),
        web: !!(includeWebCB && includeWebCB.checked),
        lm: !!(includeLMCB && includeLMCB.checked),
    };
    sliderDates = buildSliderDates(types);

    if (!sliderDates.length) {
        // No archives available for any enabled type. Force live mode and
        // disable the slider.
        archiveSlider.min = 0;
        archiveSlider.max = 0;
        archiveSlider.value = 0;
        archiveSlider.step = 1;
        archiveSlider.disabled = true;
        if (archiveSliderTicks) archiveSliderTicks.innerHTML = '';
        if (archiveMode !== 'live') {
            // Silently revert to live mode without triggering a reload (the
            // toggle handler will reload). Just update state + UI.
            selectedSliderDate = null;
            archiveMode = 'live';
            if (archiveSliderDateSelect) archiveSliderDateSelect.value = 'live';
            if (archiveSliderLabelBlock) archiveSliderLabelBlock.classList.remove('is-travelling');
            if (archiveSliderBar) archiveSliderBar.classList.remove('is-travelling');
            refreshDateButton();
            refreshLiveButton();
        }
        if (archiveSliderDateSelect) {
            archiveSliderDateSelect.innerHTML = '<option value="live">Live</option>';
            archiveSliderDateSelect.value = 'live';
        }
        if (archiveSliderSourceStatus) {
            archiveSliderSourceStatus.innerHTML =
                '<span class="as-status-na">No archives available for the selected source types.</span>';
        }
        return;
    }
    archiveSlider.disabled = false;

    // Slider uses the real date axis while snapping to archive points.
    archiveSlider.min = sliderDates[0].ts;
    archiveSlider.max = sliderDates[sliderDates.length - 1].ts;
    archiveSlider.step = 24 * 60 * 60 * 1000;

    buildTicks();
    populateDateSelect();

    // Re-clamp current selection.
    if (archiveMode === 'archive' && selectedSliderDate != null) {
        const idx = sliderDates.findIndex(d => d.ts === selectedSliderDate);
        if (idx >= 0) {
            archiveSlider.value = String(selectedSliderDate);
            updateSliderLabelOnly(idx);
            // selectedSliderDate is still valid — no change needed. The toggle
            // handler's reload will use it as-is.
        } else {
            // Previously-selected date no longer exists in the new type set.
            // Fall back to the closest available date (older or equal) so we
            // don't jump to the latest archive point. Update selectedSliderDate
            // in-place so the toggle handler's reload uses the new value. We
            // do NOT call applySliderIndex here (that would double-reload).
            const closestIdx = findClosestOlderEntryIndex(selectedSliderDate);
            const fallbackIdx = closestIdx >= 0 ? closestIdx : sliderDates.length - 1;
            selectedSliderDate = sliderDates[fallbackIdx].ts;
            archiveSlider.value = String(selectedSliderDate);
            updateSliderLabelOnly(fallbackIdx);
            refreshDateButton();
        }
    } else {
        // Live mode: park the thumb at the rightmost position (newest date),
        // but DON'T switch into archive mode — the user is still on live.
        const newestTs = sliderDates[sliderDates.length - 1].ts;
        archiveSlider.value = String(newestTs);
        if (archiveSliderDateSelect) archiveSliderDateSelect.value = 'live';
        if (archiveSliderLabelBlock) archiveSliderLabelBlock.classList.remove('is-travelling');
        if (archiveSliderBar) archiveSliderBar.classList.remove('is-travelling');
        updatePreviewSourceStatus(newestTs);
    }
}

// Build year tick marks under the slider for orientation.
function buildTicks() {
    if (!archiveSliderTicks || !sliderDates.length) return;
    const minTs = sliderDates[0].ts;
    const maxTs = sliderDates[sliderDates.length - 1].ts;
    const span = maxTs - minTs;
    const startYear = new Date(minTs).getUTCFullYear();
    const endYear = new Date(maxTs).getUTCFullYear();
    let html = '';
    for (let y = startYear; y <= endYear; y++) {
        let ts = Date.UTC(y, 0, 1);
        if (ts < minTs) ts = minTs;
        if (ts > maxTs) ts = maxTs;
        const pct = span > 0 ? ((ts - minTs) / span) * 100 : 0;
        html += '<span class="as-tick" style="left:' + pct.toFixed(2) + '%">' +
            '<span class="as-tick-line"></span>' +
            '<span class="as-tick-label">' + y + '</span>' +
        '</span>';
    }
    archiveSliderTicks.innerHTML = html;
}

function populateDateSelect() {
    if (!archiveSliderDateSelect || !sliderDates.length) return;

    const currentValue = archiveSliderDateSelect.value;
    const options = ['<option value="live">Live</option>'];
    for (let i = sliderDates.length - 1; i >= 0; i--) {
        const entry = sliderDates[i];
        options.push('<option value="' + entry.ts + '">' + tsToDotted(entry.ts) + '</option>');
    }
    archiveSliderDateSelect.innerHTML = options.join('');

    if (archiveMode === 'live') {
        archiveSliderDateSelect.value = 'live';
    } else if (currentValue === 'live' || archiveSliderDateSelect.querySelector('option[value="' + currentValue + '"]')) {
        archiveSliderDateSelect.value = currentValue;
    } else if (archiveSlider && archiveSlider.value !== '') {
        archiveSliderDateSelect.value = String(archiveSlider.value);
    } else {
        archiveSliderDateSelect.value = 'live';
    }
}

function findClosestEntryIndex(targetTs) {
    if (!sliderDates.length) return -1;
    let bestIndex = 0;
    let bestDistance = Math.abs(sliderDates[0].ts - targetTs);
    for (let i = 1; i < sliderDates.length; i++) {
        const distance = Math.abs(sliderDates[i].ts - targetTs);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function findClosestOlderEntryIndex(targetTs) {
    let bestIndex = -1;
    let bestTs = -Infinity;
    for (let i = 0; i < sliderDates.length; i++) {
        const ts = sliderDates[i].ts;
        if (ts > targetTs) continue;
        if (ts > bestTs) {
            bestTs = ts;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function updatePreviewSourceStatus(targetTs) {
    const types = [
        { key: 'exe', label: 'exe', enabled: !!(includeExeCB && includeExeCB.checked), archives: availableExeArchives, node: archiveSliderStatusExe },
        { key: 'web', label: 'web', enabled: !!(includeWebCB && includeWebCB.checked), archives: availableWebArchives, node: archiveSliderStatusWeb },
        { key: 'lm',  label: 'lm',  enabled: !!(includeLMCB && includeLMCB.checked), archives: availableLMArchives, node: archiveSliderStatusLm },
    ];

    const isLiveMode = archiveMode === 'live';
    const isPreviewing = archiveSliderLabelBlock && archiveSliderLabelBlock.classList && archiveSliderLabelBlock.classList.contains('is-travelling');

    types.forEach(function (t) {
        if (!t.node) return;
        if (!t.enabled) {
            t.node.textContent = t.label + ' off';
            t.node.className = 'as-status-item as-status-na';
            return;
        }
        if (t.key === 'exe' && isLiveMode && !isPreviewing) {
            t.node.textContent = t.label + ' live';
            t.node.className = 'as-status-item as-status-live';
            return;
        }
        const candidate = findClosestOlderArchive(t.archives, targetTs);
        if (!candidate) {
            t.node.textContent = t.label + ' N/A';
            t.node.className = 'as-status-item as-status-na';
            return;
        }
        t.node.textContent = t.label + ' ' + archiveNameToDotted(candidate);
        t.node.className = 'as-status-item as-status-ok';
    });
    if (archiveSliderSourceStatus) {
        archiveSliderSourceStatus.innerHTML = '';
    }
}

function updateSliderLabelOnly(idx) {
    if (!sliderDates.length) {
        if (archiveSliderDateSelect) archiveSliderDateSelect.value = 'live';
        if (archiveSliderLabelBlock) archiveSliderLabelBlock.classList.remove('is-travelling');
        if (archiveSliderBar) archiveSliderBar.classList.remove('is-travelling');
        return;
    }
    if (idx < 0 || idx >= sliderDates.length) return;
    const entry = sliderDates[idx];
    if (!entry) return;
    if (archiveSliderLabelBlock) archiveSliderLabelBlock.classList.add('is-travelling');
    if (archiveSliderBar) archiveSliderBar.classList.add('is-travelling');
    if (archiveSliderDateSelect) archiveSliderDateSelect.value = String(entry.ts);
}

// Apply a slider index: switch to archive mode, store the selected date,
// and trigger a data reload.
function applySliderIndex(idx) {
    if (!sliderDates.length) return;
    if (idx < 0 || idx >= sliderDates.length) return;
    const entry = sliderDates[idx];
    selectedSliderDate = entry.ts;
    archiveMode = 'archive';
    archiveSlider.value = String(entry.ts);
    updateSliderLabelOnly(idx);
    refreshDateButton();
    refreshLiveButton();
    // Trigger reload — same mechanism as the Exe/Web/LM toggles use.
    forceServerUpdate = true;
    reload();
}

// Switch to live mode. If `triggerReload` is false, only the UI is updated
// (used during initialisation).
function setArchiveLiveMode(triggerReload) {
    selectedSliderDate = null;
    archiveMode = 'live';
    if (archiveSliderLabelBlock) archiveSliderLabelBlock.classList.remove('is-travelling');
    if (archiveSliderBar) archiveSliderBar.classList.remove('is-travelling');
    // Park the thumb at the rightmost position (newest date) so the visual
    // matches the "live" semantic.
    if (archiveSlider && sliderDates.length) {
        archiveSlider.value = String(sliderDates[sliderDates.length - 1].ts);
        updatePreviewSourceStatus(sliderDates[sliderDates.length - 1].ts);
    }
    if (archiveSliderDateSelect) {
        archiveSliderDateSelect.value = 'live';
    }
    refreshDateButton();
    refreshLiveButton();
    if (triggerReload) {
        forceServerUpdate = true;
        reload();
    }
}

// Show or hide the slider bar based on `archiveSliderVisible`, and sync the
// date button's "slider-visible" class.
function applySliderVisibility() {
    if (!archiveSliderBar || !archiveDateBtn) return;
    if (archiveSliderVisible) {
        archiveSliderBar.hidden = false;
        archiveDateBtn.classList.add('slider-visible');
        archiveDateBtn.setAttribute('aria-pressed', 'true');
    } else {
        archiveSliderBar.hidden = true;
        archiveDateBtn.classList.remove('slider-visible');
        archiveDateBtn.setAttribute('aria-pressed', 'false');
    }
}

// Update the nav date button's text + active class based on current mode.
function refreshDateButton() {
    if (!archiveDateBtn) return;
    if (archiveMode === 'archive' && selectedSliderDate != null) {
        archiveDateBtn.textContent = tsToDotted(selectedSliderDate);
        archiveDateBtn.classList.add('is-active');
    } else {
        archiveDateBtn.textContent = 'Live';
        archiveDateBtn.classList.remove('is-active');
    }
}

// Update the slider's Live button active state.
function refreshLiveButton() {
    if (!archiveSliderLiveBtn) return;
    if (archiveMode === 'live') archiveSliderLiveBtn.classList.add('is-active');
    else archiveSliderLiveBtn.classList.remove('is-active');
}

// Update the source-status line under the slider based on which archives were
// actually used for the most recent fetch. Called from dataFetching after merge.
function refreshSourceStatus(used) {
    if (!archiveSliderSourceStatus) return;
    // `used` = { exe: {archive, live, ok} | null, web: {archive, ok} | null, lm: {archive, ok} | null }
    const parts = [];
    const types = [
        { key: 'exe', label: 'exe', enabled: !!(includeExeCB && includeExeCB.checked) },
        { key: 'web', label: 'web', enabled: !!(includeWebCB && includeWebCB.checked) },
        { key: 'lm',  label: 'lm',  enabled: !!(includeLMCB && includeLMCB.checked) },
    ];
    types.forEach(function (t, i) {
        if (i > 0) parts.push('<span class="as-sep">·</span>');
        if (!t.enabled) {
            parts.push('<span class="as-status-na">' + t.label + ' off</span>');
            return;
        }
        const u = used && used[t.key];
        if (!u || u.ok === false) {
            parts.push('<span class="as-status-na">' + t.label + ' N/A</span>');
            return;
        }
        if (u.live) {
            parts.push('<span class="as-status-live">' + t.label + ' live</span>');
        } else if (u.archive) {
            parts.push(
                '<span class="as-status-ok">' + t.label + ' ' + archiveNameToDotted(u.archive) + '</span>'
            );
        } else {
            parts.push('<span class="as-status-na">' + t.label + ' N/A</span>');
        }
    });
    archiveSliderSourceStatus.innerHTML = parts.join('');
}
