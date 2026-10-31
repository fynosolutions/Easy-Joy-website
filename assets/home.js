/* Optional home motion. All content, links and horizontal scrolling work without JS. */
(() => {
  const root = document.querySelector('.home-editorial');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1001px)');
  const motionButton = root.querySelector('.motion-toggle');
  const hero = root.querySelector('.cinema-hero');
  const heroVisual = root.querySelector('[data-hero-parallax]');
  const scenes = [...root.querySelectorAll('.story-scene')];
  const carousel = root.querySelector('.signature-carousel');
  const cards = [...carousel.querySelectorAll('.signature-slide')];
  const controls = root.querySelector('.carousel-controls');
  const counter = root.querySelector('.carousel-position');
  const announcement = root.querySelector('.carousel-announcement');
  let paused = false;
  let visible = false;
  let hovered = false;
  let focused = false;
  let dragging = false;
  let carouselFrame;
  let carouselPaused = false;
  let lastTick = 0;
  let resumeAt = 0;
  let frame;
  let sceneStarts = [];
  const motionAllowed = () => !paused && !reduce.matches;
  const behavior = () => motionAllowed() ? 'smooth' : 'instant';

  const measure = () => {
    const stack = root.querySelector('.story-stack');
    let top = stack.getBoundingClientRect().top + scrollY;
    sceneStarts = scenes.map(scene => {
      const entry = {top, height: scene.offsetHeight};
      top += scene.offsetHeight;
      return entry;
    });
  };
  const paintScroll = () => {
    frame = null;
    if (!motionAllowed() || !desktop.matches) {
      heroVisual.style.transform = '';
      heroVisual.style.opacity = '';
      scenes.forEach(scene => scene.querySelector('[data-parallax]').style.transform = '');
      return;
    }
    const heroBox = hero.getBoundingClientRect();
    if (heroBox.bottom > 0) {
      const travel = Math.max(0, -heroBox.top);
      heroVisual.style.transform = `translate3d(0,${Math.min(travel * .18, 130)}px,0)`;
      heroVisual.style.opacity = String(Math.max(.35, 1 - travel / heroBox.height * .6));
    }
    scenes.forEach((scene, i) => {
      const box = scene.getBoundingClientRect();
      if (box.top > innerHeight || box.bottom < 0) return;
      const progress = Math.max(0, Math.min(1, (scrollY + innerHeight - sceneStarts[i].top) / (innerHeight + sceneStarts[i].height)));
      scene.querySelector('[data-parallax]').style.transform = `translate3d(0,${(0.5 - progress) * 95}px,0)`;
    });
  };
  const queueScroll = () => { if (!frame) frame = requestAnimationFrame(paintScroll); };
  addEventListener('scroll', queueScroll, {passive: true});
  addEventListener('resize', () => { measure(); queueScroll(); }, {passive: true});
  desktop.addEventListener('change', queueScroll);
  measure(); queueScroll();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => { measure(); queueScroll(); });
    observer.observe(root.querySelector('.story-stack'));
    observer.observe(document.querySelector('.site-header'));
  }

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (motionAllowed()) entry.target.classList.add('home-revealed');
      reveal.unobserve(entry.target);
    }), {threshold: .15});
    root.querySelectorAll('[data-home-reveal]').forEach(element => reveal.observe(element));
  }

  const track = carousel.querySelector('.signature-track');
  const carouselSection = root.querySelector('#menu-highlights');
  const pauseCarousel = controls.querySelector('.carousel-pause');
  // Only the ten original cards participate in keyboard/screen-reader navigation.
  // Matching copies on both sides make the visual wrap continuous.
  const copySet = () => cards.map(card => {
    const copy = card.cloneNode(true);
    copy.dataset.loopCopy = '';
    copy.setAttribute('aria-hidden', 'true');
    copy.tabIndex = -1;
    return copy;
  });
  const leading = copySet();
  track.prepend(...leading);
  track.append(...copySet());
  carousel.classList.add('is-looping');
  let cycle = 0;
  let step = 0;
  let position = 0;
  const modulo = (value, length) => ((value % length) + length) % length;
  const currentIndex = () => cycle ? modulo(Math.round((carousel.scrollLeft - cycle) / step), cards.length) : 0;
  const refreshCounter = () => { counter.textContent = `${String(currentIndex() + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`; };
  const measureCarousel = () => {
    const phase = cycle ? modulo(carousel.scrollLeft - cycle, cycle) / cycle : 0;
    cycle = cards[0].offsetLeft - leading[0].offsetLeft;
    step = cycle / cards.length;
    position = cycle + phase * cycle;
    carousel.scrollTo({left: position, behavior: 'instant'});
    refreshCounter();
  };
  const normalizePosition = () => {
    const left = carousel.scrollLeft;
    if (left < cycle || left >= 2 * cycle) {
      carousel.scrollTo({left: cycle + modulo(left - cycle, cycle), behavior: 'instant'});
    }
    position = carousel.scrollLeft;
  };
  function tick(now) {
    const elapsed = lastTick ? Math.min(now - lastTick, 80) : 0;
    lastTick = now;
    if (now >= resumeAt) {
      // Decreasing scrollLeft moves the pictures from left to right.
      position -= step * elapsed / 10000;
      position = cycle + modulo(position - cycle, cycle);
      carousel.scrollTo({left: position, behavior: 'instant'});
    } else position = carousel.scrollLeft;
    carouselFrame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(carouselFrame);
    carouselFrame = null;
    lastTick = 0;
    if (!motionAllowed() || carouselPaused || !visible || hovered || focused || dragging || document.hidden || !cycle) return;
    normalizePosition();
    carouselFrame = requestAnimationFrame(tick);
  }
  function advance(direction, manual = false) {
    normalizePosition();
    const relative = (carousel.scrollLeft - cycle) / step;
    const next = direction > 0 ? Math.floor(relative + .02) + 1 : Math.ceil(relative - .02) - 1;
    const target = cycle + next * step;
    resumeAt = performance.now() + 1500;
    carousel.scrollTo({left: target, behavior: behavior()});
    if (manual) announcement.textContent = `Showing ${cards[modulo(next, cards.length)].querySelector('h3').textContent} and more dishes.`;
  }
  carousel.addEventListener('scroll', refreshCounter, {passive: true});
  controls.hidden = false;
  controls.querySelectorAll('[data-carousel-step]').forEach(button => button.addEventListener('click', () => {
    advance(Number(button.dataset.carouselStep), true); schedule();
  }));
  pauseCarousel.addEventListener('click', () => {
    if (paused) { paused = false; carouselPaused = false; }
    else carouselPaused = !carouselPaused;
    syncMotion();
  });
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || event.target !== carousel) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') carousel.scrollTo({left: cycle + (event.key === 'Home' ? 0 : (cards.length - 1) * step), behavior: behavior()});
    else advance(event.key === 'ArrowRight' ? 1 : -1, true);
    schedule();
  });
  carousel.querySelectorAll('.signature-slide').forEach(card => {
    card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
    card.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; schedule(); } });
  });
  // Keep keyboard reading stable without treating mouse clicks on controls as
  // a persistent focus pause after the pointer has left the pictures.
  carouselSection.addEventListener('focusin', event => { focused = event.target.matches(':focus-visible'); schedule(); });
  carouselSection.addEventListener('focusout', event => {
    focused = Boolean(event.relatedTarget && carouselSection.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible'));
    schedule();
  });
  carousel.addEventListener('pointerdown', () => { dragging = true; schedule(); }, {passive: true});
  const endDrag = () => { if (!dragging) return; dragging = false; resumeAt = performance.now() + 1500; schedule(); };
  addEventListener('pointerup', endDrag, {passive: true});
  addEventListener('pointercancel', endDrag, {passive: true});
  carousel.addEventListener('wheel', () => { resumeAt = performance.now() + 1500; }, {passive: true});
  measureCarousel();
  new ResizeObserver(() => { measureCarousel(); schedule(); }).observe(carousel);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .1}).observe(carousel);

  const video = root.querySelector('.hero-motion-video');
  const videoButton = root.querySelector('.hero-video-control');
  let videoVisible = false;
  let videoWanted = true;
  async function syncVideo() {
    if (!video) return;
    if (videoWanted && videoVisible && motionAllowed() && !document.hidden) {
      try { await video.play(); } catch { videoWanted = false; }
    } else video.pause();
    videoButton.textContent = video.paused ? 'Play video' : 'Pause video';
  }
  if (video) {
    videoButton.hidden = false;
    videoButton.addEventListener('click', async () => {
      if (video.paused) {
        videoWanted = true;
        try { await video.play(); } catch { videoWanted = false; }
      } else { videoWanted = false; video.pause(); }
      videoButton.textContent = video.paused ? 'Play video' : 'Pause video';
    });
    new IntersectionObserver(entries => { videoVisible = entries[0].isIntersecting; syncVideo(); }, {threshold: .1}).observe(hero);
    video.addEventListener('error', () => { video.hidden = true; videoButton.hidden = true; });
  }
  function syncMotion() {
    root.classList.toggle('home-motion-paused', !motionAllowed());
    motionButton.setAttribute('aria-pressed', String(!motionAllowed()));
    motionButton.textContent = reduce.matches ? 'Reduced motion on' : paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
    motionButton.disabled = reduce.matches;
    pauseCarousel.setAttribute('aria-pressed', String(carouselPaused || !motionAllowed()));
    pauseCarousel.textContent = reduce.matches ? 'Motion off' : carouselPaused || paused ? 'Resume scrolling' : 'Pause scrolling';
    pauseCarousel.disabled = reduce.matches;
    queueScroll(); schedule(); syncVideo();
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduce.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => { schedule(); syncVideo(); });
  syncMotion();
})();
