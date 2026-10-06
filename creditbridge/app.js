const PARTICIPATING = new Set(["AL","AK","AR","CO","FL","GA","ID","IN","IA","KS","KY","LA","MS","MO","MT","NE","NV","NH","ND","NC","OH","OK","SC","SD","TN","TX","UT","VA","WV","WY"]);
const STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];
const answers = { tax:null, status:null, state:null };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ICON = id => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;

const stateSelect = $("#state");
STATES.forEach(([code,name]) => { const o=document.createElement("option"); o.value=code; o.textContent=name+(PARTICIPATING.has(code)?"  · opted in":""); stateSelect.appendChild(o); });
const wl = $("#stateWaitlist");
STATES.forEach(([code,name]) => { const o=document.createElement("option"); o.value=name; o.textContent=name; wl.appendChild(o); });

function goTo(step) {
  $$(".step-panel").forEach(p => p.classList.toggle("active", p.dataset.step === String(step)));
  $$(".progress-step").forEach(el => {
    const n = Number(el.dataset.p);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
    el.querySelector(".dot").textContent = n < step ? "✓" : String(n);
  });
  const fill = $("#progressFill"); if (fill) fill.style.width = (step * 25) + "%";
  if (step === 4) renderResult();
}
$$(".option").forEach(btn => btn.addEventListener("click", () => {
  answers[btn.dataset.key] = btn.dataset.val;
  btn.parentElement.querySelectorAll(".option").forEach(b => { b.classList.remove("selected"); b.setAttribute("aria-pressed","false"); });
  btn.classList.add("selected"); btn.setAttribute("aria-pressed","true");
  if (btn.dataset.key === "tax") $("#next1").disabled = false;
  if (btn.dataset.key === "status") $("#next2").disabled = false;
}));
stateSelect.addEventListener("change", () => { answers.state = stateSelect.value || null; $("#next3").disabled = !answers.state; });
$("#next1").addEventListener("click", () => goTo(2));
$("#next2").addEventListener("click", () => goTo(3));
$("#next3").addEventListener("click", () => goTo(4));
$$("[data-back]").forEach(b => b.addEventListener("click", () => goTo(Number(b.dataset.back))));
$("#restart").addEventListener("click", () => {
  answers.tax = answers.status = answers.state = null;
  $$(".option").forEach(o => { o.classList.remove("selected"); o.setAttribute("aria-pressed","false"); });
  stateSelect.value = "";
  $("#next1").disabled = true; $("#next2").disabled = true; $("#next3").disabled = true;
  goTo(1);
});

function renderResult() {
  const { tax, status, state } = answers;
  const opted = PARTICIPATING.has(state);
  const stateName = STATES.find(s => s[0] === state)[1];
  let cls="good", kicker="Looks promising", title="You may be able to use this credit", body="", icon="i-check";
  if (tax === "no") { cls="bad"; icon="i-zero"; kicker="Likely not a fit right now"; title="This credit needs a tax bill to reduce"; body="<p>The Federal Scholarship Tax Credit is <strong>nonrefundable</strong>. If you owe $0 in federal income tax, a gift generally will not come back as a refund. Unused credit may carry forward up to 5 years if you later owe tax.</p>"; }
  else if (tax === "maybe") { cls="warn"; icon="i-q"; kicker="Possibly — depends on your tax bill"; title="Confirm your 2027 liability first"; body="<p>If you end up owing federal income tax for 2027, you may be able to use up to <strong>$1,700</strong> of credit for a qualifying cash gift to an eligible SGO.</p>"; }
  else { body="<p>If you owe federal income tax, a qualifying cash gift of up to <strong>$1,700</strong> to an eligible SGO (on or after Jan 1, 2027) may reduce that tax dollar-for-dollar, subject to limits and offsets.</p>"; }
  body += status === "mfj"
    ? "<p><strong>Married filing jointly:</strong> Proposed IRS rules (Oct 2026) would allow up to <strong>$3,400</strong> total if <em>each</em> spouse makes up to $1,700 of qualifying gifts. That reading is proposed, not final.</p>"
    : "<p><strong>Filing status:</strong> Plan around the <strong>$1,700</strong> per-taxpayer cap unless final rules say otherwise.</p>";
  body += opted
    ? `<p><strong>${stateName}</strong> has made an advance election to participate for 2027 (IRS list as of Sep 14, 2026).</p>`
    : `<p><strong>${stateName}</strong> is <em>not</em> on the IRS advance-election list as of Sep 14, 2026. You may still claim a credit for gifts to SGOs in participating states.</p>`;
  body += `<p class="muted-2" style="margin-bottom:0;">Not tax advice. Verify before you give.</p>`;
  $("#resultCard").innerHTML = `<div class="result-card ${cls}"><div class="result-kicker">${ICON(icon)}${kicker}</div><h3 class="result-title">${title}</h3><div class="result-body">${body}</div><div class="result-chips"><span class="chip ${tax==='yes'?'on':tax==='maybe'?'':'off'}">Tax liability: ${tax==='yes'?'Yes':tax==='maybe'?'Unsure':'No'}</span><span class="chip on">${status==='mfj'?'Married filing jointly':'Individual filer'}</span><span class="chip ${opted?'on':'off'}">${stateName}${opted?' · opted in':' · not opted in'}</span></div></div>`;
}

/* Header state + active nav */
const header = $(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll(); window.addEventListener("scroll", onScroll, { passive:true });
if ("IntersectionObserver" in window) {
  const links = new Map($$(".nav-links a[href^='#']").map(a => [a.getAttribute("href").slice(1), a]));
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove("active")); const a = links.get(e.target.id); if (a && !a.classList.contains("nav-cta")) a.classList.add("active"); } });
  }, { rootMargin:"-45% 0px -50% 0px" });
  ["flow","checker","how","faq","notify"].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });
}

/* Reveal on scroll — content is always visible without JS */
(function enableReveals(){
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = $$(".reveal");
  $$(".steps-grid, .hero-copy").forEach(group => $$(".reveal", group).forEach((n, i) => n.style.setProperty("--d", (i * 0.08) + "s")));
  if (reduce || !("IntersectionObserver" in window)) { nodes.forEach(n => n.classList.add("is-visible")); return; }
  document.documentElement.classList.add("motion-ready");
  const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  nodes.forEach(n => { const r=n.getBoundingClientRect(); if (r.top < window.innerHeight*0.95 && r.bottom>0) n.classList.add("is-visible"); else io.observe(n); });
})();

if (new URLSearchParams(location.search).get("demo") === "1") {
  answers.tax="yes"; answers.status="mfj"; answers.state="FL"; stateSelect.value="FL";
  goTo(4); history.replaceState(null,"",location.pathname); 
}

document.getElementById("notifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("#notifyMsg");
  const btn = $("#notifyBtn");
  const show = (text, kind) => { msg.hidden = false; msg.className = "notify-msg" + (kind ? " " + kind : ""); msg.textContent = text; };
  show("Submitting…"); btn.disabled = true;
  try {
    const res = await fetch(e.target.action, { method:"POST", body:new FormData(e.target), headers:{ Accept:"application/json" } });
    const json = await res.json().catch(() => ({}));
    if (res.ok && String(json.success) !== "false") { show("You’re on the list. We’ll email you when qualifying gifts can begin.", "ok"); e.target.reset(); }
    else { show(json.message || "Something went wrong. Please try again.", "err"); }
  } catch (err) { show("Network error. Please try again.", "err"); }
  finally { btn.disabled = false; }
});
