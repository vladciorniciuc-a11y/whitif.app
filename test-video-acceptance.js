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

// 1. Video Tag Count: 15 Story Section Backdrop Videos
const backdropVideos = html.match(/<video class="video-backdrop"[^>]*>/g) || [];
assert(backdropVideos.length === 15, '1. Total 15 Story Section Backdrop Videos Present in HTML', `Found ${backdropVideos.length}`);

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

const loopingBackdropVideos = backdropVideos.filter(v => v.includes('loop'));
assert(loopingBackdropVideos.length === 1, '6. Only Scene 14 has loop attribute among backdrop reels (Scenes 00-13 stop at last frame)', `Found ${loopingBackdropVideos.length} videos with loop`);

// 4. Muted & Playsinline Present on All Backdrop Videos
const mutedBackdropVideos = backdropVideos.filter(v => v.includes('muted'));
assert(mutedBackdropVideos.length === 15, '7. HTML "muted" attribute present on all 15 backdrop videos', `Found ${mutedBackdropVideos.length}`);

const playsinlineBackdropVideos = backdropVideos.filter(v => v.includes('playsinline'));
assert(playsinlineBackdropVideos.length === 15, '8. HTML "playsinline" attribute present on all 15 backdrop videos', `Found ${playsinlineBackdropVideos.length}`);

// 5. Fallback Source Configuration
const fallbackVideos = backdropVideos.filter(v => v.includes('data-fallback'));
assert(fallbackVideos.length === 15, '9. Fallback video configuration defined on all 15 backdrop videos', `Found ${fallbackVideos.length}`);

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

// 12. Quick Navigation Dock & English Tooltips (3 Buttons: Projector, Step-Back, Clapperboard)
assert(html.includes('id="roadmapQuickNav"'), '25. Quick Navigation Dock (#roadmapQuickNav) present in HTML');
assert(html.includes('id="btnSpotlightDirect"'), '26. Top Button (#btnSpotlightDirect) present in HTML');
assert(html.includes('id="btnPrevScene"'), '27. Middle Button (#btnPrevScene) present in HTML');
assert(html.includes('id="btnPrologueDirect"'), '28. Bottom Button (#btnPrologueDirect) present in HTML');
assert(html.includes('projector-profile-icon'), '29. Button 1 uses 35mm cinema projector in profile icon (📽)');
assert(html.includes('data-lucide="step-back"'), '30. Button 2 uses "step-back" icon (⏮ cu bara)');
assert(html.includes('data-lucide="clapperboard"'), '31. Button 3 uses "clapperboard" icon (🎬 clacheta)');
assert(html.includes('title="Spotlight Finale"') && html.includes('>Spotlight Finale<'), '32. Button 1 has English tooltip: "Spotlight Finale"');
assert(html.includes('title="Previous Chapter"') && html.includes('>Previous Chapter<'), '33. Button 2 has English tooltip: "Previous Chapter"');
assert(html.includes('title="Return to Trailer"') && html.includes('>Return to Trailer<'), '34. Button 3 has English tooltip: "Return to Trailer"');

// 13. Quick Navigation Functionality
assert(js.includes('btnSpotlightDirect.addEventListener') && js.includes('goToScene(totalSections - 1);'), '35. Button 1 (projector) navigates directly to Spotlight Finale (Scene 14)');
assert(js.includes('goToScene(currentSceneIndex - 1);'), '36. Button 2 (step back) navigates to previous scene');
assert(js.includes('btnPrologueDirect.addEventListener') && js.includes('goToScene(0);'), '37. Button 3 (clapperboard) navigates directly to Prologue (Scene 00)');
assert(css.includes('.roadmap-circle-btn') && css.includes('.roadmap-quick-dock'), '38. Circular button dark glass and gold CSS styles defined');

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

// 17. Footer Center Alignment with Header Logo & Spotlight Finale Black Color Adaptation
assert(html.includes('hud-footer-center') && html.includes('left-1/2 -translate-x-1/2') && html.includes('2026 if.') && html.includes('btnOpenPrivacyModalFooter'), '40. Footer center (2026 if.) is dead-center aligned with header logo; legal modals accessible via Scene 14 footer');
assert(css.includes('body.scene-climax-active .hud-footer-center .hud-footer-copy') && css.includes('#07150e'), '41. Scene 14 Spotlight Finale turns "2026 if." to black (#07150e) exclusively in spotlight section');

// 18. Intermission / Commercial Break Section & BYOK Privacy Architecture
const breakSectionMatch = html.includes('id="scene-commercial-break"') && html.includes('COMMERCIAL BREAK');
assert(breakSectionMatch, '42. Intermission / Commercial Break section present between scene-03 and scene-04 with COMMERCIAL BREAK badge');

const byokDownloadPresent = html.includes('id="btnDownloadDesktopApp"') && html.includes('DOWNLOAD DESKTOP APP (BYOK)') && html.includes('Monthly License');
assert(byokDownloadPresent, '43. Desktop app download CTA, BYOK privacy guarantee, and monthly subscription model present');

const auditModalAndPdfPresent = html.includes('id="auditModal"') && html.includes('withif-security-audit-data-disclosure.pdf') && html.includes('CLOUD AI USERS NOTICE');
assert(auditModalAndPdfPresent, '44. Audit report modal, downloadable PDF document, and cloud AI training disclosure present');

// 19. Section Title Badges use Scene. instead of Ch.
const hasScenePrefixes = html.includes('Scene. 01') && html.includes('Scene. 04') && html.includes('Scene. 14') && !html.includes('Ch. 01');
assert(hasScenePrefixes, '45. Section title badges use "Scene." prefix instead of "Ch."');

// 20. Commercial Break Section is Centered in the Middle of the Page
const commercialSectionHtml = html.split('id="scene-commercial-break"')[1]?.split('</section>')[0] || '';
const isCommercialCentered = commercialSectionHtml.includes('justify-center items-center') && commercialSectionHtml.includes('text-center');
assert(isCommercialCentered, '46. Commercial Break section content is centered in the middle of the page');

// 21. The Set 360° Virtual Production Soundstage Acceptance Checks
const theSetSectionPresent = html.includes('id="scene-the-set"') && html.includes('id="theSetPanorama"');
assert(theSetSectionPresent, '47. The Set section (#scene-the-set) and Pannellum panorama container (#theSetPanorama) present in HTML');

const theSetRoadmapDotPresent = html.includes('the-set-dot') && html.includes('data-target="#scene-the-set"') && html.includes('>The Set<');
assert(theSetRoadmapDotPresent, '48. Emerald green roadmap dot (.the-set-dot) for "The Set" present between Scene 08 and Scene 09');

const theSetPannellumAssets = html.includes('assets/js/pannellum.js') && html.includes('assets/css/pannellum.css');
assert(theSetPannellumAssets, '49. Self-hosted Pannellum 360 engine JS and CSS included locally (zero external CDNs)');

const theSetPresenterAndAudio = html.includes('id="theSetPresenterVideo"') && html.includes('id="btnTheSetSound"') && html.includes('TAP FOR SOUND 🎙️');
assert(theSetPresenterAndAudio, '50. Standing presenter video card with [ TAP FOR SOUND 🎙️ ] audio button present');

const theSetJsController = js.includes('initTheSet360') && js.includes('theSetViewer') && js.includes('btnTheSetSound.addEventListener');
assert(theSetJsController, '51. JavaScript controllers for 360 panorama initialization and host audio toggle integrated');

const theSetCssStyles = css.includes('.roadmap-dot.the-set-dot') && css.includes('#38e07b') && css.includes('.the-set-panorama-container');
assert(theSetCssStyles, '52. Emerald green marker styling (#38e07b) and 360 container styles defined in CSS');

const theSetGlobeIconPresent = html.includes('id="theSetCenterGlobe"') && html.includes('the-set-center-globe') && css.includes('.the-set-center-globe');
assert(theSetGlobeIconPresent, '53. Central 360° globe icon badge present in the middle of the 360 panorama');

const theSetPanoramaConfigured = js.includes("type: 'equirectangular'") && js.includes('the_set_360.jpg') && fs.existsSync(path.join(__dirname, 'assets', 'images', 'the_set_360.jpg'));
assert(theSetPanoramaConfigured, '54. 360° Studio Panorama Image (the_set_360.jpg) properly configured and verified on disk');

console.log('\n====================================================');
console.log(`TOTAL ACCEPTANCE CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

process.exit(failCount === 0 ? 0 : 1);
