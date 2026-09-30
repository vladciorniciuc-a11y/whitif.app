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

// 2. Hero Video (Scene 00) Autoplay & No Loop & No Replay Button
const scene00Match = html.match(/<section id="scene-00"[\s\S]*?<video[^>]*>/);
const scene00HasAutoplay = scene00Match && scene00Match[0].includes('autoplay');
const scene00HasLoop = scene00Match && scene00Match[0].includes('loop');
assert(scene00HasAutoplay, '2. Scene 00 (Hero) video has autoplay enabled in HTML');
assert(!scene00HasLoop, '3. Scene 00 (Hero) video has NO loop attribute in HTML (stops at last frame)');
assert(js.includes('isHero') && js.includes('video.autoplay = true;'), '4. JavaScript reinforces autoplay for Scene 00 hero video');

// 3. Scene 14 (Spotlight Finale) Loop Preservation
const scene14Match = html.match(/<section id="scene-14"[\s\S]*?<video[^>]*>/);
const scene14HasLoop = scene14Match && scene14Match[0].includes('loop');
assert(scene14HasLoop, '5. Scene 14 (Spotlight Finale) video has loop attribute enabled');

const loopingVideos = videoMatches.filter(v => v.includes('loop'));
assert(loopingVideos.length === 1, '6. Only Scene 14 has loop attribute (Scenes 00-13 stop at last frame)', `Found ${loopingVideos.length} videos with loop`);

// 4. Muted & Playsinline Present
const mutedVideos = videoMatches.filter(v => v.includes('muted'));
assert(mutedVideos.length === 15, '7. HTML "muted" attribute present on all 15 videos', `Found ${mutedVideos.length}`);

const playsinlineVideos = videoMatches.filter(v => v.includes('playsinline'));
assert(playsinlineVideos.length === 15, '8. HTML "playsinline" attribute present on all 15 videos', `Found ${playsinlineVideos.length}`);

// 5. Fallback Source Configuration
const fallbackVideos = videoMatches.filter(v => v.includes('data-fallback'));
assert(fallbackVideos.length === 15, '9. Fallback video configuration defined on all videos', `Found ${fallbackVideos.length}`);

// 6. JavaScript Video Loop Rules: scenes 00-13 loop = false; scene 14 loop = true
assert(js.includes('video.loop = false;'), '10. JavaScript enforces video.loop = false for scenes 00-13');
assert(js.includes('isFinale'), '11. JavaScript detects Scene 14 Finale for loop preservation');

// 7. Replay Button Exclusions: Neither Scene 00 nor Scene 14 gets a replay button
assert(js.includes('if (index === 0 || index === totalSections - 1)'), '12. Scene 00 and Scene 14 are excluded from replay button generation');

// 8. Dynamic Replay Button for Scenes 01-13
assert(js.includes("document.createElement('button');"), '13. Replay button dynamic DOM instantiation exists for Scenes 01-13');
assert(js.includes("video-replay-btn"), '14. Replay button assigned .video-replay-btn class');
assert(js.includes("video.addEventListener('ended'"), '15. Video "ended" event listener attached to trigger replay button');
assert(js.includes("replayBtn.classList.add('visible')"), '16. Replay button becomes visible when video ends at last frame');
assert(js.includes("video.addEventListener('play'"), '17. Video "play" event listener attached to hide replay button');
assert(js.includes("replayBtn.classList.remove('visible')"), '18. Replay button hides when video is playing');
assert(js.includes("video.currentTime = 0;"), '19. Replay button rewinds video to timestamp 0');

// 9. Scene 00 Text Visibility Guaranteed
assert(js.includes("heroWrapper.style.opacity = '1'"), '20. Scene 00 hero text is explicitly guaranteed visible (opacity 1)');

// 10. Direct Scroll Navigation (No Mouse Activation Interception)
assert(!js.includes('startPrologueFilm()'), '21. Manual startPrologueFilm mouse interception removed');
assert(!js.includes('isPrologueFilmStarted'), '22. isPrologueFilmStarted lock flag removed');
assert(js.includes("goToScene(currentSceneIndex + 1)"), '23. Scroll directly advances to next scene');

// 11. Hero Scroll Indicator Click Handler
assert(js.includes("heroScrollIndicator.addEventListener('click', () => {") && js.includes("goToScene(1);"), '24. Hero scroll indicator clicks directly to Scene 01');

// 12. Quick Navigation Dock & English Tooltips
assert(html.includes('id="roadmapQuickNav"'), '25. Quick Navigation Dock (#roadmapQuickNav) present in HTML');
assert(html.includes('id="btnPrevScene"'), '26. 1-Arrow Down Button (#btnPrevScene) present in HTML');
assert(html.includes('id="btnPrologueDirect"'), '27. 2-Arrows Down Button (#btnPrologueDirect) present in HTML');
assert(html.includes('data-lucide="step-back"'), '28. Button 1 uses "step-back" icon (⏮ cu bara)');
assert(html.includes('data-lucide="clapperboard"'), '29. Button 2 uses "clapperboard" icon (🎬 clacheta)');
assert(html.includes('title="Previous Chapter"') && html.includes('>Previous Chapter<'), '30. Button 1 has English tooltip: "Previous Chapter"');
assert(html.includes('title="Return to Prologue"') && html.includes('>Return to Prologue<'), '31. Button 2 has English tooltip: "Return to Prologue"');

// 13. Quick Navigation Functionality
assert(js.includes('goToScene(currentSceneIndex - 1);'), '32. Button 1 (1 arrow down) navigates to previous scene');
assert(js.includes('btnPrologueDirect.addEventListener') && js.includes('goToScene(0);'), '33. Button 2 (2 arrows down) navigates directly to Prologue (Scene 00)');
assert(css.includes('.roadmap-circle-btn') && css.includes('.roadmap-quick-dock'), '34. Circular button dark glass and gold CSS styles defined');

// 14. Header Logo Reload on Click
assert(html.includes('id="headerBrandLogo"'), '33. Header logo element has #headerBrandLogo id');
assert(js.includes('headerBrandLogo.addEventListener') && js.includes('window.location.reload()'), '34. Clicking header logo reloads the page (instead of navigating away)');

// 15. Scene 14 Spotlight Finale Specific Logo Colors
assert(css.includes('body.scene-climax-active .hud-brand-center .hud-logo-if') && css.includes('#07150e'), '35. Scene 14 sets logo "if." to black in Spotlight Finale');
assert(css.includes('body.scene-climax-active .hud-brand-center .hud-logo-tagline') && css.includes('#4a5649'), '36. Scene 14 sets tagline to darker shade of gray in Spotlight Finale');
assert(js.includes("document.body.classList.add('scene-climax-active');"), '37. JavaScript toggles scene-climax-active exclusively on Scene 14');

// 16. Spotlight CTAs present in both Prologue (Scene 00) and Spotlight Finale (Scene 14)
const scene00Html = html.split('<section id="scene-00"')[1]?.split('</section>')[0] || '';
const scene00HasAccessCTA = scene00Html.includes('GET EARLY ACCESS');
const scene00HasExploreCTA = scene00Html.includes('EXPLORE PLATFORM');
assert(scene00HasAccessCTA && scene00HasExploreCTA, '38. Spotlight CTAs ("GET EARLY ACCESS" & "EXPLORE PLATFORM") are present in Prologue (Scene 00)');

const scene14Html = html.split('<section id="scene-14"')[1]?.split('</section>')[0] || '';
const scene14HasAccessCTA = scene14Html.includes('GET EARLY ACCESS');
const scene14HasExploreCTA = scene14Html.includes('EXPLORE PLATFORM');
assert(scene14HasAccessCTA && scene14HasExploreCTA, '39. Spotlight CTAs ("GET EARLY ACCESS" & "EXPLORE PLATFORM") are present in Spotlight Finale (Scene 14)');

console.log('\n====================================================');
console.log(`TOTAL ACCEPTANCE CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

process.exit(failCount === 0 ? 0 : 1);
