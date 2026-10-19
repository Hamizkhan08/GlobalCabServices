/**
 * Global Cab Services - Main JavaScript v2.0
 * WhatsApp-driven booking, mobile-first, no backend for inquiries
 */

/* ============================================================
   CENTRAL CONFIGURATION (single source of truth)
   ============================================================ */
var GALAXY = {
  phone: '919881598109',
  name: 'Global Cab Services',
  email: 'globalcabservicesnsk@gmail.com',
  reviews: 'https://g.page/r/Cd-LLnOEWd0wEBE/review'
};

/* ============================================================
   WHATSAPP HELPERS
   ============================================================ */
function waUrl(msg) {
  return 'https://wa.me/' + GALAXY.phone + '?text=' + encodeURIComponent(msg);
}

function openWa(msg) {
  window.open(waUrl(msg), '_blank', 'noopener,noreferrer');
}

function msgGeneric() {
  return 'Hello ' + GALAXY.name + ', I would like to enquire about a cab booking. Please share availability and fare details.';
}

function msgService(name) {
  return 'Hello ' + GALAXY.name + ', I would like to enquire about your *' + name + '* service.\n\nPlease share the fare and availability. Thank you!';
}

function msgVehicle(name) {
  return 'Hello ' + GALAXY.name + ', I would like to book a *' + name + '*.\n\nPlease share availability and fare for my journey. Thank you!';
}

function msgBooking(d) {
  var m = 'Hello ' + GALAXY.name + ', I would like to book a cab.\n\n';
  m += '\uD83D\uDC64 Name: ' + d.name + '\n';
  m += '\uD83D\uDCDE Phone: ' + d.phone + '\n';
  if (d.service) m += '\uD83C\uDFF7\uFE0F Service: ' + d.service + '\n';
  if (d.vehicle) m += '\uD83D\uDE97 Vehicle: ' + d.vehicle + '\n';
  m += '\uD83D\uDCCD Pickup: ' + d.pickup + '\n';
  m += '\uD83D\uDCCD Destination: ' + d.destination + '\n';
  m += '\uD83D\uDCC5 Date: ' + d.date + '\n';
  if (d.time) m += '\uD83D\uDD50 Time: ' + d.time + '\n';
  m += '\uD83D\uDD04 Trip Type: ' + d.tripType + '\n';
  if (d.passengers) m += '\uD83D\uDC65 Passengers: ' + d.passengers + '\n';
  if (d.notes) m += '\uD83D\uDCDD Notes: ' + d.notes + '\n';
  m += '\nKindly confirm availability and fare. Thank you!';
  return m;
}

function msgFare(d) {
  var m = 'Hello ' + GALAXY.name + ', I would like a *fare quote* for the following trip:\n\n';
  m += '\uD83D\uDCCD Pickup: ' + d.pickup + '\n';
  m += '\uD83D\uDCCD Destination: ' + d.destination + '\n';
  m += '\uD83D\uDD04 Trip Type: ' + d.tripType + '\n';
  if (d.vehicle) m += '\uD83D\uDE97 Vehicle: ' + d.vehicle + '\n';
  m += '\uD83D\uDCC5 Date: ' + d.date + '\n';
  if (d.returnDate) m += '\uD83D\uDCC5 Return Date: ' + d.returnDate + '\n';
  m += '\nPlease share the fare and availability. Thank you!';
  return m;
}

/* ============================================================
   NAVBAR + MOBILE DRAWER
   ============================================================ */
function initNavbar() {
  var navbar    = document.getElementById('main-navbar');
  var hamburger = document.getElementById('nav-hamburger');
  var drawer    = document.getElementById('mobile-drawer');
  var backdrop  = document.getElementById('drawer-backdrop');
  var closeBtn  = document.getElementById('drawer-close');

  if (!navbar) return;

  /* Scroll state */
  function onScroll() {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    /* Move focus into drawer */
    var firstLink = drawer.querySelector('.mobile-drawer__link, .mobile-drawer__close');
    if (firstLink) firstLink.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', function () {
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });

  if (closeBtn)  closeBtn.addEventListener('click', closeDrawer);
  if (backdrop)  backdrop.addEventListener('click', closeDrawer);

  /* All nav links and CTAs inside drawer close it */
  drawer.querySelectorAll('.mobile-drawer__link, .mobile-drawer__cta a, .mobile-drawer__cta button').forEach(function (el) {
    el.addEventListener('click', closeDrawer);
  });

  /* Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
}

/* ============================================================
   TESTIMONIAL SLIDER
   ============================================================ */
function initSlider() {
  var wrapper = document.getElementById('reviews-slider');
  if (!wrapper) return;

  var track = wrapper.querySelector('.slider-track');
  if (!track) return;

  var cards = Array.from(track.children);
  if (!cards.length) return;

  var prevBtn = document.getElementById('slider-prev');
  var nextBtn = document.getElementById('slider-next');
  var dotsEl = document.getElementById('slider-dots');

  var currentIdx = 0;
  var timer = null;
  var hovered = false;
  var focused = false;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  var perView = getPerView();
  var total = Math.max(0, cards.length - perView);

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (var i = 0; i <= total; i++) {
      (function(idx) {
        var dot = document.createElement('button');
        dot.className = 'slider-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (idx + 1));
        dot.addEventListener('click', function () { goTo(idx); resetTimer(); });
        dotsEl.appendChild(dot);
      })(i);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    var dots = dotsEl.querySelectorAll('.slider-dot');
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === currentIdx); });
  }

  function goTo(idx) {
    currentIdx = Math.max(0, Math.min(idx, total));
    var cardW = cards[0].offsetWidth + 24; // 24 = gap
    track.style.transform = 'translateX(-' + (currentIdx * cardW) + 'px)';
    updateDots();
  }

  function next() { goTo(currentIdx >= total ? 0 : currentIdx + 1); }
  function prev() { goTo(currentIdx <= 0 ? total : currentIdx - 1); }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });

  // Touch swipe
  var touchX = 0;
  track.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetTimer(); }
  });

  // Keyboard
  wrapper.setAttribute('tabindex', '0');
  wrapper.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
  });

  wrapper.addEventListener('mouseenter', function () { hovered = true; });
  wrapper.addEventListener('mouseleave', function () { hovered = false; });
  wrapper.addEventListener('focusin',  function () { focused = true; });
  wrapper.addEventListener('focusout', function () { focused = false; });

  function startTimer() {
    if (prefersReduced) return;
    timer = setInterval(function () { if (!hovered && !focused) next(); }, 4200);
  }

  function resetTimer() { clearInterval(timer); startTimer(); }

  // Resize
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      perView = getPerView();
      total = Math.max(0, cards.length - perView);
      buildDots();
      goTo(0);
    }, 200);
  });

  buildDots();
  goTo(0);
  startTimer();
}

/* ============================================================
   BOOKING FORM
   ============================================================ */
function initBookingForm() {
  var form = document.getElementById('booking-form');
  if (!form) return;

  var rules = {
    full_name:     { msg: 'Please enter your full name.' },
    customer_phone:{ msg: 'Please enter a valid 10-digit mobile number.', pattern: /^[6-9]\d{9}$/ },
    service_type:  { msg: 'Please select a service type.' },
    pickup_location:{ msg: 'Please enter your pickup location.' },
    destination:   { msg: 'Please enter your destination.' },
    travel_date:   { msg: 'Please select a travel date.' },
    trip_type:     { msg: 'Please select a trip type.' }
  };

  function validateField(name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return true;
    var wrap = el.closest('.field');
    var errEl = wrap ? wrap.querySelector('.field__err') : null;
    var val = el.value.trim();
    var ok = val !== '';
    if (ok && rules[name].pattern) ok = rules[name].pattern.test(val);
    if (wrap) wrap.classList.toggle('has-error', !ok);
    if (errEl) errEl.textContent = ok ? '' : rules[name].msg;
    return ok;
  }

  function validateAll() {
    return Object.keys(rules).map(validateField).every(Boolean);
  }

  Object.keys(rules).forEach(function (name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (el) el.addEventListener('blur', function () { validateField(name); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateAll()) return;

    var data = {
      name: (form.querySelector('[name="full_name"]') || {}).value || '',
      phone: (form.querySelector('[name="customer_phone"]') || {}).value || '',
      service: (form.querySelector('[name="service_type"]') || {}).value || '',
      vehicle: (form.querySelector('[name="vehicle_pref"]') || {}).value || '',
      pickup: (form.querySelector('[name="pickup_location"]') || {}).value || '',
      destination: (form.querySelector('[name="destination"]') || {}).value || '',
      date: (form.querySelector('[name="travel_date"]') || {}).value || '',
      time: (form.querySelector('[name="pickup_time"]') || {}).value || '',
      tripType: (form.querySelector('[name="trip_type"]') || {}).value || '',
      passengers: (form.querySelector('[name="passengers"]') || {}).value || '',
      notes: (form.querySelector('[name="notes"]') || form.querySelector('[name="extra_notes"]') || {}).value || ''
    };

    openWa(msgBooking(data));
  });
}

/* ============================================================
   FARE INQUIRY FORM
   ============================================================ */
function initFareForm() {
  var form = document.getElementById('fare-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var pickup = (form.querySelector('[name="fare_pickup"]') || {}).value || '';
    var dest   = (form.querySelector('[name="fare_dest"]') || {}).value || '';
    var type   = (form.querySelector('[name="fare_trip_type"]') || {}).value || '';
    var veh    = (form.querySelector('[name="fare_vehicle"]') || {}).value || '';
    var date   = (form.querySelector('[name="fare_date"]') || {}).value || '';
    var ret    = (form.querySelector('[name="fare_return"]') || {}).value || '';

    pickup = pickup.trim(); dest = dest.trim();

    if (!pickup || !dest || !type || !date) {
      alert('Please fill in Pickup, Destination, Trip Type and Travel Date to request a fare quote.');
      return;
    }

    openWa(msgFare({ pickup: pickup, destination: dest, tripType: type, vehicle: veh, date: date, returnDate: ret }));
  });
}

/* ============================================================
   SERVICE / VEHICLE / GENERIC WHATSAPP BUTTONS
   ============================================================ */
function initWaButtons() {
  document.querySelectorAll('[data-wa-service]').forEach(function (btn) {
    btn.addEventListener('click', function () { openWa(msgService(btn.getAttribute('data-wa-service'))); });
  });
  document.querySelectorAll('[data-wa-vehicle]').forEach(function (btn) {
    btn.addEventListener('click', function () { openWa(msgVehicle(btn.getAttribute('data-wa-vehicle'))); });
  });
  document.querySelectorAll('[data-wa-generic]').forEach(function (btn) {
    btn.addEventListener('click', function () { openWa(msgGeneric()); });
  });
}

/* ============================================================
   DATE FIELDS - prevent past dates
   ============================================================ */
function initDates() {
  var today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(function (el) {
    el.setAttribute('min', today);
  });
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function initYear() {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   SMOOTH SCROLL WITH NAVBAR OFFSET
   ============================================================ */
function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = 70 + 16;
      var y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initSlider();
  initBookingForm();
  initFareForm();
  initWaButtons();
  initDates();
  initYear();
  initScroll();
});

