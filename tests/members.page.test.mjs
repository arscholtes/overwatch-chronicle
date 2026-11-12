// Drives the page's own members code against a running Supabase stack: sign in, edit a spotlight, exchange messages.
// Run `npx supabase start` first; these are skipped unless MEMBERS_STACK=1.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function stack() {
  if (!process.env.MEMBERS_STACK) return null;
  try {
    const env = Object.fromEntries(execFileSync("npx", ["--yes", "supabase", "status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").filter((line) => line.includes("=")).map((line) => { const at = line.indexOf("="); return [line.slice(0, at), line.slice(at + 1).replace(/^"|"$/g, "")]; }));
    return env.API_URL ? { url: env.API_URL, anon: env.ANON_KEY, service: env.SERVICE_ROLE_KEY, mail: env.MAILPIT_URL ?? env.INBUCKET_URL } : null;
  } catch {
    return null;
  }
}

const S = stack();
const skip = S ? false : "set MEMBERS_STACK=1 with a local Supabase stack running";
const run = Date.now();
const MARKUP = `"><img src=x onerror=alert(1)>`;
const accounts = {};

async function admin(path, method, body) {
  const response = await fetch(S.url + path, { method, headers: { apikey: S.service, Authorization: `Bearer ${S.service}`, "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
  const text = await response.text();
  assert.ok(response.ok, `${path} answered ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function emailedCode(email) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const found = await (await fetch(`${S.mail}/api/v1/search?query=${encodeURIComponent("to:" + email)}`)).json();
    if (found.messages?.length) {
      const message = await (await fetch(`${S.mail}/api/v1/message/${found.messages[0].ID}`)).json();
      const code = /\b(\d{6})\b/.exec(message.Text);
      if (code) return code[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no code reached ${email}`);
}

/** A visitor's browser: the page's script running against the real backend, with clicks and form submits to drive it. */
async function visitor() {
  const elements = new Map();
  const listeners = { click: [], submit: [], input: [], keydown: [], error: [] };
  const stored = new Map();
  const canvas = new Proxy({}, { get: () => () => {} });
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, { innerHTML: "", textContent: "", hidden: true, style: {}, children: [], value: "", focus() {}, addEventListener() {}, setAttribute() {}, getContext: () => canvas, querySelector: () => ({}) });
    return elements.get(selector);
  };
  const site = JSON.parse(read("site/data/site.json"));
  site.backend = { url: S.url, key: S.anon };
  const context = vm.createContext({
    console, Date, URLSearchParams, encodeURIComponent,
    document: { querySelector: element, querySelectorAll: () => [], getElementById: () => null, addEventListener: (type, fn) => listeners[type]?.push(fn), body: { style: {} } },
    window: { addEventListener() {}, matchMedia: () => ({ matches: true }), scrollTo() {} },
    location: { hash: "" },
    localStorage: { getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v), removeItem: (k) => stored.delete(k) },
    FormData: class { constructor(form) { this.form = form; } [Symbol.iterator]() { return Object.entries(this.form.values)[Symbol.iterator](); } },
    requestAnimationFrame() {}, cancelAnimationFrame() {},
    fetch: (path, options) => (path.startsWith("data/")
      ? Promise.resolve({ json: async () => (path === "data/site.json" ? site : JSON.parse(read("site/" + path))) })
      : fetch(path, options)),
  });
  vm.runInContext(read("site/assets/app.js"), context);
  const settle = () => new Promise((resolve) => setTimeout(resolve, 350));
  await settle();
  const target = (attributes, dataset) => ({ dataset, closest: (selector) => (attributes.some((a) => selector.includes(a)) ? { dataset } : null) });
  return {
    html: (selector) => element(selector).innerHTML,
    text: (selector) => element(selector).textContent,
    run: (code) => vm.runInContext(code, context),
    async click(attribute, dataset = {}) { for (const fn of listeners.click) fn({ target: target([attribute], dataset) }); await settle(); },
    async submit(kind, values) {
      const form = { dataset: { m: kind }, values };
      for (const fn of listeners.submit) fn({ preventDefault() {}, target: { closest: (selector) => (selector === "form[data-m]" ? form : null) } });
      await settle();
    },
    async signIn(email) {
      await this.click("#memberBtn");
      await this.submit("code", { email });
      await this.submit("verify", { token: await emailedCode(email) });
    },
  };
}

before(async () => {
  if (skip) return;
  for (const roster of ["sniper", "halo"]) {
    const email = `${roster}-${run}@example.test`;
    const user = await admin("/auth/v1/admin/users", "POST", { email, email_confirm: true });
    await admin("/rest/v1/rpc/add_member", "POST", { member_email: email, roster });
    accounts[roster] = { id: user.id, email };
  }
});

after(async () => {
  for (const { id } of Object.values(accounts)) await admin(`/auth/v1/admin/users/${id}`, "DELETE");
  if (!skip) await admin("/rest/v1/profile?roster_id=in.(sniper,halo)", "DELETE");
});

test("a member signs in with the emailed code and the page knows who they are", { skip }, async () => {
  const page = await visitor();
  assert.equal(page.run(`$("#memberBtn").hidden`), false);
  await page.signIn(accounts.sniper.email);
  assert.equal(page.text("#memberBtn"), "sniper");
  assert.match(page.html("#sBody"), /In your words/);
});

test("an address that was not invited is told so and stays signed out", { skip }, async () => {
  const page = await visitor();
  await page.click("#memberBtn");
  await page.submit("code", { email: `nobody-${run}@example.test` });
  assert.match(page.html("#sBody"), /class="mnote"/);
  assert.doesNotMatch(page.html("#sBody"), /Check your email/);
  assert.equal(page.text("#memberBtn"), "");
});

test("what a member writes shows on their public spotlight as text, and hiding takes them off the page", { skip }, async () => {
  const member = await visitor();
  await member.signIn(accounts.sniper.email);
  await member.submit("profile", { bio: `Tank main. ${MARKUP}` });
  assert.match(member.html("#sBody"), /Saved\./);

  const stranger = await visitor();
  stranger.run(`openPerson("sniper")`);
  assert.ok(stranger.html("#sBody").includes("Tank main. &quot;&gt;&lt;img"), "the bio is not on the spotlight as text");
  assert.ok(!stranger.html("#sBody").includes("<img src=x"));
  assert.ok(!stranger.html("#sBody").includes("data-message"), "someone signed out was offered the message button");

  await member.submit("profile", { bio: "Tank main.", hidden: "on" });
  const later = await visitor();
  later.run(`state.view="people";cases()`);
  assert.ok(!later.html("#case").includes(`data-person="sniper"`), "a hidden member still has a card");
  assert.ok(later.html("#case").includes(`data-person="halo"`));
  await member.submit("profile", { bio: "Tank main." });
});

test("one member messages another from their spotlight and the other reads it", { skip }, async () => {
  const sender = await visitor();
  await sender.signIn(accounts.sniper.email);
  sender.run(`openPerson("halo")`);
  assert.ok(sender.html("#sBody").includes(`data-message="${accounts.halo.id}"`), "no message button on a member's spotlight");
  await sender.click("data-message", { message: accounts.halo.id });
  await sender.submit("send", { body: `gg ${MARKUP}` });
  assert.ok(sender.html("#sBody").includes("gg &quot;&gt;&lt;img"));

  const reader = await visitor();
  await reader.signIn(accounts.halo.email);
  await reader.click("data-mview", { mview: "mail" });
  const thread = /data-thread="([0-9a-f-]{36})"/.exec(reader.html("#sBody"));
  assert.ok(thread, "the conversation is not listed for the other member");
  await reader.click("data-thread", { thread: thread[1] });
  assert.ok(reader.html("#sBody").includes("gg &quot;&gt;&lt;img"));
  assert.ok(!reader.html("#sBody").includes("<img src=x"));
});
