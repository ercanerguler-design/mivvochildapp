/**
 * End-to-end smoke test of the whole Mivvo flow against a running deployment.
 * Creates a throwaway parent, pairs a fake child device, sends messages, checks alerts,
 * then deletes the account (which also exercises KVKK deletion).
 *
 * Usage: node scripts/smoke.mts https://mivvo.org
 * Note: uses the real AI analysis (a few cents) and writes to the target database briefly.
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const stamp = Date.now();
const email = `smoke-test+${stamp}@mivvo.org`;
const password = `Smoke-${stamp}-Aa1!`;

let passed = 0;
let failed = 0;
const cookies = new Map<string, string>();

function check(name: string, ok: boolean, detail = "") {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

async function call(method: string, path: string, opts: { json?: unknown; form?: Record<string, string>; token?: string; useCookies?: boolean } = {}) {
  const headers: Record<string, string> = {};
  let body: string | undefined;
  if (opts.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(opts.json);
  }
  if (opts.form) {
    headers["content-type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(opts.form).toString();
  }
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  if (opts.useCookies && cookies.size) headers.cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  const res = await fetch(`${BASE}${path}`, { method, headers, body, redirect: "manual" });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    cookies.set(pair.slice(0, i), pair.slice(i + 1));
  }
  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, location: res.headers.get("location") };
}

console.log(`Smoke test → ${BASE}\n`);

// 1. Public pages
for (const p of ["/", "/en", "/rehber", "/kvkk", "/gizlilik", "/acik-riza", "/kullanim-kosullari", "/mesafeli-satis", "/indir", "/robots.txt", "/sitemap.xml"]) {
  const r = await call("GET", p);
  check(`GET ${p}`, r.status === 200, String(r.status));
}

// 2. Registration (consent required)
const noConsent = await call("POST", "/api/auth/register", { json: { name: "Smoke Test", email, password } });
check("register rejects missing consent", noConsent.status === 400);
const reg = await call("POST", "/api/auth/register", { json: { name: "Smoke Test", email, password, acceptTerms: true, acceptConsent: true } });
check("register with consent", reg.status === 201, String(reg.status));

// 3. Mobile parent login + overview
const bad = await call("POST", "/api/mobile/parent/login", { json: { email, password: "wrong-password" } });
check("mobile login rejects wrong password", bad.status === 401);
const login = await call("POST", "/api/mobile/parent/login", { json: { email, password } });
const jwt: string = login.data?.token;
check("mobile parent login", login.status === 200 && Boolean(jwt), String(login.status));
const ov = await call("GET", "/api/mobile/parent/overview", { token: jwt });
check("parent overview", ov.status === 200 && Array.isArray(ov.data?.children), `children=${ov.data?.children?.length}, trial=${ov.data?.billing?.trialActive}`);

// 4. Pairing
const pc = await call("POST", "/api/mobile/parent/pairing-code", { token: jwt });
check("pairing code from parent app", pc.status === 200 && typeof pc.data?.code === "string");
const badPair = await call("POST", "/api/setup/pair", { json: { pairCode: "not-a-real-code", displayName: "Smoke", birthDate: "2014-01-01" } });
check("pair rejects invalid code", badPair.status === 400);
const adultPair = await call("POST", "/api/setup/pair", { json: { pairCode: pc.data?.code, displayName: "Adult", birthDate: "1990-01-01", deviceId: `smoke-adult-${stamp}` } });
check("pair rejects 18+ birth date", adultPair.status === 400);
const pair = await call("POST", "/api/setup/pair", { json: { pairCode: pc.data?.code, displayName: "Smoke Çocuk", birthDate: "2014-05-21", deviceId: `smoke-${stamp}` } });
const childId: string = pair.data?.childId;
const deviceToken: string = pair.data?.deviceToken;
check("pair child device", (pair.status === 201 || pair.status === 200) && Boolean(childId && deviceToken), String(pair.status));

// 5. Device auth
const hb = await call("POST", "/api/mobile/heartbeat", { token: deviceToken, json: { childId, deviceId: `smoke-${stamp}`, appVersion: "smoke" } });
check("heartbeat with device token", hb.status === 200, String(hb.status));
const hbBad = await call("POST", "/api/mobile/heartbeat", { token: `${deviceToken}x`, json: { childId } });
check("heartbeat rejects tampered token", hbBad.status === 401);
const actNoAuth = await call("POST", "/api/activity", { json: { childId, activities: [{ platform: "WHATSAPP", type: "MESSAGE", content: "test" }] } });
check("activity rejects missing auth", actNoAuth.status === 401);

// 6. Analysis: safe message must not alert, threat must alert
const safe = await call("POST", "/api/activity", { token: deviceToken, json: { childId, activities: [{ platform: "WHATSAPP", type: "MESSAGE", content: "Ali: kanka yarın maç kaçta başlıyo, annem 8de evde ol dedi" }] } });
check("safe message → no alert", safe.status === 200 && safe.data?.alerts === 0, `alerts=${safe.data?.alerts}`);
const risky = await call("POST", "/api/activity", { token: deviceToken, json: { childId, activities: [{ platform: "TELEGRAM", type: "MESSAGE", content: "Bilinmeyen: adresini biliyorum, yarın okul çıkışı bekliyor olcam" }] } });
check("threat message → alert", risky.status === 200 && risky.data?.alerts === 1, `alerts=${risky.data?.alerts}`);
const second = await call("POST", "/api/activity", { token: deviceToken, json: { childId, activities: [{ platform: "TELEGRAM", type: "MESSAGE", content: "Bilinmeyen: seni okulda bi yakalarsam kafanı kırarım bak görürsün" }] } });
check("second different threat → its own alert", second.status === 200 && second.data?.alerts === 1, `alerts=${second.data?.alerts}`);
const exact = await call("POST", "/api/activity", { token: deviceToken, json: { childId, activities: [{ platform: "TELEGRAM", type: "MESSAGE", content: "Bilinmeyen: adresini biliyorum, yarın okul çıkışı bekliyor olcam" }] } });
check("exact repeat → merged", exact.status === 200 && exact.data?.alerts === 0, `alerts=${exact.data?.alerts}`);
const alcohol = await call("POST", "/api/activity", { token: deviceToken, json: { childId, activities: [{ platform: "WHATSAPP", type: "MESSAGE", content: "Ahmet: alkol alır mısın", contactDisplayName: "Ahmet" }] } });
check("alcohol offer → alert", alcohol.status === 200 && alcohol.data?.alerts === 1, `alerts=${alcohol.data?.alerts}`);

const sos = await call("POST", "/api/mobile/sos", { token: deviceToken, json: { childId, latitude: 39.92077, longitude: 32.85411, accuracy: 25 } });
check("SOS from child", sos.status === 200 && sos.data?.ok === true, String(sos.status));
const sosList = await call("GET", "/api/mobile/parent/sos", { token: jwt });
check("parent sees SOS with map link", sosList.data?.events?.[0]?.mapUrl?.includes("39.920770,32.854110"), sosList.data?.events?.[0]?.mapUrl);
const sosAck = await call("PATCH", "/api/mobile/parent/sos", { token: jwt, json: { id: sosList.data?.events?.[0]?.id } });
check("parent acknowledges SOS", sosAck.status === 200);
const sosNoAuth = await call("POST", "/api/mobile/sos", { json: { childId } });
check("SOS rejects missing auth", sosNoAuth.status === 401);

// 7. Parent sees and resolves the alert
const list = await call("GET", "/api/mobile/parent/alerts?page=1", { token: jwt });
const alert = list.data?.alerts?.find((a: any) => a.originalText?.includes("adresini"));
check("parent alert list", list.status === 200 && list.data?.alerts?.length === 3, `count=${list.data?.alerts?.length}`);
check("alert category is THREAT", alert?.category === "THREAT", alert?.category);
check("alcohol alert is SUBSTANCE", list.data?.alerts?.some((a: any) => a.category === "SUBSTANCE"), list.data?.alerts?.map((a: any) => a.category).join(","));
check("alert keeps only risky fragment", typeof alert?.originalText === "string" && alert.originalText.length > 0 && alert.originalText.length <= 300);
check("alert has explanation", typeof alert?.aiExplanation === "string" && alert.aiExplanation.length > 5, alert?.aiExplanation?.slice(0, 60));
const patch = await call("PATCH", `/api/mobile/parent/alerts/${alert?.id}`, { token: jwt, json: { status: "RESOLVED" } });
check("resolve alert", patch.status === 200 && patch.data?.status === "RESOLVED", String(patch.status));
const ov2 = await call("GET", "/api/mobile/parent/overview", { token: jwt });
check("overview shows child online", ov2.data?.children?.[0]?.displayName === "Smoke Çocuk" && ov2.data?.stats?.weekTotal === 3, `weekTotal=${ov2.data?.stats?.weekTotal}`);

// 8. Web session (NextAuth credentials) → settings, checkout guard, account deletion
const csrf = await call("GET", "/api/auth/csrf", { useCookies: true });
const signIn = await call("POST", "/api/auth/callback/credentials", { useCookies: true, form: { csrfToken: csrf.data?.csrfToken, email, password, callbackUrl: `${BASE}/dashboard` } });
const session = await call("GET", "/api/auth/session", { useCookies: true });
check("web login (credentials)", session.data?.user?.email === email, `status=${signIn.status}`);
const wizard = await call("GET", "/kurulum", { useCookies: true });
check("setup wizard page", wizard.status === 200, String(wizard.status));
const wizardCode = await call("POST", "/api/setup/pairing-code", { useCookies: true });
check("setup wizard pairing code", wizardCode.status === 200 && typeof wizardCode.data?.code === "string" && wizardCode.data.code !== pc.data?.code);
const wizardStatus = await call("GET", "/api/setup/status", { useCookies: true });
check("setup wizard sees paired phone", wizardStatus.status === 200 && wizardStatus.data?.children?.[0]?.displayName === "Smoke Çocuk");
const settings = await call("GET", "/api/settings/parent", { useCookies: true });
check("dashboard settings API", settings.status === 200 && settings.data?.billing?.trial?.active === true);
const checkoutNoConsent = await call("POST", "/api/payments/checkout", { useCookies: true, json: { fullName: "Smoke Test", phone: "05000000000", city: "Ankara", address: "Test adresi 1" } });
check("checkout requires sale agreement (or iyzico off)", [400, 503].includes(checkoutNoConsent.status), String(checkoutNoConsent.status));

const delBad = await call("DELETE", "/api/account", { useCookies: true, json: { confirm: "sil" } });
check("account deletion needs exact confirmation", delBad.status === 400);
const del = await call("DELETE", "/api/account", { useCookies: true, json: { confirm: "SİL" } });
check("account deletion", del.status === 200, String(del.status));

// 9. After deletion everything is gone
const hbAfter = await call("POST", "/api/mobile/heartbeat", { token: deviceToken, json: { childId } });
check("child device cut off after deletion", hbAfter.status === 404, String(hbAfter.status));
const ovAfter = await call("GET", "/api/mobile/parent/overview", { token: jwt });
check("parent data gone after deletion", ovAfter.status === 404, String(ovAfter.status));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
