/* ========================================
   Newfoundation — macOS Desktop Simulation
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================================
     Menu Bar Clock
     ======================================== */

  const menuClock = document.getElementById('menuClock');

  function updateClock() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    menuClock.textContent =
      `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}  ${hours}:${minutes} ${ampm}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ========================================
     Boot Sequence
     ======================================== */

  const bootScreen = document.getElementById('bootScreen');
  const bootFill = document.getElementById('bootProgressFill');
  const snapContainer = document.getElementById('snapContainer');

  let bootProgress = 0;

  function advanceBoot() {
    // Random increment to mimic real loading jitter
    bootProgress += 2 + Math.random() * 4;
    if (bootProgress >= 100) {
      bootProgress = 100;
      bootFill.style.width = '100%';
      // Small pause at 100%, then reveal desktop
      setTimeout(() => {
        bootScreen.classList.add('done');
        snapContainer.style.opacity = '1';
        // Remove boot screen from DOM after transition
        setTimeout(() => bootScreen.remove(), 600);
      }, 300);
      return;
    }
    bootFill.style.width = bootProgress + '%';
    setTimeout(advanceBoot, 40 + Math.random() * 60);
  }

  // Start filling after logo + track have faded in (~1.4s)
  setTimeout(advanceBoot, 1400);

  const TITLE_TEXT = 'Newfoundation ';

  const BODY_TEXT = 'is a global ecosystem of researchers, thinkers and engineers building a new coordination substrate for human machine cultural evolution. AGI will not be a model, but a network of specialised cognitive and computational nodes operating on a common protocol. Our ecosystem combines decades of experience in cryptography, game theory, machine learning and open protocols from DeepMind, Google Research, Holochain, MIT, UC Berkeley and UCL. By favoring emergent order over top-down control, and cooperation over extraction, we aim to foster a self-organizing ecology where intelligence is cultivated and evolved like organic systems.';

  /* ========================================
     Text helpers
     ======================================== */

  function splitIntoWords(text, container) {
    const words = text.split(/(\s+)/);
    const wordSpans = [];
    words.forEach(part => {
      if (/^\s+$/.test(part)) {
        container.appendChild(document.createTextNode(part));
      } else if (part.length > 0) {
        const span = document.createElement('span');
        span.classList.add('char');
        span.textContent = part;
        container.appendChild(span);
        wordSpans.push(span);
      }
    });
    return wordSpans;
  }

  /* ========================================
     Elements
     ======================================== */

  const logo = document.getElementById('logo');
  const titleEl = document.getElementById('title');
  const bodyEl = document.getElementById('bodyText');
  const screenText = document.getElementById('screenText');
  const textFlow = document.getElementById('textFlow');
  const desktopArea = document.getElementById('desktopArea');

  /* ---- Build word spans ---- */
  const titleWords = splitIntoWords(TITLE_TEXT, titleEl);
  const allBodyWords = splitIntoWords(BODY_TEXT, bodyEl);

  /* ---- Style brand names with NewfoundationWhyte ---- */
  const brandWords = ['DeepMind', 'Google', 'Research', 'Holochain', 'MIT', 'UC', 'Berkeley', 'UCL'];
  /* ---- Style special words with ABCViafont ---- */
  const viafontWords = ['machine', 'AGI', 'ecology', 'systems', 'systems.'];

  // Find the last "systems" span so we can keep it in Garamond
  let lastSystemsSpan = null;
  allBodyWords.forEach(span => {
    const word = span.textContent.replace(/[.,;:!?]/g, '');
    if (word === 'systems') lastSystemsSpan = span;
  });

  allBodyWords.forEach(span => {
    const word = span.textContent.replace(/[.,;:!?]/g, '');
    if (brandWords.includes(word)) {
      span.classList.add('brand-name');
    }
    // Apply viafont to all matching words except the last "systems"
    if (span !== lastSystemsSpan && (viafontWords.includes(span.textContent.trim()) || viafontWords.includes(word))) {
      span.classList.add('viafont-word');
    }
  });

  /* ========================================
     Menu Bar — Dropdown
     ======================================== */

  const menuFiles = document.getElementById('menuFiles');
  const dropdownFiles = document.getElementById('dropdownFiles');
  const menuAbout = document.getElementById('menuAbout');

  // Toggle Files dropdown
  menuFiles.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownFiles.classList.toggle('open');
  });

  // Close dropdown when clicking elsewhere
  document.addEventListener('click', () => {
    dropdownFiles.classList.remove('open');
  });

  // ---- Scroll elevator (GSAP-powered snap) ----
  const screenFinal = document.getElementById('screenFinal');
  const screenConnectEl = document.getElementById('screenConnect');
  const screenExplorationsEl = document.getElementById('screenExplorations');
  const screens = [document.getElementById('screenDesktop'), screenText, screenExplorationsEl, screenConnectEl, screenFinal];
  let currentScreen = 0;
  let isScrolling = false;

  // ---- URL hash ↔ screen mapping ----
  const screenSlugs = ['desktop', 'about', 'work', 'connect', 'thanks'];

  function slugToIndex(slug) {
    const idx = screenSlugs.indexOf(slug);
    return idx >= 0 ? idx : 0;
  }

  function scrollToScreen(index, { animated = true, updateHash = true } = {}) {
    if (index < 0 || index >= screens.length || isScrolling) return;
    isScrolling = true;
    currentScreen = index;

    // Update URL hash (replaceState to avoid polluting history on every scroll)
    if (updateHash) {
      const slug = screenSlugs[index];
      if (slug) {
        history.replaceState(null, '', '#' + slug);
      }
    }

    if (animated) {
      gsap.to(snapContainer, {
        scrollTop: screens[index].offsetTop,
        duration: 1,
        ease: 'power3.inOut',
        onComplete: () => { isScrolling = false; }
      });
    } else {
      gsap.killTweensOf(snapContainer);
      snapContainer.scrollTop = screens[index].offsetTop;
      isScrolling = false;
    }
  }

  // ---- Re-snap on resize (universal fix) ----
  window.addEventListener('resize', () => {
    // Instantly jump to current screen's new position after layout reflow
    requestAnimationFrame(() => {
      snapContainer.scrollTop = screens[currentScreen].offsetTop;
    });
  });

  // About menu → go to Screen 2
  menuAbout.addEventListener('click', () => scrollToScreen(1));

  // Our Work menu → go to Explorations screen
  const menuOurWork = document.getElementById('menuOurWork');
  menuOurWork.addEventListener('click', () => scrollToScreen(2));

  // Desktop About icon → scroll to About section
  const desktopAboutIcon = document.getElementById('desktopAboutIcon');
  let lastAboutClick = 0;
  desktopAboutIcon.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastAboutClick < 400) {
      scrollToScreen(1);
      lastAboutClick = 0;
    } else {
      lastAboutClick = now;
    }
  });

  // Desktop Explorations icon → scroll to Explorations section
  const desktopExplorationsIcon = document.getElementById('desktopExplorationsIcon');
  let lastExplorationsClick = 0;
  desktopExplorationsIcon.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastExplorationsClick < 400) {
      scrollToScreen(2);
      lastExplorationsClick = 0;
    } else {
      lastExplorationsClick = now;
    }
  });

  // Wheel-driven elevator
  snapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isScrolling) return;
    if (e.deltaY > 30) scrollToScreen(currentScreen + 1);
    else if (e.deltaY < -30) scrollToScreen(currentScreen - 1);
  }, { passive: false });

  // Touch-driven elevator
  let touchStartY = 0;
  snapContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  snapContainer.addEventListener('touchend', (e) => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      scrollToScreen(currentScreen + (delta > 0 ? 1 : -1));
    }
  }, { passive: true });

  /* ========================================
     Draggable Desktop Icons
     ======================================== */

  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    let isDragging = false;
    let startX, startY, iconStartX, iconStartY;

    function onPointerDown(e) {
      e.preventDefault();
      isDragging = true;
      icon.classList.add('dragging');

      const touch = e.touches ? e.touches[0] : e;
      startX = touch.clientX;
      startY = touch.clientY;

      const rect = icon.getBoundingClientRect();
      iconStartX = rect.left;
      iconStartY = rect.top;

      // Switch to fixed positioning for smooth dragging
      icon.style.position = 'fixed';
      icon.style.left = iconStartX + 'px';
      icon.style.top = iconStartY + 'px';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Clamp within desktop area
      const areaRect = desktopArea.getBoundingClientRect();
      const iconW = icon.offsetWidth;
      const iconH = icon.offsetHeight;

      let newX = iconStartX + dx;
      let newY = iconStartY + dy;

      newX = Math.max(areaRect.left, Math.min(newX, areaRect.right - iconW));
      newY = Math.max(areaRect.top, Math.min(newY, areaRect.bottom - iconH));

      icon.style.left = newX + 'px';
      icon.style.top = newY + 'px';
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      icon.classList.remove('dragging');

      // Convert fixed position back to absolute within desktop area
      const areaRect = desktopArea.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();

      const relX = ((iconRect.left - areaRect.left) / areaRect.width) * 100;
      const relY = ((iconRect.top - areaRect.top) / areaRect.height) * 100;

      icon.style.position = 'absolute';
      icon.style.left = relX + '%';
      icon.style.top = relY + '%';
    }

    // Mouse events
    icon.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    // Touch events
    icon.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  });

  /* ========================================
     Auto-fit text on Screen 2
     Binary search for largest font that fits
     ======================================== */

  let textAnimPlayed = false;
  let textTimeline = null;

  function fitText() {
    // Temporarily show everything for measurement
    textFlow.querySelectorAll('.char').forEach(s => s.style.opacity = '1');
    logo.style.opacity = '1';

    const style = getComputedStyle(screenText);
    const padH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    // ceil to avoid sub-pixel rounding: scrollWidth is an integer
    const maxW = Math.ceil(screenText.clientWidth - padH);
    const maxH = Math.ceil(screenText.clientHeight - padV);

    textFlow.style.transition = 'none';

    let lo = 8, hi = 120, best = 16;

    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      textFlow.style.fontSize = mid + 'px';

      if (textFlow.scrollWidth <= maxW && textFlow.scrollHeight <= maxH) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Apply a small safety margin to prevent sub-pixel overflow
    best = best * 0.89;
    textFlow.style.fontSize = best + 'px';

    // Hide again — animation will reveal
    if (!textAnimPlayed) {
      textFlow.querySelectorAll('.char').forEach(s => s.style.opacity = '');
      logo.style.opacity = '';
    }

    requestAnimationFrame(() => {
      textFlow.style.transition = '';
    });
  }

  fitText();

  /* ========================================
     Auto-fit text in Exploration Cards
     Binary search for largest font that fills each card
     ======================================== */

  function fitExplorationCards() {
    // Helper: find best font size for a single card
    function findBestSize(card, titleEl, descEl, ratio, maxSize) {
      card.style.overflow = 'visible';
      const origTitleOp = titleEl.style.opacity;
      const origDescOp = descEl.style.opacity;
      titleEl.style.opacity = '1';
      descEl.style.opacity = '1';

      const maxW = card.clientWidth;
      const maxH = card.clientHeight;

      let lo = 8, hi = maxSize, best = 8;

      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        titleEl.style.fontSize = mid + 'px';
        descEl.style.fontSize = (mid * ratio) + 'px';

        if (card.scrollWidth <= maxW && card.scrollHeight <= maxH) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }

      // Reset to avoid visual flash
      titleEl.style.fontSize = '';
      descEl.style.fontSize = '';
      card.style.overflow = '';
      titleEl.style.opacity = origTitleOp;
      descEl.style.opacity = origDescOp;

      return best;
    }

    // --- Find best size for each card type independently ---
    const cards = document.querySelectorAll('.exploration-card');
    const projCards = document.querySelectorAll('.exploration-project-card');
    const descRatio = 0.92;
    let minResearchSize = Infinity;
    let minProjSize = Infinity;

    cards.forEach(card => {
      const title = card.querySelector('.exploration-card-title');
      const desc = card.querySelector('.exploration-card-desc');
      if (!title || !desc) return;
      const best = findBestSize(card, title, desc, descRatio, 80);
      if (best < minResearchSize) minResearchSize = best;
    });

    projCards.forEach(card => {
      const title = card.querySelector('.exploration-card-title');
      const desc = card.querySelector('.exploration-card-desc');
      if (!title || !desc) return;
      const best = findBestSize(card, title, desc, descRatio, 60);
      if (best < minProjSize) minProjSize = best;
    });

    // Use the same size for both types — take the smaller of the two
    const unifiedSize = Math.min(minResearchSize * 0.88, minProjSize * 0.95);

    cards.forEach(card => {
      const title = card.querySelector('.exploration-card-title');
      const desc = card.querySelector('.exploration-card-desc');
      if (!title || !desc) return;
      title.style.fontSize = unifiedSize + 'px';
      desc.style.fontSize = (unifiedSize * descRatio) + 'px';
    });

    projCards.forEach(card => {
      const title = card.querySelector('.exploration-card-title');
      const desc = card.querySelector('.exploration-card-desc');
      if (!title || !desc) return;
      title.style.fontSize = unifiedSize + 'px';
      desc.style.fontSize = (unifiedSize * descRatio) + 'px';
    });
  }

  fitExplorationCards();

  let resizeRAF;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      fitText();
      fitExplorationCards();
    });
  });

  /* ========================================
     Typewriter animation on scroll to Screen 2
     ======================================== */

  const allAnimated = [logo, ...titleWords, ...allBodyWords];

  function resetTextAnim() {
    if (textTimeline) { textTimeline.kill(); textTimeline = null; }
    // Reset all chars to hidden
    allAnimated.forEach(el => {
      gsap.set(el, { opacity: 0, y: 15 });
    });
    textAnimPlayed = false;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !textAnimPlayed) {
        textAnimPlayed = true;

        textTimeline = gsap.timeline({ delay: 0.15 }).to(allAnimated, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: {
            each: 0.016,
            ease: 'none'
          },
          ease: 'power2.out'
        });
      } else if (!entry.isIntersecting && textAnimPlayed) {
        resetTextAnim();
      }
    });
  }, {
    threshold: 0.5
  });

  observer.observe(screenText);

  /* ========================================
     Screen 3: Final section animation
     ======================================== */

  let finalAnimPlayed = false;
  let finalTimeline = null;
  const finalTitle = document.querySelector('.final-title');
  const finalWords = document.querySelectorAll('.final-word');
  const finalFooter = document.querySelector('.final-flower');
  const finalVideo = document.querySelector('.final-video-bg');
  const finalCopyright = document.querySelector('.final-copyright');

  // Split title into individual letter spans for typewriter effect
  const titleText = finalTitle.textContent;
  finalTitle.textContent = '';
  const letterSpans = [];
  for (let i = 0; i < titleText.length; i++) {
    const span = document.createElement('span');
    span.classList.add('letter');
    span.textContent = titleText[i] === ' ' ? '\u00A0' : titleText[i];
    finalTitle.appendChild(span);
    letterSpans.push(span);
  }

  function resetFinalAnim() {
    if (finalTimeline) { finalTimeline.kill(); finalTimeline = null; }
    // Reset all animated elements
    gsap.set(letterSpans, { opacity: 0, y: 15 });
    gsap.set(finalWords, { opacity: 0, y: 10 });
    gsap.set(finalFooter, { opacity: 0, y: 10 });
    gsap.set(finalCopyright, { opacity: 0, y: 10 });
    finalVideo.classList.remove('visible');
    const fBtt = document.getElementById('finalBackToTop');
    if (fBtt) fBtt.classList.remove('visible');
    finalAnimPlayed = false;
  }

  const finalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !finalAnimPlayed) {
        finalAnimPlayed = true;

        finalTimeline = gsap.timeline({ delay: 0.2 });

        // Start video fade-in very early
        finalTimeline.call(() => {
          finalVideo.classList.add('visible');
        }, null, 0.3);

        // Title letters land one by one — typewriter style
        finalTimeline.to(letterSpans, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: {
            each: 0.04,
            ease: 'none'
          },
          ease: 'power2.out'
        }, 0);

        // Each thank-you word lands softly
        finalTimeline.to(finalWords, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: {
            each: 0.05,
            ease: 'none'
          },
          ease: 'power2.out'
        }, '-=0.3');

        // Footer fades in
        finalTimeline.to(finalFooter, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.2');

        // Copyright fades in
        finalTimeline.to(finalCopyright, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.4');

        // Back-to-top fades in at the end
        finalTimeline.call(() => {
          const fBtt = document.getElementById('finalBackToTop');
          if (fBtt) fBtt.classList.add('visible');
        });
      } else if (!entry.isIntersecting && finalAnimPlayed) {
        resetFinalAnim();
      }
    });
  }, {
    threshold: 0.3
  });

  finalObserver.observe(screenFinal);

  /* ========================================
     QuickTime Player Overlay
     ======================================== */

  const qtOverlay = document.getElementById('qtOverlay');
  const qtPlayer = document.getElementById('qtPlayer');
  const qtClose = document.getElementById('qtClose');
  const qtVimeoFrame = document.getElementById('qtVimeoFrame');
  const keynoteIcon = document.getElementById('keynoteIcon');
  const qtTitlebar = document.getElementById('qtTitlebar');

  const VIMEO_EMBED_URL = 'https://player.vimeo.com/video/1126097552?autoplay=1&title=0&byline=0&portrait=0&dnt=1';

  // Track click timing for double-click detection (since icons are draggable,
  // we only open on double-click so single-click + drag still works)
  let lastKeynoteClick = 0;

  function openQTPlayer() {
    // Reset to center
    qtPlayer.style.left = '50%';
    qtPlayer.style.top = '50%';
    qtPlayer.style.transform = '';
    qtPlayer.classList.remove('dragging');
    qtVimeoFrame.src = VIMEO_EMBED_URL;
    qtOverlay.classList.add('open');
  }

  function closeQTPlayer() {
    qtOverlay.classList.remove('open');
    qtPlayer.classList.remove('dragging');
    // After the close animation, unload the iframe
    setTimeout(() => {
      qtVimeoFrame.src = '';
    }, 400);
  }

  // Open on click of Keynote icon
  keynoteIcon.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQTPlayer();
  });

  // Close button
  qtClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeQTPlayer();
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qtOverlay.classList.contains('open')) {
      closeQTPlayer();
    }
  });

  /* ---- Draggable title bar ---- */

  let isDraggingPlayer = false;
  let dragStartX, dragStartY, playerStartX, playerStartY;

  qtTitlebar.addEventListener('mousedown', (e) => {
    // Don't drag when clicking traffic light buttons
    if (e.target.closest('.qt-traffic-lights')) return;

    isDraggingPlayer = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = qtPlayer.getBoundingClientRect();
    playerStartX = rect.left;
    playerStartY = rect.top;

    // Switch from translate-centered to absolute pixel positioning
    qtPlayer.classList.add('dragging');
    qtPlayer.style.left = rect.left + 'px';
    qtPlayer.style.top = rect.top + 'px';
    qtPlayer.style.transform = 'none';

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDraggingPlayer) return;
    e.preventDefault();

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    qtPlayer.style.left = (playerStartX + dx) + 'px';
    qtPlayer.style.top = (playerStartY + dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDraggingPlayer = false;
  });

  /* ========================================
     Navigate to Connect Section
     ======================================== */

  const screenConnect = document.getElementById('screenConnect');
  const menuHelp = document.getElementById('menuHelp');

  function scrollToConnectSection() {
    scrollToScreen(3);
    // Focus name input after scroll
    const nameInput = document.getElementById('connectInputName');
    if (nameInput && window.connectCurrentStep === 0) {
      setTimeout(() => nameInput.focus(), 800);
    }
  }

  // Dock connect icon → scroll to connect section
  const dockConnect = document.getElementById('dockConnect');
  dockConnect.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToConnectSection();
  });

  // Help menu → scroll to connect section
  menuHelp.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToConnectSection();
  });

  // Connect logo → scroll back to home/desktop
  const connectLogoLink = document.getElementById('connectLogoLink');
  if (connectLogoLink) {
    connectLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToScreen(0);
    });
  }

  /* ========================================
     Connect Form — Scroll-in Animation
     (same style as Screen 2 text animation)
     ======================================== */

  let connectAnimPlayed = false;
  let connectTimeline = null;
  const connectLogo = document.getElementById('connectLogo');
  const connectFormShell = document.getElementById('connectFormShell');
  const connectAnimTargets = [connectLogo, connectFormShell];

  function resetConnectAnim() {
    if (connectTimeline) { connectTimeline.kill(); connectTimeline = null; }
    gsap.set(connectAnimTargets, { opacity: 0, y: 15 });
    // Also reset intro word spans and button
    const introChars = document.querySelectorAll('.connect-intro-text .char');
    const introBtn = document.querySelector('.connect-intro ~ .connect-btn-row');
    if (introChars.length) gsap.set(introChars, { opacity: 0, y: 15 });
    if (introBtn) gsap.set(introBtn, { opacity: 0, y: 15 });
    connectAnimPlayed = false;
  }

  const connectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !connectAnimPlayed) {
        connectAnimPlayed = true;

        // Check for intro word spans (word-by-word stagger like about page)
        const introChars = document.querySelectorAll('.connect-intro-text .char');
        const introBtn = document.querySelector('.connect-intro ~ .connect-btn-row');

        if (introChars.length > 0) {
          // Make form shell visible immediately so words can animate inside it
          gsap.set(connectFormShell, { opacity: 1, y: 0 });

          const targets = [connectLogo, ...introChars];
          if (introBtn) targets.push(introBtn);

          connectTimeline = gsap.timeline({ delay: 0.15 }).to(targets, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: {
              each: 0.016,
              ease: 'none'
            },
            ease: 'power2.out'
          });
        } else {
          // Fallback: simple fade for non-intro steps
          connectTimeline = gsap.timeline({ delay: 0.15 }).to(connectAnimTargets, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: {
              each: 0.12,
              ease: 'none'
            },
            ease: 'power2.out'
          });
        }
      } else if (!entry.isIntersecting && connectAnimPlayed) {
        resetConnectAnim();
      }
    });
  }, {
    threshold: 0.5
  });

  connectObserver.observe(screenConnectEl);

  /* ========================================
     Explorations — Scroll-in Animation
     ======================================== */

  let explorationsAnimPlayed = false;
  let explorationsTimeline = null;
  const explorationsInner = document.querySelector('.explorations-inner');
  const explorationCards = document.querySelectorAll('.exploration-card');
  const projectCards = document.querySelectorAll('.exploration-project-card');

  function resetExplorationsAnim() {
    if (explorationsTimeline) { explorationsTimeline.kill(); explorationsTimeline = null; }
    gsap.set(explorationsInner, { opacity: 0, y: 15 });
    gsap.set(explorationCards, { opacity: 0, y: 15 });
    gsap.set(projectCards, { opacity: 0, y: 15 });
    explorationsAnimPlayed = false;
  }

  const explorationsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !explorationsAnimPlayed) {
        explorationsAnimPlayed = true;

        explorationsTimeline = gsap.timeline({ delay: 0.15 });

        // Container fades in
        explorationsTimeline.to(explorationsInner, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        });

        // Cards stagger in
        explorationsTimeline.to(explorationCards, {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: {
            each: 0.1,
            ease: 'none'
          },
          ease: 'power2.out'
        }, '-=0.3');

        // Project link cards stagger in
        explorationsTimeline.to(projectCards, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: {
            each: 0.08,
            ease: 'none'
          },
          ease: 'power2.out'
        }, '-=0.4');
      } else if (!entry.isIntersecting && explorationsAnimPlayed) {
        resetExplorationsAnim();
      }
    });
  }, {
    threshold: 0.15
  });

  explorationsObserver.observe(screenExplorationsEl);

  /* ========================================
     Back-to-Top Buttons
     ======================================== */

  const finalBackToTop = document.getElementById('finalBackToTop');

  function goBackToTop() {
    scrollToScreen(0);
  }

  // Final screen back-to-top
  finalBackToTop.addEventListener('click', goBackToTop);

  // Connect form back-to-top — handled dynamically by the form engine

  // Back-to-top visibility is now handled by the final animation timeline

  /* ========================================
     Finder Windows (Inspiration & Trash)
     ======================================== */

  // Open Finder from dock
  document.getElementById('dockFinder').addEventListener('click', () => {
    document.getElementById('finderInspirationOverlay').classList.add('active');
  });

  document.getElementById('dockTrash').addEventListener('click', () => {
    document.getElementById('finderTrashOverlay').classList.add('active');
  });

  // Close buttons
  document.querySelectorAll('.finder-btn-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlayId = btn.getAttribute('data-close');
      const overlay = document.getElementById(overlayId);
      if (overlay) overlay.classList.remove('active');
    });
  });

  // Click outside to close
  document.querySelectorAll('.finder-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Draggable Finder title bars
  document.querySelectorAll('.finder-titlebar').forEach(titlebar => {
    const windowId = titlebar.getAttribute('data-finder');
    const win = document.getElementById(windowId);
    let isDrag = false, sx, sy, wx, wy;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.finder-traffic-lights')) return;
      isDrag = true;
      sx = e.clientX;
      sy = e.clientY;
      const rect = win.getBoundingClientRect();
      wx = rect.left;
      wy = rect.top;
      win.classList.add('dragging');
      win.style.left = wx + 'px';
      win.style.top = wy + 'px';
      win.style.transform = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDrag) return;
      win.style.left = (wx + e.clientX - sx) + 'px';
      win.style.top = (wy + e.clientY - sy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDrag) {
        isDrag = false;
        // Keep position but remove dragging class
      }
    });
  });

  /* ========================================
     Connect Form Logic — Data-Driven Engine
     ======================================== */

  (() => {
    'use strict';

    const STORAGE_KEY = 'nf_connect_form_v2';

    // ============================================================
    // FORM CONFIGURATION
    // Each step has: id, question (optional), fields[], buttonText
    // Fields: { key, label, type, required, placeholder, description, options }
    // Branches: step with `branches` array, each { when, steps[] }
    // ============================================================

    const STEPS_BEFORE_BRANCH = [
      {
        id: 'intro',
        isIntro: true,
        introHTML: `
          <p><span class="brand-name">Newfoundation</span> collaborates with a network of founders, investors, academic institutions e.g. MIT, Cambridge, UCL, and compute providers. We connect researchers, developers, investors, and co-publish research. Our team and network comes from Google Research, DeepMind, Ndea, Berkeley, Stanford, CSM, University of California, University of Oxford.</p>
          <p>Areas of research: Agentic search in the space of programs/skills. Evolutionary optimization. Agentic reasoning and Interleaved Chain-of-Thought (CoT) with Tool Use, program/tool synthesis and multi-agent coordination with MARL architectures. AI Safety and Governance.</p>
        `,
        buttonText: "Let's connect"
      },
      {
        id: 'identity1',
        question: 'About you',
        fields: [
          { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
          { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
          { key: 'phone', label: 'Phone (Signal / Telegram)', type: 'text', required: false, placeholder: '+1 555 0123' }
        ]
      },
      {
        id: 'interests',
        question: 'What are you interested in?',
        fields: [
          {
            key: 'interests', type: 'choice-multi', required: true, options: [
              "Grants / Funding",
              "Alignment Council",
              "Networking",
              "Research / Collaborations",
              "Partnership"
            ]
          }
        ]
      },
      {
        id: 'identity2',
        question: 'Main area',
        fields: [
          { key: 'location', label: 'Primary Location', type: 'text', required: true, placeholder: 'City, Timezone' },
          { key: 'affiliations', label: 'Current Affiliations', type: 'text', required: false, placeholder: 'University, Lab, Company, or DAO' }
        ]
      },
      {
        id: 'identity3',
        question: 'About you',
        fields: [
          { key: 'socialLinks', label: 'Links', type: 'multiText', required: true, placeholder: 'https://x.com/handle', maxFields: 3 },
          { key: 'researchFocus', label: 'Research Focus', type: 'text', required: false, placeholder: 'e.g. Multi-agent systems, AI Safety, ZK Proofs' },
          { key: 'achievements', label: 'Key Achievements / Benchmarks', type: 'textarea', required: false, placeholder: 'Notable breakthroughs, benchmarks, publications...' },
          { key: 'grantsAwards', label: 'Previous Grants or Awards', type: 'text', required: false, placeholder: 'e.g. NSF Grant, Ethereum Foundation, Best Paper Award' },
          { key: 'bio', label: 'Short Bio', type: 'textarea', required: true, placeholder: '2-3 sentences about your background.' }
        ]
      },
      {
        id: 'role',
        question: 'How can you contribute to Newfoundation?',
        fields: [
          {
            key: 'role', type: 'choice-multi', required: true, options: [
              "I can do code / engineering",
              "I am a researcher",
              "I want to partner with my existing project",
              "Interested in the governance"
            ]
          }
        ]
      }
    ];

    // Branch-specific steps (inserted after role selection)
    const BRANCHES = {
      "I can do code / engineering": [
        {
          id: 'branch_builder_1',
          question: 'What represents your primary stack?',
          fields: [
            {
              key: 'stack', type: 'choice-multi', required: true, options: [
                "Distributed Systems / P2P (Rust, Go, Libp2p)",
                "AI Engineering (Python, CUDA, Mojo)",
                "Smart Contracts / VM",
                "Full-stack / Frontend"
              ]
            }
          ]
        },
        {
          id: 'branch_builder_2',
          question: 'Share your work',
          fields: [
            { key: 'portfolio', label: 'Work URLs', type: 'multiText', required: true, placeholder: 'Work URL', maxFields: 3 }
          ]
        }
      ],
      "I am a researcher": [
        {
          id: 'branch_researcher_1',
          question: 'What is your research focus?',
          fields: [
            {
              key: 'researchFocus', type: 'choice-multi', required: true, options: [
                "AI Safety & Alignment",
                "Cryptography & Zero-Knowledge",
                "Game Theory & Mechanism Design",
                "Complex Systems / Emergence"
              ]
            }
          ]
        },
        {
          id: 'branch_researcher_2',
          question: 'Share your work',
          fields: [
            { key: 'publication', label: 'Work URLs', type: 'multiText', required: true, placeholder: 'Work URL', maxFields: 3 }
          ]
        }
      ],
      "I want to partner with my existing project": [
        {
          id: 'branch_project_1',
          question: 'Tell us about your project',
          fields: [
            { key: 'projectLink', label: 'Project Link', type: 'text', required: true, placeholder: 'https://yourproject.com' },
            { key: 'projectDescription', label: 'Description', type: 'textarea', required: true, placeholder: 'Briefly describe your project...' }
          ]
        },
        {
          id: 'branch_project_2',
          question: 'What stage is the project?',
          fields: [
            {
              key: 'projectStage', type: 'choice', required: true, options: [
                "Idea / Whitepaper",
                "MVP / Testnet",
                "Live / Mainnet"
              ]
            }
          ]
        }
      ],
      "Interested in the governance": [
        {
          id: 'branch_governance_1',
          question: 'Specific governance interests',
          fields: [
            {
              key: 'govInterests', type: 'choice-multi', required: true, options: [
                "DAO Operations & Voting",
                "Tokenomics & Policy",
                "Community Building",
                "Event Organizing"
              ]
            }
          ]
        }
      ]
    };

    const STEPS_AFTER_BRANCH = [
      {
        id: 'cultural',
        question: 'What do you think about open protocols?',
        fields: [
          {
            key: 'culturalFilter', type: 'choice', required: true, options: [
              "I'm an insider and can discern real protocols from vaporware",
              "I don't know much but I'm curious",
              "AI should be centralized and controlled by 5 companies"
            ]
          }
        ]
      },
      {
        id: 'referral',
        question: 'Did someone refer you?',
        fields: [
          { key: 'referral', label: 'Who referred you?', type: 'text', required: false, placeholder: 'Name or handle' }
        ]
      },
      {
        id: 'notes',
        question: 'Anything else?',
        fields: [
          { key: 'notes', label: 'Additional notes', type: 'textarea', required: false, placeholder: 'Anything you\'d like to add...' }
        ],
        buttonText: 'Submit'
      },
      {
        id: 'thankyou',
        isFinal: true
      }
    ];

    // ============================================================
    // ENGINE STATE
    // ============================================================

    const viewport = document.getElementById('connectStepsViewport');
    const dotsContainer = document.getElementById('connectProgressDots');
    const sideArrow = document.getElementById('connectSideArrow');
    const sideArrowFwd = document.getElementById('connectSideArrowFwd');
    const formData = {};

    let resolvedSteps = [];
    let currentIdx = 0;
    let highestReached = 0;
    let stepElements = [];

    // ============================================================
    // RESOLVE STEP LIST (recalculate when role changes)
    // ============================================================

    function resolveSteps() {
      const role = formData.role;
      const branchSteps = role && BRANCHES[role] ? BRANCHES[role] : [];
      const afterSteps = STEPS_AFTER_BRANCH.filter(s => !s.condition || s.condition(formData));
      resolvedSteps = [...STEPS_BEFORE_BRANCH, ...branchSteps, ...afterSteps];
    }

    // ============================================================
    // RENDER
    // ============================================================

    function renderAll() {
      resolveSteps();
      viewport.innerHTML = '';
      dotsContainer.innerHTML = '';
      stepElements = [];

      const totalVisible = resolvedSteps.filter(s => !s.isFinal && !s.isIntro).length;

      // Create dots
      for (let i = 0; i < totalVisible; i++) {
        const dot = document.createElement('button');
        dot.className = 'connect-dot';
        dot.dataset.dot = i;
        dot.setAttribute('aria-label', `Step ${i + 1}`);
        dot.addEventListener('click', () => {
          if (i <= highestReached && i !== currentIdx && !resolvedSteps[currentIdx].isFinal) {
            goTo(i);
          }
        });
        dotsContainer.appendChild(dot);
      }

      // Create step elements
      resolvedSteps.forEach((stepCfg, idx) => {
        const el = document.createElement('div');
        el.className = 'connect-step';
        el.dataset.step = idx;

        if (stepCfg.isFinal) {
          el.innerHTML = renderThankYou();
        } else if (stepCfg.isIntro) {
          el.innerHTML = `
            <div class="connect-intro">
              <div class="connect-intro-text">${stepCfg.introHTML}</div>
            </div>
            <div class="connect-btn-row">
              <button class="connect-btn connect-btn-primary" data-action="next">${stepCfg.buttonText || "Let's connect"}</button>
            </div>`;
        } else {
          el.innerHTML = renderStepContent(stepCfg);
        }

        viewport.appendChild(el);
        stepElements.push(el);
      });

      // Bind interactivity
      bindAll();

      // Show current step
      if (currentIdx >= resolvedSteps.length) currentIdx = resolvedSteps.length - 1;
      stepElements[currentIdx].classList.add('connect-active');
      staggerFields(stepElements[currentIdx]);
      updateDots();
      updateSideArrow();

      // Fit intro text to match about page sizing
      fitIntroText();
      // Split intro text into word spans for stagger animation
      splitIntroWords();
    }

    function fitIntroText() {
      const introEl = viewport.querySelector('.connect-intro');
      if (!introEl) return;
      const introText = introEl.querySelector('.connect-intro-text');
      if (!introText) return;

      // Temporarily show all chars for measurement
      const chars = introText.querySelectorAll('.char');
      chars.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });

      const panel = document.querySelector('.connect-panel-inner');
      if (!panel) return;

      const style = getComputedStyle(panel);
      const padH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const maxW = Math.ceil(panel.clientWidth - padH);
      const maxH = Math.ceil(panel.clientHeight - padV - 120); // leave room for button + breathing space

      introText.style.transition = 'none';

      let lo = 8, hi = 120, best = 16;

      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        introText.style.fontSize = mid + 'px';

        if (introText.scrollWidth <= maxW && introText.scrollHeight <= maxH) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }

      // Same scale factor as about page
      best = best * 0.89;
      introText.style.fontSize = best + 'px';

      // Hide chars again if animation hasn't played yet
      if (!connectAnimPlayed) {
        chars.forEach(s => { s.style.opacity = ''; s.style.transform = ''; });
      }

      requestAnimationFrame(() => {
        introText.style.transition = '';
      });
    }

    function splitIntroWords() {
      const introText = viewport.querySelector('.connect-intro-text');
      if (!introText || introText.querySelector('.char')) return; // already split

      const paragraphs = introText.querySelectorAll('p');
      paragraphs.forEach(p => {
        const fragment = document.createDocumentFragment();
        const childNodes = Array.from(p.childNodes);

        childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent.split(/(\s+)/);
            parts.forEach(part => {
              if (/^\s+$/.test(part)) {
                fragment.appendChild(document.createTextNode(part));
              } else if (part.length > 0) {
                const span = document.createElement('span');
                span.classList.add('char');
                span.textContent = part;
                fragment.appendChild(span);
              }
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // For elements like <span class="brand-name">, add char class
            node.classList.add('char');
            fragment.appendChild(node);
          }
        });

        p.innerHTML = '';
        p.appendChild(fragment);
      });
    }

    // Re-fit intro on resize
    window.addEventListener('resize', fitIntroText);

    function renderStepContent(cfg) {
      let html = '';

      if (cfg.question) {
        html += `<div class="connect-question">${cfg.question}</div>`;
      }

      if (cfg.fields.length > 1 && cfg.fields.some(f => f.type === 'text' || f.type === 'email' || f.type === 'textarea' || f.type === 'multiText')) {
        // Multi-field step with labels
        html += '<div class="connect-field-group">';
        cfg.fields.forEach(f => {
          html += renderField(f);
        });
        html += '</div>';
      } else {
        // Single field or choice-only step
        cfg.fields.forEach(f => {
          html += renderField(f);
        });
      }

      const btnText = cfg.buttonText || 'Continue';
      html += `<div class="connect-btn-row">
        <button class="connect-btn connect-btn-primary" data-action="next">${btnText}</button>
      </div>`;

      return html;
    }

    function renderField(f) {
      let html = '';
      const optTag = f.required === false ? ' <span class="connect-optional">(optional)</span>' : '';

      if (f.type === 'text' || f.type === 'email') {
        html += '<div class="connect-field">';
        if (f.label) html += `<label class="connect-field-label">${f.label}${optTag}</label>`;
        if (f.description) html += `<div class="connect-description">${f.description}</div>`;
        html += `<input type="${f.type}" class="connect-input" data-key="${f.key}" placeholder="${f.placeholder || ''}" autocomplete="off" value="${formData[f.key] || ''}">`;
        html += '</div>';
      } else if (f.type === 'textarea') {
        html += '<div class="connect-field">';
        if (f.label) html += `<label class="connect-field-label">${f.label}${optTag}</label>`;
        if (f.description) html += `<div class="connect-description">${f.description}</div>`;
        html += `<textarea class="connect-input" data-key="${f.key}" placeholder="${f.placeholder || ''}" rows="3">${formData[f.key] || ''}</textarea>`;
        html += '</div>';
      } else if (f.type === 'choice' || f.type === 'choice-multi') {
        const isMulti = f.type === 'choice-multi';
        const isLong = f.options.some(o => o.length > 30);
        const gridClass = isLong ? 'connect-role-grid single-col' : 'connect-role-grid';

        html += `<div class="${gridClass}" data-key="${f.key}" data-multi="${isMulti}">`;
        f.options.forEach(opt => {
          const selected = isMulti
            ? (Array.isArray(formData[f.key]) && formData[f.key].includes(opt))
            : formData[f.key] === opt;
          const classes = ['connect-role-tile'];
          if (isMulti) classes.push('multi-select');
          if (isLong) classes.push('long-text');
          if (selected) classes.push('selected');
          html += `<div class="${classes.join(' ')}" data-value="${opt}">${opt}</div>`;
        });
        html += '</div>';
      } else if (f.type === 'multiText') {
        // Dynamic multi-input field (grows as user types, up to maxFields)
        const max = f.maxFields || 3;
        const existing = Array.isArray(formData[f.key]) ? formData[f.key] : (formData[f.key] ? [formData[f.key]] : ['']);
        // Ensure at least 1 slot
        if (existing.length === 0) existing.push('');
        // Store as array
        formData[f.key] = existing;

        html += '<div class="connect-field">';
        if (f.label) html += `<label class="connect-field-label">${f.label}${optTag}</label>`;
        if (f.description) html += `<div class="connect-description">${f.description}</div>`;
        html += `<div class="connect-multi-text-container" data-key="${f.key}" data-max="${max}">`;
        existing.forEach((val, i) => {
          const numberedPlaceholder = `${f.placeholder || 'URL'} ${i + 1}`;
          html += `<input type="text" class="connect-input connect-multi-input" data-key="${f.key}" data-index="${i}" placeholder="${numberedPlaceholder}" data-placeholder-base="${f.placeholder || 'URL'}" autocomplete="off" value="${val}">`;
        });
        html += '</div>';
        html += '</div>';
      }

      return html;
    }

    function renderThankYou() {
      return `
        <div class="connect-thank-you">
          <div class="connect-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2>Thank you</h2>
          <p>We'll be in touch soon.</p>
          <a class="connect-restart" data-action="restart">Start over</a>
        </div>
        <button class="back-to-top-glass" id="connectBackToTop" aria-label="Back to top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>`;
    }

    // ============================================================
    // BIND INTERACTIVITY
    // ============================================================

    function bindMultiTextContainer(container) {
      const key = container.dataset.key;
      const max = parseInt(container.dataset.max, 10) || 3;

      function bindInput(input) {
        input.addEventListener('input', () => {
          const idx = parseInt(input.dataset.index, 10);
          if (!Array.isArray(formData[key])) formData[key] = [];
          formData[key][idx] = input.value;
          validateCurrentStep();
          saveState();

          // If this is the last input, it's non-empty, and we haven't hit the max, add another
          const inputs = container.querySelectorAll('.connect-multi-input');
          if (idx === inputs.length - 1 && input.value.trim().length > 0 && inputs.length < max) {
            formData[key].push('');
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = 'connect-input connect-multi-input';
            newInput.dataset.key = key;
            newInput.dataset.index = inputs.length;
            const base = input.dataset.placeholderBase || input.placeholder.replace(/ \d+$/, '');
            newInput.placeholder = `${base} ${inputs.length + 1}`;
            newInput.dataset.placeholderBase = base;
            newInput.autocomplete = 'off';
            newInput.style.opacity = '0';
            newInput.style.transform = 'translateY(8px)';
            container.appendChild(newInput);
            bindInput(newInput);
            // Animate in
            requestAnimationFrame(() => {
              newInput.style.opacity = '1';
              newInput.style.transform = 'translateY(0)';
            });
          }
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Move to next input if available, otherwise trigger Continue
            const inputs = container.querySelectorAll('.connect-multi-input');
            const idx = parseInt(input.dataset.index, 10);
            if (idx < inputs.length - 1) {
              inputs[idx + 1].focus();
            } else {
              const btn = stepElements[currentIdx].querySelector('[data-action="next"]');
              if (btn && !btn.disabled) btn.click();
            }
          }
        });
      }

      container.querySelectorAll('.connect-multi-input').forEach(bindInput);
    }

    function bindAll() {
      // Text / email / textarea inputs
      viewport.querySelectorAll('.connect-input:not(.connect-multi-input)').forEach(input => {
        const key = input.dataset.key;
        input.addEventListener('input', () => {
          formData[key] = input.value;
          validateCurrentStep();
          saveState();
        });
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && input.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const btn = stepElements[currentIdx].querySelector('[data-action="next"]');
            if (btn && !btn.disabled) btn.click();
          }
        });
      });

      // MultiText dynamic inputs
      viewport.querySelectorAll('.connect-multi-text-container').forEach(container => {
        bindMultiTextContainer(container);
      });

      // Choice tiles
      viewport.querySelectorAll('.connect-role-grid').forEach(grid => {
        const key = grid.dataset.key;
        const isMulti = grid.dataset.multi === 'true';

        grid.querySelectorAll('.connect-role-tile').forEach(tile => {
          tile.addEventListener('click', () => {
            const val = tile.dataset.value;

            if (isMulti) {
              if (!Array.isArray(formData[key])) formData[key] = [];
              const idx = formData[key].indexOf(val);
              if (idx >= 0) {
                formData[key].splice(idx, 1);
                tile.classList.remove('selected');
              } else {
                formData[key].push(val);
                tile.classList.add('selected');
              }
            } else {
              // Single select — deselect siblings
              grid.querySelectorAll('.connect-role-tile').forEach(t => t.classList.remove('selected'));
              formData[key] = val;
              tile.classList.add('selected');
            }

            validateCurrentStep();
            saveState();

            // When role changes, reset highest reached so old branch steps aren't accessible via dots
            if (!isMulti && key === 'role') {
              highestReached = Math.min(highestReached, currentIdx);
            }
          });
        });
      });

      // Next / Submit buttons
      viewport.querySelectorAll('[data-action="next"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cfg = resolvedSteps[currentIdx];
          if (cfg.buttonText === 'Submit') {
            handleSubmit();
          } else {
            // Always re-resolve steps (branches / conditional steps may have changed)
            const oldStepIds = resolvedSteps.map(s => s.id).join(',');
            resolveSteps();
            const newStepIds = resolvedSteps.map(s => s.id).join(',');
            const nextIdx = currentIdx + 1;

            if (oldStepIds !== newStepIds) {
              // Steps changed — full re-render then navigate
              renderAll();
              jumpTo(nextIdx, false);
            } else {
              goTo(nextIdx);
            }
          }
        });
      });

      // Restart link
      viewport.querySelectorAll('[data-action="restart"]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          handleRestart();
        });
      });

      // Back-to-top
      const cBtt = document.getElementById('connectBackToTop');
      if (cBtt) {
        cBtt.addEventListener('click', () => {
          if (typeof goBackToTop === 'function') goBackToTop();
        });
      }

      // Re-validate current step
      validateCurrentStep();
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    function validateCurrentStep() {
      const cfg = resolvedSteps[currentIdx];
      if (!cfg || cfg.isFinal || cfg.isIntro) return;

      const btn = stepElements[currentIdx].querySelector('[data-action="next"]');
      if (!btn) return;

      let valid = true;
      for (const f of cfg.fields) {
        if (f.required === false) continue;
        if (f.type === 'text' || f.type === 'email' || f.type === 'textarea') {
          if (!formData[f.key] || formData[f.key].trim().length === 0) { valid = false; break; }
        } else if (f.type === 'multiText') {
          const vals = Array.isArray(formData[f.key]) ? formData[f.key] : [];
          if (vals.length === 0 || !vals.some(v => v.trim().length > 0)) { valid = false; break; }
        } else if (f.type === 'choice') {
          if (!formData[f.key]) { valid = false; break; }
        } else if (f.type === 'choice-multi') {
          if (!Array.isArray(formData[f.key]) || formData[f.key].length === 0) { valid = false; break; }
        }
      }

      btn.disabled = !valid;
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    function staggerFields(stepEl) {
      const items = stepEl.querySelectorAll('.connect-question, .connect-field, .connect-role-grid, .connect-btn-row');
      items.forEach((el, i) => {
        el.style.transitionDelay = `${i * 100 + 200}ms`;
      });
      // Trigger stagger class after a frame so transitions fire
      requestAnimationFrame(() => {
        stepEl.classList.add('connect-stagger-in');
      });
      // Clean up delays after animation completes
      setTimeout(() => {
        items.forEach(el => { el.style.transitionDelay = ''; });
      }, items.length * 100 + 800);
    }

    function goTo(target) {
      if (target === currentIdx || target < 0 || target >= resolvedSteps.length) return;
      const direction = target > currentIdx ? 'forward' : 'back';

      const prev = currentIdx;
      stepElements[prev].classList.remove('connect-active', 'connect-entering', 'connect-stagger-in');
      stepElements[prev].classList.add(direction === 'forward' ? 'connect-exit-up' : 'connect-exit-down');

      stepElements[target].classList.remove('connect-active', 'connect-exit-up', 'connect-exit-down', 'connect-entering', 'connect-stagger-in');
      stepElements[target].style.opacity = '0';
      stepElements[target].style.transform = direction === 'forward' ? 'translateY(36px)' : 'translateY(-28px)';

      void stepElements[target].offsetHeight;

      stepElements[target].classList.add('connect-entering', 'connect-active');
      stepElements[target].style.opacity = '';
      stepElements[target].style.transform = '';

      currentIdx = target;
      if (target > highestReached && !resolvedSteps[target].isFinal) {
        highestReached = target;
      }

      updateDots();
      updateSideArrow();
      saveState();
      validateCurrentStep();

      // Staggered field reveal — each child fades in one-by-one
      staggerFields(stepElements[target]);

      // Focus first input if present
      setTimeout(() => {
        const firstInput = stepElements[target].querySelector('.connect-input');
        if (firstInput) firstInput.focus();
      }, 800);

      // Thank you step: show back-to-top
      if (resolvedSteps[target].isFinal) {
        dotsContainer.style.opacity = '0';
        const cBtt = document.getElementById('connectBackToTop');
        if (cBtt) setTimeout(() => cBtt.classList.add('visible'), 900);
      } else {
        dotsContainer.style.opacity = '1';
        const cBtt = document.getElementById('connectBackToTop');
        if (cBtt) cBtt.classList.remove('visible');
      }

      setTimeout(() => {
        stepElements[prev].classList.remove('connect-exit-up', 'connect-exit-down');
      }, 750);
    }

    function jumpTo(target, instant) {
      if (target >= resolvedSteps.length) target = resolvedSteps.length - 1;

      stepElements[currentIdx].classList.remove('connect-active', 'connect-entering', 'connect-exit-up', 'connect-exit-down', 'connect-stagger-in');
      stepElements[currentIdx].style.opacity = '';
      stepElements[currentIdx].style.transform = '';

      currentIdx = target;
      if (target > highestReached && !resolvedSteps[target].isFinal) {
        highestReached = target;
      }

      stepElements[target].classList.remove('connect-exit-up', 'connect-exit-down', 'connect-entering', 'connect-stagger-in');
      if (instant) {
        stepElements[target].style.transition = 'none';
        stepElements[target].classList.add('connect-active');
        stepElements[target].style.opacity = '';
        stepElements[target].style.transform = '';
        void stepElements[target].offsetHeight;
        stepElements[target].style.transition = '';
      } else {
        stepElements[target].classList.add('connect-entering', 'connect-active');
        stepElements[target].style.opacity = '';
        stepElements[target].style.transform = '';
      }

      staggerFields(stepElements[target]);
      updateDots();
      updateSideArrow();
      validateCurrentStep();

      if (resolvedSteps[target].isFinal) {
        dotsContainer.style.opacity = '0';
      }

      window.connectCurrentStep = currentIdx;
    }

    // ============================================================
    // DOTS & ARROW
    // ============================================================

    function updateDots() {
      const cfg = resolvedSteps[currentIdx];
      // Hide dots on intro and final steps
      if (cfg && (cfg.isIntro || cfg.isFinal)) {
        dotsContainer.style.opacity = '0';
      } else {
        dotsContainer.style.opacity = '1';
      }
      // Align panel from top on intro step so button stays on screen
      const panel = document.querySelector('.connect-panel-inner');
      if (panel) {
        panel.classList.toggle('connect-intro-mode', !!(cfg && cfg.isIntro));
      }
      const dots = dotsContainer.querySelectorAll('.connect-dot');
      dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i === currentIdx && !cfg.isFinal) {
          dot.classList.add('active');
        } else if (i < currentIdx || i <= highestReached) {
          dot.classList.add('completed');
        }
      });
      window.connectCurrentStep = currentIdx;
    }

    function updateSideArrow() {
      if (currentIdx > 0 && !resolvedSteps[currentIdx].isFinal && !resolvedSteps[currentIdx].isIntro) {
        sideArrow.classList.add('visible');
      } else {
        sideArrow.classList.remove('visible');
      }
      // Forward arrow: visible when there's a visited step ahead
      if (currentIdx < highestReached && !resolvedSteps[currentIdx].isFinal && !resolvedSteps[currentIdx].isIntro) {
        sideArrowFwd.classList.add('visible');
      } else {
        sideArrowFwd.classList.remove('visible');
      }
    }

    sideArrow.addEventListener('click', () => {
      if (currentIdx > 0 && !resolvedSteps[currentIdx].isFinal) {
        // Going back: check if we need to re-resolve (skip conditional steps)
        let prev = currentIdx - 1;
        while (prev >= 0 && resolvedSteps[prev].condition && !resolvedSteps[prev].condition(formData)) {
          prev--;
        }
        if (prev >= 0) goTo(prev);
      }
    });

    sideArrowFwd.addEventListener('click', () => {
      if (currentIdx < highestReached && !resolvedSteps[currentIdx].isFinal) {
        let next = currentIdx + 1;
        while (next < resolvedSteps.length && resolvedSteps[next].condition && !resolvedSteps[next].condition(formData)) {
          next++;
        }
        if (next <= highestReached && next < resolvedSteps.length) goTo(next);
      }
    });

    // ============================================================
    // SUBMIT & RESTART
    // ============================================================

    // Google Apps Script Web App URL — replace with your deployment URL
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbz9niriDDnGBDprj5jF4EVcmTAQ7QtIKgzi5F7UDth0cATcupfLsuhY24i3mj3tTI_Z/exec';

    function handleSubmit() {
      const payload = {
        timestamp: new Date().toISOString(),
        ...formData
      };
      console.log('Connect form submission:', JSON.stringify(payload, null, 2));

      // POST to Google Sheets (fire-and-forget with no-cors for Apps Script)
      if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
        fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.warn('Sheet submission error:', err));
      }

      // Navigate to thank-you (don't wait for the POST)
      goTo(resolvedSteps.length - 1);
      setTimeout(() => {
        document.getElementById('screenFinal').scrollIntoView({ behavior: 'smooth' });
      }, 2000);
    }

    function handleRestart() {
      clearState();
      Object.keys(formData).forEach(k => delete formData[k]);
      currentIdx = 0;
      highestReached = 0;
      renderAll();
      jumpTo(0, false);
      setTimeout(() => {
        const firstInput = stepElements[0].querySelector('.connect-input');
        if (firstInput) firstInput.focus();
      }, 100);
    }

    // ============================================================
    // LOCAL STORAGE
    // ============================================================

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          formData: { ...formData },
          step: currentIdx,
          highestReached
        }));
      } catch (e) { /* silent */ }
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }

    function clearState() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silent */ }
    }

    // ============================================================
    // INIT
    // ============================================================

    function init() {
      const saved = loadState();
      if (saved && saved.formData) {
        Object.assign(formData, saved.formData);
        highestReached = saved.highestReached || 0;
      }

      renderAll();

      if (saved && saved.step > 0) {
        jumpTo(Math.min(saved.step, resolvedSteps.length - 1), true);
      }
    }

    init();
  })();

  /* ========================================
     Menu: Research opens Finder
     ======================================== */

  const menuResearch = document.getElementById('menuResearch');
  if (menuResearch) {
    menuResearch.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownFiles.classList.remove('open');
      document.getElementById('finderInspirationOverlay').classList.add('active');
    });
  }

  /* ========================================
     System Exit Dialog for External Links
     ======================================== */

  const exitOverlay = document.getElementById('exitDialogOverlay');
  const exitCancel = document.getElementById('exitDialogCancel');
  const exitConfirm = document.getElementById('exitDialogConfirm');
  let pendingExternalUrl = '';

  function showExitDialog(url) {
    pendingExternalUrl = url;
    exitOverlay.classList.add('active');
  }

  function hideExitDialog() {
    exitOverlay.classList.remove('active');
    pendingExternalUrl = '';
  }

  // Cancel
  exitCancel.addEventListener('click', hideExitDialog);

  // Confirm → open link and close dialog
  exitConfirm.addEventListener('click', () => {
    if (pendingExternalUrl) {
      window.open(pendingExternalUrl, '_blank');
    }
    hideExitDialog();
  });

  // Click overlay backdrop to dismiss
  exitOverlay.addEventListener('click', (e) => {
    if (e.target === exitOverlay) hideExitDialog();
  });

  // Escape key dismisses
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exitOverlay.classList.contains('active')) {
      hideExitDialog();
    }
  });

  // Wire all .external-link elements
  document.querySelectorAll('.external-link').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = el.getAttribute('data-href');
      if (url) showExitDialog(url);
    });
  });

  /* ========================================
     Hamburger Menu (Mobile — Full-Screen)
     ======================================== */

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    // Toggle hamburger
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Helper: close mobile menu
    function closeMobileMenu() {
      hamburgerBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
    }

    // Mobile menu: Desktop → scroll to Screen 0
    const mobileMenuDesktop = document.getElementById('mobileMenuDesktop');
    if (mobileMenuDesktop) {
      mobileMenuDesktop.addEventListener('click', () => {
        closeMobileMenu();
        scrollToScreen(0);
      });
    }

    // Mobile menu: About → scroll to Screen 1
    const mobileMenuAbout = document.getElementById('mobileMenuAbout');
    if (mobileMenuAbout) {
      mobileMenuAbout.addEventListener('click', () => {
        closeMobileMenu();
        scrollToScreen(1);
      });
    }

    // Mobile menu: Research → open Finder
    const mobileMenuResearch = document.getElementById('mobileMenuResearch');
    if (mobileMenuResearch) {
      mobileMenuResearch.addEventListener('click', () => {
        closeMobileMenu();
        document.getElementById('finderInspirationOverlay').classList.add('active');
      });
    }

    // Mobile menu: Keynote → open QuickTime player
    const mobileMenuKeynote = document.getElementById('mobileMenuKeynote');
    if (mobileMenuKeynote) {
      mobileMenuKeynote.addEventListener('click', () => {
        closeMobileMenu();
        if (typeof openQTPlayer === 'function') openQTPlayer();
      });
    }

    // Mobile menu: Connect → scroll to Connect section
    const mobileMenuConnect = document.getElementById('mobileMenuConnect');
    if (mobileMenuConnect) {
      mobileMenuConnect.addEventListener('click', () => {
        closeMobileMenu();
        scrollToConnectSection();
      });
    }

    // Close mobile menu when scrolling to another screen
    snapContainer.addEventListener('scroll', () => {
      closeMobileMenu();
    });
  }

  /* ========================================
     URL Hash Navigation
     Navigate to the correct section on load
     and when hash changes (e.g. browser back/forward)
     ======================================== */

  // Navigate on hash change (browser back/forward, manual hash entry)
  window.addEventListener('hashchange', () => {
    const slug = location.hash.replace('#', '');
    if (slug) {
      const idx = slugToIndex(slug);
      scrollToScreen(idx, { updateHash: false });
    }
  });

  // On page load, if a hash is present, jump to that section after boot
  const initialHash = location.hash.replace('#', '');
  if (initialHash && screenSlugs.includes(initialHash)) {
    const targetIdx = slugToIndex(initialHash);
    // Wait for boot to finish, then jump instantly
    const bootWatcher = setInterval(() => {
      if (!document.getElementById('bootScreen')) {
        clearInterval(bootWatcher);
        scrollToScreen(targetIdx, { animated: false });
      }
    }, 100);
  }

});
