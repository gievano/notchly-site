// notchly landing: live clock + the notch demos itself on hover/tap,
// exactly like the real app
(function () {
  'use strict';

  // live clock in the menu bar
  var clock = document.getElementById('clock');
  function tick() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    clock.textContent = h + ':' + m;
  }
  tick();
  setInterval(tick, 10000);

  var notch = document.getElementById('notch');
  var lines = Array.prototype.slice.call(
    document.querySelectorAll('#npLyrics div')
  );
  var lineIdx = 0;
  var lyricTimer = null;

  function highlight(i) {
    lines.forEach(function (el, j) {
      el.classList.toggle('active', j === i);
    });
  }

  function open() {
    notch.classList.add('expanded');
    lineIdx = 0;
    highlight(0);
    clearInterval(lyricTimer);
    lyricTimer = setInterval(function () {
      lineIdx = (lineIdx + 1) % lines.length;
      highlight(lineIdx);
    }, 1600);
  }

  function close() {
    notch.classList.remove('expanded');
    clearInterval(lyricTimer);
  }

  notch.addEventListener('mouseenter', open);
  notch.addEventListener('mouseleave', close);
  // touch: tap toggles
  notch.addEventListener('click', function () {
    if (notch.classList.contains('expanded')) close();
    else open();
  });
})();
