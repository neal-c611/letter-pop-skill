const glyphs = {
  H: ["hello-h.png"],
  e: ["hello-e-1.png", "neal-e.png"],
  l: ["hello-l-1.png", "hello-l-2.png", "neal-l.png"],
  o: ["hello-o.png"],
  ",": ["hello-comma.png"],
  我: ["hello-wo.png"],
  是: ["hello-shi.png"],
  N: ["neal-n.png"],
  a: ["neal-a.png"],
};

const tuning = [
  { spread: 0.15, rotation: -7, lift: 0.01 },
  { spread: 0.13, rotation: 6, lift: 0.02 },
  { spread: 0.13, rotation: -5, lift: -0.02 },
  { spread: 0.13, rotation: 7, lift: 0.01 },
  { spread: 0.15, rotation: -6, lift: 0.02 },
  { spread: 0.02, rotation: 5, lift: 0.04 },
];

const segmenter = "Segmenter" in Intl
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

function graphemes(text) {
  return segmenter ? [...segmenter.segment(text)].map(({ segment }) => segment) : Array.from(text);
}

function wordsWithIndices(text) {
  const parts = text.split(/(\s+)/u);
  let index = 0;

  return parts.map((part) => {
    const items = graphemes(part).map((char) => ({ char, index: index++ }));
    return { space: /^\s+$/u.test(part), items };
  });
}

function createLetterPop(stage) {
  const text = stage.dataset.text || "";
  const parts = wordsWithIndices(text);
  const visual = document.createElement("span");
  const hits = document.createElement("span");
  const occurrences = [];
  const returnTimers = new Map();
  const seen = new Map();

  visual.className = "lp-visual";
  visual.setAttribute("aria-hidden", "true");
  hits.className = "lp-hits";
  hits.setAttribute("aria-hidden", "true");

  function activate(index) {
    const letter = occurrences[index];
    if (!letter) return;
    window.clearTimeout(returnTimers.get(index));
    letter.classList.remove("is-returning");
    if (letter.classList.contains("is-active")) {
      letter.classList.remove("is-active");
      void letter.offsetWidth;
    }
    letter.classList.add("is-active");
  }

  function deactivate(index, delay = 155) {
    const letter = occurrences[index];
    if (!letter) return;
    window.clearTimeout(returnTimers.get(index));
    const timer = window.setTimeout(() => {
      letter.classList.remove("is-active");
      letter.classList.add("is-returning");
      window.setTimeout(() => letter.classList.remove("is-returning"), 330);
    }, delay);
    returnTimers.set(index, timer);
  }

  function play() {
    const order = occurrences.map((_, index) => index);
    order.forEach((index, step) => {
      window.setTimeout(() => {
        activate(index);
        deactivate(index, 520);
      }, step * 82);
    });
  }

  parts.forEach((part) => {
    if (part.space) {
      const visualSpace = document.createElement("span");
      const hitSpace = document.createElement("span");
      visualSpace.className = "lp-space";
      hitSpace.className = "lp-space";
      visual.append(visualSpace);
      hits.append(hitSpace);
      return;
    }

    const visualWord = document.createElement("span");
    const hitWord = document.createElement("span");
    visualWord.className = "lp-word";
    hitWord.className = "lp-hit-word";

    part.items.forEach(({ char, index }) => {
      const artOptions = glyphs[char];
      if (!artOptions) return;
      const occurrence = seen.get(char) || 0;
      seen.set(char, occurrence + 1);
      const art = artOptions[occurrence % artOptions.length];
      const config = tuning[index % tuning.length];
      const punctuation = /\p{P}/u.test(char);
      const cjk = /\p{Script=Han}/u.test(char);

      const letter = document.createElement("span");
      const character = document.createElement("span");
      const artShell = document.createElement("span");
      const image = document.createElement("img");
      const hit = document.createElement("span");

      letter.className = "lp-letter";
      if (punctuation) letter.classList.add("is-punctuation");
      if (cjk) letter.classList.add("is-cjk");
      letter.style.setProperty("--spread", `${punctuation ? 0.02 : config.spread}em`);
      letter.style.setProperty("--rotation", `${config.rotation}deg`);
      letter.style.setProperty("--lift", `${config.lift}em`);

      character.className = "lp-character";
      character.textContent = char;

      artShell.className = "lp-art-shell";
      image.className = "lp-art";
      image.src = `./assets/glyphs/${art}`;
      image.alt = "";
      image.draggable = false;
      artShell.append(image);

      hit.className = "lp-hit";
      hit.textContent = char;
      hit.addEventListener("pointerenter", () => activate(index));
      hit.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "touch") deactivate(index);
      });
      hit.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        activate(index);
        deactivate(index, 760);
      });

      letter.append(character, artShell);
      visualWord.append(letter);
      hitWord.append(hit);
      occurrences[index] = letter;
    });

    visual.append(visualWord);
    hits.append(hitWord);
  });

  stage.append(visual, hits);
  stage.addEventListener("focus", play);
  return { play, activate, deactivate, occurrences };
}

const demos = new Map();
document.querySelectorAll(".letter-pop").forEach((stage) => {
  demos.set(stage.id, createLetterPop(stage));
});

document.querySelectorAll("[data-play]").forEach((button) => {
  button.addEventListener("click", () => demos.get(button.dataset.play)?.play());
});

Promise.all(
  [...document.images].map((image) => image.decode?.().catch(() => undefined)),
).then(() => {
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview && demos.has(`${preview}-stage`)) {
    const demo = demos.get(`${preview}-stage`);
    const activeIndices = preview === "compact" ? [0, 1, 2, 4, 5] : [0, 2, 4, 5, 7, 8, 10];
    activeIndices.forEach((index) => demo.activate(index));
  } else {
    window.setTimeout(() => demos.get("sans-stage")?.play(), 450);
  }
});

window.letterPopDemos = demos;
