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

  const carouselSection = root.querySelector('#menu-highlights');
  const pauseCarousel = controls.querySelector('.carousel-pause');
  // Each dish appears once (no cloned cards). Autoplay steps one card at a time
  // and rewinds to the first dish after the last one.
  let step = 0;
  const maxLeft = () => Math.max(0, carousel.scrollWidth - carousel.clientWidth);
  const currentIndex = () => step ? Math.min(cards.length - 1, Math.round(carousel.scrollLeft / step)) : 0;
  const refreshCounter = () => { counter.textContent = `${String(currentIndex() + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`; };
  const measureCarousel = () => { step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : carousel.clientWidth; refreshCounter(); };
  const goTo = index => {
    const atEnd = carousel.scrollLeft >= maxLeft() - 4;
    if (index >= cards.length || (index > currentIndex() && atEnd)) index = 0;
    if (index < 0) index = cards.length - 1;
    carousel.scrollTo({left: Math.min(index * step, maxLeft()), behavior: behavior()});
    return index;
  };
  function tick(now) {
    if (now >= resumeAt) { goTo(currentIndex() + 1); resumeAt = now + 3500; }
    carouselFrame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(carouselFrame);
    carouselFrame = null;
    if (!motionAllowed() || carouselPaused || !visible || hovered || focused || dragging || document.hidden || !step) return;
    resumeAt = Math.max(resumeAt, performance.now() + 3500);
    carouselFrame = requestAnimationFrame(tick);
  }
  function advance(direction, manual = false) {
    const next = goTo(currentIndex() + direction);
    resumeAt = performance.now() + 5000;
    if (manual) announcement.textContent = `Showing ${cards[next].querySelector('h3').textContent} and more dishes.`;
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
    if (event.key === 'Home' || event.key === 'End') carousel.scrollTo({left: event.key === 'Home' ? 0 : maxLeft(), behavior: behavior()});
    else advance(event.key === 'ArrowRight' ? 1 : -1, true);
    schedule();
  });
  cards.forEach(card => {
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
  const endDrag = () => { if (!dragging) return; dragging = false; resumeAt = performance.now() + 5000; schedule(); };
  addEventListener('pointerup', endDrag, {passive: true});
  addEventListener('pointercancel', endDrag, {passive: true});
  carousel.addEventListener('wheel', () => { resumeAt = performance.now() + 5000; }, {passive: true});
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

// Special offers band: one offer at a time; pauses on hover/focus, when motion is paused, or with reduced motion.
(() => {
  const band = document.querySelector('.promo-band');
  if (!band) return;
  const slides = [...band.querySelectorAll('.promo-slide')], dots = [...band.querySelectorAll('.promo-dot')];
  if (slides.length < 2) return;
  const ms = 7000, reduce = matchMedia('(prefers-reduced-motion: reduce)');
  band.style.setProperty('--promo-ms', `${ms}ms`);
  let index = 0, timer = 0, hold = false;
  const show = n => {
    index = (n + slides.length) % slides.length;
    slides.forEach((s, i) => { const on = i === index; s.classList.toggle('is-active', on); s.setAttribute('aria-hidden', String(!on)); });
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    play();
  };
  const play = () => {
    clearTimeout(timer);
    const pausedByToolbar = document.querySelector('.motion-toggle[aria-pressed="true"]');
    const run = !hold && !reduce.matches && !pausedByToolbar && !document.hidden;
    band.classList.remove('is-playing'); void band.offsetWidth; band.classList.toggle('is-playing', run);
    if (run) timer = setTimeout(() => show(index + 1), ms);
  };
  dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
  band.addEventListener('mouseenter', () => { hold = true; play(); });
  band.addEventListener('mouseleave', () => { hold = false; play(); });
  band.addEventListener('focusin', () => { hold = true; play(); });
  band.addEventListener('focusout', () => { hold = false; play(); });
  document.addEventListener('visibilitychange', play);
  document.querySelector('.motion-toggle')?.addEventListener('click', () => setTimeout(play, 0));
  reduce.addEventListener?.('change', play);
  play();
})();
// keep the "1 / 3" counter in the Special offers badge in step with the active slide
(() => {
  const band = document.querySelector('.promo-band'); const b = band?.querySelector('.promo-count b');
  if (!band || !b) return;
  const slides = [...band.querySelectorAll('.promo-slide')];
  new MutationObserver(() => { b.textContent = String(slides.findIndex(s => s.classList.contains('is-active')) + 1); })
    .observe(band.querySelector('.promo-stage'), {subtree: true, attributes: true, attributeFilter: ['class']});
})();

(() => {
  const poster = document.querySelector('.lunch-poster');
  if (!poster || typeof poster.showModal !== 'function' || location.hash) return;
  const key = 'easyjoy.lunch-offer.dismissed';
  const preview = ['localhost', '127.0.0.1'].includes(location.hostname)
    && new URLSearchParams(location.search).get('preview') === 'lunch';
  const week = 7 * 24 * 60 * 60 * 1000;
  try {
    if (!preview && Date.now() - Number(localStorage.getItem(key)) < week) return;
  } catch { /* The offer still works when storage is unavailable. */ }
  const slides = [...poster.querySelectorAll('[data-slide]')];
  const dots = [...poster.querySelectorAll('.lunch-dots i')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((s, i) => { s.inert = i !== index; });
    dots.forEach((d, i) => d.classList.toggle('is-on', i === index));
    restart();
  }
  function restart() {
    clearTimeout(timer);
    if (poster.open && !motion.matches) timer = setTimeout(() => show(index + 1), 5000);
  }
  poster.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
  poster.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
  function dismiss() {
    clearTimeout(timer);
    try { if (!preview) localStorage.setItem(key, String(Date.now())); } catch {}
    poster.close();
  }
  poster.querySelector('.lunch-close').addEventListener('click', dismiss);
  poster.querySelector('.lunch-directions').addEventListener('click', dismiss);
  poster.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  poster.addEventListener('click', event => { if (event.target === poster) dismiss(); });
  function scheduleOffer() {
    window.setTimeout(() => {
      if (!location.hash && !poster.open) { poster.showModal(); show(0); }
    }, 3000);
  }
  if (document.readyState === 'complete') scheduleOffer();
  else window.addEventListener('load', scheduleOffer, { once: true });
})();
