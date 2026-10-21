/* Ganga Avanta 2.0 — page interactions (vanilla JS, no framework) */
(function () {
    'use strict';

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
    var DESKTOP = window.matchMedia('(min-width: 992px)');
    var NAV_DESKTOP = window.matchMedia('(min-width: 1200px)');

    /* ---------- Header: scrolled state ---------- */
    var header = $('#siteHeader');
    var onScrollHeader = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* ---------- Mobile navigation drawer ---------- */
    var nav = $('#mainNav'), trigger = $('#menuTrigger'), overlay = $('#navOverlay'), navClose = $('#navClose');

    function openNav() {
        nav.classList.add('is-open');
        overlay.hidden = false;
        requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
        document.body.classList.add('nav-open');
        trigger.setAttribute('aria-expanded', 'true');
        navClose.focus();
    }
    function closeNav() {
        if (!nav.classList.contains('is-open')) return;
        nav.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        document.body.classList.remove('nav-open');
        trigger.setAttribute('aria-expanded', 'false');
        setTimeout(function () { overlay.hidden = true; }, 350);
    }
    trigger.addEventListener('click', openNav);
    navClose.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    $$('.nav-list a').forEach(function (a) { a.addEventListener('click', closeNav); });
    NAV_DESKTOP.addEventListener('change', closeNav);

    /* ---------- Active nav link while scrolling ---------- */
    var navLinks = $$('.nav-list a');
    if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (a) {
                    a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        navLinks.forEach(function (a) {
            var target = document.getElementById(a.getAttribute('href').slice(1));
            if (target) spy.observe(target);
        });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
        var revealer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        reveals.forEach(function (el) { revealer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Accessible tabs (amenities, floor plan, specs) ---------- */
    $$('[role="tablist"]').forEach(function (list) {
        var tabs = $$(':scope > [role="tab"]', list);

        function select(tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.tabIndex = on ? 0 : -1;
                var panel = document.getElementById(t.getAttribute('aria-controls'));
                if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
            });
            if (focus) tab.focus();
            if (list.classList.contains('plan-tabs')) {
                tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            }
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { select(tab, false); });
            tab.addEventListener('keydown', function (e) {
                var next = null;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
                if (e.key === 'Home') next = tabs[0];
                if (e.key === 'End') next = tabs[tabs.length - 1];
                if (next) { e.preventDefault(); select(next, true); }
            });
        });
    });

    /* ---------- Popup enquiry (dialog) ---------- */
    var modal = $('#popupModal');
    var modalTitle = $('#popupModalLabel');
    var supportsDialog = typeof modal.showModal === 'function';

    function openModal(title) {
        if (modal.open) return;
        modalTitle.textContent = title || 'Book a Site Visit';
        if (supportsDialog) modal.showModal(); else modal.setAttribute('open', '');
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        if (supportsDialog) modal.close(); else modal.removeAttribute('open');
    }
    modal.addEventListener('close', function () { document.body.style.overflow = ''; });
    // click on backdrop closes
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });

    $$('[data-enquire]').forEach(function (btn) {
        btn.addEventListener('click', function () { openModal(btn.getAttribute('data-enquire')); });
    });

    // Auto popup once after 6s — skipped if the visitor is already typing in a form or another dialog is open
    setTimeout(function () {
        var active = document.activeElement;
        var typing = active && active.classList && active.classList.contains('form-control');
        var lb = $('#lightbox');
        if (!typing && !(lb && lb.open) && !document.body.classList.contains('nav-open')) openModal();
    }, 6000);

    /* ---------- Desktop side enquiry panel ---------- */
    var side = $('#sideEnquiry'), sideTab = $('#sideEnquiryTab'), sideClose = $('#sideEnquiryClose');
    var autoOpened = false;
    function setSide(open) {
        side.classList.toggle('is-open', open);
        sideTab.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    sideTab.addEventListener('click', function () { setSide(!side.classList.contains('is-open')); });
    sideClose.addEventListener('click', function () { setSide(false); });
    window.addEventListener('scroll', function () {
        if (!DESKTOP.matches) return;
        var y = window.scrollY;
        if (y <= 0) { setSide(false); return; }
        // auto-open once, after the visitor has scrolled past the hero
        if (y >= 900 && !autoOpened && !modal.open) { autoOpened = true; setSide(true); }
    }, { passive: true });
    DESKTOP.addEventListener('change', function (e) { if (!e.matches) setSide(false); });

    /* ---------- Gallery carousel (scroll-snap) ---------- */
    var track = $('#galleryTrack');
    if (track) {
        var slides = $$('.carousel-slide', track);
        var dotsWrap = $('.carousel-dots');
        var dots = slides.map(function () { var d = document.createElement('span'); dotsWrap.appendChild(d); return d; });
        var current = 0;

        function go(index) {
            current = (index + slides.length) % slides.length;
            track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft, behavior: 'smooth' });
        }
        function sync() {
            current = Math.round(track.scrollLeft / track.clientWidth);
            dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
        }
        $$('.carousel-btn').forEach(function (b) {
            b.addEventListener('click', function () { go(current + Number(b.getAttribute('data-dir'))); });
        });
        track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
        });
        sync();
    }

    /* ---------- Lightbox ---------- */
    var lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbCap = $('#lightboxCaption');
    var group = [], index = 0;

    function show(i) {
        index = (i + group.length) % group.length;
        var link = group[index];
        lbImg.src = link.getAttribute('href');
        lbImg.alt = (link.querySelector('img') || {}).alt || '';
        lbCap.textContent = link.getAttribute('data-caption') || '';
    }
    $$('[data-lightbox]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            group = $$('[data-lightbox="' + link.getAttribute('data-lightbox') + '"]');
            lb.classList.toggle('is-single', group.length < 2);
            show(group.indexOf(link));
            if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
        });
    });
    function closeLb() { if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); }
    $('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
    $('.lightbox-next').addEventListener('click', function () { show(index + 1); });
    $('[data-close]', lb).addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('keydown', function (e) {
        if (group.length < 2) return;
        if (e.key === 'ArrowRight') show(index + 1);
        if (e.key === 'ArrowLeft') show(index - 1);
    });

    /* ---------- Footer disclaimer ---------- */
    var dToggle = $('#disclaimerToggle'), dWrap = $('#disclaimerWrap'), dPreview = $('#disclaimerPreview');
    dToggle.addEventListener('click', function () {
        var open = dToggle.getAttribute('aria-expanded') === 'true';
        dToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        dWrap.hidden = open;
        dPreview.hidden = !open;
        dToggle.textContent = open ? 'Read More' : 'Read Less';
    });
})();
