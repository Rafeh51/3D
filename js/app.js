"use strict";

const CONFIG_PATH = "./data/config.json";

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
    heroAlign: "right",
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
    email: "coolrafehq12@gmail.com"
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
      "Abdul Rafeh is a 3D environment artist with a passion for building believable, atmospheric worlds that tell stories without words.",
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
      number: "20+",
      label: "Environments Created"
    },
    {
      number: "2+",
      label: "Years of Experience"
    },
    {
      number: "10+",
      label: "Clients & Collaborators"
    }
  ],
  skills: [
    "Blender",
    "Unreal Engine 5",
    "Gaea",
    "Lighting",
    "Rendering",
    "Composition",
    "Texture painting",
    "Material Blending",
    "Terrain Creation",
    "Environment Art"
  ],
  socials: {
    artstation: "https://rafeh.artstation.com/",
    youtube: "https://www.youtube.com/@Rafeh51",
    instagram: "https://www.instagram.com/rafeh51_"
  },
  customCSS: "",
  projects: []
};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  siteData = await loadSiteData();

  applyEverything();
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
  try {
    const response = await fetch(CONFIG_PATH, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Could not load ${CONFIG_PATH}`);
    }

    const configFromFile = await response.json();
    return normalizeConfig(configFromFile);
  } catch (error) {
    console.warn("Could not load config.json. Using fallback config.", error);
    return normalizeConfig(defaultConfig);
  }
}

function normalizeConfig(input) {
  const data = deepClone(defaultConfig);

  if (!input || typeof input !== "object") {
    return data;
  }

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
  if (!Array.isArray(buttons)) {
    return defaultConfig.site.heroButtons;
  }

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
  if (!Array.isArray(filters)) {
    return defaultConfig.work.filters;
  }

  return filters
    .map((filter) => String(filter).trim().toLowerCase())
    .filter(Boolean);
}

function normalizeProject(project, index) {
  const title = project.title || `Project ${index + 1}`;
  const image = typeof project.image === "string" ? project.image.trim() : "";

  const gallery = Array.isArray(project.gallery)
    ? project.gallery.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (image && !gallery.includes(image)) {
    gallery.unshift(image);
  }

  const links = Array.isArray(project.links)
    ? project.links
        .map((link) => ({
          label: String(link.label || "Open Link").trim(),
          url: String(link.url || "").trim()
        }))
        .filter((link) => link.url)
    : [];

  return {
    id: project.id || createSlug(title),
    title,
    software: project.software || "Blender",
    category: project.category || "cinematic",
    year: project.year || new Date().getFullYear(),
    description: project.description || "",
    responsibilities:
      project.responsibilities ||
      "Environment Art, Modeling, Texturing, Lighting, Rendering, Composition.",
    breakdown: project.breakdown || "",
    links,
    image,
    gallery,
    height: Number(project.height || 340)
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
}

function applyColors() {
  document.documentElement.style.setProperty("--accent", siteData.colors.accent);
  document.documentElement.style.setProperty("--accent2", siteData.colors.accent2);
  document.documentElement.style.setProperty("--accent3", siteData.colors.accent3);
}

function applyCustomCSS() {
  let styleTag = document.getElementById("customCssFromConfig");

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "customCssFromConfig";
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
      console.warn("Hero video path not found:", videoPath);
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
  filterBar.appendChild(createFilterButton("all", "All"));

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
    if (project.category) {
      categorySet.add(project.category);
    }
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
        No projects here yet.
      </div>
    `;
    return;
  }

  projects.forEach((project) => {
    const item = document.createElement("article");
    item.className = "portfolio-item";
    item.dataset.category = project.category;

    const cardLinksHTML =
      project.links && project.links.length
        ? `
          <div class="portfolio-links">
            ${project.links
              .map(
                (link) => `
                  <a
                    class="portfolio-link-btn"
                    href="${escapeAttribute(link.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ${escapeHTML(link.label)}
                  </a>
                `
              )
              .join("")}
          </div>
        `
        : "";

    item.innerHTML = `
      <div class="portfolio-img-wrap" style="height: ${Number(project.height) || 340}px;">
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

        ${cardLinksHTML}
      </div>
    `;

    const viewButton = item.querySelector(".overlay-view-btn");
    viewButton.addEventListener("click", () => openProjectModal(project));

    grid.appendChild(item);
  });
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

  const oldLinks = document.getElementById("modalProjectLinks");
  if (oldLinks) oldLinks.remove();

  if (project.links && project.links.length) {
    const linksWrap = document.createElement("div");
    linksWrap.id = "modalProjectLinks";
    linksWrap.className = "modal-project-links";

    project.links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.className = "glass-btn accent-btn";
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      linksWrap.appendChild(anchor);
    });

    modalDesc.insertAdjacentElement("afterend", linksWrap);
  }

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

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
