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

function artworkFor(text) {
  const seen = new Map();
  return LetterPop.graphemes(text)
    .filter((char) => !/^\s+$/u.test(char))
    .map((char, index) => {
      const choices = glyphs[char];
      if (!choices) return null;
      const occurrence = seen.get(char) || 0;
      seen.set(char, occurrence + 1);
      const config = tuning[index % tuning.length];
      return {
        src: `./assets/glyphs/${choices[occurrence % choices.length]}`,
        spread: /\p{P}/u.test(char) ? 0.02 : config.spread,
        rotation: config.rotation,
        lift: config.lift,
      };
    });
}

const demos = new Map();
document.querySelectorAll(".letter-pop").forEach((stage) => {
  const text = stage.dataset.text || "";
  demos.set(stage.id, LetterPop.mount(stage, { text, artwork: artworkFor(text) }));
});

document.querySelectorAll("[data-play]").forEach((button) => {
  button.addEventListener("click", () => demos.get(button.dataset.play)?.play());
});

Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined))).then(() => {
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
window.verifyLetterPopDemos = async () => Promise.all(
  Array.from(demos, async ([id, instance]) => ({ id, ...await instance.verify() })),
);
