document.documentElement.classList.add("js");

(function () {
  "use strict";

  const DEFAULT_LANGUAGE = "en";
  const STORAGE_KEY = "portfolio-language";

  const translations = {
    en: {
      metadata: {
        title: "Peter Andersen \u2014 Software Developer",
        description:
          "Portfolio of Peter Andersen, a software developer focused on backend systems, integrations, and practical AI.",
      },
      skipLink: "Skip to content",
      navigation: {
        label: "Primary navigation",
        about: "About",
        skills: "Skills",
        projects: "Projects",
      },
      language: {
        label: "Language selection",
        englishButton: "View site in English",
        danishButton: "View site in Danish",
      },
      hero: {
        role:
          "Software developer focused on backend systems, integrations, and practical AI.",
        summary:
          "I build readable, testable software and turn complex technical problems into working prototypes.",
        projectsCta: "View projects",
        githubCta: "GitHub profile",
      },
      about: {
        eyebrow: "About",
        title: "About me",
        firstParagraph:
          "I recently graduated with a Professional Bachelor's degree in Software Development and have hands-on experience from two software development internships.",
        secondParagraph:
          "I enjoy research-heavy problems where unfamiliar territory must be turned into clear technical experiments. My work is grounded in readable, testable code, thoughtful system integration, clear documentation, and constructive collaboration.",
      },
      skills: {
        eyebrow: "Capabilities",
        title: "Tools I work with",
        intro:
          "A practical toolkit for building, integrating, and documenting reliable software.",
        backend: "Backend",
        web: "Web & APIs",
        data: "Data & platform",
        ai: "AI & delivery",
        llm: "LLM integrations",
        mcp: "Tool calling / MCP",
        testing: "Testing & technical documentation",
      },
      projects: {
        eyebrow: "Selected work",
        title: "Projects",
        intro: "Practical projects built to solve real problems.",
      },
      project: {
        featured: "Featured project",
        description:
          "An unofficial local Windows tool for public Holdet.dk fantasy data, combining a reusable Python library, a CLI, and a Streamlit dashboard.",
        link: "View on GitHub",
        highlights: "Highlights",
        highlightOne:
          "Explore player and team statistics across supported fantasy games.",
        highlightTwo:
          "Create group standings and reproducible knockout tournaments.",
        highlightThree: "Export data as TXT, JSON, or Markdown.",
        highlightFour:
          "Reuse local snapshots while keeping personal data on the user's computer.",
        technologiesLabel: "Project technologies",
      },
      activityExplorer: {
        description:
          "A local-first Blazor app for exploring cycling, running, and walking history from Garmin and Strava exports and individual activity files.",
        highlightOne:
          "Import Garmin and Strava account exports plus FIT, GPX, TCX, GZ, and ZIP files without API keys or credentials.",
        highlightTwo:
          "Explore searchable activities, synchronized sensor charts, records, routes, segments, and a combined world map.",
        highlightThree:
          "Deduplicate equivalent activities while preserving immutable originals and source provenance.",
        highlightFour:
          "Keep SQLite data and maps local by default, with online basemaps available only through explicit opt-in.",
      },
      pcmCdbEditor: {
        description:
          "A Windows desktop editor for Pro Cycling Manager CDB save files, combining schema-aware browsing, typed SQLite editing, and copy-first safety workflows.",
        highlightOne:
          "Open and edit isolated copies of CDB files with backup and recovery support.",
        highlightTwo:
          "Browse bounded table data with search, filters, sorting, and typed inline or full-row editing.",
        highlightThree:
          "Use disk-backed undo/redo and preview-first maintenance tools for supported schemas.",
      },
      githubActivity: {
        eyebrow: "Public work",
        title: "GitHub activity",
        description:
          "A daily snapshot of the contributions GitHub displays on my public profile.",
        profileLabel: "View @Peter537 on GitHub",
        loading: "Loading GitHub activity\u2026",
        unavailable: "GitHub activity is temporarily unavailable.",
        unavailableLink: "View @Peter537 on GitHub",
        total: "{count} contributions in the last year",
        updated: "Updated {date}",
        less: "Less",
        more: "More",
        scrollLabel:
          "GitHub contribution calendar; scroll horizontally to see all dates",
        graphSummary:
          "{count} contributions from {from} to {to}, shown across {days} days.",
        noContributions: "No contributions on {date}",
        oneContribution: "1 contribution on {date}",
        manyContributions: "{count} contributions on {date}",
      },
    },
    da: {
      metadata: {
        title: "Peter Andersen \u2014 Softwareudvikler",
        description:
          "Portfolio for Peter Andersen, softwareudvikler med fokus p\u00e5 backend-systemer, integrationer og praktisk AI.",
      },
      skipLink: "G\u00e5 til indhold",
      navigation: {
        label: "Prim\u00e6r navigation",
        about: "Om",
        skills: "Kompetencer",
        projects: "Projekter",
      },
      language: {
        label: "Sprogvalg",
        englishButton: "Vis siden p\u00e5 engelsk",
        danishButton: "Vis siden p\u00e5 dansk",
      },
      hero: {
        role:
          "Softwareudvikler med fokus p\u00e5 backend-systemer, integrationer og praktisk AI.",
        summary:
          "Jeg bygger l\u00e6sbar og testbar software og oms\u00e6tter komplekse tekniske problemer til fungerende prototyper.",
        projectsCta: "Se projekter",
        githubCta: "GitHub-profil",
      },
      about: {
        eyebrow: "Om",
        title: "Om mig",
        firstParagraph:
          "Jeg er nyuddannet professionsbachelor i softwareudvikling og har praktisk erfaring fra to praktikforl\u00f8b som softwareudvikler.",
        secondParagraph:
          "Jeg trives med researchtunge problemstillinger, hvor ukendte omr\u00e5der skal oms\u00e6ttes til tydelige tekniske eksperimenter. Mit arbejde bygger p\u00e5 l\u00e6sbar og testbar kode, gennemt\u00e6nkt systemintegration, klar dokumentation og konstruktivt samarbejde.",
      },
      skills: {
        eyebrow: "Kompetencer",
        title: "Teknologier jeg arbejder med",
        intro:
          "Et praktisk v\u00e6rkt\u00f8jss\u00e6t til at bygge, integrere og dokumentere p\u00e5lidelig software.",
        backend: "Backend",
        web: "Web og API'er",
        data: "Data og platform",
        ai: "AI og udviklingspraksis",
        llm: "LLM-integrationer",
        mcp: "Tool calling / MCP",
        testing: "Test og teknisk dokumentation",
      },
      projects: {
        eyebrow: "Udvalgt arbejde",
        title: "Projekter",
        intro: "Praktiske projekter bygget til at l\u00f8se virkelige problemer.",
      },
      project: {
        featured: "Udvalgt projekt",
        description:
          "Et uofficielt, lokalt Windows-v\u00e6rkt\u00f8j til offentlige fantasydata fra Holdet.dk, der kombinerer et genanvendeligt Python-bibliotek, en CLI og et Streamlit-dashboard.",
        link: "Se p\u00e5 GitHub",
        highlights: "H\u00f8jdepunkter",
        highlightOne:
          "Udforsk spiller- og holdstatistik p\u00e5 tv\u00e6rs af underst\u00f8ttede fantasyspil.",
        highlightTwo:
          "Opret gruppestillinger og reproducerbare knockoutturneringer.",
        highlightThree: "Eksport\u00e9r data som TXT, JSON eller Markdown.",
        highlightFour:
          "Genbrug lokale snapshots, mens personlige data forbliver p\u00e5 brugerens computer.",
        technologiesLabel: "Projektteknologier",
      },
      activityExplorer: {
        description:
          "Activity Explorer er en lokal Blazor-app til at udforske cykel-, l\u00f8be- og g\u00e5historik fra Garmin- og Strava-eksporter samt individuelle aktivitetsfiler.",
        highlightOne:
          "Import\u00e9r Garmin- og Strava-kontoeksporter samt FIT-, GPX-, TCX-, GZ- og ZIP-filer uden API-n\u00f8gler eller adgangsoplysninger.",
        highlightTwo:
          "Udforsk s\u00f8gbare aktiviteter, synkroniserede sensorgrafer, rekorder, ruter, segmenter og et samlet verdenskort.",
        highlightThree:
          "Identific\u00e9r tilsvarende aktiviteter som dubletter, mens uforanderlige originalfiler og kildehistorik bevares.",
        highlightFour:
          "Hold SQLite-data og kort lokale som standard, og aktiv\u00e9r kun online-baggrundskort gennem et udtrykkeligt tilvalg.",
      },
      pcmCdbEditor: {
        description:
          "Et Windows-desktopprogram til CDB-savefiler fra Pro Cycling Manager, der kombinerer skemabevidst navigation, typestyret SQLite-redigering og sikre arbejdsgange baseret p\u00e5 kopier.",
        highlightOne:
          "\u00c5bn og redig\u00e9r isolerede kopier af CDB-filer med underst\u00f8ttelse af backup og gendannelse.",
        highlightTwo:
          "Gennemse afgr\u00e6nsede dele af tabeller med s\u00f8gning, filtre og sortering, og redig\u00e9r data med korrekte datatyper direkte i celler eller hele r\u00e6kker.",
        highlightThree:
          "Brug diskbaseret fortryd og gentag samt vedligeholdelsesv\u00e6rkt\u00f8jer med forh\u00e5ndsvisning til underst\u00f8ttede databaseskemaer.",
      },
      githubActivity: {
        eyebrow: "Offentligt arbejde",
        title: "GitHub-aktivitet",
        description:
          "Et dagligt snapshot af de bidrag, som GitHub viser p\u00e5 min offentlige profil.",
        profileLabel: "Se @Peter537 p\u00e5 GitHub",
        loading: "Indl\u00e6ser GitHub-aktivitet\u2026",
        unavailable: "GitHub-aktivitet er midlertidigt utilg\u00e6ngelig.",
        unavailableLink: "Se @Peter537 p\u00e5 GitHub",
        total: "{count} bidrag det seneste \u00e5r",
        updated: "Opdateret {date}",
        less: "F\u00e6rre",
        more: "Flere",
        scrollLabel:
          "GitHub-bidragskalender; rul vandret for at se alle datoer",
        graphSummary:
          "{count} bidrag fra {from} til {to}, vist over {days} dage.",
        noContributions: "Ingen bidrag den {date}",
        oneContribution: "1 bidrag den {date}",
        manyContributions: "{count} bidrag den {date}",
      },
    },
  };

  let activeLanguage = DEFAULT_LANGUAGE;
  let githubActivitySnapshot = null;
  let githubActivityState = "loading";

  function getNestedValue(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value && value[key];
    }, source);
  }

  function formatMessage(message, values) {
    return Object.entries(values).reduce(function (result, entry) {
      const placeholder = "{" + entry[0] + "}";
      return result.split(placeholder).join(String(entry[1]));
    }, message);
  }

  function isPlainObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }

  function hasExactKeys(value, expectedKeys) {
    if (!isPlainObject(value)) return false;
    const actualKeys = Object.keys(value).sort();
    const sortedExpectedKeys = expectedKeys.slice().sort();
    return (
      actualKeys.length === sortedExpectedKeys.length &&
      actualKeys.every(function (key, index) {
        return key === sortedExpectedKeys[index];
      })
    );
  }

  function parseUtcDay(value) {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      throw new TypeError("Invalid date");
    }

    const date = new Date(value + "T00:00:00Z");
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new TypeError("Invalid date");
    }

    return date;
  }

  function validateGithubActivitySnapshot(snapshot) {
    if (
      !hasExactKeys(snapshot, [
        "schemaVersion",
        "username",
        "profileUrl",
        "generatedAt",
        "period",
        "totalContributions",
        "weeks",
      ]) ||
      snapshot.schemaVersion !== 1 ||
      snapshot.username !== "Peter537" ||
      snapshot.profileUrl !== "https://github.com/Peter537" ||
      !Number.isSafeInteger(snapshot.totalContributions) ||
      snapshot.totalContributions < 0 ||
      !Array.isArray(snapshot.weeks) ||
      snapshot.weeks.length < 52 ||
      snapshot.weeks.length > 54
    ) {
      throw new TypeError("Invalid GitHub activity snapshot");
    }

    const generatedAt = new Date(snapshot.generatedAt);
    if (
      typeof snapshot.generatedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(
        snapshot.generatedAt,
      ) ||
      Number.isNaN(generatedAt.getTime()) ||
      generatedAt.toISOString().slice(0, 19) !==
        snapshot.generatedAt.slice(0, 19)
    ) {
      throw new TypeError("Invalid snapshot timestamp");
    }

    if (!hasExactKeys(snapshot.period, ["from", "to"])) {
      throw new TypeError("Invalid snapshot period");
    }

    const periodFrom = parseUtcDay(snapshot.period.from);
    const periodTo = parseUtcDay(snapshot.period.to);
    if (periodFrom > periodTo) {
      throw new TypeError("Invalid snapshot period");
    }

    const seenDates = new Set();
    let previousDate = null;
    let previousWeek = null;
    let contributionTotal = 0;
    let dayTotal = 0;

    snapshot.weeks.forEach(function (week) {
      if (
        !hasExactKeys(week, ["firstDay", "days"]) ||
        !Array.isArray(week.days) ||
        week.days.length < 1 ||
        week.days.length > 7
      ) {
        throw new TypeError("Invalid contribution week");
      }

      const firstDay = parseUtcDay(week.firstDay);
      if (
        previousWeek !== null &&
        firstDay <= previousWeek
      ) {
        throw new TypeError("Invalid contribution week order");
      }
      previousWeek = firstDay;

      week.days.forEach(function (day) {
        if (
          !hasExactKeys(day, ["date", "count", "level"]) ||
          !Number.isSafeInteger(day.count) ||
          day.count < 0 ||
          !Number.isInteger(day.level) ||
          day.level < 0 ||
          day.level > 4 ||
          (day.count === 0 && day.level !== 0) ||
          (day.count > 0 && day.level === 0)
        ) {
          throw new TypeError("Invalid contribution day");
        }

        const date = parseUtcDay(day.date);
        const offsetFromWeekStart =
          (date.getTime() - firstDay.getTime()) / 86400000;
        if (
          !Number.isInteger(offsetFromWeekStart) ||
          offsetFromWeekStart < 0 ||
          offsetFromWeekStart > 6 ||
          seenDates.has(day.date) ||
          (previousDate !== null &&
            date.getTime() - previousDate.getTime() !== 86400000)
        ) {
          throw new TypeError("Invalid contribution day order");
        }

        seenDates.add(day.date);
        previousDate = date;
        contributionTotal += day.count;
        if (!Number.isSafeInteger(contributionTotal)) {
          throw new TypeError("Contribution total exceeds the safe range");
        }
        dayTotal += 1;
      });
    });

    const firstDate = snapshot.weeks[0].days[0].date;
    const lastWeek = snapshot.weeks[snapshot.weeks.length - 1];
    const lastDate = lastWeek.days[lastWeek.days.length - 1].date;
    if (
      dayTotal < 365 ||
      dayTotal > 367 ||
      firstDate !== snapshot.period.from ||
      lastDate !== snapshot.period.to ||
      contributionTotal !== snapshot.totalContributions
    ) {
      throw new TypeError("Inconsistent contribution totals or period");
    }

    return snapshot;
  }

  function getActivityLocale() {
    return activeLanguage === "da" ? "da-DK" : "en-GB";
  }

  function renderGitHubActivity() {
    const root = document.querySelector("[data-github-activity]");
    if (!root) return;

    const copy = translations[activeLanguage].githubActivity;
    const status = root.querySelector("[data-github-status]");
    const statusText = root.querySelector("[data-github-status-text]");
    const statusLink = root.querySelector("[data-github-status-link]");
    const figure = root.querySelector("[data-github-figure]");

    if (githubActivityState !== "ready" || !githubActivitySnapshot) {
      root.setAttribute(
        "aria-busy",
        String(githubActivityState === "loading"),
      );
      status.hidden = false;
      figure.hidden = true;
      statusText.textContent =
        githubActivityState === "loading" ? copy.loading : copy.unavailable;
      statusLink.hidden = githubActivityState !== "unavailable";
      return;
    }

    root.setAttribute("aria-busy", "false");
    status.hidden = true;
    figure.hidden = false;

    const locale = getActivityLocale();
    const numberFormatter = new Intl.NumberFormat(locale);
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    const monthFormatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    });
    const weekdayFormatter = new Intl.DateTimeFormat(locale, {
      weekday: "short",
      timeZone: "UTC",
    });
    const calendar = root.querySelector("[data-github-calendar]");
    const months = root.querySelector("[data-github-months]");
    const grid = root.querySelector("[data-github-grid]");
    const weekdays = root.querySelectorAll("[data-github-weekday]");
    const total = root.querySelector("[data-github-total]");
    const updated = root.querySelector("[data-github-updated]");
    const monthFragment = document.createDocumentFragment();
    const dayFragment = document.createDocumentFragment();
    let dayCount = 0;

    calendar.style.setProperty(
      "--github-week-count",
      String(githubActivitySnapshot.weeks.length),
    );

    weekdays.forEach(function (weekday) {
      const weekdayIndex = Number(weekday.dataset.githubWeekday);
      const referenceDate = new Date(Date.UTC(2024, 0, 7 + weekdayIndex));
      weekday.textContent = weekdayFormatter.format(referenceDate);
    });

    githubActivitySnapshot.weeks.forEach(function (week, weekIndex) {
      week.days.forEach(function (day) {
        const date = parseUtcDay(day.date);
        dayCount += 1;

        if (date.getUTCDate() === 1) {
          const month = document.createElement("span");
          month.className = "github-calendar-month";
          month.style.gridColumn = String(weekIndex + 1);
          month.textContent = monthFormatter.format(date);
          monthFragment.appendChild(month);
        }

        const cell = document.createElement("span");
        const formattedDate = dateFormatter.format(date);
        const formattedCount = numberFormatter.format(day.count);
        let tooltip = copy.manyContributions;
        if (day.count === 0) tooltip = copy.noContributions;
        if (day.count === 1) tooltip = copy.oneContribution;

        cell.className = "github-day";
        cell.dataset.level = String(day.level);
        cell.style.gridColumn = String(weekIndex + 1);
        cell.style.gridRow = String(date.getUTCDay() + 1);
        cell.title = formatMessage(tooltip, {
          count: formattedCount,
          date: formattedDate,
        });
        dayFragment.appendChild(cell);
      });
    });

    months.replaceChildren(monthFragment);
    grid.replaceChildren(dayFragment);

    const formattedTotal = numberFormatter.format(
      githubActivitySnapshot.totalContributions,
    );
    const formattedFrom = dateFormatter.format(
      parseUtcDay(githubActivitySnapshot.period.from),
    );
    const formattedTo = dateFormatter.format(
      parseUtcDay(githubActivitySnapshot.period.to),
    );
    const formattedGeneratedAt = dateFormatter.format(
      new Date(githubActivitySnapshot.generatedAt),
    );

    total.textContent = formatMessage(copy.total, {
      count: formattedTotal,
    });
    updated.textContent = formatMessage(copy.updated, {
      date: formattedGeneratedAt,
    });
    calendar.setAttribute(
      "aria-label",
      formatMessage(copy.graphSummary, {
        count: formattedTotal,
        from: formattedFrom,
        to: formattedTo,
        days: numberFormatter.format(dayCount),
      }),
    );
  }

  async function loadGitHubActivity() {
    try {
      const response = await fetch("./github-activity.json", {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Snapshot request failed");

      githubActivitySnapshot = validateGithubActivitySnapshot(
        await response.json(),
      );
      githubActivityState = "ready";
    } catch (_error) {
      githubActivitySnapshot = null;
      githubActivityState = "unavailable";
    }

    renderGitHubActivity();
  }

  function isSupportedLanguage(language) {
    return typeof language === "string" && Object.hasOwn(translations, language);
  }

  function getStoredLanguage() {
    try {
      const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
      return isSupportedLanguage(storedLanguage)
        ? storedLanguage
        : DEFAULT_LANGUAGE;
    } catch (_error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (_error) {
      // The selected language still applies for this page view when storage is unavailable.
    }
  }

  function applyLanguage(language, persist) {
    const selectedLanguage = isSupportedLanguage(language)
      ? language
      : DEFAULT_LANGUAGE;
    const copy = translations[selectedLanguage];
    activeLanguage = selectedLanguage;

    document.documentElement.lang = selectedLanguage;
    document.title = copy.metadata.title;

    const description = document.querySelector('meta[name="description"]');
    const openGraphTitle = document.querySelector('meta[property="og:title"]');
    const openGraphDescription = document.querySelector(
      'meta[property="og:description"]',
    );

    if (description) description.content = copy.metadata.description;
    if (openGraphTitle) openGraphTitle.content = copy.metadata.title;
    if (openGraphDescription) {
      openGraphDescription.content = copy.metadata.description;
    }

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const translatedText = getNestedValue(copy, element.dataset.i18n);
      if (typeof translatedText === "string") {
        element.textContent = translatedText;
      }
    });

    document
      .querySelectorAll("[data-i18n-aria-label]")
      .forEach(function (element) {
        const translatedLabel = getNestedValue(
          copy,
          element.dataset.i18nAriaLabel,
        );
        if (typeof translatedLabel === "string") {
          element.setAttribute("aria-label", translatedLabel);
        }
      });

    document.querySelectorAll("[data-language]").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === selectedLanguage),
      );
    });

    if (persist) storeLanguage(selectedLanguage);
    renderGitHubActivity();
  }

  document.querySelectorAll("[data-language]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.dataset.language, true);
    });
  });

  const githubActivityScroll = document.querySelector("[data-github-scroll]");
  if (githubActivityScroll) {
    githubActivityScroll.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      githubActivityScroll.scrollLeft += event.key === "ArrowLeft" ? -48 : 48;
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  applyLanguage(getStoredLanguage(), false);
  void loadGitHubActivity();
})();
