document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const categoryToggle = document.querySelector('.category-toggle');
const dropdown = document.querySelector('#category-dropdown');
const backToTop = document.querySelector('.back-to-top');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const navToggle = document.querySelector('.mobile-nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
const mobileWidth = window.matchMedia('(max-width: 1000px)');
const closeNavigation = (restoreFocus = false) => {
  header.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  closeCategories();
  if (restoreFocus) navToggle.focus();
};
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  header.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  if (!open) closeCategories();
});
mobileWidth.addEventListener('change', () => closeNavigation());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('nav-open') && dropdown.hidden) closeNavigation(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeNavigation(primaryNav.contains(document.activeElement));
});
header.addEventListener('focusout', event => {
  // Focus is temporarily on body between blur and focus during a pointer click.
  // Keep the menu visible when focus is moving to one of its own links.
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeNavigation();
});
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNavigation()));
const setHeaderHeight = () => document.documentElement.style.setProperty('--sticky-header', `${Math.ceil(header.getBoundingClientRect().height)}px`);
setHeaderHeight();
if ('ResizeObserver' in window) new ResizeObserver(setHeaderHeight).observe(header);
const closeCategories = (restoreFocus = false) => {
  dropdown.hidden = true;
  categoryToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) categoryToggle.focus();
};
categoryToggle.addEventListener('click', () => {
  const open = categoryToggle.getAttribute('aria-expanded') !== 'true';
  dropdown.hidden = !open;
  categoryToggle.setAttribute('aria-expanded', String(open));
});
categoryToggle.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); dropdown.hidden = false; categoryToggle.setAttribute('aria-expanded', 'true'); dropdown.querySelector('a').focus(); }
});
document.addEventListener('click', event => { if (!header.contains(event.target)) closeCategories(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dropdown.hidden) closeCategories(header.contains(document.activeElement));
});
header.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeCategories()));
const input = document.querySelector('#menu-search');
let resetMenu = () => {};
let updateActiveCategory = () => {};
if (input) {
  const dishes = [...document.querySelectorAll('.dish')];
  const sections = [...document.querySelectorAll('[data-category]')];
  const links = [...document.querySelectorAll('.menu-nav a')];
  const popularButton = document.querySelector('#popular-filter');
  const categoryJump = document.querySelector('#category-jump');
  const normalise = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const searchTerms = new Map(dishes.map(dish => [dish, normalise(dish.dataset.search)]));
  const filter = () => {
    const words = normalise(input.value).split(' ').filter(Boolean);
    const popularOnly = popularButton.getAttribute('aria-pressed') === 'true';
    let count = 0;
    dishes.forEach(dish => {
      dish.hidden = !words.every(word => searchTerms.get(dish).includes(word)) || (popularOnly && dish.dataset.popular !== 'true');
      if (!dish.hidden) count++;
    });
    sections.forEach(section => { section.hidden = !section.querySelector('.dish:not([hidden])'); });
    document.querySelector('#search-count').textContent = `${count}${popularOnly ? ' popular' : ''} ${count === 1 ? 'dish' : 'dishes'}${words.length ? ' matching your search' : !popularOnly ? ' in ' + sections.length + ' categories' : ''}`;
    document.querySelector('#no-results').hidden = count !== 0;
    updateActiveCategory();
  };
  resetMenu = () => { input.value = ''; popularButton.setAttribute('aria-pressed', 'false'); filter(); };
  updateActiveCategory = () => {
    const drinksSection = document.querySelector('#drinks-menu');
    const visible = [...sections, ...(drinksSection ? [drinksSection] : [])].filter(section => !section.hidden);
    const jumpHeight = categoryJump.parentElement.getBoundingClientRect().height;
    const offset = header.getBoundingClientRect().height + jumpHeight + 48;
    const current = visible.filter(section => section.getBoundingClientRect().top <= offset).at(-1) || visible[0];
    links.forEach(link => {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (current) categoryJump.value = current.id;
  };
  input.addEventListener('input', filter);
  popularButton.addEventListener('click', () => { popularButton.setAttribute('aria-pressed', String(popularButton.getAttribute('aria-pressed') !== 'true')); filter(); });
  document.querySelector('#clear-search').addEventListener('click', () => { resetMenu(); input.focus(); });
  links.forEach(link => link.addEventListener('click', resetMenu));
  categoryJump.addEventListener('change', () => {
    const id = categoryJump.value;
    if (!id) return;
    resetMenu();
    location.hash = id;
    categoryJump.value = id;
  });
  document.querySelectorAll('[data-category-link]').forEach(link => link.addEventListener('click', resetMenu));
  updateActiveCategory();
}
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    backToTop.hidden = window.scrollY < 650;
    updateActiveCategory();
    scrollQueued = false;
  });
}, {passive:true});
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
  }), {threshold:0.12});
  document.querySelectorAll('[data-reveal]').forEach(item => observer.observe(item));
}

// Keep native video controls usable with or without the optional play overlay.
const film = document.querySelector('#film-player');
const filmPlay = document.querySelector('.film-play');
if (film && filmPlay) {
  filmPlay.hidden = false;
  const startFilm = async () => {
    try { await film.play(); filmPlay.hidden = true; }
    catch { filmPlay.hidden = true; document.querySelector('.film-error').hidden = false; film.focus(); }
  };
  filmPlay.addEventListener('click', startFilm);
  document.querySelector('.film-watch-link')?.addEventListener('click', () => { film.focus(); startFilm(); });
  film.addEventListener('play', () => { filmPlay.hidden = true; });
  film.addEventListener('ended', () => { filmPlay.hidden = false; });
  film.addEventListener('error', () => { filmPlay.hidden = true; document.querySelector('.film-error').hidden = false; });
}
// Native details supplies keyboard and no-JS behavior; add dismissal and focus return.
const deliveryMenus = [...document.querySelectorAll('.delivery-menu')];
deliveryMenus.forEach(menu => {
  menu.addEventListener('toggle', () => {
    if (menu.open) deliveryMenus.forEach(other => { if (other !== menu) other.open = false; });
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault(); event.stopPropagation(); menu.open = false; menu.querySelector('summary').focus();
    }
  });
  menu.addEventListener('focusout', event => {
    // During pointer focus transfer activeElement can still be body. Closing
    // here would hide the link before mouseup/click. Use the destination instead.
    // A null destination is handled by outside-click or Escape dismissal.
    if (event.relatedTarget && !menu.contains(event.relatedTarget)) menu.open = false;
  });
});
document.addEventListener('click', event => deliveryMenus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; }));
