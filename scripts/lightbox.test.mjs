import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const script = new Script(readFileSync(new URL("../src/templates/partials/gallery-script.twig", import.meta.url), "utf8"));

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.style = { setProperty() {} };
  }
  addEventListener(type, listener) { (this.listeners[type] ??= []).push(listener); }
  dispatch(type, values = {}) {
    const event = { button: 0, target: this, preventDefault() { this.defaultPrevented = true; }, ...values };
    for (const listener of this.listeners[type] ?? []) listener(event);
    return event;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus(options) { this.focusOptions = options; this.focused = true; }
  remove() { this.removed = true; }
}

function fixture({ supported = true, count = 3 } = {}) {
  const copies = [];
  function makePicture(index) {
    const image = new Element();
    image.setAttribute("width", 1200);
    image.setAttribute("height", 800);
    image.setAttribute("loading", "lazy");
    image.setAttribute("fetchpriority", "high");
    image.alt = `Photo ${index + 1}`;
    image.complete = false;
    image.naturalWidth = 1200;
    image.getBoundingClientRect = () => ({ left: 100, width: 600 });
    const sources = [new Element(), new Element()];
    const picture = new Element();
    picture.querySelector = () => image;
    picture.querySelectorAll = () => [...sources, image];
    picture.cloneNode = () => {
      const copy = makePicture(index);
      copies.push(copy);
      return copy;
    };
    return picture;
  }
  const links = Array.from({ length: count }, (_, index) => {
    const picture = makePicture(index);
    const figure = new Element();
    figure.querySelector = (selector) => selector === "img" ? picture.querySelector() : index === 1 ? { textContent: "A caption" } : null;
    const link = new Element();
    link.querySelector = () => picture;
    link.closest = () => figure;
    return link;
  });
  const parts = Object.fromEntries(["stage", "close", "previous", "next", "counter", "caption", "error", "announcement"].map((name) => [name, new Element()]));
  parts.error.textContent = "Could not load image";
  parts.stage.clientWidth = 900;
  parts.stage.clientHeight = 500;
  parts.stage.append = (picture) => { parts.stage.picture = picture; };
  const dialog = new Element();
  dialog.dataset = { positionLabel: "Image {current} of {total}" };
  dialog.open = false;
  dialog.querySelector = (selector) => parts[selector.replace(".lightbox-", "")];
  if (supported) dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatch("close"); };
  const classes = new Set();
  const viewSwitch = new Element();
  viewSwitch.querySelectorAll = () => [];
  let resize;
  const document = {
    documentElement: { dataset: {}, classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
    querySelector: (selector) => selector === ".view-switch" ? viewSwitch : dialog,
    querySelectorAll: (selector) => selector === ".photo-open" ? links : links.map((link) => link.closest()),
  };
  script.runInNewContext({ document, window: { addEventListener: (_, listener) => { resize = listener; } } });
  return { links, dialog, classes, copies, resize, ...parts };
}

test("lightbox opens only on unmodified clicks and keeps a direct-link fallback", () => {
  const f = fixture();
  for (const modified of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    assert.ok(!f.links[0].dispatch("click", modified).defaultPrevented);
    assert.equal(f.dialog.open, false);
  }
  assert.ok(f.links[0].dispatch("click").defaultPrevented);
  assert.equal(f.dialog.open, true);
  assert.ok(f.classes.has("lightbox-open"));
  assert.ok(f.close.focused);
  assert.equal(f.counter.textContent, "1 / 3");
  assert.equal(f.previous.disabled, true);
  assert.equal(f.next.disabled, false);
  assert.equal(f.copies.length, 1, "only the selected photo is cloned");
  const image = f.stage.picture.querySelector();
  assert.equal(image.getAttribute("loading"), "eager");
  assert.equal(image.getAttribute("fetchpriority"), undefined);
  assert.equal(image.getAttribute("sizes"), "750px");
  assert.equal(f.announcement.textContent, "Image 1 of 3: Photo 1");
  const unsupported = fixture({ supported: false });
  assert.ok(!unsupported.links[0].dispatch("click").defaultPrevented);
  assert.equal(unsupported.links[0].getAttribute("aria-haspopup"), undefined);
});

test("lightbox navigation stops at the ends, updates captions and responsive sizes", () => {
  const f = fixture();
  f.links[0].dispatch("click");
  f.dialog.dispatch("keydown", { key: "ArrowLeft" });
  assert.equal(f.counter.textContent, "1 / 3");
  assert.equal(f.copies.length, 1);
  assert.ok(f.dialog.dispatch("keydown", { key: "ArrowRight" }).defaultPrevented);
  assert.equal(f.counter.textContent, "2 / 3");
  assert.equal(f.caption.textContent, "A caption");
  assert.equal(f.caption.hidden, false);
  f.next.dispatch("click");
  assert.equal(f.counter.textContent, "3 / 3");
  assert.equal(f.next.disabled, true);
  assert.equal(f.caption.hidden, true);
  f.dialog.dispatch("keydown", { key: "ArrowRight" });
  assert.equal(f.counter.textContent, "3 / 3");
  f.previous.dispatch("click");
  assert.equal(f.counter.textContent, "2 / 3");
  f.stage.clientWidth = 320;
  f.resize();
  assert.ok(f.stage.picture.querySelectorAll().every((element) => element.getAttribute("sizes") === "320px"));
});

test("clicking the displayed photo's halves navigates without wrapping or closing", () => {
  const f = fixture();
  f.links[1].dispatch("click");
  const clickImage = (clientX, button = 0) => {
    const target = f.stage.picture.querySelector();
    f.dialog.dispatch("pointerdown", { target });
    f.dialog.dispatch("click", { target, clientX, button });
  };
  clickImage(200);
  assert.equal(f.counter.textContent, "1 / 3", "left half goes back relative to the photo's position");
  clickImage(200);
  assert.equal(f.counter.textContent, "1 / 3", "left half does nothing at the first photo");
  clickImage(600);
  assert.equal(f.counter.textContent, "2 / 3", "right half goes forward");
  clickImage(400);
  assert.equal(f.counter.textContent, "3 / 3", "the midpoint belongs to the right half");
  clickImage(600);
  assert.equal(f.counter.textContent, "3 / 3", "right half does nothing at the last photo");
  clickImage(200, 2);
  assert.equal(f.counter.textContent, "3 / 3", "non-primary clicks do not navigate");
  assert.equal(f.dialog.open, true);
});

test("lightbox handles image failures without stale responses affecting another photo", () => {
  const f = fixture();
  f.links[0].dispatch("click");
  const oldImage = f.stage.picture.querySelector();
  f.next.dispatch("click");
  oldImage.dispatch("error");
  assert.equal(f.error.hidden, true);
  assert.equal(f.stage.getAttribute("aria-busy"), "true");
  f.stage.picture.querySelector().dispatch("error");
  assert.equal(f.error.hidden, false);
  assert.equal(f.stage.picture.hidden, true);
  assert.equal(f.stage.getAttribute("aria-busy"), "false");
  assert.equal(f.announcement.textContent, "Image 2 of 3: Could not load image");
  f.next.dispatch("click");
  f.stage.picture.querySelector().dispatch("load");
  assert.equal(f.error.hidden, true);
  assert.equal(f.stage.getAttribute("aria-busy"), "false");
});

test("closing restores focus and scroll state; only blank-area clicks dismiss", () => {
  const f = fixture();
  f.links[1].dispatch("click");
  f.dialog.dispatch("pointerdown", { target: f.stage.picture.querySelector() });
  f.dialog.dispatch("click", { target: f.stage });
  assert.equal(f.dialog.open, true, "dragging off the image does not close it");
  f.dialog.dispatch("pointerdown", { target: f.stage });
  f.dialog.dispatch("click", { target: f.stage });
  assert.equal(f.dialog.open, false);
  assert.ok(!f.classes.has("lightbox-open"));
  assert.ok(f.links[1].focused);
  assert.equal(f.links[1].focusOptions.preventScroll, true);
  assert.ok(f.stage.picture.removed);
  assert.equal(f.announcement.textContent, "");
  f.links[0].dispatch("click");
  f.close.dispatch("click");
  assert.equal(f.dialog.open, false);
  assert.ok(f.links[0].focused);
});

test("a single-photo gallery disables both navigation buttons", () => {
  const f = fixture({ count: 1 });
  f.links[0].dispatch("click");
  assert.equal(f.previous.disabled, true);
  assert.equal(f.next.disabled, true);
  assert.equal(f.counter.textContent, "1 / 1");
});
