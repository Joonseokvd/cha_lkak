const photos = [
  "IMG_0573.jpg",
  "IMG_0749.jpg",
  "IMG_0970.jpg",
  "IMG_1044.jpg",
  "IMG_1356.jpg",
  "IMG_1445.jpg",
  "IMG_1457.jpg",
  "IMG_1777.jpg",
  "IMG_2522.jpg",
  "IMG_3426.jpg",
  "IMG_3440.jpg",
  "IMG_3508.jpg",
  "IMG_3564.jpg",
  "IMG_3984.jpg",
  "IMG_4070.jpg",
  "IMG_4074.jpg",
  "IMG_4101.jpg",
  "IMG_4176.jpg",
  "IMG_4181.jpg",
  "IMG_4208.jpg",
  "IMG_4351.jpg",
  "IMG_4629.jpg",
  "IMG_4668.jpg",
  "IMG_4710.jpg",
  "IMG_4784.jpg",
  "IMG_5286.jpg",
  "IMG_5335.jpg",
  "IMG_6400.jpg",
  "IMG_6684.jpg",
  "IMG_6829.jpg",
  "IMG_6875.jpg",
  "IMG_6878.jpg",
  "IMG_7633.jpg",
  "IMG_7639.jpg",
  "IMG_7964-1.jpg",
  "IMG_7968.jpg",
  "IMG_8567.jpg",
  "IMG_8602.jpg",
  "IMG_8673.jpg",
  "IMG_8762.jpg",
  "IMG_8771.jpg",
  "IMG_8771-1.jpg",
  "IMG_9152.jpg",
  "IMG_9349.jpg",
  "IMG_9584.jpg"
];

const track = document.getElementById("track");
const randomizedPhotos = shuffleArray([...photos]);

let activeIndex = 0;
let isAnimating = false;
let touchStartY = 0;
let touchStartX = 0;
let releasedAnimationLock = null;

function buildSlides() {
  const fragment = document.createDocumentFragment();

  randomizedPhotos.forEach((file, index) => {
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.dataset.index = String(index);

    const card = document.createElement("article");
    card.className = "card";

    const media = document.createElement("div");
    media.className = "media";

    const img = document.createElement("img");
    img.src = file;
    img.alt = `cha__lkak photo ${index + 1}`;
    img.loading = index < 2 ? "eager" : "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });

    const caption = document.createElement("footer");
    caption.className = "caption";

    const title = document.createElement("span");
    title.textContent = file.replace(/\.[^.]+$/, "");

    const year = document.createElement("span");
    year.className = "year";
    year.textContent = "2025";

    caption.append(title, year);
    media.appendChild(img);
    card.append(media, caption);
    slide.appendChild(card);
    fragment.appendChild(slide);
  });

  track.appendChild(fragment);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setActive(index) {
  const slides = track.querySelectorAll(".slide");
  slides.forEach((slide) => slide.classList.remove("is-active"));
  const current = slides[index];
  if (current) {
    current.classList.add("is-active");
    activeIndex = index;
  }
}

function scrollToIndex(index) {
  const slides = track.querySelectorAll(".slide");
  const clamped = Math.max(0, Math.min(index, slides.length - 1));
  const current = slides[activeIndex];
  const target = slides[clamped];
  if (!target) {
    return;
  }
  if (clamped === activeIndex) {
    return;
  }

  if (releasedAnimationLock) {
    clearTimeout(releasedAnimationLock);
  }

  slides.forEach((slide) => slide.classList.remove("is-leaving"));

  isAnimating = true;
  if (current) {
    current.classList.add("is-leaving");
  }
  setActive(clamped);
  target.scrollIntoView({ behavior: "smooth", block: "start" });

  releasedAnimationLock = setTimeout(() => {
    if (current) {
      current.classList.remove("is-leaving");
    }
    isAnimating = false;
  }, 520);
}

function moveBy(delta) {
  if (isAnimating) {
    return;
  }
  scrollToIndex(activeIndex + delta);
}

function setupObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (isAnimating) {
          return;
        }
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const idx = Number(entry.target.dataset.index || 0);
          setActive(idx);
        }
      });
    },
    {
      root: track,
      threshold: [0.6]
    }
  );

  track.querySelectorAll(".slide").forEach((slide) => observer.observe(slide));
}

track.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 6) {
      return;
    }
    moveBy(event.deltaY > 0 ? 1 : -1);
  },
  { passive: false }
);

track.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
  },
  { passive: true }
);

track.addEventListener(
  "touchend",
  (event) => {
    const touch = event.changedTouches[0];
    const deltaY = touchStartY - touch.clientY;
    const deltaX = touchStartX - touch.clientX;

    if (Math.abs(deltaY) < 28 || Math.abs(deltaY) < Math.abs(deltaX)) {
      return;
    }

    moveBy(deltaY > 0 ? 1 : -1);
  },
  { passive: true }
);

window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    moveBy(1);
  }

  if (["ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    moveBy(-1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    scrollToIndex(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    scrollToIndex(photos.length - 1);
  }
});

buildSlides();
setupObserver();
setActive(0);
