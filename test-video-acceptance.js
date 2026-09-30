const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   VIDEO ARCHITECTURE & PLAYBACK ACCEPTANCE CHECKS   ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName} ${details ? '--> ' + details : ''}`);
    failCount++;
  }
}

// Read index.html
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Read assets/js/main.js
const jsPath = path.join(__dirname, 'assets', 'js', 'main.js');
const js = fs.readFileSync(jsPath, 'utf8');

// Read assets/css/style.css
const cssPath = path.join(__dirname, 'assets', 'css', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

// 1. Video Tag Count
const videoMatches = html.match(/<video[^>]*>/g) || [];
assert(videoMatches.length === 15, '1. Total 15 Story Section Videos Present in HTML', `Found ${videoMatches.length}`);

// 2. Loop Attribute: Removed from scenes 00-13, kept only on Scene 14
const scene14Match = html.match(/<section id="scene-14"[\s\S]*?<video[^>]*>/);
const scene14HasLoop = scene14Match && scene14Match[0].includes('loop');
assert(scene14HasLoop, '2. Scene 14 (Spotlight Finale) video has loop attribute enabled');

const loopingVideos = videoMatches.filter(v => v.includes('loop'));
assert(loopingVideos.length === 1, '3. Only Scene 14 has loop attribute (Scenes 00-13 stop at last frame)', `Found ${loopingVideos.length} videos with loop`);

// 3. Muted & Playsinline Present
const mutedVideos = videoMatches.filter(v => v.includes('muted'));
assert(mutedVideos.length === 15, '4. HTML "muted" attribute present on all 15 videos', `Found ${mutedVideos.length}`);

const playsinlineVideos = videoMatches.filter(v => v.includes('playsinline'));
assert(playsinlineVideos.length === 15, '5. HTML "playsinline" attribute present on all 15 videos', `Found ${playsinlineVideos.length}`);

// 4. Fallback Source Configuration
const fallbackVideos = videoMatches.filter(v => v.includes('data-fallback'));
assert(fallbackVideos.length === 15, '6. Fallback video configuration defined on all videos', `Found ${fallbackVideos.length}`);

// 5. JavaScript Loop Deactivation & Scene 14 Loop Preservation
assert(js.includes('video.loop = false;'), '7. JavaScript enforces video.loop = false for scenes 00-13');
assert(js.includes('isFinale'), '8. JavaScript detects Scene 14 Finale for loop preservation');
assert(js.includes('index === totalSections - 1'), '9. JavaScript explicitly checks last sequence in storySections');

// 6. Dynamic Replay Button Injection (Skipping Scene 14)
assert(js.includes("document.createElement('button');"), '10. Replay button dynamic DOM instantiation exists');
assert(js.includes("video-replay-btn"), '11. Replay button assigned .video-replay-btn class');
assert(js.includes("if (index === totalSections - 1)"), '12. Scene 14 explicitly returns early without creating replay button');

// 7. Video End Detection (Stop at Last Frame)
assert(js.includes("video.addEventListener('ended'"), '13. Video "ended" event listener attached to trigger replay button');
assert(js.includes("replayBtn.classList.add('visible')"), '14. Replay button becomes visible when video ends at last frame');

// 8. Video Play State Sync
assert(js.includes("video.addEventListener('play'"), '15. Video "play" event listener attached to hide replay button');
assert(js.includes("replayBtn.classList.remove('visible')"), '16. Replay button hides when video is playing');

// 9. Replay Button Interaction
assert(js.includes("video.currentTime = 0;"), '17. Replay button rewinds video to timestamp 0');

// 10. Scene 00 Text Visibility (No Dissolve/Fade-out)
const hidesHeroWrapper = js.includes("heroWrapper.style.pointerEvents = 'none'") || js.includes('opacity: 0,\n        y: -30');
assert(!hidesHeroWrapper, '18. Scene 00 hero text is NEVER dissolved or faded out');
assert(js.includes("heroWrapper.style.opacity = '1'"), '19. Scene 00 hero text is explicitly guaranteed visible (opacity 1)');

// 11. Two-Step Interaction Engine (First Scroll = Video Play, Second Scroll = Advance)
assert(js.includes("startPrologueFilm()"), '20. startPrologueFilm controller exists');
assert(js.includes("prologueVideo && prologueVideo.paused"), '21. First scroll checks if prologue video is paused');
assert(js.includes("prologueScrollCooldown = Date.now() + 250;"), '22. Scroll debounce cooldown prevents accidental skipping');
assert(js.includes("currentSceneIndex === 0 && !isPrologueFilmStarted"), '23. First wheel scroll initiates film without advancing scene');

// 12. Advance to Section 2 (Scene 01 // My Next Chapter)
assert(js.includes("goToScene(currentSceneIndex + 1)"), '24. Next scroll cleanly advances to subsequent scene');
assert(js.includes("isTransitioning = false;"), '25. Transition lock released cleanly on settlement');

// 13. Replay Button CSS Styling & Position Variants
assert(css.includes(".video-replay-btn"), '26. CSS base styles defined for .video-replay-btn');
assert(css.includes(".video-replay-btn.visible"), '27. CSS visibility state defined for .video-replay-btn.visible');
assert(css.includes(".replay-btn-scene-default"), '28. Position variant defined for Scenes 01-13 (top: 30%)');
assert(css.includes(".replay-btn-scene-00"), '29. Position variant defined for Scene 00 (bottom: 5.5rem)');

// 14. Quick Navigation Dock (2 Circular Buttons with Downward Arrows)
assert(html.includes('id="roadmapQuickNav"'), '30. Quick Navigation Dock (#roadmapQuickNav) present in HTML');
assert(html.includes('id="btnPrevScene"'), '31. 1-Arrow Down Button (#btnPrevScene) present in HTML');
assert(html.includes('id="btnPrologueDirect"'), '32. 2-Arrows Down Button (#btnPrologueDirect) present in HTML');
assert(js.includes('goToScene(currentSceneIndex - 1);'), '33. Button 1 (1 arrow down) navigates to previous scene');
assert(js.includes('btnPrologueDirect.addEventListener') && js.includes('goToScene(0);'), '34. Button 2 (2 arrows down) navigates directly to Prologue (Scene 00)');
assert(css.includes('.roadmap-circle-btn') && css.includes('.roadmap-quick-dock'), '35. Circular button dark glass and gold CSS styles defined');

console.log('\n====================================================');
console.log(`TOTAL ACCEPTANCE CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

process.exit(failCount === 0 ? 0 : 1);
