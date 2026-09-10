(function (global) {
  "use strict";

  const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

  const punctuationPattern = /\p{P}/u;
  const cjkPattern = /\p{Script=Han}/u;
  const latinPattern = /\p{Script=Latin}|[0-9]/u;
  const whitespacePattern = /^\s+$/u;

  function graphemes(text) {
    return segmenter
      ? Array.from(segmenter.segment(text), ({ segment }) => segment)
      : Array.from(text);
  }

  function classify(char) {
    if (whitespacePattern.test(char)) return "space";
    if (punctuationPattern.test(char)) return "punctuation";
    if (cjkPattern.test(char)) return "cjk";
    if (latinPattern.test(char)) return "latin";
    return "other";
  }

  // Short CJK clauses, Latin words, and punctuation-attached groups preserve
  // natural wrapping without turning an unspaced Chinese sentence into one line.
  function layoutGroups(text, maxCjkGroup) {
    const groups = [];
    let current = null;
    let nextIndex = 0;

    function flush() {
      if (current && current.items.length) groups.push(current);
      current = null;
    }

    for (const char of graphemes(text)) {
      const type = classify(char);

      if (type === "space") {
        flush();
        const width = Math.max(0.3, graphemes(char).length * 0.3);
        if (groups.length) groups[groups.length - 1].spaceAfter += width;
        continue;
      }

      if (type === "punctuation") {
        if (!current) current = { items: [], spaceAfter: 0, kind: "punctuation" };
        current.items.push({ char, index: nextIndex++, type });
        flush();
        continue;
      }

      const shouldStartNew = !current
        || (type === "latin" && current.kind !== "latin")
        || (type !== "latin" && current.kind === "latin")
        || (type === "cjk" && current.kind === "cjk" && current.items.length >= maxCjkGroup);

      if (shouldStartNew) {
        flush();
        current = { items: [], spaceAfter: 0, kind: type };
      }

      current.items.push({ char, index: nextIndex++, type });
    }

    flush();
    return groups;
  }

  function normalizeArtwork(artwork, item) {
    const raw = Array.isArray(artwork)
      ? artwork[item.index]
      : artwork && (artwork[item.index] ?? artwork[item.char]);
    if (!raw) return null;
    return typeof raw === "string" ? { src: raw } : raw;
  }

  function rectDelta(before, after) {
    return Math.max(
      Math.abs(before.x - after.x),
      Math.abs(before.y - after.y),
      Math.abs(before.width - after.width),
      Math.abs(before.height - after.height),
    );
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function mount(target, options) {
    if (typeof target === "string") target = document.querySelector(target);
    if (!target) throw new Error("LetterPop.mount: target was not found");
    if (target.dataset.letterPopMounted === "true") {
      throw new Error("LetterPop.mount: target is already mounted");
    }

    const settings = options || {};
    const text = settings.text ?? target.textContent ?? "";
    const groups = layoutGroups(text, settings.maxCjkGroup || 4);
    const artwork = settings.artwork || [];
    const occurrences = [];
    const hits = [];
    const timers = new Map();
    const scheduled = new Set();
    const previous = {
      html: target.innerHTML,
      ariaLabel: target.getAttribute("aria-label"),
      tabIndex: target.getAttribute("tabindex"),
      justifyContent: target.style.justifyContent,
      hadClass: target.classList.contains("letter-pop"),
    };

    function schedule(callback, delay) {
      const timer = setTimeout(() => {
        scheduled.delete(timer);
        callback();
      }, delay);
      scheduled.add(timer);
      return timer;
    }

    function cancel(timer) {
      clearTimeout(timer);
      scheduled.delete(timer);
    }

    target.textContent = "";
    target.classList.add("letter-pop");
    target.dataset.letterPopMounted = "true";
    target.setAttribute("aria-label", text);
    const textAlign = settings.align || getComputedStyle(target).textAlign;
    target.style.justifyContent = textAlign === "center"
      ? "center"
      : (textAlign === "right" || textAlign === "end" ? "flex-end" : "flex-start");
    if (settings.keyboard !== false && !target.hasAttribute("tabindex")) target.tabIndex = 0;

    function activate(index) {
      const occurrence = occurrences[index];
      if (!occurrence) return;
      cancel(timers.get(index));
      occurrence.classList.remove("is-returning");
      occurrence.classList.add("is-active");
    }

    function deactivate(index, delay) {
      const occurrence = occurrences[index];
      if (!occurrence) return;
      cancel(timers.get(index));
      timers.set(index, schedule(() => {
        occurrence.classList.remove("is-active");
        occurrence.classList.add("is-returning");
        schedule(() => occurrence.classList.remove("is-returning"), 360);
      }, delay == null ? 140 : delay));
    }

    function play(interval) {
      const step = interval == null ? 82 : interval;
      occurrences.forEach((occurrence, index) => {
        if (!occurrence) return;
        schedule(() => {
          activate(index);
          deactivate(index, 540);
        }, index * step);
      });
    }

    for (const group of groups) {
      const shell = document.createElement("span");
      const visual = document.createElement("span");
      const hitLayer = document.createElement("span");
      shell.className = "lp-group";
      visual.className = "lp-visual-group";
      hitLayer.className = "lp-hit-group";
      visual.setAttribute("aria-hidden", "true");
      hitLayer.setAttribute("aria-hidden", "true");
      shell.style.setProperty("--space-after", `${group.spaceAfter}em`);

      for (const item of group.items) {
        const config = normalizeArtwork(artwork, item);
        const letter = document.createElement("span");
        const character = document.createElement("span");
        const artShell = document.createElement("span");
        const hit = document.createElement("span");

        letter.className = "lp-letter";
        character.className = "lp-character";
        artShell.className = "lp-art-shell";
        hit.className = "lp-hit";
        character.textContent = item.char;
        hit.textContent = item.char;
        hit.dataset.letterPopIndex = String(item.index);

        if (item.type === "punctuation") letter.classList.add("is-punctuation");
        if (item.type === "cjk") letter.classList.add("is-cjk");

        if (config && config.src) {
          const image = document.createElement("img");
          image.className = "lp-art";
          image.src = config.src;
          image.alt = "";
          image.draggable = false;
          artShell.append(image);
          letter.style.setProperty("--spread", `${config.spread ?? (item.type === "punctuation" ? 0.025 : 0.13)}em`);
          letter.style.setProperty("--rotation", `${config.rotation ?? ((item.index % 2 ? 1 : -1) * (4 + item.index % 4))}deg`);
          letter.style.setProperty("--lift", `${config.lift ?? 0}em`);
          letter.style.setProperty("--art-scale", String(config.scale ?? (item.type === "punctuation" ? 0.58 : 1)));
          letter.style.setProperty("--art-width", `${config.width ?? (item.type === "punctuation" ? 0.8 : 1.45)}em`);
          letter.style.setProperty("--art-height", `${config.height ?? (item.type === "punctuation" ? 0.72 : 1.18)}em`);
          letter.style.setProperty("--art-bottom", `${config.bottom ?? (item.type === "punctuation" ? -0.02 : -0.08)}em`);
        } else {
          letter.classList.add("has-no-art");
        }

        hit.addEventListener("pointerenter", () => activate(item.index));
        hit.addEventListener("pointerleave", (event) => {
          if (event.pointerType !== "touch") deactivate(item.index);
        });
        hit.addEventListener("pointerdown", (event) => {
          if (event.pointerType === "touch") {
            activate(item.index);
            deactivate(item.index, settings.touchDuration || 760);
          }
        });

        letter.append(character, artShell);
        visual.append(letter);
        hitLayer.append(hit);
        occurrences[item.index] = letter;
        hits[item.index] = hit;
      }

      shell.append(visual, hitLayer);
      target.append(shell);
    }

    const onFocus = () => play();
    target.addEventListener("focus", onFocus);

    async function verify(index) {
      const available = hits.map((hit, i) => hit ? i : -1).filter((i) => i >= 0);
      const selected = index == null ? available[0] : index;
      const before = hits.map((hit) => hit && hit.getBoundingClientRect());
      activate(selected);
      await nextFrame();
      const during = hits.map((hit) => hit && hit.getBoundingClientRect());
      const maxHitDelta = before.reduce((max, rect, i) => rect && during[i]
        ? Math.max(max, rectDelta(rect, during[i]))
        : max, 0);
      const images = Array.from(target.querySelectorAll("img"));
      const failedImages = images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src);
      const viewportOverflow = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
      deactivate(selected, 0);
      return {
        pass: maxHitDelta <= 0.75 && viewportOverflow <= 1 && failedImages.length === 0,
        maxHitDelta,
        viewportOverflow,
        failedImages,
        hitCount: available.length,
        artworkCount: images.length,
      };
    }

    function destroy() {
      scheduled.forEach(clearTimeout);
      scheduled.clear();
      target.removeEventListener("focus", onFocus);
      if (!previous.hadClass) target.classList.remove("letter-pop");
      delete target.dataset.letterPopMounted;
      target.innerHTML = previous.html;
      if (previous.ariaLabel == null) target.removeAttribute("aria-label");
      else target.setAttribute("aria-label", previous.ariaLabel);
      if (previous.tabIndex == null) target.removeAttribute("tabindex");
      else target.setAttribute("tabindex", previous.tabIndex);
      target.style.justifyContent = previous.justifyContent;
    }

    return { text, occurrences, hits, activate, deactivate, play, verify, destroy };
  }

  global.LetterPop = Object.freeze({ mount, graphemes, layoutGroups });
})(window);
