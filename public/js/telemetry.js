(() => {
  const scriptEl = document.currentScript;
  const posthogKey =
    scriptEl instanceof HTMLScriptElement ? scriptEl.dataset.posthogKey || "" : "";
  const posthogHost =
    scriptEl instanceof HTMLScriptElement
      ? scriptEl.dataset.posthogHost || "https://us.i.posthog.com"
      : "https://us.i.posthog.com";

  const hasPosthog = Boolean(posthogKey);
  const CONSENT_KEY = "lc_analytics_consent_v1";
  const CONSENT_ACCEPTED = "accepted";
  const CONSENT_REJECTED = "rejected";
  const EVENT_VERSION = 1;
  const pendingEvents = [];

  const pathname = window.location.pathname || "/";
  const searchParams = new URLSearchParams(window.location.search);

  const readConsent = () => {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  };

  const writeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {}
  };

  const detectLocale = (path) => {
    if (path.startsWith("/pt-br")) return "pt-br";
    if (path.startsWith("/pt-pt") || path === "/pt" || path.startsWith("/pt/")) return "pt-pt";
    if (path.startsWith("/fr-fr") || path === "/fr" || path.startsWith("/fr/")) return "fr-fr";
    if (path.startsWith("/en-gb")) return "en-gb";
    return "en-us";
  };

  const locale = detectLocale(pathname);
  const privacyPath = `/${locale}/privacy`;

  const getFunnelStep = (path) => {
    const normalized = (path || "/").replace(/\/+$/, "") || "/";
    if (/^\/(en-us|en-gb|pt-br|pt-pt|fr-fr|pt|fr)$/.test(normalized)) return "launch";
    if (/^\/(welcome|pt-br\/welcome|pt\/welcome|fr\/welcome)$/.test(normalized)) return "welcome";
    if (/^\/(confirmed|pt-br\/confirmed|pt\/confirmed|fr\/confirmed)$/.test(normalized)) return "confirmed";
    return "other";
  };

  const funnelStep = getFunnelStep(pathname);

  const sanitizeProps = (value) =>
    Object.fromEntries(
      Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );

  const safeReferrerDomain = () => {
    if (!document.referrer) return undefined;
    try {
      return new URL(document.referrer).hostname;
    } catch {
      return undefined;
    }
  };

  const baseProps = () =>
    sanitizeProps({
      event_version: EVENT_VERSION,
      locale,
      page_path: pathname,
      funnel_step: funnelStep,
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
      referrer_domain: safeReferrerDomain(),
    });

  let posthogReady = false;
  let posthogLoading = false;
  let viewTracked = false;

  const captureNow = (eventName, props = {}) => {
    if (!posthogReady || !window.posthog) return;
    window.posthog.capture(eventName, sanitizeProps({ ...baseProps(), ...props }));
  };

  const flushPendingEvents = () => {
    while (pendingEvents.length > 0) {
      const [name, props] = pendingEvents.shift();
      captureNow(name, props);
    }
  };

  const trackInitialView = () => {
    if (viewTracked) return;
    viewTracked = true;

    if (funnelStep === "launch") {
      captureNow("launch_view");
    } else if (funnelStep === "welcome") {
      captureNow("welcome_view");
    } else if (funnelStep === "confirmed") {
      captureNow("confirmed_view");
    }
  };

  window.lcTrack = (eventName, props = {}) => {
    if (!hasPosthog || readConsent() !== CONSENT_ACCEPTED) return;
    if (!posthogReady || !window.posthog) {
      pendingEvents.push([eventName, props]);
      return;
    }
    captureNow(eventName, props);
  };

  const bootstrapPosthog = () => {
    if (!hasPosthog || posthogLoading || posthogReady) return;
    posthogLoading = true;

    /* eslint-disable */
    (function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1]));
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.async = !0),
            (p.src = s.api_host + "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = "posthog";
                return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "init capture register register_once unregister unregister_once alias identify set_config reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing".split(
                  " ",
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);
    /* eslint-enable */

    window.posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      loaded: () => {
        posthogReady = true;
        flushPendingEvents();
        trackInitialView();
        window.dispatchEvent(new CustomEvent("lc:analytics-ready"));
      },
    });
  };

  const getConsentCopy = (localeKey) => {
    const dict = {
      "en-us": {
        title: "Privacy, your call.",
        message:
          "If you accept, we use lightweight analytics to improve the reading experience. We never sell personal data.",
        accept: "Allow analytics",
        reject: "No thanks",
        policy: "Read privacy policy",
      },
      "en-gb": {
        title: "Privacy, your call.",
        message:
          "If you accept, we use lightweight analytics to improve the reading experience. We never sell personal data.",
        accept: "Allow analytics",
        reject: "No thanks",
        policy: "Read privacy policy",
      },
      "pt-br": {
        title: "Privacidade, sua escolha.",
        message:
          "Se você aceitar, usamos analytics leves para melhorar a experiência de leitura. Nunca vendemos dados pessoais.",
        accept: "Permitir analytics",
        reject: "Agora não",
        policy: "Ler política de privacidade",
      },
      "pt-pt": {
        title: "Privacidade, a sua escolha.",
        message:
          "Se aceitar, usamos analytics leves para melhorar a experiência de leitura. Nunca vendemos dados pessoais.",
        accept: "Permitir analytics",
        reject: "Agora não",
        policy: "Ler política de privacidade",
      },
      "fr-fr": {
        title: "Confidentialité, votre choix.",
        message:
          "Si vous acceptez, nous utilisons des analytics légers pour améliorer la lecture. Nous ne vendons jamais de données personnelles.",
        accept: "Autoriser les analytics",
        reject: "Pas maintenant",
        policy: "Lire la politique de confidentialité",
      },
    };
    return dict[localeKey] || dict["en-us"];
  };

  const renderConsentBanner = () => {
    if (!hasPosthog) return;
    if (readConsent()) return;
    if (document.getElementById("lcConsentBanner")) return;

    const copy = getConsentCopy(locale);
    const banner = document.createElement("aside");
    banner.id = "lcConsentBanner";
    banner.className = "lc-consent-banner";
    banner.innerHTML = `
      <div class="lc-consent-banner__text">
        <p class="lc-consent-banner__title">${copy.title}</p>
        <p class="lc-consent-banner__copy">${copy.message} <a href="${privacyPath}" class="lc-consent-banner__link">${copy.policy}</a>.</p>
      </div>
      <div class="lc-consent-banner__actions">
        <button type="button" class="lc-consent-banner__btn lc-consent-banner__btn--ghost" id="lcConsentReject">${copy.reject}</button>
        <button type="button" class="lc-consent-banner__btn lc-consent-banner__btn--primary" id="lcConsentAccept">${copy.accept}</button>
      </div>
    `;

    document.body.appendChild(banner);

    const accept = document.getElementById("lcConsentAccept");
    const reject = document.getElementById("lcConsentReject");

    accept?.addEventListener("click", () => {
      writeConsent(CONSENT_ACCEPTED);
      banner.remove();
      bootstrapPosthog();
      window.lcTrack?.("analytics_consent_accepted", { source: "banner" });
    });

    reject?.addEventListener("click", () => {
      writeConsent(CONSENT_REJECTED);
      banner.remove();
    });
  };

  const bindWelcomeClickEvents = () => {
    const gmail = document.getElementById("welcomeOpenGmail");
    const outlook = document.getElementById("welcomeOpenOutlook");
    const continueButton = document.getElementById("welcomeContinueConfirmed");

    gmail?.addEventListener("click", () => {
      window.lcTrack?.("welcome_open_mail_clicked", { provider: "gmail" });
    });

    outlook?.addEventListener("click", () => {
      window.lcTrack?.("welcome_open_mail_clicked", { provider: "outlook" });
    });

    continueButton?.addEventListener("click", () => {
      window.lcTrack?.("welcome_continue_clicked");
    });
  };

  const bindConfirmedSocialEvent = () => {
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;
      if (!target.href.includes("linkedin.com/in/leocamacho")) return;
      if (funnelStep !== "confirmed") return;
      window.lcTrack?.("confirmed_follow_linkedin_clicked");
    });
  };

  const initialize = () => {
    const consent = readConsent();
    if (consent === CONSENT_ACCEPTED) {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => bootstrapPosthog(), { timeout: 1600 });
      } else {
        window.setTimeout(() => bootstrapPosthog(), 400);
      }
    } else {
      renderConsentBanner();
    }

    bindWelcomeClickEvents();
    bindConfirmedSocialEvent();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
