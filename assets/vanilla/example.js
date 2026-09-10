// One entry per grapheme occurrence, in reading order. Repeated characters
// intentionally receive separate entries so their artwork can differ.
const artwork = [
  { src: "/letter-pop/glyph-00.png", rotation: -6 },
  {
    src: "/letter-pop/glyph-01-a.png",
    variants: ["/letter-pop/glyph-01-b.png"],
    rotation: 5,
  },
];

const instance = LetterPop.mount(document.querySelector("[data-letter-pop-target]"), {
  artwork,
});

// Run this in browser verification and require report.pass === true.
window.letterPopVerification = () => instance.verify();
