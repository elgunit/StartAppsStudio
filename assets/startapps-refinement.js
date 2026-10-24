(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  ready(function () {
    var labels = window.__SAS_REFINEMENT_LABELS__ || {};
    var nav = document.querySelector('.sas-nav');
    var menuButton = document.querySelector('.sas-menu-button');
    var navLinks = document.getElementById('sasNavLinks');
    if (menuButton && navLinks) {
      menuButton.addEventListener('click', function () {
        var open = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(open));
        navLinks.classList.toggle('is-open', open);
      });
      navLinks.addEventListener('click', function (event) {
        if (!event.target.closest('a')) return;
        navLinks.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    }
    function updateHeader() {
      if (nav) nav.classList.toggle('is-compact', window.scrollY > 28);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // The static template remains a complete two-step form without JavaScript.
    var form = document.getElementById('contactForm');
    var stepOne = document.getElementById('formStep1');
    var stepTwo = document.getElementById('formStep2');
    var continueButton = document.getElementById('formContinue');
    var backButton = document.getElementById('formBack');
    var progressLabel = document.querySelector('.sas-progress-label');
    var progressFill = document.getElementById('sasProgressFill');
    function setStep(number) {
      if (!stepOne || !stepTwo) return;
      stepOne.hidden = number !== 1;
      stepTwo.hidden = number !== 2;
      if (progressLabel) progressLabel.textContent = number === 1 ? labels.stepOne : labels.stepTwo;
      if (progressFill) progressFill.style.width = number === 1 ? '50%' : '100%';
      var focusTarget = number === 1 ? document.getElementById('fullName') : document.getElementById('digitalPresence');
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }
    function validStepOne() {
      if (!form) return false;
      var required = [document.getElementById('fullName'), document.getElementById('email'), document.getElementById('businessStage')];
      for (var i = 0; i < required.length; i += 1) {
        if (required[i] && !required[i].reportValidity()) return false;
      }
      return true;
    }
    if (continueButton) continueButton.addEventListener('click', function () { if (validStepOne()) setStep(2); });
    if (backButton) backButton.addEventListener('click', function () { setStep(1); });
    if (form) {
      form.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || event.shiftKey || event.target.tagName === 'TEXTAREA') return;
        if (!stepOne || stepOne.hidden) return;
        event.preventDefault();
        if (validStepOne()) setStep(2);
      });
      form.addEventListener('submit', function (event) {
        if (stepOne && !stepOne.hidden) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (validStepOne()) setStep(2);
          return;
        }
        var budget = form.querySelector('input[name="budget"]:checked');
        var message = document.getElementById('message');
        if (!budget) {
          event.preventDefault();
          event.stopImmediatePropagation();
          var requiredBudget = form.querySelector('input[name="budget"]');
          if (requiredBudget) requiredBudget.reportValidity();
        } else if (message && !message.value.trim()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          message.value = '';
          message.reportValidity();
        }
      }, true);
    }

    // Keep a single tier selected, and synchronize the existing interest logic.
    function chooseTier(value) {
      var grid = document.getElementById('budgetGrid');
      if (!grid) return;
      grid.querySelectorAll('.budget-chip').forEach(function (chip) {
        var radio = chip.querySelector('input[name="budget"]');
        var selected = radio && radio.value === value;
        chip.classList.toggle('selected', !!selected);
        if (radio && selected) radio.click();
      });
    }
    document.querySelectorAll('[data-budget-choice]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.stopPropagation();
        chooseTier(link.getAttribute('data-budget-choice'));
        setStep(1);
      });
    });
    document.querySelectorAll('a[href="#contact"]').forEach(function (link) {
      link.addEventListener('click', function () { setStep(1); });
    });
    document.querySelectorAll('.sas-included-toggle').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        var card = button.closest('.price-card');
        if (!card) return;
        var open = card.classList.toggle('is-expanded');
        button.setAttribute('aria-expanded', String(open));
      });
    });
    document.querySelectorAll('.faq-item').forEach(function (item) {
      item.setAttribute('name', 'studio-faq');
      item.addEventListener('toggle', function () {
        if (item.open) document.querySelectorAll('.faq-item[open]').forEach(function (other) { if (other !== item) other.open = false; });
      });
    });

    // Single-quote navigation works with swipe, keyboard, and the visible arrows.
    var cards = Array.prototype.slice.call(document.querySelectorAll('.testimonials-grid .testimonial-card'));
    var quoteWrap = document.querySelector('.testimonial-carousel-wrap');
    var previous = document.getElementById('sasQuotePrevious');
    var next = document.getElementById('sasQuoteNext');
    if (cards.length && quoteWrap) {
      var current = Math.max(0, cards.findIndex(function (card) { return card.classList.contains('is-current'); }));
      function showQuote(index) {
        current = (index + cards.length) % cards.length;
        cards.forEach(function (card, i) {
          var active = i === current;
          card.classList.toggle('is-current', active);
          card.hidden = !active;
          card.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        var count = document.getElementById('sasQuoteCount');
        if (count) count.textContent = (current + 1) + ' / ' + cards.length;
      }
      if (previous) previous.addEventListener('click', function () { showQuote(current - 1); });
      if (next) next.addEventListener('click', function () { showQuote(current + 1); });
      quoteWrap.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') showQuote(current - 1);
        if (event.key === 'ArrowRight') showQuote(current + 1);
      });
      var touchStart = 0;
      quoteWrap.addEventListener('touchstart', function (event) { touchStart = event.changedTouches[0].screenX; }, { passive: true });
      quoteWrap.addEventListener('touchend', function (event) {
        var delta = event.changedTouches[0].screenX - touchStart;
        if (Math.abs(delta) > 40) showQuote(current + (delta < 0 ? 1 : -1));
      }, { passive: true });
      quoteWrap.tabIndex = 0;
      showQuote(current);
    }

    // Case-study data, including the timeline, is server-localized.
    document.querySelectorAll('.showcase-card').forEach(function (card) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', card.dataset.name);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });

    var mobileCta = document.querySelector('.sas-mobile-cta');
    var topButton = document.querySelector('.sas-back-top');
    var contact = document.getElementById('contactForm');
    var contactVisible = false;
    function syncScrollActions() {
      if (mobileCta) mobileCta.classList.toggle('is-hidden', window.scrollY < 180 || contactVisible);
      if (topButton) topButton.classList.toggle('is-visible', window.scrollY > 520 && !contactVisible);
    }
    if (contact && 'IntersectionObserver' in window) {
      var visiblePanels = new Set();
      var panelObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visiblePanels.add(entry.target);
          else visiblePanels.delete(entry.target);
        });
        contactVisible = visiblePanels.size > 0;
        syncScrollActions();
      }, { threshold: 0 });
      panelObserver.observe(contact);
      var successPanel = document.getElementById('formSuccess');
      if (successPanel) panelObserver.observe(successPanel);
    }
    window.addEventListener('scroll', syncScrollActions, { passive: true });
    syncScrollActions();
    if (topButton) topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });

    document.querySelectorAll('.pain-strip-item,.service-card').forEach(function (card) {
      var description = card.querySelector('.pain-strip-resolve,.service-card > p');
      if (!description) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sas-description-toggle';
      button.textContent = labels.readMore;
      button.setAttribute('aria-expanded', 'false');
      card.appendChild(button);
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = card.classList.toggle('sas-description-open');
        button.textContent = open ? labels.showLess : labels.readMore;
        button.setAttribute('aria-expanded', String(open));
      });
    });
  });
})();
