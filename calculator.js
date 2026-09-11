// Medical answering service cost calculator. Pure client-side; no data leaves the page.
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $("calc");
  if (!form) return;

  const num = (id) => {
    const v = parseFloat($(id).value);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  };
  const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const usd2 = (v) => "$" + (Math.round(v * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function model() {
    return form.querySelector('input[name="model"]:checked').value;
  }

  function calc() {
    const calls = num("calls");
    const avgMin = num("minutes");
    const cycles = Math.min(13, Math.max(1, num("cycles") || 12));
    const setup = num("setup");
    const auto = num("auto");

    const minutes = calls * avgMin;
    let humanMonth = 0;
    let over = 0;
    let breakdown = "";

    if (model() === "minute") {
      const base = num("base");
      const included = num("included");
      const rate = num("overage");
      over = Math.max(0, minutes - included);
      humanMonth = base + over * rate;
      breakdown = usd(base) + " base + " + Math.round(over) + " min x " + usd2(rate);
      $("r-overage-note").textContent = included + " included";
    } else {
      const base = num("base-call");
      const rate = num("per-call");
      humanMonth = base + calls * rate;
      breakdown = usd(base) + " base + " + calls + " calls x " + usd2(rate);
      $("r-overage-note").textContent = "per-call plan, no bucket";
    }

    const humanYear = humanMonth * cycles + setup;
    const autoYear = auto * 12;
    const saveYear = humanYear - autoYear;
    const saveMonth = saveYear / 12;
    const pct = humanYear > 0 ? Math.round((saveYear / humanYear) * 100) : 0;
    const three = humanMonth * cycles * 3 + setup - auto * 36;

    $("r-minutes").textContent = Math.round(minutes).toLocaleString("en-US");
    $("r-over").textContent = Math.round(over).toLocaleString("en-US");
    $("r-human-month").textContent = usd(humanMonth);
    $("r-human-breakdown").textContent = breakdown;
    $("r-human-year").textContent = usd(humanYear);
    $("r-human-call").textContent = calls > 0 ? usd2(humanMonth / calls) : "n/a";
    $("r-auto-year").textContent = usd(autoYear);
    $("r-auto-call").textContent = calls > 0 ? usd2(auto / calls) : "n/a";
    $("r-three").textContent = (three < 0 ? "-" : "") + usd(Math.abs(three));

    const big = $("save-year");
    big.textContent = usd(Math.abs(saveYear));
    $("save-month").textContent = usd(Math.abs(saveMonth));
    $("save-pct").textContent = Math.abs(pct) + "%";
    big.closest(".result-big").querySelector(".label").textContent =
      saveYear < 0 ? "Estimated annual extra cost" : "Estimated annual savings";
    big.closest(".result-big").querySelector(".sub").lastChild.textContent =
      saveYear < 0 ? " more than the human service" : " less than the human service";
  }

  function syncModel() {
    const m = model();
    $("minute-fields").hidden = m !== "minute";
    $("call-fields").hidden = m !== "call";
    calc();
  }

  function syncPresets() {
    const calls = num("calls");
    form.querySelectorAll(".preset").forEach((b) => {
      b.setAttribute("aria-pressed", String(parseFloat(b.dataset.calls) === calls));
    });
  }

  form.querySelectorAll(".preset").forEach((b) => {
    b.addEventListener("click", () => {
      $("calls").value = b.dataset.calls;
      syncPresets();
      calc();
    });
  });
  form.querySelectorAll('input[name="model"]').forEach((r) => r.addEventListener("change", syncModel));
  form.addEventListener("input", (e) => {
    if (e.target.id === "calls") syncPresets();
    calc();
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  syncPresets();
  syncModel();
})();
