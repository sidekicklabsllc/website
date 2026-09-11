// Medical answering service cost estimate. One input (practice size); assumptions are fixed and stated on the page.
(function () {
  const BASE = 330, INCLUDED = 250, OVERAGE = 1.5, MIN_PER_CALL = 2.5;
  const $ = (id) => document.getElementById(id);
  const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const buttons = document.querySelectorAll(".preset");
  if (!buttons.length) return;

  function render(calls) {
    const minutes = calls * MIN_PER_CALL;
    const over = Math.max(0, minutes - INCLUDED);
    const month = BASE + over * OVERAGE;
    $("r-calls").textContent = calls;
    $("r-minutes").textContent = Math.round(minutes).toLocaleString("en-US");
    $("r-month").textContent = usd(month);
    $("r-year").textContent = usd(month * 12);
    $("r-call").textContent = "$" + (month / calls).toFixed(2);
    $("r-note").textContent = over > 0
      ? "That is the $" + BASE + " base plan plus " + Math.round(over).toLocaleString("en-US") + " overage minutes at $" + OVERAGE.toFixed(2) + " each."
      : "That fits inside the base plan's 250 included minutes, so there is no overage.";
  }

  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    render(parseInt(b.dataset.calls, 10));
  }));
  render(100);
})();
