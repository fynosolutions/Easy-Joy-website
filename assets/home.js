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
  let timer;
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

  const maxScroll = () => carousel.scrollWidth - carousel.clientWidth;
  const cardStops = () => cards.map(card => card.offsetLeft - cards[0].offsetLeft);
  const currentIndex = () => {
    const left = carousel.scrollLeft;
    const stops = cardStops();
    return stops.reduce((nearest, stop, i) => Math.abs(stop - left) < Math.abs(stops[nearest] - left) ? i : nearest, 0);
  };
  const refreshCounter = () => { counter.textContent = `${String(currentIndex() + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`; };
  carousel.addEventListener('scroll', refreshCounter, {passive: true});
  function advance(direction, manual = false) {
    const stops = cardStops();
    const left = carousel.scrollLeft;
    let target;
    if (direction > 0) target = left >= maxScroll() - 3 ? 0 : Math.min(maxScroll(), stops.find(stop => stop > left + 5) ?? maxScroll());
    else target = left <= 3 ? maxScroll() : [...stops].reverse().find(stop => stop < left - 5) ?? 0;
    carousel.scrollTo({left: target, behavior: behavior()});
    if (manual) {
      const index = stops.reduce((nearest, stop, i) => Math.abs(stop - target) < Math.abs(stops[nearest] - target) ? i : nearest, 0);
      announcement.textContent = `Showing ${cards[index].querySelector('h3').textContent} and more dishes.`;
    }
  }
  function schedule() {
    clearTimeout(timer);
    if (!motionAllowed() || !visible || hovered || focused || dragging || document.hidden || maxScroll() <= 1) return;
    timer = setTimeout(() => { advance(1); schedule(); }, 5000);
  }
  controls.hidden = false;
  controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    advance(Number(button.dataset.carouselStep), true); schedule();
  }));
  carousel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (event.target !== carousel) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') carousel.scrollTo({left: event.key === 'Home' ? 0 : maxScroll(), behavior: behavior()});
    else advance(event.key === 'ArrowRight' ? 1 : -1, true);
    schedule();
  });
  const carouselSection = root.querySelector('#menu-highlights');
  carouselSection.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  carouselSection.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  carouselSection.addEventListener('focusin', () => { focused = true; schedule(); });
  carouselSection.addEventListener('focusout', () => queueMicrotask(() => { focused = carouselSection.contains(document.activeElement); schedule(); }));
  carousel.addEventListener('pointerdown', () => { dragging = true; schedule(); }, {passive: true});
  addEventListener('pointerup', () => { dragging = false; schedule(); }, {passive: true});
  addEventListener('pointercancel', () => { dragging = false; schedule(); }, {passive: true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold: .4}).observe(carousel);

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
    queueScroll(); schedule(); syncVideo();
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduce.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => { schedule(); syncVideo(); });
  syncMotion();
})();
