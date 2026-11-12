// The members database's promises, checked against a running Supabase stack.
// Run `npx supabase start` then `node --test tests/members.db.test.mjs`; without a stack these are skipped.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { before, test } from "node:test";

/** @return {object | null} the local stack's address and keys, or null when none is running */
function stack() {
  if (process.env.SUPABASE_URL) return { url: process.env.SUPABASE_URL, anon: process.env.SUPABASE_ANON_KEY, service: process.env.SUPABASE_SERVICE_KEY, mail: process.env.MAILPIT_URL };
  try {
    const env = Object.fromEntries(execFileSync("npx", ["--yes", "supabase", "status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n").filter((line) => line.includes("=")).map((line) => { const at = line.indexOf("="); return [line.slice(0, at), line.slice(at + 1).replace(/^"|"$/g, "")]; }));
    return env.API_URL ? { url: env.API_URL, anon: env.ANON_KEY, service: env.SERVICE_ROLE_KEY, mail: env.MAILPIT_URL ?? env.INBUCKET_URL } : null;
  } catch {
    return null;
  }
}

const S = stack();
const skip = S ? false : "no Supabase stack is running";
const run = Date.now();
const address = (name) => `${name}-${run}@example.test`;

/** Calls the stack and returns { status, body }. */
async function call(path, { key = S.anon, token = key, method = "GET", body, prefer } = {}) {
  const response = await fetch(S.url + path, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

/** Invites an address the way the dashboard does, optionally tying it to a roster entry. */
async function invite(name, roster, owner = false) {
  const created = await call("/auth/v1/admin/users", { key: S.service, method: "POST", body: { email: address(name), email_confirm: true } });
  assert.equal(created.status, 200, JSON.stringify(created.body));
  if (roster) {
    const added = await call("/rest/v1/rpc/add_member", { key: S.service, method: "POST", body: { member_email: address(name), roster: `${roster}-${run}`, is_owner: owner } });
    assert.equal(added.status, 200, JSON.stringify(added.body));
  }
  return created.body.id;
}

/** @return {Promise<string>} the newest code emailed to an address */
async function emailedCode(name) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const found = await (await fetch(`${S.mail}/api/v1/search?query=${encodeURIComponent("to:" + address(name))}`)).json();
    if (found.messages?.length) {
      const message = await (await fetch(`${S.mail}/api/v1/message/${found.messages[0].ID}`)).json();
      const code = /\b(\d{6})\b/.exec(message.Text);
      if (code) return code[1];
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no code reached ${address(name)}`);
}

/** Logs in the way the page does: ask for a code, read it from the email, exchange it for a session. */
async function logIn(name) {
  const asked = await call("/auth/v1/otp", { method: "POST", body: { email: address(name), create_user: false } });
  assert.equal(asked.status, 200, JSON.stringify(asked.body));
  const session = await call("/auth/v1/verify", { method: "POST", body: { type: "email", email: address(name), token: await emailedCode(name) } });
  assert.equal(session.status, 200, JSON.stringify(session.body));
  return session.body.access_token;
}

const people = {};
before(async () => {
  if (skip) return;
  for (const [name, roster, owner] of [["ana", "ana"], ["bo", "bo"], ["cy", "cy"], ["owner", "owner", true], ["guest", null]]) {
    people[name] = { id: await invite(name, roster, owner), roster: roster && `${roster}-${run}` };
    people[name].token = await logIn(name);
  }
});

test("an address that was never invited gets no code and no account", { skip }, async () => {
  const asked = await call("/auth/v1/otp", { method: "POST", body: { email: address("stranger"), create_user: false } });
  assert.notEqual(asked.status, 200);
  const signup = await call("/auth/v1/signup", { method: "POST", body: { email: address("stranger"), password: "not-a-real-password-1" } });
  assert.notEqual(signup.status, 200);
});

test("someone not logged in reads profiles and nothing else", { skip }, async () => {
  assert.equal((await call("/rest/v1/profile?select=roster_id")).status, 200);
  for (const table of ["member", "thread", "thread_member", "message", "block", "report"]) {
    const read = await call(`/rest/v1/${table}?select=*`);
    assert.ok(read.status >= 400 || read.body.length === 0, `${table} answered ${read.status} with rows`);
    assert.notEqual(read.status, 200, `${table} is readable without logging in`);
  }
});

test("an invited account with no roster entry can do nothing", { skip }, async () => {
  const { token } = people.guest;
  assert.deepEqual((await call("/rest/v1/member?select=user_id", { token })).body, []);
  const write = await call("/rest/v1/profile", { token, method: "POST", body: { roster_id: people.ana.roster, bio: "mine now" } });
  assert.ok(write.status >= 400);
  const start = await call("/rest/v1/rpc/start_thread", { token, method: "POST", body: { recipient: people.ana.id } });
  assert.ok(start.status >= 400);
});

test("a member writes their own profile and nobody else's", { skip }, async () => {
  const { token, roster } = people.ana;
  const own = await call("/rest/v1/profile", { token, method: "POST", prefer: "resolution=merge-duplicates", body: { roster_id: roster, bio: "Tank player.", hidden: false } });
  assert.equal(own.status, 201, JSON.stringify(own.body));
  const other = await call("/rest/v1/profile", { token, method: "POST", prefer: "resolution=merge-duplicates", body: { roster_id: people.bo.roster, bio: "defaced" } });
  assert.ok(other.status >= 400);
  const edit = await call(`/rest/v1/profile?roster_id=eq.${roster}`, { token: people.bo.token, method: "PATCH", prefer: "return=representation", body: { bio: "defaced" } });
  assert.deepEqual(edit.body, []);
  const seen = await call(`/rest/v1/profile?roster_id=eq.${roster}&select=bio,hidden`);
  assert.deepEqual(seen.body, [{ bio: "Tank player.", hidden: false }]);
});

test("a member cannot make themselves a member of anything else", { skip }, async () => {
  const { token, id } = people.ana;
  assert.ok((await call(`/rest/v1/member?user_id=eq.${id}`, { token, method: "PATCH", body: { owner: true } })).status >= 400);
  assert.ok((await call("/rest/v1/rpc/add_member", { token, method: "POST", body: { member_email: address("guest"), roster: "x" } })).status >= 400);
});

test("two members exchange messages and a third member cannot read or join them", { skip }, async () => {
  const started = await call("/rest/v1/rpc/start_thread", { token: people.ana.token, method: "POST", body: { recipient: people.bo.id } });
  assert.equal(started.status, 200, JSON.stringify(started.body));
  const thread = started.body;
  const again = await call("/rest/v1/rpc/start_thread", { token: people.bo.token, method: "POST", body: { recipient: people.ana.id } });
  assert.equal(again.body, thread, "the same two people got a second conversation");

  const sent = await call("/rest/v1/message", { token: people.ana.token, method: "POST", body: { thread_id: thread, sender: people.ana.id, body: "gg" } });
  assert.equal(sent.status, 201, JSON.stringify(sent.body));
  await call("/rest/v1/message", { token: people.bo.token, method: "POST", body: { thread_id: thread, sender: people.bo.id, body: "wp" } });
  const read = await call(`/rest/v1/message?thread_id=eq.${thread}&select=body&order=sent_at`, { token: people.bo.token });
  assert.deepEqual(read.body.map((m) => m.body), ["gg", "wp"]);

  assert.deepEqual((await call(`/rest/v1/message?thread_id=eq.${thread}&select=body`, { token: people.cy.token })).body, []);
  assert.deepEqual((await call(`/rest/v1/thread_member?thread_id=eq.${thread}&select=user_id`, { token: people.cy.token })).body, []);
  const intrude = await call("/rest/v1/message", { token: people.cy.token, method: "POST", body: { thread_id: thread, sender: people.cy.id, body: "hi" } });
  assert.ok(intrude.status >= 400);
  const join = await call("/rest/v1/thread_member", { token: people.cy.token, method: "POST", body: { thread_id: thread, user_id: people.cy.id } });
  assert.ok(join.status >= 400);
  const forged = await call("/rest/v1/message", { token: people.ana.token, method: "POST", body: { thread_id: thread, sender: people.bo.id, body: "forged" } });
  assert.ok(forged.status >= 400);
  people.thread = thread;
});

test("only an owner reads a report", { skip }, async () => {
  const message = (await call(`/rest/v1/message?thread_id=eq.${people.thread}&select=id&limit=1`, { token: people.bo.token })).body[0].id;
  const filed = await call("/rest/v1/report", { token: people.bo.token, method: "POST", body: { message_id: message, reporter: people.bo.id, reason: "test" } });
  assert.equal(filed.status, 201, JSON.stringify(filed.body));
  const outside = await call("/rest/v1/report", { token: people.cy.token, method: "POST", body: { message_id: message, reporter: people.cy.id, reason: "cannot see it" } });
  assert.ok(outside.status >= 400);
  assert.deepEqual((await call("/rest/v1/report?select=id", { token: people.bo.token })).body, []);
  assert.ok((await call("/rest/v1/report?select=id", { token: people.owner.token })).body.length >= 1);
});

test("a block stops messages both ways", { skip }, async () => {
  const blocked = await call("/rest/v1/block", { token: people.bo.token, method: "POST", body: { blocker: people.bo.id, blocked: people.ana.id } });
  assert.equal(blocked.status, 201, JSON.stringify(blocked.body));
  for (const who of ["ana", "bo"]) {
    const sent = await call("/rest/v1/message", { token: people[who].token, method: "POST", body: { thread_id: people.thread, sender: people[who].id, body: "still there?" } });
    assert.ok(sent.status >= 400, `${who} could still write`);
  }
  assert.deepEqual((await call("/rest/v1/block?select=blocked", { token: people.ana.token })).body, []);
  await call(`/rest/v1/block?blocked=eq.${people.ana.id}`, { token: people.bo.token, method: "DELETE" });
  const after = await call("/rest/v1/message", { token: people.ana.token, method: "POST", body: { thread_id: people.thread, sender: people.ana.id, body: "back" } });
  assert.equal(after.status, 201);
});
