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

  if (toggle && notch) {
    toggle.addEventListener('click', function () {
      var open = !notch.classList.contains('is-open');
      notch.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

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
    }
    drawTimer();
    window.setInterval(function () {
      if (document.hidden || secondsLeft <= 0) return;
      secondsLeft -= 1;
      drawTimer();
    }, 1000);
  }

  if (reduceMotion) {
    var ticker = document.querySelector('.ticker-track');
    if (ticker) ticker.style.animation = 'none';
  }
})();