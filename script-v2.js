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
    },
  };

  function getNestedValue(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value && value[key];
    }, source);
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
  }

  document.querySelectorAll("[data-language]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.dataset.language, true);
    });
  });

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  applyLanguage(getStoredLanguage(), false);
})();
