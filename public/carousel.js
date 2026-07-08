(function () {
  const track = document.querySelector('.carousel-track');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const total = document.querySelectorAll('.slide').length;

  let current = 0;

  function goTo(index) {
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
    if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1);
  });

  // Initialise
  goTo(0);
})();
