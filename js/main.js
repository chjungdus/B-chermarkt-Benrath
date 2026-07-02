/* ==========================================================================
   Büchermarkt Benrath – main.js
   Inhalt:
   1. Mobile Navigation
   2. Aktives Nav-Highlighting beim Scrollen
   3. Sortiment-Filter
   4. Öffnungszeiten-Status
   5. Galerie-Lightbox
   6. Zurück-nach-oben-Button
   7. Copyright-Jahr
   8. FAQ-Akkordeon
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initActiveNavHighlighting();
    initCategoryFilter();
    initOpeningHoursStatus();
    initGalleryLightbox();
    initBackToTop();
    initCopyrightYear();
    initFaqAccordion();
  });

  /* ---------- 1. Mobile Navigation ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- 2. Aktives Nav-Highlighting ---------- */
  function initActiveNavHighlighting() {
    var navLinks = document.querySelectorAll('.main-nav a[href^="#"], .main-nav a[href^="index.html#"]');
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var hash = link.getAttribute("href").split("#")[1];
      var section = hash ? document.getElementById(hash) : null;
      if (section) sections.push({ link: link, section: section });
    });
    if (!sections.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (item) {
            return item.section === entry.target;
          });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.remove("active");
            });
            match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (item) {
      observer.observe(item.section);
    });
  }

  /* ---------- 3. Sortiment-Filter ---------- */
  function initCategoryFilter() {
    var filterButtons = document.querySelectorAll(".category-filters button");
    var cards = document.querySelectorAll(".category-card");
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (btn) {
          btn.classList.remove("active");
        });
        button.classList.add("active");

        var filter = button.getAttribute("data-filter");
        cards.forEach(function (card) {
          var category = card.getAttribute("data-category");
          card.classList.remove("is-dimmed", "is-highlighted");
          if (filter === "alle") return;
          if (category === filter) {
            card.classList.add("is-highlighted");
          } else {
            card.classList.add("is-dimmed");
          }
        });
      });
    });
  }

  /* ---------- 4. Öffnungszeiten-Status ---------- */
  function initOpeningHoursStatus() {
    var badge = document.getElementById("status-badge");
    var table = document.getElementById("hours-table");
    if (!badge) return;

    // Öffnungszeiten passend zu den Angaben in der Tabelle.
    // Wochentage: 0 = Sonntag ... 6 = Samstag.
    var openingHours = {
      0: null, // Sonntag: geschlossen
      1: { start: 10, end: 16 },
      2: { start: 10, end: 16 },
      3: { start: 10, end: 16 },
      4: { start: 10, end: 16 },
      5: { start: 10, end: 16 },
      6: { start: 10, end: 16 }
    };

    var now = new Date();
    var day = now.getDay();
    var hourDecimal = now.getHours() + now.getMinutes() / 60;
    var today = openingHours[day];
    var isOpen = !!today && hourDecimal >= today.start && hourDecimal < today.end;

    badge.textContent = isOpen ? "Aktuell geöffnet" : "Aktuell geschlossen";
    badge.classList.toggle("is-open", isOpen);
    badge.classList.toggle("is-closed", !isOpen);

    if (table) {
      var rows = table.querySelectorAll("tr[data-day]");
      rows.forEach(function (row) {
        var rowDay = Number(row.getAttribute("data-day"));
        row.classList.toggle("today", rowDay === day);
      });
    }
  }

  /* ---------- 5. Galerie-Lightbox ---------- */
  function initGalleryLightbox() {
    var items = document.querySelectorAll(".gallery-item");
    var lightbox = document.getElementById("lightbox");
    if (!items.length || !lightbox) return;

    var closeButton = document.getElementById("lightbox-close");
    var captionEl = document.getElementById("lightbox-caption");
    var imageEl = document.getElementById("lightbox-img");
    var lastFocused = null;

    function openLightbox(item) {
      var sourceImg = item.querySelector("img");
      lastFocused = document.activeElement;
      captionEl.textContent = item.getAttribute("data-caption") || "";
      if (sourceImg && imageEl) {
        imageEl.src = sourceImg.src;
        imageEl.alt = sourceImg.alt;
      }
      lightbox.classList.add("is-visible");
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-visible");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item);
      });
    });

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-visible")) {
        closeLightbox();
      }
    });
  }

  /* ---------- 6. Zurück-nach-oben-Button ---------- */
  function initBackToTop() {
    var button = document.getElementById("back-to-top");
    if (!button) return;

    function toggleVisibility() {
      button.classList.toggle("is-visible", window.scrollY > 480);
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 7. Copyright-Jahr ---------- */
  function initCopyrightYear() {
    var yearEl = document.getElementById("copyright-year");
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- 8. FAQ-Akkordeon ---------- */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll(".faq-item");
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var button = item.querySelector(".faq-question");
      if (!button) return;

      button.addEventListener("click", function () {
        var isOpen = item.classList.contains("is-open");
        item.classList.toggle("is-open", !isOpen);
        button.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }
})();
