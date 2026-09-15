// Savings model for /cost-savings/. Every multiplier below is defended on the page itself,
// in the "How each number is built" table, with a link to its primary source.
// Two assumption sets: "conservative" is the default and sits below every published figure.
(function () {
  const SETS = {
    // Only the sourced figures differ between the sets. newShare, visitsYr and years have no source
    // behind them, so they are held at their conservative value in both: seven multipliers all moving
    // at once compound to a ~4.8x swing, and letting our own guesswork drive that is indefensible.
    conservative: { missed: 0.20, bookable: 0.34, lost: 0.25, newShare: 0.15, margin: 0.55, visitsYr: 2.0, years: 2, liftPP: 0.10 },
    midpoint:     { missed: 0.30, bookable: 0.34, lost: 0.40, newShare: 0.15, margin: 0.75, visitsYr: 2.0, years: 2, liftPP: 0.20 },
  };

  const $ = (id) => document.getElementById(id);
  const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const num = (v) => Math.round(v).toLocaleString("en-US");
  const pct = (v) => Math.round(v * 100) + "%";

  const calls = $("in-calls"), rev = $("in-rev"), refs = $("in-refs");
  if (!calls || !rev || !refs) return;

  const presets = document.querySelectorAll(".preset[data-calls]");
  const setBtns = document.querySelectorAll(".preset[data-set]");
  let set = "conservative";

  function read(el, fallback) {
    const v = parseFloat(el.value);
    return isFinite(v) && v >= 0 ? v : fallback;
  }

  function render() {
    const a = SETS[set];
    const nCalls = read(calls, 1500), nRev = read(rev, 150), nRefs = read(refs, 40);

    // One captured visit is worth its contribution margin, because the slot was going to sit empty
    // either way. A captured new patient is worth that margin repeated over their time with you.
    const perVisit = nRev * a.margin;
    const ltv = nRev * a.visitsYr * a.years * a.margin;

    // Lever 1: calls that never reach a person.
    const unanswered = nCalls * a.missed;
    const bookable = unanswered * a.bookable;
    const lost = bookable * a.lost;
    const lostNew = lost * a.newShare;
    const lostExisting = lost - lostNew;
    const callsMonth = lostNew * ltv + lostExisting * perVisit;

    // Lever 2: referrals worked the day they arrive instead of a week later.
    const refExtra = nRefs * a.liftPP;
    const refsMonth = refExtra * ltv;

    const year = (callsMonth + refsMonth) * 12;

    $("r-total").textContent = usd(year);
    $("r-total-sub").textContent = usd(callsMonth + refsMonth) + " a month, from " +
      num(lost + refExtra) + " visits that otherwise do not get booked";
    $("r-calls-val").textContent = usd(callsMonth * 12);
    $("r-refs-val").textContent = usd(refsMonth * 12);
    $("r-calls-sub").textContent = num(lost) + " bookings lost a month, of which " +
      num(lostNew) + " are new patients.";
    $("r-refs-sub").textContent = num(refExtra) + " more referrals a month reach a completed first visit.";

    $("r-chain").innerHTML =
      "<strong>" + num(nCalls) + "</strong> calls a month" +
      " &times; <strong>" + pct(a.missed) + "</strong> that never reach a person" +
      " = <strong>" + num(unanswered) + "</strong> missed." +
      " &times; <strong>" + pct(a.bookable) + "</strong> that were real booking opportunities" +
      " = <strong>" + num(bookable) + "</strong>." +
      " &times; <strong>" + pct(a.lost) + "</strong> who never try again" +
      " = <strong>" + num(lost) + "</strong> bookings lost a month.<br />" +
      "<strong>" + num(lostExisting) + "</strong> existing patients &times; " + usd(perVisit) +
      " contribution per visit, plus <strong>" + num(lostNew) + "</strong> new patients &times; " +
      usd(ltv) + " over " + a.years + " years = <strong>" + usd(callsMonth) + "</strong> a month.<br />" +
      "<strong>" + num(nRefs) + "</strong> referrals &times; <strong>+" + Math.round(a.liftPP * 100) +
      " points</strong> of completion = <strong>" + num(refExtra) + "</strong> more first visits &times; " +
      usd(ltv) + " = <strong>" + usd(refsMonth) + "</strong> a month.";
  }

  presets.forEach((b) => b.addEventListener("click", () => {
    presets.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    calls.value = b.dataset.calls;
    render();
  }));

  setBtns.forEach((b) => b.addEventListener("click", () => {
    setBtns.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    set = b.dataset.set;
    render();
  }));

  [calls, rev, refs].forEach((el) => el.addEventListener("input", () => {
    if (el === calls) presets.forEach((o) => o.setAttribute("aria-pressed", "false"));
    render();
  }));

  render();
})();
