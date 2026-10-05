const PARTICIPATING = new Set(["AL","AK","AR","CO","FL","GA","ID","IN","IA","KS","KY","LA","MS","MO","MT","NE","NV","NH","ND","NC","OH","OK","SC","SD","TN","TX","UT","VA","WV","WY"]);
const STATES = [["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]];
const answers = { tax:null, status:null, state:null };
const stateSelect = document.getElementById("state");
STATES.forEach(([code,name]) => { const o=document.createElement("option"); o.value=code; o.textContent=name+(PARTICIPATING.has(code)?"  · opted in":""); stateSelect.appendChild(o); });
const wl = document.getElementById("stateWaitlist");
STATES.forEach(([code,name]) => { const o=document.createElement("option"); o.value=name; o.textContent=name; wl.appendChild(o); });
function goTo(step) {
  document.querySelectorAll(".step-panel").forEach(p => p.classList.toggle("active", p.dataset.step === String(step)));
  document.querySelectorAll(".progress-step").forEach(el => {
    const n = Number(el.dataset.p);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
    el.querySelector(".dot").textContent = n < step ? "✓" : String(n);
  });
  if (step === 4) renderResult();
}
document.querySelectorAll(".option").forEach(btn => btn.addEventListener("click", () => {
  answers[btn.dataset.key] = btn.dataset.val;
  btn.parentElement.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  if (btn.dataset.key === "tax") document.getElementById("next1").disabled = false;
  if (btn.dataset.key === "status") document.getElementById("next2").disabled = false;
}));
stateSelect.addEventListener("change", () => { answers.state = stateSelect.value || null; document.getElementById("next3").disabled = !answers.state; });
document.getElementById("next1").addEventListener("click", () => goTo(2));
document.getElementById("next2").addEventListener("click", () => goTo(3));
document.getElementById("next3").addEventListener("click", () => goTo(4));
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => goTo(Number(b.dataset.back))));
document.getElementById("restart").addEventListener("click", () => {
  answers.tax = answers.status = answers.state = null;
  document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
  stateSelect.value = "";
  document.getElementById("next1").disabled = true;
  document.getElementById("next2").disabled = true;
  document.getElementById("next3").disabled = true;
  goTo(1);
});
function renderResult() {
  const { tax, status, state } = answers;
  const opted = PARTICIPATING.has(state);
  const stateName = STATES.find(s => s[0] === state)[1];
  let cls="good", kicker="Looks promising", title="You may be able to use this credit", body="";
  if (tax === "no") { cls="bad"; kicker="Likely not a fit right now"; title="This credit needs a tax bill to reduce"; body="<p>The Federal Scholarship Tax Credit is <strong>nonrefundable</strong>. If you owe $0 in federal income tax, a gift generally will not come back as a refund. Unused credit may carry forward up to 5 years if you later owe tax.</p>"; }
  else if (tax === "maybe") { cls="warn"; kicker="Possibly — depends on your tax bill"; title="Confirm your 2027 liability first"; body="<p>If you end up owing federal income tax for 2027, you may be able to use up to <strong>$1,700</strong> of credit for a qualifying cash gift to an eligible SGO.</p>"; }
  else { body="<p>If you owe federal income tax, a qualifying cash gift of up to <strong>$1,700</strong> to an eligible SGO (on or after Jan 1, 2027) may reduce that tax dollar-for-dollar, subject to limits and offsets.</p>"; }
  body += status === "mfj"
    ? "<p><strong>Married filing jointly:</strong> Proposed IRS rules (Oct 2026) would allow up to <strong>$3,400</strong> total if <em>each</em> spouse makes up to $1,700 of qualifying gifts. That reading is proposed, not final.</p>"
    : "<p><strong>Filing status:</strong> Plan around the <strong>$1,700</strong> per-taxpayer cap unless final rules say otherwise.</p>";
  body += opted
    ? `<p><strong>${stateName}</strong> has made an advance election to participate for 2027 (IRS list as of Sep 14, 2026).</p>`
    : `<p><strong>${stateName}</strong> is <em>not</em> on the IRS advance-election list as of Sep 14, 2026. You may still claim a credit for gifts to SGOs in participating states.</p>`;
  body += `<p class="muted-2" style="margin-bottom:0;">Not tax advice. Verify before you give.</p>`;
  document.getElementById("resultCard").innerHTML = `<div class="result-card ${cls}"><div class="result-kicker">${kicker}</div><h3 class="result-title">${title}</h3><div class="result-body">${body}</div><div class="result-chips"><span class="chip ${tax==='yes'?'on':tax==='maybe'?'':'off'}">Tax liability: ${tax==='yes'?'Yes':tax==='maybe'?'Unsure':'No'}</span><span class="chip on">${status==='mfj'?'Married filing jointly':'Individual filer'}</span><span class="chip ${opted?'on':'off'}">${stateName}${opted?' · opted in':' · not opted in'}</span></div></div>`;
}
(function enableReveals(){
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) { nodes.forEach(n => n.classList.add("is-visible")); return; }
  document.documentElement.classList.add("motion-ready");
  const io = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  nodes.forEach(n => { const r=n.getBoundingClientRect(); if (r.top < window.innerHeight*0.95 && r.bottom>0) n.classList.add("is-visible"); else io.observe(n); });
  setTimeout(() => nodes.forEach(n => n.classList.add("is-visible")), 900);
})();
if (new URLSearchParams(location.search).get("demo") === "1") {
  answers.tax="yes"; answers.status="mfj"; answers.state="FL"; stateSelect.value="FL";
  document.querySelectorAll(".reveal").forEach(n => n.classList.add("is-visible"));
  goTo(4); history.replaceState(null,"",location.pathname+location.search); window.scrollTo(0,0);
}
document.getElementById("notifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("notifyMsg");
  const btn = document.getElementById("notifyBtn");
  msg.style.display = "block"; msg.textContent = "Submitting…"; btn.disabled = true;
  try {
    const res = await fetch(e.target.action, { method:"POST", body:new FormData(e.target), headers:{ Accept:"application/json" } });
    const json = await res.json().catch(() => ({}));
    if (res.ok) { msg.textContent = "You’re on the list. Check your inbox for a confirmation if asked. Launch updates go to the site owner."; e.target.reset(); }
    else { msg.textContent = json.message || "Something went wrong. Please try again."; }
  } catch (err) { msg.textContent = "Network error. Please try again."; }
  finally { btn.disabled = false; }
});
