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

const workbuddyBase = "./assets/showcase/workbuddy/";
const doubaoBase = "./assets/showcase/doubao/";
const variantsBase = "./assets/showcase/variants/";

const showcaseArtwork = {
  "workbuddy-stage": [
    { src: workbuddyBase + "g00-da.png", rotation: -5 },
    { src: workbuddyBase + "g01-jia.png", rotation: 4 },
    { src: workbuddyBase + "g02-hao.png", rotation: -6 },
    { src: workbuddyBase + "g03-comma.png", scale: 0.52, width: 0.72, height: 0.72, bottom: -0.01, spread: 0.02 },
    { src: workbuddyBase + "g04-wo.png", rotation: 5 },
    { src: workbuddyBase + "g05-shi.png", rotation: -4 },
    { src: workbuddyBase + "g06-W.png", rotation: 4 },
    { src: workbuddyBase + "g07-o.png", rotation: -5, lift: 0.02 },
    { src: workbuddyBase + "g08-r.png", rotation: 6 },
    { src: workbuddyBase + "g09-k.png", rotation: -4 },
    { src: workbuddyBase + "g10-b.png", rotation: 5 },
    { src: workbuddyBase + "g11-u.png", rotation: -6 },
    { src: workbuddyBase + "g12-d-ice.png", rotation: 4 },
    { src: workbuddyBase + "g13-d-stitch.png", rotation: -5 },
    { src: workbuddyBase + "g14-y.png", rotation: 6 },
    { src: workbuddyBase + "g15-N.png", rotation: -4 },
    { src: workbuddyBase + "g16-e.png", rotation: 5 },
    { src: workbuddyBase + "g17-a.png", rotation: -6 },
    { src: workbuddyBase + "g18-l.png", rotation: 4 },
    { src: workbuddyBase + "g19-period.png", scale: 0.52, width: 0.68, height: 0.68, bottom: -0.01, spread: 0.02 },
  ],
  "doubao-stage": [
    { src: doubaoBase + "g00-da.png", rotation: -4 },
    { src: doubaoBase + "g01-jia.png", rotation: 3 },
    { src: doubaoBase + "g02-hao.png", rotation: -3 },
    { src: doubaoBase + "g03-comma.png", rotation: 2, scale: 0.52, width: 0.72, height: 0.72, bottom: -0.01, spread: 0.02 },
    { src: doubaoBase + "g04-wo.png", rotation: 4 },
    { src: doubaoBase + "g05-shi.png", rotation: -5 },
    { src: doubaoBase + "g06-dou.png", rotation: 3 },
    { src: doubaoBase + "g07-bao.png", rotation: -3 },
    { src: doubaoBase + "g08-N.png", rotation: 2 },
    { src: doubaoBase + "g09-e.png", rotation: -4 },
    { src: doubaoBase + "g10-a.png", rotation: 3 },
    { src: doubaoBase + "g11-l.png", rotation: -2 },
    { src: doubaoBase + "g12-period.png", rotation: 1, scale: 0.5, width: 0.68, height: 0.68, bottom: -0.01, spread: 0.02 },
  ],
  "variants-stage": [
    { src: variantsBase + "g00-da-a.png", variants: [variantsBase + "g00-da-b.png"], rotation: -5 },
    { src: variantsBase + "g01-jia-a.png", variants: [variantsBase + "g01-jia-b.png"], rotation: 4 },
    { src: variantsBase + "g02-hao-a.png", variants: [variantsBase + "g02-hao-b.png"], rotation: -4 },
    { src: variantsBase + "g03-comma-a.png", variants: [variantsBase + "g03-comma-b.png"], rotation: 7 },
    { src: variantsBase + "g04-wo-a.png", variants: [variantsBase + "g04-wo-b.png"], rotation: 5 },
    { src: variantsBase + "g05-shi-a.png", variants: [variantsBase + "g05-shi-b.png"], rotation: -5 },
    { src: variantsBase + "g06-N-a.png", variants: [variantsBase + "g06-N-b.png"], rotation: 4 },
    { src: variantsBase + "g07-e-a.png", variants: [variantsBase + "g07-e-b.png"], rotation: -5 },
    { src: variantsBase + "g08-a-a.png", variants: [variantsBase + "g08-a-b.png"], rotation: 5 },
    { src: variantsBase + "g09-l-a.png", variants: [variantsBase + "g09-l-b.png"], rotation: -4 },
    { src: variantsBase + "g10-period-a.png", variants: [variantsBase + "g10-period-b.png"], rotation: 6 },
  ],
};

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
      const primaryIndex = occurrence % choices.length;
      const orderedChoices = [
        ...choices.slice(primaryIndex),
        ...choices.slice(0, primaryIndex),
      ];
      return {
        src: `./assets/glyphs/${orderedChoices[0]}`,
        variants: orderedChoices.slice(1).map((name) => `./assets/glyphs/${name}`),
        spread: /\p{P}/u.test(char) ? 0.02 : config.spread,
        rotation: config.rotation,
        lift: config.lift,
      };
    });
}

const demos = new Map();
document.querySelectorAll(".letter-pop").forEach((stage) => {
  const text = stage.dataset.text || "";
  const artwork = showcaseArtwork[stage.id] || artworkFor(text);
  demos.set(stage.id, LetterPop.mount(stage, { text, artwork }));
});

document.querySelectorAll("[data-play]").forEach((button) => {
  button.addEventListener("click", () => demos.get(button.dataset.play)?.play());
});

Promise.all([...document.images].map((image) => image.decode?.().catch(() => undefined))).then(() => {
  const preview = new URLSearchParams(window.location.search).get("preview");
  if (preview && demos.has(`${preview}-stage`)) {
    const demo = demos.get(`${preview}-stage`);
    const activeIndices = preview === "compact"
      ? [0, 1, 2, 4, 5]
      : (preview === "workbuddy" ? [6] :
        (preview === "doubao" ? [1] :
          (preview === "variants" ? [0, 1, 2, 4, 5, 6, 8, 10] : [0, 2, 4, 5, 7, 8, 10])));
    activeIndices.forEach((index) => demo.activate(index));
    if (preview === "variants") {
      [1, 4, 6, 10].forEach((index) => {
        demo.deactivate(index, 0);
        window.setTimeout(() => demo.activate(index), 20);
      });
    }
  } else {
    window.setTimeout(() => demos.get("sans-stage")?.play(), 450);
  }
});

window.letterPopDemos = demos;
window.verifyLetterPopDemos = async () => Promise.all(
  Array.from(demos, async ([id, instance]) => ({ id, ...await instance.verify() })),
);
