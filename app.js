// notchly site: small interactions for the product mockup. No runtime dependencies.
(function () {
  'use strict';

  var clock = document.getElementById('desktopClock');
  var notch = document.getElementById('mockNotch');
  var toggle = document.getElementById('mockToggle');
  var play = document.getElementById('mockPlay');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.mock-tab'));
  var views = Array.prototype.slice.call(document.querySelectorAll('.mock-view'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tickClock() {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date());
  }
  tickClock();
  window.setInterval(tickClock, 30000);

  // ---- sliding segmented-control indicator ----
  var tabBar = document.querySelector('.mock-tabs');
  var indicator = document.querySelector('.mock-tab-indicator');
  function positionIndicator() {
    if (!tabBar || !indicator) return;
    var active = tabBar.querySelector('.mock-tab.is-active');
    if (!active) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + active.offsetLeft + 'px)';
  }

  // ---- notch behaviour mirrors the real app: hover opens, leaving closes;
  // a click pins it open or shut (and is the only control on touch) ----
  var pinnedOpen = true;
  var hoverTimer = null;
  function setNotch(open) {
    if (!notch) return;
    notch.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    positionIndicator();
    window.setTimeout(positionIndicator, 600);
  }
  if (toggle && notch) {
    toggle.addEventListener('click', function () {
      var open = !notch.classList.contains('is-open');
      pinnedOpen = open;
      setNotch(open);
    });
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      notch.addEventListener('mouseenter', function () {
        window.clearTimeout(hoverTimer);
        if (!notch.classList.contains('is-open')) setNotch(true);
      });
      notch.addEventListener('mouseleave', function () {
        if (pinnedOpen) return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(function () { setNotch(false); }, 280);
      });
    }
  }
  positionIndicator();
  window.addEventListener('load', positionIndicator);
  window.addEventListener('resize', positionIndicator);

  function activateTab(selected, focusButton) {
    var name = selected.getAttribute('data-view');
    tabs.forEach(function (tab) {
      var active = tab === selected;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    views.forEach(function (view) {
      var active = view.id === 'view-' + name;
      view.hidden = !active;
      view.classList.toggle('is-active', active);
    });
    positionIndicator();
    if (focusButton) selected.focus();
  }

  tabs.forEach(function (tab, index) {
    tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
    tab.addEventListener('click', function () { activateTab(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });

  if (play) {
    var isPlaying = true;
    play.addEventListener('click', function () {
      isPlaying = !isPlaying;
      play.textContent = isPlaying ? 'Ⅱ' : '▶';
      play.setAttribute('aria-label', isPlaying ? 'Pause demo playback' : 'Play demo playback');
      if (notch) notch.classList.toggle('is-playing', isPlaying);
      var equalizer = notch && notch.querySelector('.mock-eq');
      if (equalizer) equalizer.style.opacity = isPlaying ? '1' : '.35';
      if (equalizer) equalizer.style.animationPlayState = isPlaying ? 'running' : 'paused';
    });
  }

  // The mock is illustrative, but the timer still ticks so the surface feels real.
  var focusTimer = document.getElementById('focusDemoTime');
  if (focusTimer) {
    var secondsLeft = 24 * 60 + 18;
    function drawTimer() {
      var min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      var sec = String(secondsLeft % 60).padStart(2, '0');
      focusTimer.textContent = min + ':' + sec;
      var ft = document.querySelector('.focus-demo-track span');
      if (ft) ft.style.width = ((1 - secondsLeft / 1500) * 100).toFixed(1) + '%';
    }
    drawTimer();
    window.setInterval(function () {
      if (document.hidden || secondsLeft <= 0) return;
      secondsLeft -= 1;
      drawTimer();
    }, 1000);
  }

  // ---- living mock: lyrics cycle like real synced lyrics, progress plays ----
  var lyricLines = Array.prototype.slice.call(document.querySelectorAll('.mock-lyrics > *'));
  var progressBar = document.querySelector('.mock-progress span');
  var timeRow = document.querySelectorAll('.mock-time-row span');
  var demoPos = 102, demoDur = 238, demoPlaying = true, lyricIdx = 1;

  function drawLyrics() {
    lyricLines.forEach(function (line, i) { line.classList.toggle('is-live', i === lyricIdx); });
  }
  if (lyricLines.length) drawLyrics();

  function fmtDemo(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function drawProgress() {
    if (progressBar) progressBar.style.width = (demoPos / demoDur * 100).toFixed(1) + '%';
    if (timeRow.length) timeRow[0].textContent = fmtDemo(demoPos);
  }
  drawProgress();

  if (play) play.addEventListener('click', function () { demoPlaying = !demoPlaying; });

  if (!reduceMotion) {
    window.setInterval(function () {
      if (document.hidden || !demoPlaying) return;
      demoPos = demoPos >= demoDur ? 0 : demoPos + 1;
      drawProgress();
    }, 1000);
    if (lyricLines.length) window.setInterval(function () {
      if (document.hidden || !demoPlaying) return;
      lyricIdx = (lyricIdx + 1) % lyricLines.length;
      drawLyrics();
    }, 2600);
  }

  // ---- scroll reveals: once, gentle, skipped for reduced motion ----
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(
      document.querySelectorAll('.section-heading, .details-panel, .final-cta'),
      function (el) { el.classList.add('reveal'); io.observe(el); }
    );
    Array.prototype.forEach.call(document.querySelectorAll('.feature-card'), function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 2) * 80 + 'ms';
      io.observe(el);
    });
  }

  // ---- hero depth: the desktop window leans toward the cursor, gently ----
  var desk = document.getElementById('desktopDemo');
  if (desk && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var BASE_RY = -3, BASE_RX = 1, tRY = 0, tRX = 0, cRY = 0, cRX = 0, tiltRaf = null;
    function tiltLoop() {
      cRY += (tRY - cRY) * 0.08;
      cRX += (tRX - cRX) * 0.08;
      desk.style.transform = 'perspective(1500px) rotateY(' + (BASE_RY + cRY).toFixed(3) +
        'deg) rotateX(' + (BASE_RX + cRX).toFixed(3) + 'deg)';
      if (Math.abs(tRY - cRY) > 0.01 || Math.abs(tRX - cRX) > 0.01) {
        tiltRaf = window.requestAnimationFrame(tiltLoop);
      } else tiltRaf = null;
    }
    function kickTilt() { if (!tiltRaf) tiltRaf = window.requestAnimationFrame(tiltLoop); }
    desk.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 1050) return;
      var r = desk.getBoundingClientRect();
      tRY = ((e.clientX - r.left) / r.width - 0.5) * 2.4;
      tRX = -((e.clientY - r.top) / r.height - 0.5) * 1.8;
      kickTilt();
    });
    desk.addEventListener('mouseleave', function () { tRY = 0; tRX = 0; kickTilt(); });
  }

  if (reduceMotion) {
    var ticker = document.querySelector('.ticker-track');
    if (ticker) ticker.style.animation = 'none';
  }
})();