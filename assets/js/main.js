/**
 * THE INDEPENDENT FILMMAKER OS - CINEMATIC SCROLLYTELLING ENGINE
 * Features:
 * 1. Physical Photo/Video Frame Stacking (Memory Box Metaphor) with pinSpacing: false
 * 2. Section-by-Section Scroll Stop Engine (Discrete, Intentional Transitions)
 * 3. Smooth Text & Card Reveal to Eliminate Abrupt Appearances
 * 4. Splice Line Optical Light Leak Burst on the Leading Edge
 * 5. 3-Epoch Margins: Analog 35mm -> Hybrid DI -> Pure Digital Cinema
 * 6. Responsive Video Playback Synchronized with Current Scene
 * 7. Ascending Roadmap Navigation (00 at bottom -> 14 at top)
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded!');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const storySections = gsap.utils.toArray('.story-section');
  const roadmapDots = document.querySelectorAll('.roadmap-dot');
  const progressBar = document.getElementById('roadmapProgressBar');
  const totalSections = storySections.length;

  // 1. Initialize Lenis Smooth Scroll Engine
  // Note: virtualScroll is set to bypass arbitrary pixel scrolling,
  // allowing our section scroll-stop controller to manage transitions discretely.
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: false,
      syncTouch: false,
      virtualScroll: () => false
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    console.log('Lenis & GSAP Engine Synchronized with Scroll-Stop Controller.');
  } catch (err) {
    console.warn('Lenis fallback active:', err);
  }

  // 2. Camera HUD Live Timecode (24 FPS)
  const timecodeEl = document.getElementById('hudTimecode');
  if (timecodeEl) {
    let frame = 0;
    setInterval(() => {
      frame++;
      const fps = 24;
      const totalSeconds = Math.floor(frame / fps);
      const f = frame % fps;
      const s = totalSeconds % 60;
      const m = Math.floor(totalSeconds / 60) % 60;
      const h = Math.floor(totalSeconds / 3600);
      const pad = (n) => String(n).padStart(2, '0');
      timecodeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
    }, 1000 / 24);
  }

  // 3. Resilient Video Preload & Playback Architecture (Autoplay Hero, No Loop on 00-13, Loop on 14)
  const allVideos = document.querySelectorAll('video');
  allVideos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    const parentSection = video.closest('.story-section');
    const isFinale = parentSection && parentSection.id === 'scene-14';
    const isHero = parentSection && parentSection.id === 'scene-00';
    const isPresenter = video.id === 'theSetPresenterVideo';

    // Scene 14 (Spotlight Finale Climax) and The Set Presenter remain in continuous loop; scenes 00-13 stop at last frame (no loop)
    if (isFinale || isPresenter) {
      video.loop = true;
      video.setAttribute('loop', '');
    } else {
      video.loop = false;
      video.removeAttribute('loop');
    }
    
    // Scene 00 (Hero / Prologue): Autoplay enabled without mouse activation
    if (isHero) {
      video.autoplay = true;
      video.setAttribute('autoplay', '');
      video.play().catch(() => {});
    }

    const fallbackSrc = video.getAttribute('data-fallback') || 'videos/sample.mp4';
    const handleError = () => {
      if (!video.dataset.hasFallenBack) {
        video.dataset.hasFallenBack = "true";
        video.src = fallbackSrc;
        video.load();
        if (isHero) {
          video.play().catch(() => {});
        }
      }
    };
    video.addEventListener('error', handleError, true);
    const sources = video.querySelectorAll('source');
    sources.forEach(src => src.addEventListener('error', handleError));
  });

  // Attach Cinematic Replay Buttons ONLY to Scenes 01-13
  // - Scene 00 (Hero / Prologue): Autoplay, stops at last frame, NO replay button
  // - Scenes 01-13: Stop at last frame, SHOW replay button
  // - Scene 14 (Spotlight Finale): Continuous loop, NO replay button
  storySections.forEach((section, index) => {
    const video = section.querySelector('video.video-backdrop');
    if (!video) return;

    // Skip Scene 00 (Hero) and Scene 14 (Finale) - neither has a replay button
    if (index === 0 || index === totalSections - 1) {
      return;
    }

    // Create replay button element
    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'video-replay-btn replay-btn-scene-default';
    replayBtn.setAttribute('aria-label', 'Replay Scene Video');
    replayBtn.innerHTML = `
      <span class="video-replay-icon-box">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
      </span>
      <span class="video-replay-label">REPLAY</span>
    `;

    const photoFrame = section.querySelector('.photo-frame') || section;
    photoFrame.appendChild(replayBtn);

    // Show replay button when video stops at the last frame
    video.addEventListener('ended', () => {
      replayBtn.classList.add('visible');
    });

    // Hide replay button when video starts playing
    video.addEventListener('play', () => {
      replayBtn.classList.remove('visible');
    });

    // Clicking replay button rewinds to frame 0 and plays
    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      replayBtn.classList.remove('visible');
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });

  // 4. Interactive Volumetric Spotlights (Mouse Reactivity)
  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const mouseX = (e.clientX / innerWidth) - 0.5;
    const mouseY = (e.clientY / innerHeight) - 0.5;

    gsap.to('.spotlight-beam-left', {
      x: mouseX * 45,
      rotation: -18 + mouseX * 12,
      duration: 1.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to('.spotlight-beam-right', {
      x: mouseX * -45,
      rotation: 18 + mouseX * 12,
      duration: 1.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    gsap.to('.spotlight-glow-center', {
      x: mouseX * 40,
      y: mouseY * 40,
      duration: 2.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });

  // 5. 3-EPOCH MARGINS STATE CONTROLLER
  const vuBars = document.querySelectorAll('.vu-meter-bar');
  setInterval(() => {
    if (document.body.classList.contains('epoch-digital')) {
      vuBars.forEach((bar) => {
        const rand = Math.random();
        if (rand > 0.6) {
          bar.className = 'vu-meter-bar active-gold';
        } else if (rand > 0.25) {
          bar.className = 'vu-meter-bar active-green';
        } else {
          bar.className = 'vu-meter-bar';
        }
      });
    }
  }, 120);

  function updateEpochMargins(sceneIndex) {
    document.body.classList.remove('epoch-analog', 'epoch-hybrid', 'epoch-digital', 'scene-climax-active');
    if (sceneIndex <= 5) {
      document.body.classList.add('epoch-analog');
    } else if (sceneIndex <= 10) {
      document.body.classList.add('epoch-hybrid');
    } else {
      document.body.classList.add('epoch-digital');
    }

    // White background sections (Commercial Break & Spotlight Finale): activates specific theme styles (black logo, dark HUD)
    const activeSection = storySections[sceneIndex];
    if (sceneIndex === totalSections - 1 || (activeSection && activeSection.classList.contains('light-theme-section'))) {
      document.body.classList.add('scene-climax-active');
    }
  }

  // 6. PHYSICAL PHOTO/VIDEO FRAME STACKING ENGINE
  storySections.forEach((section, index) => {
    const frame = section.querySelector('.photo-frame');
    const spliceLeak = section.querySelector('.splice-light-leak');

    // Incremental Z-index keeps stacked frames in front of each other,
    // while remaining below fixed HUD (90), Roadmap (85), and Margins (80)
    section.style.zIndex = index + 1;

    // Stacking Pin: Each section stays pinned at the top without spacing
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=100%',
      pin: true,
      pinSpacing: false
    });

    // Animate the incoming photo/video frame as it slides over the previous one
    if (index > 0) {
      const prevSection = storySections[index - 1];
      const prevFrame = prevSection ? prevSection.querySelector('.photo-frame') : null;

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          onUpdate: (self) => {
            // Splice light leak burst flaring along the leading edge
            if (spliceLeak) {
              const p = self.progress;
              let flashIntensity = 0;
              if (p > 0.05 && p < 0.95) {
                flashIntensity = Math.sin(p * Math.PI) * 1.0;
              }
              spliceLeak.style.opacity = flashIntensity.toFixed(3);
            }
          }
        }
      })
      // The incoming frame has a deep floating shadow while travelling
      .fromTo(frame, 
        {
          boxShadow: '0 -45px 100px rgba(0, 0, 0, 0.98), 0 25px 60px rgba(0, 0, 0, 0.9)'
        },
        {
          boxShadow: '0 -25px 60px rgba(0, 0, 0, 0.95), 0 20px 45px rgba(0, 0, 0, 0.8)',
          ease: 'none'
        }
      )
      // The previous section underneath dims and recedes slightly into depth
      .to(prevFrame, {
        scale: 0.98,
        filter: 'brightness(0.6) blur(2px)',
        ease: 'none'
      }, 0);
    }
  });

  // 7. ASCENDING ROADMAP NAVIGATION (00 at Bottom -> 14 at Top)
  function updateRoadmap(activeIndex) {
    roadmapDots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute('data-index'), 10);
      if (dotIndex === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    if (progressBar && totalSections > 1) {
      const percentage = (activeIndex / (totalSections - 1)) * 100;
      progressBar.style.height = `${percentage}%`;
    }

    const activeSec = storySections[activeIndex];
    const hudSceneNumber = document.getElementById('hudSceneNumber');
    if (hudSceneNumber && activeSec) {
      const sceneCode = activeSec.getAttribute('data-scene-code') || `SCENE ${String(activeIndex).padStart(2, '0')}`;
      hudSceneNumber.textContent = sceneCode;
    }
  }

  // 8. TEXT & CARD REVEAL CHOREOGRAPHY (SMOOTH, NON-ABRUPT LOADING)
  function revealSceneContent(sceneIndex) {
    const section = storySections[sceneIndex];
    if (!section) return;

    const heroWrapper = document.querySelector('.hero-content-wrapper');

    if (sceneIndex === 0) {
      if (heroWrapper) {
        heroWrapper.style.opacity = '1';
        heroWrapper.style.pointerEvents = 'auto';
      }
      return;
    }

    if (sceneIndex === totalSections - 1) {
      // Scene 14 Climax (Pure Radiant White)
      const climaxTitle = section.querySelector('.climax-title');
      const climaxDesc = section.querySelector('.max-w-2xl');
      const ctaBtns = section.querySelector('.flex.flex-wrap');
      if (climaxTitle) {
        gsap.fromTo(climaxTitle, 
          { opacity: 0.2, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.15 }
        );
      }
      if (climaxDesc) {
        gsap.fromTo(climaxDesc, 
          { opacity: 0.2, y: 12 }, 
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 }
        );
      }
      if (ctaBtns) {
        gsap.fromTo(ctaBtns, 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.45 }
        );
      }
      return;
    }

    // Scenes 01 to 13: Staggered cinematic reveal of Badge, Title, Motto, and Editorial Card
    const badge = section.querySelector('.section-badge');
    const title = section.querySelector('.section-title');
    const motto = section.querySelector('.section-motto');
    const card = section.querySelector('.feature-card');

    const commercialBox = section.querySelector('.commercial-break-box');
    if (commercialBox) {
      gsap.fromTo(commercialBox, 
        { opacity: 0.2, y: -10, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 }
      );
    }

    if (badge) {
      gsap.fromTo(badge, 
        { opacity: 0.2, x: -14 }, 
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.15 }
      );
    }
    if (title) {
      gsap.fromTo(title, 
        { opacity: 0.2, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.25 }
      );
    }
    if (motto) {
      gsap.fromTo(motto, 
        { opacity: 0.2, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.3 }
      );
    }
    if (card) {
      gsap.fromTo(card, 
        { opacity: 0.2, y: 24, scale: 0.985 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out', delay: 0.35 }
      );
    }
  }

  // 9. SECTION-BY-SECTION SCROLL STOP CONTROLLER
  let isTransitioning = false;
  let currentSceneIndex = 0;
  let lastWheelTime = 0;

  // Sync initial scene index on load
  const initialScroll = window.scrollY || document.documentElement.scrollTop;
  currentSceneIndex = Math.min(totalSections - 1, Math.max(0, Math.round(initialScroll / window.innerHeight)));
  updateRoadmap(currentSceneIndex);
  updateEpochMargins(currentSceneIndex);

  const quickNav = document.getElementById('roadmapQuickNav');
  if (quickNav && currentSceneIndex >= 1) {
    quickNav.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
    quickNav.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
  }

  // Initial cinematic entrance for Scene 00 on page load
  if (currentSceneIndex === 0) {
    gsap.fromTo('.hero-logo-box', 
      { opacity: 0, y: 35, scale: 0.92 }, 
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo('.hero-tagline', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', delay: 0.55 }
    );
    gsap.fromTo('.hero-ctas', 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.8 }
    );
    gsap.fromTo('.hero-scroll-indicator', 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.05 }
    );
  }

  function goToScene(targetIndex) {
    if (targetIndex < 0 || targetIndex >= totalSections) return;
    if (targetIndex === currentSceneIndex && isTransitioning) return;

    isTransitioning = true;
    currentSceneIndex = targetIndex;

    const targetSection = storySections[targetIndex];
    const targetScroll = targetIndex * window.innerHeight;

    // Immediately and authoritatively update HUD & Roadmap indicators
    updateRoadmap(targetIndex);
    updateEpochMargins(targetIndex);

    // Audio Controller visibility: Silent Film in Scene 00, revealed in Scene 01+
    const audioContainer = document.getElementById('audioToggleContainer');
    if (audioContainer) {
      if (targetIndex >= 1) {
        audioContainer.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
        audioContainer.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        // If sound was active, restore volume
        if (isSoundOn && masterGain && audioCtx && audioCtx.state !== 'suspended') {
          masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.3);
        }
      } else {
        // Scene 00: SILENT FILM - mute sound immediately
        audioContainer.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
        audioContainer.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        if (masterGain && audioCtx) {
          masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
        }
      }
    }

    // Quick Chapter Navigation Dock visibility: hidden in Scene 00, visible from Scene 01+
    const quickNav = document.getElementById('roadmapQuickNav');
    if (quickNav) {
      if (targetIndex >= 1) {
        quickNav.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
        quickNav.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        quickNav.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
        quickNav.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      }
    }

    // Play active video immediately as transition begins
    const activeVideo = targetSection.querySelector('.video-backdrop');
    if (activeVideo) {
      const replayBtn = targetSection.querySelector('.video-replay-btn');
      if (replayBtn) replayBtn.classList.remove('visible');
      if (activeVideo.ended) {
        activeVideo.currentTime = 0;
      }
      activeVideo.play().catch(() => {});
    }

    // Initialize & play The Set 360 Virtual Stage if entering scene-the-set
    if (targetSection.id === 'scene-the-set') {
      initTheSet360();
      const presenterVid = document.getElementById('theSetPresenterVideo');
      if (presenterVid) presenterVid.play().catch(() => {});
    }

    // Trigger refined text reveal
    revealSceneContent(targetIndex);

    // Guard against multiple settlement calls
    let hasSettled = false;
    const safeSettle = () => {
      if (!hasSettled) {
        hasSettled = true;
        onSceneSettled(targetIndex);
      }
    };

    // Execute smooth scroll to exact section lock point
    if (lenis) {
      lenis.scrollTo(targetScroll, {
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        force: true,
        onComplete: safeSettle
      });
      // Safety timer ensures transition lock is released even during irregular events
      setTimeout(safeSettle, 1250);
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      setTimeout(safeSettle, 1100);
    }
  }

  function onSceneSettled(settledIndex) {
    // Authoritatively re-verify Roadmap & Epoch sync upon landing
    updateRoadmap(settledIndex);
    updateEpochMargins(settledIndex);

    // Pause inactive background videos to maintain optimal performance
    storySections.forEach((sec, idx) => {
      if (idx !== settledIndex) {
        const vid = sec.querySelector('.video-backdrop');
        if (vid && !vid.paused) vid.pause();
      }
    });

    // Pause The Set presenter video if not currently on scene-the-set
    const currentSec = storySections[settledIndex];
    const isTheSet = currentSec && currentSec.id === 'scene-the-set';
    const presenterVid = document.getElementById('theSetPresenterVideo');
    if (presenterVid && !isTheSet && !presenterVid.paused) {
      presenterVid.pause();
    }

    // Release transition lock cleanly
    isTransitioning = false;
  }

  // Mouse Wheel Scroll Listener (Section-by-Section Lock)
  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Ignore micro-scroll tremors or accidental twitches
    if (Math.abs(e.deltaY) < 18) return;

    if (isTransitioning) return;

    lastWheelTime = Date.now();

    if (e.deltaY > 0) {
      if (currentSceneIndex < totalSections - 1) {
        goToScene(currentSceneIndex + 1);
      }
    } else {
      if (currentSceneIndex > 0) {
        goToScene(currentSceneIndex - 1);
      }
    }
  }, { passive: false });

  // Touch Swipe Handling for Mobile / Trackpad Gestures
  let touchStartY = 0;
  let touchStartX = 0;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    // Prevent unconstrained native page dragging
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (isTransitioning) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchStartY - touchEndY;
    const deltaX = touchStartX - touchEndX;

    const isCurrentTheSet = storySections[currentSceneIndex]?.id === 'scene-the-set';
    const swipeThreshold = isCurrentTheSet ? 90 : 35;

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
      if (deltaY > 0) {
        if (currentSceneIndex < totalSections - 1) {
          goToScene(currentSceneIndex + 1);
        }
      } else if (deltaY < 0) {
        if (currentSceneIndex > 0) {
          goToScene(currentSceneIndex - 1);
        }
      }
    }
  }, { passive: true });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (isTransitioning) return;

    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      if (currentSceneIndex < totalSections - 1) {
        goToScene(currentSceneIndex + 1);
      }
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      if (currentSceneIndex > 0) {
        goToScene(currentSceneIndex - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToScene(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToScene(totalSections - 1);
    }
  });

  // Roadmap Navigation Click Handlers
  roadmapDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const dotIndex = parseInt(dot.getAttribute('data-index'), 10);
      goToScene(dotIndex);
    });
  });

  // Hero Scroll Indicator Click Handler (Advance to Scene 01)
  const heroScrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (heroScrollIndicator) {
    heroScrollIndicator.style.cursor = 'pointer';
    heroScrollIndicator.addEventListener('click', () => {
      goToScene(1);
    });
  }

  // Quick Chapter Navigation Click Handlers:
  // Button 1 (Projector): Direct jump to Spotlight Finale (Scene 14)
  // Button 2 (Step Back): 1 step backward (Previous Scene)
  // Button 3 (Clapperboard): Direct jump to Prologue (Scene 00)
  const btnSpotlightDirect = document.getElementById('btnSpotlightDirect');
  if (btnSpotlightDirect) {
    btnSpotlightDirect.addEventListener('click', (e) => {
      e.stopPropagation();
      goToScene(totalSections - 1);
    });
  }

  const btnPrevScene = document.getElementById('btnPrevScene');
  if (btnPrevScene) {
    btnPrevScene.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentSceneIndex > 0) {
        goToScene(currentSceneIndex - 1);
      }
    });
  }

  const btnPrologueDirect = document.getElementById('btnPrologueDirect');
  if (btnPrologueDirect) {
    btnPrologueDirect.addEventListener('click', (e) => {
      e.stopPropagation();
      goToScene(0);
    });
  }

  // Header Brand Logo Click Handler (Reload page instead of opening online URL)
  const headerBrandLogo = document.getElementById('headerBrandLogo');
  if (headerBrandLogo) {
    headerBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.reload();
    });
  }

  // Window Resize Alignment
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
    if (theSetViewer && typeof theSetViewer.resize === 'function') {
      theSetViewer.resize();
    }
    if (!isTransitioning) {
      const targetScroll = currentSceneIndex * window.innerHeight;
      if (lenis) {
        lenis.scrollTo(targetScroll, { immediate: true, force: true });
      } else {
        window.scrollTo(0, targetScroll);
      }
    }
  });

  // 10. FILM NOIR CINEMA AUDIO SOUNDSCAPE (48Hz Sub Drone + Room Tone + Heartbeat & Mechanical Clock)
  let audioCtx = null;
  let isSoundOn = false;
  let masterGain = null;
  let heartbeatTimer = null;
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioStatusText = document.getElementById('audioStatusText');

  function initCinemaAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // A. 48Hz Sub-Bass Drone with 0.5Hz Binaural Breathing
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(48, audioCtx.currentTime);

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(48.5, audioCtx.currentTime);

    const droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(100, audioCtx.currentTime);
    droneFilter.Q.setValueAtTime(2.5, audioCtx.currentTime);

    const droneSubGain = audioCtx.createGain();
    droneSubGain.gain.setValueAtTime(0.25, audioCtx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneSubGain);
    droneSubGain.connect(masterGain);

    osc1.start();
    osc2.start();

    // B. Distant Empty Room Ambience (Filtered Room Tone / Projector Hiss)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Warm pink-ish noise
      lastOut = output[i];
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
    noiseFilter.Q.setValueAtTime(0.9, audioCtx.currentTime);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseNode.start();
  }

  // Trigger visceral heartbeat thud (insomnia pulse) and mechanical clock tick
  function triggerHeartbeatPulse() {
    if (!audioCtx || !isSoundOn || audioCtx.state === 'suspended') return;
    const now = audioCtx.currentTime;

    // 1. Heartbeat Thud (62Hz -> 28Hz sub-bass pitch drop)
    const heartOsc = audioCtx.createOscillator();
    const heartGain = audioCtx.createGain();

    heartOsc.type = 'sine';
    heartOsc.frequency.setValueAtTime(62, now);
    heartOsc.frequency.exponentialRampToValueAtTime(28, now + 0.18);

    heartGain.gain.setValueAtTime(0.35, now);
    heartGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    heartOsc.connect(heartGain);
    heartGain.connect(masterGain);

    heartOsc.start(now);
    heartOsc.stop(now + 0.24);

    // 2. Distant Mechanical Clock Tick (Tock sound 320ms later)
    setTimeout(() => {
      if (!isSoundOn || !audioCtx) return;
      const tickTime = audioCtx.currentTime;

      const tickOsc = audioCtx.createOscillator();
      const tickFilter = audioCtx.createBiquadFilter();
      const tickGain = audioCtx.createGain();

      tickOsc.type = 'square';
      tickOsc.frequency.setValueAtTime(920, tickTime);

      tickFilter.type = 'highpass';
      tickFilter.frequency.setValueAtTime(800, tickTime);

      tickGain.gain.setValueAtTime(0.03, tickTime);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.035);

      tickOsc.connect(tickFilter);
      tickFilter.connect(tickGain);
      tickGain.connect(masterGain);

      tickOsc.start(tickTime);
      tickOsc.stop(tickTime + 0.04);
    }, 320);
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!audioCtx) initCinemaAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      // Dismiss the tooltip permanently on click
      const tooltip = document.getElementById('audioTooltip');
      if (tooltip) {
        gsap.to(tooltip, {
          opacity: 0,
          x: 10,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => { tooltip.style.display = 'none'; }
        });
      }

      isSoundOn = !isSoundOn;
      const audioIcon = document.getElementById('audioIcon');

      if (isSoundOn) {
        masterGain.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.4);
        audioBtn.classList.add('text-[#d4af37]', 'border-[#d4af37]');
        if (audioStatusText) audioStatusText.textContent = 'SOUND [ON]';

        if (audioIcon) {
          audioIcon.setAttribute('data-lucide', 'volume-2');
          audioIcon.classList.remove('text-white/70');
          audioIcon.classList.add('text-[#d4af37]');
        }

        // Unmute any video that has audio (excluding Scene 00 if silent)
        allVideos.forEach((v, vIdx) => {
          if (vIdx !== 0) v.muted = false;
        });

        // Start heartbeat & clock ticking pulse every 1150ms (~52 BPM)
        triggerHeartbeatPulse();
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(triggerHeartbeatPulse, 1150);
      } else {
        masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
        audioBtn.classList.remove('text-[#d4af37]', 'border-[#d4af37]');
        if (audioStatusText) audioStatusText.textContent = 'SOUND [OFF]';

        if (audioIcon) {
          audioIcon.setAttribute('data-lucide', 'volume-x');
          audioIcon.classList.add('text-white/70');
          audioIcon.classList.remove('text-[#d4af37]');
        }

        allVideos.forEach(v => { v.muted = true; });

        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      }

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // 11. PROLOGUE SCENE HOVER INTERACTIVITY
  const heroWrapper = document.querySelector('.hero-content-wrapper');
  if (heroWrapper) {
    heroWrapper.addEventListener('mouseenter', () => {
      if (currentSceneIndex === 0) {
        gsap.to(heroWrapper, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });
  }

  // 12. PRIVACY POLICY MODAL (CINEMATIC CAMERA HUD THEMED)
  const privacyModal = document.getElementById('privacyModal');
  const btnPrivacyPolicy = document.getElementById('btnPrivacyPolicy');
  const closePrivacyModalBtn = document.getElementById('closePrivacyModalBtn');
  const closePrivacyModalFooterBtn = document.getElementById('closePrivacyModalFooterBtn');

  function openPrivacyModal() {
    if (!privacyModal) return;
    privacyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closePrivacyModal() {
    if (!privacyModal) return;
    privacyModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnPrivacyPolicy) {
    btnPrivacyPolicy.addEventListener('click', (e) => {
      e.preventDefault();
      openPrivacyModal();
    });
  }

  if (closePrivacyModalBtn) closePrivacyModalBtn.addEventListener('click', closePrivacyModal);
  if (closePrivacyModalFooterBtn) closePrivacyModalFooterBtn.addEventListener('click', closePrivacyModal);

  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closePrivacyModal();
      }
    });
  }

  // 13. AUDIT & DATA DISCLOSURE MODAL
  const auditModal = document.getElementById('auditModal');
  const btnOpenAuditModal = document.getElementById('btnOpenAuditModal');
  const btnOpenAuditModalSide = document.getElementById('btnOpenAuditModalSide');
  const closeAuditModalBtn = document.getElementById('closeAuditModalBtn');
  const closeAuditModalFooterBtn = document.getElementById('closeAuditModalFooterBtn');

  function openAuditModal() {
    if (!auditModal) return;
    auditModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeAuditModal() {
    if (!auditModal) return;
    auditModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnOpenAuditModal) {
    btnOpenAuditModal.addEventListener('click', (e) => {
      e.preventDefault();
      openAuditModal();
    });
  }

  if (btnOpenAuditModalSide) {
    btnOpenAuditModalSide.addEventListener('click', (e) => {
      e.preventDefault();
      openAuditModal();
    });
  }

  if (closeAuditModalBtn) closeAuditModalBtn.addEventListener('click', closeAuditModal);
  if (closeAuditModalFooterBtn) closeAuditModalFooterBtn.addEventListener('click', closeAuditModal);

  if (auditModal) {
    auditModal.addEventListener('click', (e) => {
      if (e.target === auditModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeAuditModal();
      }
    });
  }

  // 14. DOWNLOAD DESKTOP APP MODAL
  const downloadModal = document.getElementById('downloadModal');
  const btnDownloadDesktopApp = document.getElementById('btnDownloadDesktopApp');
  const closeDownloadModalBtn = document.getElementById('closeDownloadModalBtn');
  const closeDownloadModalFooterBtn = document.getElementById('closeDownloadModalFooterBtn');

  function openDownloadModal() {
    if (!downloadModal) return;
    downloadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeDownloadModal() {
    if (!downloadModal) return;
    downloadModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnDownloadDesktopApp) {
    btnDownloadDesktopApp.addEventListener('click', (e) => {
      e.preventDefault();
      openDownloadModal();
    });
  }

  if (closeDownloadModalBtn) closeDownloadModalBtn.addEventListener('click', closeDownloadModal);
  if (closeDownloadModalFooterBtn) closeDownloadModalFooterBtn.addEventListener('click', closeDownloadModal);

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeDownloadModal();
      }
    });
  }

  // 15. EARLY ACCESS WAITLIST MODAL
  const earlyAccessModal = document.getElementById('earlyAccessModal');
  const btnOpenEarlyAccessHero = document.getElementById('btnOpenEarlyAccessHero');
  const btnOpenEarlyAccessFinale = document.getElementById('btnOpenEarlyAccessFinale');
  const closeEarlyAccessModalBtn = document.getElementById('closeEarlyAccessModalBtn');
  const closeEarlyAccessModalFooterBtn = document.getElementById('closeEarlyAccessModalFooterBtn');
  const earlyAccessForm = document.getElementById('earlyAccessForm');

  function openEarlyAccessModal() {
    if (!earlyAccessModal) return;
    earlyAccessModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeEarlyAccessModal() {
    if (!earlyAccessModal) return;
    earlyAccessModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnOpenEarlyAccessHero) {
    btnOpenEarlyAccessHero.addEventListener('click', (e) => {
      e.preventDefault();
      openEarlyAccessModal();
    });
  }

  if (btnOpenEarlyAccessFinale) {
    btnOpenEarlyAccessFinale.addEventListener('click', (e) => {
      e.preventDefault();
      openEarlyAccessModal();
    });
  }

  if (closeEarlyAccessModalBtn) closeEarlyAccessModalBtn.addEventListener('click', closeEarlyAccessModal);
  if (closeEarlyAccessModalFooterBtn) closeEarlyAccessModalFooterBtn.addEventListener('click', closeEarlyAccessModal);

  if (earlyAccessModal) {
    earlyAccessModal.addEventListener('click', (e) => {
      if (e.target === earlyAccessModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeEarlyAccessModal();
      }
    });
  }

  if (earlyAccessForm) {
    earlyAccessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('eaFullName')?.value || '';
      const email = document.getElementById('eaEmail')?.value || '';
      const role = document.getElementById('eaRole')?.value || '';
      const stage = document.getElementById('eaStage')?.value || '';

      try {
        localStorage.setItem('withif_early_access', JSON.stringify({ name, email, role, stage, timestamp: new Date().toISOString() }));
      } catch (err) {}

      const fieldsBox = document.getElementById('earlyAccessFormFields');
      const successBox = document.getElementById('earlyAccessSuccessState');
      if (fieldsBox) fieldsBox.classList.add('hidden');
      if (successBox) successBox.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // 16. TERMS OF SERVICE MODAL
  const termsModal = document.getElementById('termsModal');
  const btnOpenTermsModal = document.getElementById('btnOpenTermsModal');
  const closeTermsModalBtn = document.getElementById('closeTermsModalBtn');
  const closeTermsModalFooterBtn = document.getElementById('closeTermsModalFooterBtn');

  function openTermsModal() {
    if (!termsModal) return;
    termsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeTermsModal() {
    if (!termsModal) return;
    termsModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnOpenTermsModal) {
    btnOpenTermsModal.addEventListener('click', (e) => {
      e.preventDefault();
      openTermsModal();
    });
  }

  if (closeTermsModalBtn) closeTermsModalBtn.addEventListener('click', closeTermsModal);
  if (closeTermsModalFooterBtn) closeTermsModalFooterBtn.addEventListener('click', closeTermsModal);

  if (termsModal) {
    termsModal.addEventListener('click', (e) => {
      if (e.target === termsModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeTermsModal();
      }
    });
  }

  // 17. AI MEDIA & SYNTHID DISCLOSURE MODAL
  const aiDisclosureModal = document.getElementById('aiDisclosureModal');
  const btnOpenAiDisclosureModal = document.getElementById('btnOpenAiDisclosureModal');
  const closeAiDisclosureModalBtn = document.getElementById('closeAiDisclosureModalBtn');
  const closeAiDisclosureModalFooterBtn = document.getElementById('closeAiDisclosureModalFooterBtn');

  function openAiDisclosureModal() {
    if (!aiDisclosureModal) return;
    aiDisclosureModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeAiDisclosureModal() {
    if (!aiDisclosureModal) return;
    aiDisclosureModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnOpenAiDisclosureModal) {
    btnOpenAiDisclosureModal.addEventListener('click', (e) => {
      e.preventDefault();
      openAiDisclosureModal();
    });
  }

  if (closeAiDisclosureModalBtn) closeAiDisclosureModalBtn.addEventListener('click', closeAiDisclosureModal);
  if (closeAiDisclosureModalFooterBtn) closeAiDisclosureModalFooterBtn.addEventListener('click', closeAiDisclosureModal);

  if (aiDisclosureModal) {
    aiDisclosureModal.addEventListener('click', (e) => {
      if (e.target === aiDisclosureModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeAiDisclosureModal();
      }
    });
  }

  // 18. CREDITS & SPECIFICATIONS MODAL
  const creditsModal = document.getElementById('creditsModal');
  const btnOpenCreditsModal = document.getElementById('btnOpenCreditsModal');
  const closeCreditsModalBtn = document.getElementById('closeCreditsModalBtn');
  const closeCreditsModalFooterBtn = document.getElementById('closeCreditsModalFooterBtn');

  function openCreditsModal() {
    if (!creditsModal) return;
    creditsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }
  }

  function closeCreditsModal() {
    if (!creditsModal) return;
    creditsModal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }

  if (btnOpenCreditsModal) {
    btnOpenCreditsModal.addEventListener('click', (e) => {
      e.preventDefault();
      openCreditsModal();
    });
  }

  if (closeCreditsModalBtn) closeCreditsModalBtn.addEventListener('click', closeCreditsModal);
  if (closeCreditsModalFooterBtn) closeCreditsModalFooterBtn.addEventListener('click', closeCreditsModal);

  if (creditsModal) {
    creditsModal.addEventListener('click', (e) => {
      if (e.target === creditsModal || e.target.classList.contains('privacy-modal-backdrop')) {
        closeCreditsModal();
      }
    });
  }

  // Global Escape Key Listener for all Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (privacyModal && privacyModal.classList.contains('active')) closePrivacyModal();
      if (auditModal && auditModal.classList.contains('active')) closeAuditModal();
      if (downloadModal && downloadModal.classList.contains('active')) closeDownloadModal();
      if (earlyAccessModal && earlyAccessModal.classList.contains('active')) closeEarlyAccessModal();
      if (termsModal && termsModal.classList.contains('active')) closeTermsModal();
      if (aiDisclosureModal && aiDisclosureModal.classList.contains('active')) closeAiDisclosureModal();
      if (creditsModal && creditsModal.classList.contains('active')) closeCreditsModal();
    }
  });

  // Also bind Scene 14 Footer Privacy link to open Privacy Modal
  const btnOpenPrivacyModalFooter = document.getElementById('btnOpenPrivacyModalFooter');
  if (btnOpenPrivacyModalFooter) {
    btnOpenPrivacyModalFooter.addEventListener('click', (e) => {
      e.preventDefault();
      openPrivacyModal();
    });
  }

  // 13. The Set 360° Virtual Production Soundstage (Pannellum Engine & Presenter Audio)
  let theSetViewer = null;

  function initTheSet360() {
    if (theSetViewer || typeof pannellum === 'undefined') return;
    const container = document.getElementById('theSetPanorama');
    if (!container) return;

    try {
      theSetViewer = pannellum.viewer('theSetPanorama', {
        type: 'equirectangular',
        panorama: 'assets/images/the_set_360.jpg',
        autoLoad: true,
        autoRotate: -2.0,
        autoRotateInactivityDelay: 3000,
        compass: false,
        showControls: false,
        mouseZoom: false,
        hfov: 100,
        minHfov: 70,
        maxHfov: 120
      });

      // Fade out central 360 globe badge on first user interaction
      const fadeCue = () => {
        const globe = document.getElementById('theSetCenterGlobe');
        if (globe) {
          globe.classList.add('faded');
        }
      };
      container.addEventListener('mousedown', fadeCue, { once: true });
      container.addEventListener('touchstart', fadeCue, { once: true });
    } catch (err) {
      console.warn('Pannellum init error:', err);
    }
  }

  // Presenter Sound Button Toggle: [ TAP FOR SOUND 🎙️ ]
  const btnTheSetSound = document.getElementById('btnTheSetSound');
  const theSetPresenterVideo = document.getElementById('theSetPresenterVideo');
  const theSetSoundIcon = document.getElementById('theSetSoundIcon');
  const theSetSoundText = document.getElementById('theSetSoundText');

  if (btnTheSetSound && theSetPresenterVideo) {
    btnTheSetSound.addEventListener('click', (e) => {
      e.stopPropagation();
      if (theSetPresenterVideo.muted) {
        theSetPresenterVideo.muted = false;
        theSetPresenterVideo.play().catch(() => {});
        if (theSetSoundText) theSetSoundText.textContent = 'SOUND [ON] 🎙️';
        btnTheSetSound.classList.add('bg-[#38e07b]', 'text-[#07150e]', 'border-[#38e07b]');
        btnTheSetSound.classList.remove('bg-[#d4af37]/10', 'text-[#d4af37]', 'border-[#d4af37]');
        if (theSetSoundIcon) {
          theSetSoundIcon.setAttribute('data-lucide', 'volume-2');
        }
      } else {
        theSetPresenterVideo.muted = true;
        if (theSetSoundText) theSetSoundText.textContent = 'TAP FOR SOUND 🎙️';
        btnTheSetSound.classList.remove('bg-[#38e07b]', 'text-[#07150e]', 'border-[#38e07b]');
        btnTheSetSound.classList.add('bg-[#d4af37]/10', 'text-[#d4af37]', 'border-[#d4af37]');
        if (theSetSoundIcon) {
          theSetSoundIcon.setAttribute('data-lucide', 'volume-x');
        }
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // If initial load starts on scene-the-set, initialize immediately
  if (storySections[currentSceneIndex] && storySections[currentSceneIndex].id === 'scene-the-set') {
    initTheSet360();
  }

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Refresh triggers on full load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});
