"use strict";

const CONFIG_PATH = "data/config.json";
const LOCAL_DRAFT_KEY = "abdulRafehPortfolioDraft_v2";

let siteData = null;
let activeFilter = "all";

const defaultConfig = {
  nav: {
    home: "Home",
    work: "Work",
    about: "About",
    contact: "Contact"
  },
  site: {
    name: "Abdul Rafeh",
    tagline: "3D Environment Artist",
    heroTitle: "Abdul<br><em>Rafeh</em>",
    heroSubtitle:
      "Crafting worlds that blur the line between the real and imagined — from cinematic interiors to sweeping sci-fi landscapes.",
    heroAlign: "center",
    heroVideo: "assets/videos/hero.mp4",
    scrollHint: "Scroll to explore",
    heroButtons: [
      {
        text: "View Work ↓",
        link: "#portfolio",
        accent: true
      },
      {
        text: "Get in Touch",
        link: "#contact",
        accent: false
      }
    ],
    email: "hello@abdulrafeh.com"
  },
  work: {
    label: "Selected Work",
    title: "Environments",
    filters: ["cinematic", "sci-fi", "fantasy", "architectural"]
  },
  about: {
    label: "The Artist",
    title: "Worlds Built<br>by Hand",
    p1:
      "<strong>Abdul Rafeh</strong> is a 3D environment artist with a passion for building believable, atmospheric worlds that tell stories without words.",
    p2:
      "Working across cinematic, sci-fi, fantasy, and architectural genres — with a speciality in mood, lighting, and immersive detail.",
    p3:
      "Available for freelance collaborations, game production pipelines, film pre-vis, and personal commissions."
  },
  contact: {
    label: "Let's Build Something",
    title: "Ready to<br>Collaborate?",
    copy:
      "Whether it's a game world, a cinematic set, or something entirely new — I'd love to hear about it.",
    buttonText: "Send a Message"
  },
  footer: {
    left: "© {year} Abdul Rafeh. All rights reserved.",
    right: "3D Environment Artist"
  },
  layout: {
    showWork: true,
    showAbout: true,
    showContact: true
  },
  colors: {
    accent: "#8ecfb0",
    accent2: "#c49a6c",
    accent3: "#7bafd4"
  },
  stats: [
    {
      number: "24+",
      label: "Environments Created"
    },
    {
      number: "5+",
      label: "Years of Experience"
    },
    {
      number: "18+",
      label: "Clients & Collaborators"
    }
  ],
  skills: [
    "Unreal Engine 5",
    "Blender",
    "ZBrush",
    "Substance Painter",
    "Lighting",
    "Environment Art"
  ],
  socials: {
    artstation: "#",
    youtube: "#",
    instagram: "#"
  },
  customCSS: "",
  projects: []
};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  siteData = await loadSiteData();

  applyEverything();
  setupAdminPanel();
  setupModal();
  setupRevealAnimations();
  setupNavigationHighlight();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
    }
  });
}

async function loadSiteData() {
  let configFromFile = null;

  try {
    const response = await fetch(CONFIG_PATH, {
      cache: "no-store"
    });

    if (response.ok) {
      configFromFile = await response.json();
    }
  } catch (error) {
    console.warn("Could not load config.json. Using default config.", error);
  }

  const baseConfig = normalizeConfig(configFromFile || defaultConfig);
  const localDraft = getLocalDraft();

  return localDraft ? normalizeConfig(localDraft) : baseConfig;
}

function normalizeConfig(input) {
  const data = deepClone(defaultConfig);

  if (!input || typeof input !== "object") return data;

  data.nav = {
    ...data.nav,
    ...(input.nav || {})
  };

  data.site = {
    ...data.site,
    ...(input.site || {})
  };

  data.work = {
    ...data.work,
    ...(input.work || {})
  };

  data.about = {
    ...data.about,
    ...(input.about || {})
  };

  data.contact = {
    ...data.contact,
    ...(input.contact || {})
  };

  data.footer = {
    ...data.footer,
    ...(input.footer || {})
  };

  data.layout = {
    ...data.layout,
    ...(input.layout || {})
  };

  data.colors = {
    ...data.colors,
    ...(input.colors || {})
  };

  data.socials = {
    ...data.socials,
    ...(input.socials || {})
  };

  data.customCSS = typeof input.customCSS === "string" ? input.customCSS : "";

  data.stats = Array.isArray(input.stats) ? input.stats : data.stats;
  data.skills = Array.isArray(input.skills) ? input.skills : data.skills;
  data.projects = Array.isArray(input.projects) ? input.projects : data.projects;

  data.site.heroAlign = ["left", "center", "right"].includes(data.site.heroAlign)
    ? data.site.heroAlign
    : "center";

  data.site.heroButtons = normalizeHeroButtons(data.site.heroButtons);
  data.work.filters = normalizeFilters(data.work.filters);
  data.projects = data.projects.map((project, index) => normalizeProject(project, index));

  return data;
}

function normalizeHeroButtons(buttons) {
  if (!Array.isArray(buttons)) return defaultConfig.site.heroButtons;

  const normalized = buttons.slice(0, 2).map((button, index) => ({
    text: button.text || defaultConfig.site.heroButtons[index]?.text || "Button",
    link: button.link || defaultConfig.site.heroButtons[index]?.link || "#",
    accent:
      typeof button.accent === "boolean"
        ? button.accent
        : Boolean(defaultConfig.site.heroButtons[index]?.accent)
  }));

  while (normalized.length < 2) {
    normalized.push(defaultConfig.site.heroButtons[normalized.length]);
  }

  return normalized;
}

function normalizeFilters(filters) {
  if (!Array.isArray(filters)) return defaultConfig.work.filters;

  return filters
    .map((filter) => String(filter).trim().toLowerCase())
    .filter(Boolean);
}

function normalizeProject(project, index) {
  const title = project.title || `Project ${index + 1}`;
  const image = typeof project.image === "string" ? project.image.trim() : "";

  const gallery = Array.isArray(project.gallery)
    ? project.gallery
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  if (image && !gallery.includes(image)) {
    gallery.unshift(image);
  }

  return {
    id: project.id || createUniqueProjectId(title),
    title,
    software: project.software || "Blender",
    category: project.category || "cinematic",
    year: project.year || new Date().getFullYear(),
    description: project.description || "",
    responsibilities:
      project.responsibilities ||
      "Environment Art, Modeling, Texturing, Lighting, Rendering, Composition",
    breakdown: project.breakdown || "",
    image,
    gallery,
    height: Number(project.height || 300)
  };
}

function applyEverything() {
  applyColors();
  applyCustomCSS();
  applyVisibility();
  applyNavigation();
  applyHero();
  applyWorkIntro();
  renderFilters();
  renderProjects();
  applyAbout();
  renderSkills();
  applyStats();
  applyContact();
  applyFooter();
  fillEditorFields();
}

function applyColors() {
  document.documentElement.style.setProperty("--accent", siteData.colors.accent);
  document.documentElement.style.setProperty("--accent2", siteData.colors.accent2);
  document.documentElement.style.setProperty("--accent3", siteData.colors.accent3);
}

function applyCustomCSS() {
  let styleTag = document.getElementById("customCssFromEditor");

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "customCssFromEditor";
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = siteData.customCSS || "";
}

function applyVisibility() {
  setSectionVisibility("portfolio", siteData.layout.showWork);
  setSectionVisibility("about", siteData.layout.showAbout);
  setSectionVisibility("contact", siteData.layout.showContact);
}

function setSectionVisibility(id, visible) {
  const section = document.getElementById(id);
  if (!section) return;

  section.style.display = visible ? "" : "none";
}

function applyNavigation() {
  const links = document.querySelectorAll("#mainNav a");

  const navItems = [
    {
      text: siteData.nav.home,
      href: "#hero",
      visible: true
    },
    {
      text: siteData.nav.work,
      href: "#portfolio",
      visible: siteData.layout.showWork
    },
    {
      text: siteData.nav.about,
      href: "#about",
      visible: siteData.layout.showAbout
    },
    {
      text: siteData.nav.contact,
      href: "#contact",
      visible: siteData.layout.showContact
    }
  ];

  links.forEach((link, index) => {
    const item = navItems[index];
    if (!item) return;

    link.textContent = item.text;
    link.href = item.href;
    link.style.display = item.visible ? "" : "none";
  });
}

function applyHero() {
  const hero = document.getElementById("hero");
  const heroEyebrow = document.getElementById("heroEyebrow");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const heroButtons = document.querySelectorAll(".hero-btns a");
  const scrollHint = document.querySelector(".hero-scroll-hint span:last-child");

  if (hero) {
    hero.classList.remove("hero-left", "hero-center", "hero-right");
    hero.classList.add(`hero-${siteData.site.heroAlign}`);
  }

  if (heroEyebrow) heroEyebrow.textContent = siteData.site.tagline;
  if (heroTitle) heroTitle.innerHTML = sanitizeInlineHTML(siteData.site.heroTitle);
  if (heroSubtitle) heroSubtitle.textContent = siteData.site.heroSubtitle;
  if (scrollHint) scrollHint.textContent = siteData.site.scrollHint;

  heroButtons.forEach((button, index) => {
    const buttonData = siteData.site.heroButtons[index];
    if (!buttonData) return;

    button.textContent = buttonData.text;
    button.href = buttonData.link;
    button.classList.toggle("accent-btn", Boolean(buttonData.accent));
  });

  setupHeroVideo(siteData.site.heroVideo);
}

function setupHeroVideo(videoPath) {
  const wrap = document.getElementById("heroVideoWrap");
  const video = document.getElementById("heroVideo");
  const source = document.getElementById("heroVideoSource");

  if (!wrap || !video || !source) return;

  if (!videoPath || !videoPath.trim()) {
    wrap.style.display = "none";
    source.removeAttribute("src");
    video.load();
    return;
  }

  source.src = videoPath.trim();
  video.load();

  video.addEventListener(
    "canplay",
    () => {
      wrap.style.display = "block";
    },
    {
      once: true
    }
  );

  video.addEventListener(
    "error",
    () => {
      wrap.style.display = "none";
      showToast("Hero video path not found.");
    },
    {
      once: true
    }
  );
}

function applyWorkIntro() {
  setTextSelector("#portfolio .section-label", siteData.work.label);
  setHTMLSelector("#portfolio .section-title", sanitizeInlineHTML(siteData.work.title));
}

function renderFilters() {
  const filterBar = document.getElementById("filterBar");
  if (!filterBar) return;

  const categories = getAllCategories();

  filterBar.innerHTML = "";

  const allButton = createFilterButton("all", "All");
  filterBar.appendChild(allButton);

  categories.forEach((category) => {
    filterBar.appendChild(createFilterButton(category, formatCategory(category)));
  });
}

function createFilterButton(filter, label) {
  const button = document.createElement("button");
  button.className = "filter-btn";
  button.type = "button";
  button.dataset.filter = filter;
  button.textContent = label;

  if (activeFilter === filter) {
    button.classList.add("active");
  }

  button.addEventListener("click", () => {
    activeFilter = filter;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === activeFilter);
    });

    renderProjects();
  });

  return button;
}

function getAllCategories() {
  const categorySet = new Set(siteData.work.filters);

  siteData.projects.forEach((project) => {
    if (project.category) categorySet.add(project.category);
  });

  return [...categorySet].filter(Boolean);
}

function renderProjects() {
  const grid = document.getElementById("masonryGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const projects =
    activeFilter === "all"
      ? siteData.projects
      : siteData.projects.filter((project) => project.category === activeFilter);

  if (!projects.length) {
    grid.innerHTML = `
      <div class="portfolio-empty">
        No projects here yet. Add one from the ✦ editor.
      </div>
    `;
    renderProjectList();
    return;
  }

  projects.forEach((project) => {
    const item = document.createElement("article");
    item.className = "portfolio-item";
    item.dataset.category = project.category;

    item.innerHTML = `
      <div class="portfolio-img-wrap" style="height: ${Number(project.height) || 300}px;">
        ${
          project.image
            ? `<img src="${escapeAttribute(project.image)}" alt="${escapeHTML(project.title)}" loading="lazy">`
            : `<div class="portfolio-placeholder">Image missing</div>`
        }

        <div class="portfolio-overlay">
          <button class="overlay-view-btn" type="button">View Project</button>
        </div>
      </div>

      <div class="portfolio-info">
        <h3 class="portfolio-title">${escapeHTML(project.title)}</h3>

        <div class="portfolio-meta">
          <span class="meta-tag">${escapeHTML(formatCategory(project.category))}</span>
          <span class="meta-year">${escapeHTML(String(project.year))}</span>
        </div>

        <p class="portfolio-desc">${escapeHTML(project.description)}</p>
      </div>
    `;

    const button = item.querySelector(".overlay-view-btn");
    button.addEventListener("click", () => openProjectModal(project));

    grid.appendChild(item);
  });

  renderProjectList();
}

function openProjectModal(project) {
  const modalOverlay = document.getElementById("modalOverlay");
  const imgWrap = document.getElementById("modalImgWrap");
  const modalMeta = document.getElementById("modalMeta");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalBreakdown = document.getElementById("modalBreakdown");

  if (!modalOverlay || !imgWrap || !modalMeta || !modalTitle || !modalDesc || !modalBreakdown) {
    return;
  }

  const gallery = project.gallery.length ? project.gallery : project.image ? [project.image] : [];
  const firstImage = gallery[0] || "";

  imgWrap.innerHTML = `
    <div class="modal-hero">
      ${
        firstImage
          ? `<img class="modal-img" id="modalMainImage" src="${escapeAttribute(firstImage)}" alt="${escapeHTML(project.title)}">`
          : `<div class="modal-placeholder">Image missing</div>`
      }
    </div>

    ${
      gallery.length > 1
        ? `<div class="modal-gallery">
            ${gallery
              .map(
                (image, index) => `
                  <button class="modal-thumb-button" type="button" data-image="${escapeAttribute(image)}">
                    <img
                      class="modal-thumb ${index === 0 ? "active" : ""}"
                      src="${escapeAttribute(image)}"
                      alt="${escapeHTML(project.title)} thumbnail ${index + 1}"
                    >
                  </button>
                `
              )
              .join("")}
          </div>`
        : ""
    }
  `;

  const mainImage = document.getElementById("modalMainImage");

  document.querySelectorAll(".modal-thumb-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (mainImage && button.dataset.image) {
        mainImage.src = button.dataset.image;
      }

      document.querySelectorAll(".modal-thumb").forEach((thumb) => {
        thumb.classList.remove("active");
      });

      const thumb = button.querySelector(".modal-thumb");
      if (thumb) thumb.classList.add("active");
    });
  });

  modalMeta.innerHTML = `
    <span class="modal-tag">${escapeHTML(formatCategory(project.category))}</span>
    <span class="modal-tag">${escapeHTML(String(project.year))}</span>
  `;

  modalTitle.textContent = project.title;
  modalDesc.textContent = project.description;

  setText("modalSoftware", project.software);
  setText("modalCategory", formatCategory(project.category));
  setText("modalYear", String(project.year));
  setText("modalResponsibilities", project.responsibilities);

  if (project.breakdown) {
    modalBreakdown.style.display = "block";
    modalBreakdown.textContent = project.breakdown;
  } else {
    modalBreakdown.style.display = "none";
    modalBreakdown.textContent = "";
  }

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  if (!modalOverlay) return;

  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function setupModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) {
        closeProjectModal();
      }
    });
  }
}

function applyAbout() {
  setTextSelector("#about .section-label", siteData.about.label);
  setHTML("aboutTitle", sanitizeInlineHTML(siteData.about.title));
  setHTML("aboutP1", sanitizeBasicHTML(siteData.about.p1));
  setText("aboutP2", siteData.about.p2);
  setText("aboutP3", siteData.about.p3);
}

function renderSkills() {
  const skillsGrid = document.getElementById("skillsGrid");
  if (!skillsGrid) return;

  skillsGrid.innerHTML = "";

  siteData.skills.forEach((skill) => {
    const chip = document.createElement("div");
    chip.className = "skill-chip";
    chip.textContent = skill;
    skillsGrid.appendChild(chip);
  });
}

function applyStats() {
  const stat1 = siteData.stats[0] || defaultConfig.stats[0];
  const stat2 = siteData.stats[1] || defaultConfig.stats[1];
  const stat3 = siteData.stats[2] || defaultConfig.stats[2];

  setText("statProjects", stat1.number);
  setText("statProjectsLabel", stat1.label);

  setText("statYears", stat2.number);
  setText("statYearsLabel", stat2.label);

  setText("statClients", stat3.number);
  setText("statClientsLabel", stat3.label);
}

function applyContact() {
  setTextSelector("#contact .section-label", siteData.contact.label);
  setHTMLSelector("#contact .section-title", sanitizeInlineHTML(siteData.contact.title));
  setTextSelector("#contact .contact-copy", siteData.contact.copy);

  const contactEmail = document.getElementById("contactEmail");
  const contactButton = document.getElementById("contactButton");

  if (contactEmail) {
    contactEmail.textContent = siteData.site.email;
    contactEmail.href = `mailto:${siteData.site.email}`;
  }

  if (contactButton) {
    contactButton.textContent = siteData.contact.buttonText;
    contactButton.href = `mailto:${siteData.site.email}`;
  }

  setupSocialLink("socialArtstation", siteData.socials.artstation);
  setupSocialLink("socialYoutube", siteData.socials.youtube);
  setupSocialLink("socialInstagram", siteData.socials.instagram);
}

function setupSocialLink(id, url) {
  const link = document.getElementById(id);
  if (!link) return;

  link.href = url || "#";

  if (url && url !== "#") {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
}

function applyFooter() {
  const footerItems = document.querySelectorAll("footer p");
  const year = new Date().getFullYear();

  if (footerItems[0]) {
    footerItems[0].textContent = siteData.footer.left.replace("{year}", year);
  }

  if (footerItems[1]) {
    footerItems[1].textContent = siteData.footer.right;
  }
}

function setupAdminPanel() {
  const toggle = document.getElementById("admin-toggle");
  const panel = document.getElementById("admin-panel");
  const close = document.getElementById("adminClose");

  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      panel.classList.toggle("open");
      fillEditorFields();
    });
  }

  if (close && panel) {
    close.addEventListener("click", () => {
      panel.classList.remove("open");
    });
  }

  setupAdminTabs();
  setupAdminActions();
}

function setupAdminTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = document.querySelectorAll(".admin-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((item) => item.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      tab.classList.add("active");

      const section = document.getElementById(`tab-${target}`);
      if (section) section.classList.add("active");
    });
  });
}

function setupAdminActions() {
  bindClick("saveHomeBtn", saveHomeFromEditor);
  bindClick("saveWorkIntroBtn", saveWorkIntroFromEditor);
  bindClick("saveProjectBtn", saveProjectFromEditor);
  bindClick("cancelProjectEditBtn", cancelProjectEditing);
  bindClick("saveAboutBtn", saveAboutFromEditor);
  bindClick("saveContactBtn", saveContactFromEditor);
  bindClick("saveStyleBtn", saveStyleFromEditor);
  bindClick("exportConfigBtn", exportConfig);
  bindClick("resetDraftBtn", resetLocalDraft);
}

function fillEditorFields() {
  if (!siteData) return;

  setInputValue("navHome", siteData.nav.home);
  setInputValue("navWork", siteData.nav.work);
  setInputValue("navAbout", siteData.nav.about);
  setInputValue("navContact", siteData.nav.contact);

  setInputValue("cfgHeroAlign", siteData.site.heroAlign);
  setInputValue("cfgTagline", siteData.site.tagline);
  setInputValue("cfgHeroTitle", siteData.site.heroTitle);
  setInputValue("cfgHeroSub", siteData.site.heroSubtitle);
  setInputValue("cfgHeroVideo", siteData.site.heroVideo);
  setInputValue("cfgHeroBtn1Text", siteData.site.heroButtons[0]?.text || "");
  setInputValue("cfgHeroBtn1Link", siteData.site.heroButtons[0]?.link || "");
  setInputValue("cfgHeroBtn2Text", siteData.site.heroButtons[1]?.text || "");
  setInputValue("cfgHeroBtn2Link", siteData.site.heroButtons[1]?.link || "");
  setInputValue("cfgScrollHint", siteData.site.scrollHint);

  setInputValue("cfgWorkLabel", siteData.work.label);
  setInputValue("cfgWorkTitle", siteData.work.title);
  setInputValue("cfgWorkFilters", siteData.work.filters.join(", "));

  setInputValue("cfgAboutLabel", siteData.about.label);
  setInputValue("cfgAboutTitle", siteData.about.title);
  setInputValue("cfgAboutP1", stripHTMLForTextarea(siteData.about.p1));
  setInputValue("cfgAboutP2", siteData.about.p2);
  setInputValue("cfgAboutP3", siteData.about.p3);
  setInputValue("cfgSkills", siteData.skills.join(", "));

  setInputValue("cfgStat1Number", siteData.stats[0]?.number || "");
  setInputValue("cfgStat1Label", siteData.stats[0]?.label || "");
  setInputValue("cfgStat2Number", siteData.stats[1]?.number || "");
  setInputValue("cfgStat2Label", siteData.stats[1]?.label || "");
  setInputValue("cfgStat3Number", siteData.stats[2]?.number || "");
  setInputValue("cfgStat3Label", siteData.stats[2]?.label || "");

  setInputValue("cfgContactLabel", siteData.contact.label);
  setInputValue("cfgContactTitle", siteData.contact.title);
  setInputValue("cfgContactCopy", siteData.contact.copy);
  setInputValue("cfgEmail", siteData.site.email);
  setInputValue("cfgContactButtonText", siteData.contact.buttonText);
  setInputValue("cfgArtstation", siteData.socials.artstation);
  setInputValue("cfgYoutube", siteData.socials.youtube);
  setInputValue("cfgInstagram", siteData.socials.instagram);

  setInputValue("cfgFooterLeft", siteData.footer.left);
  setInputValue("cfgFooterRight", siteData.footer.right);

  setInputValue("colAccent", siteData.colors.accent);
  setInputValue("colAccent2", siteData.colors.accent2);
  setInputValue("colAccent3", siteData.colors.accent3);
  setCheckboxValue("showWork", siteData.layout.showWork);
  setCheckboxValue("showAbout", siteData.layout.showAbout);
  setCheckboxValue("showContact", siteData.layout.showContact);
  setInputValue("cfgCustomCSS", siteData.customCSS);

  renderProjectList();
}

function saveHomeFromEditor() {
  siteData.nav.home = getInputValue("navHome") || "Home";
  siteData.nav.work = getInputValue("navWork") || "Work";
  siteData.nav.about = getInputValue("navAbout") || "About";
  siteData.nav.contact = getInputValue("navContact") || "Contact";

  siteData.site.heroAlign = getInputValue("cfgHeroAlign") || "center";
  siteData.site.tagline = getInputValue("cfgTagline");
  siteData.site.heroTitle = getInputValue("cfgHeroTitle");
  siteData.site.heroSubtitle = getInputValue("cfgHeroSub");
  siteData.site.heroVideo = getInputValue("cfgHeroVideo");
  siteData.site.scrollHint = getInputValue("cfgScrollHint");

  siteData.site.heroButtons = [
    {
      text: getInputValue("cfgHeroBtn1Text"),
      link: getInputValue("cfgHeroBtn1Link"),
      accent: true
    },
    {
      text: getInputValue("cfgHeroBtn2Text"),
      link: getInputValue("cfgHeroBtn2Link"),
      accent: false
    }
  ];

  saveAndRefresh("Home saved.");
}

function saveWorkIntroFromEditor() {
  siteData.work.label = getInputValue("cfgWorkLabel");
  siteData.work.title = getInputValue("cfgWorkTitle");
  siteData.work.filters = parseCommaList(getInputValue("cfgWorkFilters")).map((item) =>
    item.toLowerCase()
  );

  if (!siteData.work.filters.length) {
    siteData.work.filters = defaultConfig.work.filters;
  }

  activeFilter = "all";

  saveAndRefresh("Work section saved.");
}

function saveProjectFromEditor() {
  const editingProjectId = getInputValue("editingProjectId");

  const title = getInputValue("inTitle");
  const software = getInputValue("inSoftware");
  const image = getInputValue("inImage");

  if (!title || !software) {
    showToast("Title and software are required.");
    return;
  }

  if (!image) {
    showToast("Image path is required.");
    return;
  }

  const gallery = parseLines(getInputValue("inGallery"));

  if (!gallery.includes(image)) {
    gallery.unshift(image);
  }

  const projectData = normalizeProject(
    {
      id: editingProjectId || createUniqueProjectId(title),
      title,
      software,
      category: getInputValue("inCategory") || "cinematic",
      year: Number(getInputValue("inYear")) || new Date().getFullYear(),
      image,
      gallery,
      description: getInputValue("inDesc"),
      responsibilities: getInputValue("inResponsibilities"),
      breakdown: getInputValue("inBreakdown"),
      height: Number(getInputValue("inHeight")) || 300
    },
    siteData.projects.length
  );

  if (editingProjectId) {
    const index = siteData.projects.findIndex((project) => project.id === editingProjectId);

    if (index !== -1) {
      siteData.projects[index] = projectData;
    }

    showToast("Project updated.");
  } else {
    siteData.projects.unshift(projectData);
    showToast("Project added.");
  }

  cancelProjectEditing();
  saveAndRefresh("Project saved.");
}

function saveAboutFromEditor() {
  siteData.about.label = getInputValue("cfgAboutLabel");
  siteData.about.title = getInputValue("cfgAboutTitle");
  siteData.about.p1 = getInputValue("cfgAboutP1");
  siteData.about.p2 = getInputValue("cfgAboutP2");
  siteData.about.p3 = getInputValue("cfgAboutP3");

  siteData.skills = parseCommaList(getInputValue("cfgSkills"));

  siteData.stats = [
    {
      number: getInputValue("cfgStat1Number"),
      label: getInputValue("cfgStat1Label")
    },
    {
      number: getInputValue("cfgStat2Number"),
      label: getInputValue("cfgStat2Label")
    },
    {
      number: getInputValue("cfgStat3Number"),
      label: getInputValue("cfgStat3Label")
    }
  ];

  saveAndRefresh("About saved.");
}

function saveContactFromEditor() {
  siteData.contact.label = getInputValue("cfgContactLabel");
  siteData.contact.title = getInputValue("cfgContactTitle");
  siteData.contact.copy = getInputValue("cfgContactCopy");
  siteData.contact.buttonText = getInputValue("cfgContactButtonText");

  siteData.site.email = getInputValue("cfgEmail");

  siteData.socials.artstation = getInputValue("cfgArtstation") || "#";
  siteData.socials.youtube = getInputValue("cfgYoutube") || "#";
  siteData.socials.instagram = getInputValue("cfgInstagram") || "#";

  siteData.footer.left = getInputValue("cfgFooterLeft");
  siteData.footer.right = getInputValue("cfgFooterRight");

  saveAndRefresh("Contact saved.");
}

function saveStyleFromEditor() {
  siteData.colors.accent = getInputValue("colAccent") || "#8ecfb0";
  siteData.colors.accent2 = getInputValue("colAccent2") || "#c49a6c";
  siteData.colors.accent3 = getInputValue("colAccent3") || "#7bafd4";

  siteData.layout.showWork = getCheckboxValue("showWork");
  siteData.layout.showAbout = getCheckboxValue("showAbout");
  siteData.layout.showContact = getCheckboxValue("showContact");

  siteData.customCSS = getInputValue("cfgCustomCSS");

  saveAndRefresh("Style saved.");
}

function saveAndRefresh(message) {
  siteData = normalizeConfig(siteData);
  saveLocalDraft();
  applyEverything();
  showToast(message);
}

function renderProjectList() {
  const list = document.getElementById("projectList");
  if (!list || !siteData) return;

  list.innerHTML = "";

  if (!siteData.projects.length) {
    list.innerHTML = `<p class="admin-hint">No projects yet.</p>`;
    return;
  }

  siteData.projects.forEach((project, index) => {
    const item = document.createElement("div");
    item.className = "project-list-item";

    item.innerHTML = `
      ${
        project.image
          ? `<img class="project-list-thumb" src="${escapeAttribute(project.image)}" alt="">`
          : `<div class="project-list-thumb">?</div>`
      }

      <div class="project-list-info">
        <div class="project-list-title">${escapeHTML(project.title)}</div>
        <div class="project-list-sub">${escapeHTML(formatCategory(project.category))} · ${escapeHTML(String(project.year))}</div>
      </div>

      <button class="icon-btn" type="button" title="Edit" data-action="edit">✎</button>
      <button class="icon-btn" type="button" title="Move up" data-action="up">↑</button>
      <button class="icon-btn" type="button" title="Move down" data-action="down">↓</button>
      <button class="icon-btn" type="button" title="Delete" data-action="delete">✕</button>
    `;

    item.querySelector('[data-action="edit"]').addEventListener("click", () => {
      startProjectEditing(project.id);
    });

    item.querySelector('[data-action="up"]').addEventListener("click", () => {
      moveProject(index, -1);
    });

    item.querySelector('[data-action="down"]').addEventListener("click", () => {
      moveProject(index, 1);
    });

    item.querySelector('[data-action="delete"]').addEventListener("click", () => {
      deleteProject(index);
    });

    list.appendChild(item);
  });
}

function startProjectEditing(projectId) {
  const project = siteData.projects.find((item) => item.id === projectId);
  if (!project) return;

  setInputValue("editingProjectId", project.id);
  setInputValue("inTitle", project.title);
  setInputValue("inSoftware", project.software);
  setInputValue("inCategory", project.category);
  setInputValue("inYear", project.year);
  setInputValue("inImage", project.image);
  setInputValue("inGallery", project.gallery.join("\n"));
  setInputValue("inDesc", project.description);
  setInputValue("inResponsibilities", project.responsibilities);
  setInputValue("inBreakdown", project.breakdown);
  setInputValue("inHeight", project.height);

  setText("projectEditorTitle", `Editing: ${project.title}`);
  setText("saveProjectBtn", "Save Project");
  setHidden("cancelProjectEditBtn", false);

  switchAdminTab("work");
}

function cancelProjectEditing() {
  setInputValue("editingProjectId", "");
  setInputValue("inTitle", "");
  setInputValue("inSoftware", "");
  setInputValue("inCategory", "");
  setInputValue("inYear", "");
  setInputValue("inImage", "");
  setInputValue("inGallery", "");
  setInputValue("inDesc", "");
  setInputValue("inResponsibilities", "");
  setInputValue("inBreakdown", "");
  setInputValue("inHeight", "300");

  setText("projectEditorTitle", "Add / Edit Project");
  setText("saveProjectBtn", "Add Project");
  setHidden("cancelProjectEditBtn", true);
}

function moveProject(index, direction) {
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= siteData.projects.length) return;

  const [project] = siteData.projects.splice(index, 1);
  siteData.projects.splice(newIndex, 0, project);

  saveAndRefresh("Project order updated.");
}

function deleteProject(index) {
  const project = siteData.projects[index];
  const confirmed = window.confirm(`Delete "${project.title}"?`);

  if (!confirmed) return;

  siteData.projects.splice(index, 1);
  saveAndRefresh("Project deleted.");
}

function saveLocalDraft() {
  localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(siteData));
}

function getLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resetLocalDraft() {
  const confirmed = window.confirm("Reset all local editor changes and reload from config.json?");
  if (!confirmed) return;

  localStorage.removeItem(LOCAL_DRAFT_KEY);
  window.location.reload();
}

function exportConfig() {
  const cleanData = normalizeConfig(siteData);
  const json = JSON.stringify(cleanData, null, 2);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "config.json";
  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);

  showToast("Downloaded config.json.");
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupNavigationHighlight() {
  const navLinks = document.querySelectorAll("#mainNav a");
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    {
      threshold: 0.35
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function switchAdminTab(tabName) {
  const tab = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
  if (tab) tab.click();
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener("click", handler);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function setHTML(id, value) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = value || "";
}

function setTextSelector(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setHTMLSelector(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = value || "";
}

function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value ?? "";
}

function getCheckboxValue(id) {
  const input = document.getElementById(id);
  return input ? input.checked : false;
}

function setCheckboxValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.checked = Boolean(value);
}

function setHidden(id, hidden) {
  const element = document.getElementById(id);
  if (element) element.hidden = hidden;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeoutId);

  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function parseCommaList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLines(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createUniqueProjectId(title) {
  const base = createSlug(title);
  let id = base;
  let count = 2;

  while (siteData?.projects?.some((project) => project.id === id)) {
    id = `${base}-${count}`;
    count += 1;
  }

  return id;
}

function createSlug(value) {
  return String(value || "project")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatCategory(category) {
  const labels = {
    cinematic: "Cinematic",
    "sci-fi": "Sci-Fi",
    fantasy: "Fantasy",
    architectural: "Architectural"
  };

  return labels[category] || category;
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char];
  });
}

function escapeAttribute(value) {
  return escapeHTML(value).replace(/`/g, "&#096;");
}

function sanitizeInlineHTML(value) {
  const escaped = escapeHTML(value || "");

  return escaped
    .replace(/&lt;br&gt;/gi, "<br>")
    .replace(/&lt;br\/&gt;/gi, "<br>")
    .replace(/&lt;em&gt;/gi, "<em>")
    .replace(/&lt;\/em&gt;/gi, "</em>");
}

function sanitizeBasicHTML(value) {
  const escaped = escapeHTML(value || "");

  return escaped
    .replace(/&lt;strong&gt;/gi, "<strong>")
    .replace(/&lt;\/strong&gt;/gi, "</strong>")
    .replace(/&lt;br&gt;/gi, "<br>")
    .replace(/&lt;br\/&gt;/gi, "<br>");
}

function stripHTMLForTextarea(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?strong>/gi, "")
    .trim();
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}