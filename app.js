// notchly site v2 — the notch on this page behaves like the app:
// hover opens, leaving closes, a click pins it, pages slide.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header clock + battery ---------- */
  var clock = $('npClock'), dateEl = $('npDate');
  function tickClock() {
    var now = new Date();
    if (clock) clock.textContent = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }).replace(/\s/g, '');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  tickClock(); setInterval(tickClock, 10000);
  var battFill = $('npBattFill'); if (battFill) battFill.setAttribute('width', (19 * 0.76).toFixed(1));

  /* ---------- notch open / close / pin ---------- */
  var notch = $('notch'), pill = $('notchPill'), panel = $('notchPanel');
  var pinned = null; // null = follow hover; true/false = pinned by click
  function setOpen(open) {
    notch.classList.toggle('open', open);
    pill.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
  }
  function isOpen() { return notch.classList.contains('open'); }
  notch.addEventListener('mouseenter', function () { if (pinned === null) setOpen(true); });
  notch.addEventListener('mouseleave', function () { if (pinned === null) setOpen(false); });
  pill.addEventListener('click', function () { pinned = !isOpen(); setOpen(pinned); });
  pill.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = !isOpen(); setOpen(pinned); }
  });
  // one orchestrated moment on load: the notch opens to say hello
  window.setTimeout(function () { if (pinned === null) setOpen(true); }, 700);

  /* ---------- pages carousel ---------- */
  var pages = Array.prototype.slice.call(document.querySelectorAll('.np-page'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#npDots i'));
  var title = $('npTitle');
  var active = 0;
  function paint() {
    pages.forEach(function (pg, i) {
      var off = i - active;
      pg.style.transform = 'translateX(' + off * 26 + 'px) scale(' + (off === 0 ? 1 : 0.965) + ')';
      pg.style.opacity = off === 0 ? '1' : '0';
      pg.style.pointerEvents = off === 0 ? 'auto' : 'none';
      pg.style.visibility = Math.abs(off) > 1 ? 'hidden' : 'visible';
    });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === active); });
    if (title) title.textContent = pages[active].getAttribute('data-name');
  }
  function goTo(i) { active = Math.max(0, Math.min(pages.length - 1, i)); paint(); }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
  paint();

  // drag / swipe across the panel
  var dragX = null;
  panel.addEventListener('pointerdown', function (e) { dragX = e.clientX; });
  panel.addEventListener('pointerup', function (e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX; dragX = null;
    if (Math.abs(dx) > 48) goTo(active + (dx < 0 ? 1 : -1));
  });
  var wheelLock = 0;
  panel.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
    var now = Date.now(); if (now - wheelLock < 420) return; wheelLock = now;
    goTo(active + (e.deltaX > 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- music: progress, lyric cycle, layout toggle ---------- */
  var playing = true, pos = 84, dur = 191;
  var fill = $('muFill'), posEl = $('muPos'), playBtn = $('muPlay');
  function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function drawMu() {
    if (fill) fill.style.width = (pos / dur * 100).toFixed(1) + '%';
    if (posEl) posEl.textContent = fmt(pos);
  }
  drawMu();
  var lyricBox = $('muLyrics');
  var lines = lyricBox ? Array.prototype.slice.call(lyricBox.children) : [];
  var lyricIdx = 1;
  function drawLyrics() {
    lines.forEach(function (ln, i) {
      var d = Math.abs(i - lyricIdx);
      ln.className = d === 0 ? 'act' : d === 1 ? 'd1' : d === 2 ? 'd2' : 'far';
    });
  }
  drawLyrics();
  if (!reduceMotion) setInterval(function () {
    if (document.hidden || !playing) return;
    pos = pos >= dur ? 0 : pos + 1; drawMu();
    lyricIdx = (lyricIdx + 1) % lines.length; drawLyrics();
  }, 2600);
  if (playBtn) playBtn.addEventListener('click', function () {
    playing = !playing;
    playBtn.textContent = playing ? '⏸' : '▶';
    playBtn.setAttribute('aria-label', playing ? 'pause' : 'play');
    notch.classList.toggle('paused', !playing);
  });
  var mu = $('muLayout'), muToggle = $('muToggle');
  if (muToggle) muToggle.addEventListener('click', function () {
    var classic = mu.classList.toggle('classic');
    muToggle.setAttribute('aria-pressed', String(!classic));
  });

  /* ---------- focus: a real ticking pomodoro ---------- */
  var foLeft = 24 * 60 + 18;
  var foTime = $('foTime'), foProg = $('foProg');
  function drawFo() {
    if (foTime) foTime.textContent = String(Math.floor(foLeft / 60)).padStart(2, '0') + ':' + String(foLeft % 60).padStart(2, '0');
    if (foProg) foProg.style.strokeDashoffset = (188.5 * foLeft / 1500).toFixed(1);
  }
  drawFo();
  setInterval(function () { if (document.hidden || foLeft <= 0) return; foLeft -= 1; drawFo(); }, 1000);

  /* ---------- water: the drink button works ---------- */
  var waMl = 750, waGoal = 1500;
  var waMlEl = $('waMl'), waPct = $('waPct'), waRing = $('waRing');
  function drawWa() {
    var pct = Math.min(100, Math.round(waMl / waGoal * 100));
    if (waMlEl) waMlEl.textContent = waMl;
    if (waPct) waPct.textContent = pct + '%';
    if (waRing) waRing.style.background = 'conic-gradient(#38bdf8 0 ' + pct + '%, rgba(255,255,255,.09) ' + pct + '% 100%)';
  }
  drawWa();
  var waDrink = $('waDrink');
  if (waDrink) waDrink.addEventListener('click', function () { waMl = Math.min(waGoal, waMl + 250); drawWa(); });

  /* ---------- todo: summary follows the checks ---------- */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.td-row'));
  var summary = document.querySelector('.td-summary');
  var bar = document.querySelector('.td-bar span');
  function drawTd() {
    var done = rows.filter(function (r) { return r.querySelector('input').checked; }).length;
    rows.forEach(function (r) { r.classList.toggle('done', r.querySelector('input').checked); });
    if (summary) summary.textContent = done + ' of ' + rows.length + ' done';
    if (bar) bar.style.width = (done / rows.length * 100) + '%';
  }
  rows.forEach(function (r) { r.querySelector('input').addEventListener('change', drawTd); });
  drawTd();

  /* ---------- calendar: the real current month ---------- */
  var grid = $('caGrid'), monthEl = $('caMonth');
  (function buildCalendar() {
    if (!grid) return;
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    if (monthEl) monthEl.textContent = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    var first = (new Date(y, m, 1).getDay() + 6) % 7; // monday-first
    var days = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(function (d) { return '<span class="wd">' + d + '</span>'; }).join('');
    for (var i = first - 1; i >= 0; i--) cells += '<span class="dim">' + (prevDays - i) + '</span>';
    for (var d = 1; d <= days; d++) cells += '<span class="' + (d === today ? 'today' : '') + '">' + d + '</span>';
    grid.innerHTML = cells;
  })();

  /* ---------- download buttons: held until the final build ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.is-waiting'), function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
