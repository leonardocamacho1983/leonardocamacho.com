(() => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = Array.from(document.querySelectorAll(".scroll-reveal"));
  const heroEntrances = Array.from(document.querySelectorAll(".hero-entrance"));

  const revealNow = (item) => {
    if (!(item instanceof HTMLElement)) {
      return;
    }

    item.classList.add("visible");
  };

  revealItems.forEach((item) => {
    if (!(item instanceof HTMLElement)) {
      return;
    }

    const y = Number.parseFloat(item.dataset.y || "");
    const revealY = Number.isFinite(y) ? y : 30;
    item.style.setProperty("--reveal-y", `${revealY}px`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(revealNow);
    heroEntrances.forEach((item) => {
      if (item instanceof HTMLElement) {
        item.classList.add("is-entered");
      }
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
            return;
          }

          const target = entry.target;
          if (target.dataset.revealDone === "true") {
            observer.unobserve(target);
            return;
          }

          target.dataset.revealDone = "true";
          const delayValue = Number.parseInt(target.dataset.delay || "0", 10);
          const delay = Number.isFinite(delayValue) && delayValue > 0 ? delayValue : 0;

          window.setTimeout(() => {
            revealNow(target);
            observer.unobserve(target);
          }, delay);
        });
      },
      { rootMargin: "-60px" },
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });

    // Failsafe for first viewport content in case an observer event is missed.
    window.setTimeout(() => {
      const revealCutoff = window.innerHeight + 120;
      revealItems.forEach((item) => {
        if (!(item instanceof HTMLElement)) {
          return;
        }

        const { top } = item.getBoundingClientRect();
        if (top <= revealCutoff) {
          revealNow(item);
          observer.unobserve(item);
        }
      });
    }, 1000);
  }

  // Ensure hero entrance cannot remain in a mid-animation visual state.
  window.setTimeout(() => {
    heroEntrances.forEach((item) => {
      if (item instanceof HTMLElement) {
        item.classList.add("is-entered");
      }
    });
  }, 900);

  const mobileButton = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("#mobile-nav");

  if (mobileButton instanceof HTMLElement && mobileNav instanceof HTMLElement) {
    mobileButton.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      mobileButton.classList.toggle("is-open", isOpen);
      mobileButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const languageSwitch = document.querySelector("[data-language-switch]");
  const languageTrigger = document.querySelector("[data-language-trigger]");
  const languageMenu = document.querySelector("[data-language-menu]");

  if (
    languageSwitch instanceof HTMLElement &&
    languageTrigger instanceof HTMLElement &&
    languageMenu instanceof HTMLElement
  ) {
    const closeLanguageMenu = () => {
      languageMenu.classList.remove("is-open");
      languageTrigger.setAttribute("aria-expanded", "false");
    };

    languageTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = languageMenu.classList.toggle("is-open");
      languageTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Node) || !languageSwitch.contains(event.target)) {
        closeLanguageMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLanguageMenu();
      }
    });
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");

  if (themeToggle instanceof HTMLElement) {
    const syncThemeState = () => {
      const activeTheme = root.getAttribute("data-theme") || "light";
      themeToggle.setAttribute("aria-checked", activeTheme === "dark" ? "true" : "false");
    };

    syncThemeState();

    themeToggle.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // Ignore storage writes when blocked by privacy settings.
      }
      syncThemeState();
    });
  }
})();
