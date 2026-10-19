// notchly landing — demo notch loop + scroll reveals
(function () {
  var notch = document.getElementById('demoNotch');
  var bar = document.getElementById('demoBar');
  var lines = Array.prototype.slice.call(document.querySelectorAll('#demoLyrics div'));
  var li = 0, progress = 10;

  function cycleLyrics() {
    lines.forEach(function (l) { l.classList.remove('on'); });
    lines[li % lines.length].classList.add('on');
    li++;
    progress = Math.min(96, progress + 7);
    bar.style.width = progress + '%';
  }

  var lyricTimer = null;
  function loop() {
    // collapsed
    notch.classList.remove('open');
    setTimeout(function () {
      // expand
      notch.classList.add('open');
      li = 0; progress = 10;
      cycleLyrics();
      lyricTimer = setInterval(cycleLyrics, 1800);
      setTimeout(function () {
        clearInterval(lyricTimer);
        loop();
      }, 8200);
    }, 2200);
  }
  loop();

  // scroll reveals
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
