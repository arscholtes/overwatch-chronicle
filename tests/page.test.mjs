// Renders every screen from data carrying hostile values and checks none of them reach the page as markup.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const FILES = ["lore", "esports", "t2", "social", "teams", "metrics", "site", "meta", "alumni", "triumvirate"];
const MARKUP = `"><img src=x onerror=alert(1)>`;
const ATTRIBUTE = `#fff" onmouseover="alert(1)`;
const SCRIPT_URL = "javascript:alert(1)";

/** @return {object} the data the site ships */
function shippedData() {
  return Object.fromEntries(FILES.map((name) => [name, JSON.parse(read(`site/data/${name}.json`))]));
}

/** @return {object} the shipped data with every value the bot can write replaced by an attack */
function hostileData() {
  const data = shippedData();
  for (const post of data.social) Object.assign(post, { m: MARKUP, c: ATTRIBUTE, url: SCRIPT_URL });
  for (const team of data.teams) Object.assign(team, { m: MARKUP, c: ATTRIBUTE });
  for (const person of data.alumni.people) person.url = SCRIPT_URL;
  for (const row of data.metrics.viewership) Object.assign(row, { src: MARKUP, peak: MARKUP });
  for (const tab of ["lore", "esports", "t2"]) {
    for (const item of data[tab].items) {
      item.views = { peak: MARKUP, avg: MARKUP, hours: MARKUP, src: "Source", url: SCRIPT_URL };
      item.vods = [{ yt: "aaaaaaaaaaa", label: "Final", start: MARKUP }];
      item.links = [{ label: "Link", url: SCRIPT_URL }];
      item.community = { mood: "mixed", summary: "Summary", voices: [{ who: "Someone", gist: "Said it", url: SCRIPT_URL }] };
    }
  }
  return data;
}

/** @return {Promise<string>} everything the page wrote, across every tab, spotlight and pop-up */
async function renderEverything(data) {
  const elements = new Map();
  const canvas = new Proxy({}, { get: () => () => {} });
  const element = (selector) => {
    if (!elements.has(selector)) {
      elements.set(selector, { innerHTML: "", hidden: true, style: {}, children: [], value: "", focus() {}, addEventListener() {}, setAttribute() {}, getContext: () => canvas, querySelector: () => ({}) });
    }
    return elements.get(selector);
  };
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, body: { style: {} } },
    window: { addEventListener() {}, matchMedia: () => ({ matches: true }), scrollTo() {} },
    location: { hash: "" },
    requestAnimationFrame() {},
    cancelAnimationFrame() {},
    fetch: async (path) => ({ json: async () => data[path.replace(/^data\/|\.json$/g, "")] }),
  });
  vm.runInContext(read("site/assets/app.js"), context);
  await vm.runInContext("load()", context);
  const written = [];
  const collect = () => written.push(...[...elements.values()].map((e) => e.innerHTML));
  for (const view of ["lore", "esports", "t2", "teams", "numbers", "triumvirate"]) {
    vm.runInContext(`state.view=${JSON.stringify(view)};render()`, context);
    collect();
  }
  for (const team of data.teams) {
    vm.runInContext(`openSpot(${JSON.stringify(team.id)})`, context);
    collect();
  }
  for (const tab of ["lore", "esports", "t2"]) {
    for (const item of data[tab].items) {
      vm.runInContext(`openVod(${JSON.stringify(item.id)});openTalk(${JSON.stringify(item.id)})`, context);
      collect();
    }
  }
  return written.join("\n");
}

test("the built script is its sources", () => {
  assert.equal(read("site/assets/app.js"), read("tools/icons.js") + read("tools/main.js"));
});

test("the shipped data renders", async () => {
  const html = await renderEverything(shippedData());
  assert.match(html, /class="tcard/);
  assert.match(html, /class="post/);
});

test("a value from the data never becomes markup", async () => {
  const html = await renderEverything(hostileData());
  assert.ok(!html.includes("<img src=x"), "a data value was written as a tag");
});

test("a value from the data never adds an attribute", async () => {
  const html = await renderEverything(hostileData());
  assert.ok(!html.includes(`onmouseover="alert`), "a colour closed its attribute and opened another");
});

test("only http and https links are written", async () => {
  const html = await renderEverything(hostileData());
  assert.ok(!html.includes(`"javascript:`), "a javascript: address was written into a link");
});
