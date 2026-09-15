# Sourcing record for /cost-savings/

Research done 2026-09-15. This file exists so any figure on the savings page can be challenged and
traced. If a number on the page is not defended here, it should not be on the page.

The scripts skip `docs/`, so nothing here is published or sitemapped.

## Why this page is built the way it is

The savings-page category runs on four numbers that have no research behind them. We chased each to
its origin:

| Claim | Origin |
|---|---|
| "$200 per empty appointment slot" | April 2017 op-ed in *Health Management Technology* by the CMO of scheduling vendor SCI Solutions. No study, no method, no footnote. |
| "$150 billion a year" | Same op-ed. |
| "Practices miss 42% of calls (7,000 calls, 22 practices, 18 states)" | A LinkedIn post by Zed Williamson. No institution or methodology. notifyMD and dozens of downstream blogs cite the post as if it were a study. |
| "85% never call back" / "67% hang up at voicemail and call a competitor" | Vendor blogs citing vendor blogs. The "67%" is attributed to a Dialog Health study that does not appear to exist. |
| "$821K-$971K lost per physician to referral leakage" | Dialog Health cites WebMD Ignite; WebMD Ignite states it uncited and undated; a ProQuest-indexed piece attributes it to ReferralMD, itself a referral vendor, which repeats it uncited. Dead end. |
| "41-48% of patient calls come after hours" | Exists only in uncited vendor copy. Zocdoc's ~50% is *online bookings*, a self-selected 24/7 channel, not phone traffic. |
| A day-by-day referral conversion decay curve | No US peer-reviewed study plots conversion against days-to-first-contact. Vendor versions ("84% at half a day, 50-60% by day 3-5") cite nothing. |

A claimed "2024 Pew survey" on voicemail avoidance also surfaced in search and appears fabricated.

**Two findings that cut against our own pitch, and are reflected on the page:**

1. One-way reminders barely move no-shows. A centralized phone reminder system moved no-shows from
   16.3% to 15.2% (1.1pp), mailed reminders were non-significant, and Cochrane puts SMS at RR 1.14.
   Phone and SMS are statistically indistinguishable. Any claim above ~2pp from reminders alone is
   unsupportable. The page makes no reminder claim and says so in "Numbers we will not use."
2. Waitlist backfill acceptance is 11%, not the 80% vendors claim. The page states 11% openly.

## Figures used on the page

| Used for | Figure | Source | Tier |
|---|---|---|---|
| Calls not reaching a person | 31% of 11,552,668 calls at 8,280 **dental and DSO** locations | [Patient Prism 2025](https://www.patientprism.com/report/dental-patient-access-report/) | vendor platform data, large N, stated method |
| same, corroboration (healthcare-wide) | ~29% | Invoca 2024 | vendor platform data |
| same, peer-reviewed floor | in-queue abandonment 12.0% -> 8.3%, 285 facilities | [AJMC 2020](https://www.ajmc.com/view/call-center-performance-affects-patient-perceptions-of-access-and-satisfaction) | peer-reviewed (narrower metric) |
| Bookable share of calls | 34 of every 100 calls were booking opportunities; 21 became appointments | Patient Prism 2025 | vendor platform data |
| Callers who never retry | 21% immediately call another business | [CallRail 2025, n=1,000](https://www.callrail.com/blog/missed-calls-cost-businesses-more-than-ever) | vendor survey, stated N; general consumers, not patients |
| Contribution margin | overhead ~60% of revenue | [MGMA](https://www.mgma.com/articles/24-strategies-to-grow-revenue-and-control-costs-in-your-medical-practice) | association |
| same, marginal-slot logic | VA study counted full encounter as loss because staff costs stayed constant | [BMC Health Serv Res 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4714455/) | peer-reviewed |
| Revenue per visit anchors | 99213 $95.19, 99214 $135.61, 99204 $177.36 (2026 non-facility) | CMS MPFS | government |
| Patient tenure | 30% picked a new provider in one year; 25% switched on dissatisfaction | [Accenture 2022, n=10,000](https://www.healthcaredive.com/news/patients-switching-providers-genz-millenial-accenture/641866/) | industry survey |
| Referral completion baseline | 34.8% of 103,737 scheduling attempts completed; 38.9% never got a date | [JGIM 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5910374/) | peer-reviewed |
| Referral time decay | completed 20.1 days vs incomplete 41.7 days mean wait; distance 8.1 vs 8.6 mi | JGIM 2018 | peer-reviewed |
| same | delay's damage concentrated in week one, stabilizes after day 7 | [Psychiatric Services 2005](https://psychiatryonline.org/doi/10.1176/appi.ps.56.3.344) | peer-reviewed (the "12%/day" coefficient is from secondary summaries, paywalled, unverified) |
| Lead-time vs no-show | 9.1% at 0-2 weeks vs 38.3% at 6 months, 46,655 appts | [Clin Ophthalmol 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4370946/) | peer-reviewed |
| Outreach lift | scheduling 54% -> 83% (+29pp), 40,487 referrals | [JGIM 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2686771/) | peer-reviewed |
| Wait times | 31-day average, 15 metros, 1,391 offices, +48% since 2004 | [AMN Healthcare 2025](https://www.amnhealthcare.com/amn-insights/physician/whitepapers/2025-survey-of-physician-appointment-wait-times/) | industry survey |
| Cancellation backfill | 27% of canceled visits rebooked within 30 days in 2024, down from ~62% | [MGMA 2026](https://www.mgma.com/articles/designing-backfill-and-overbooking-by-specialty) | association |
| same | 11% of 60,660 offers accepted; 5,399 completed visits; ~$3M fees / 9 months; median 14 days sooner | [JMIR 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10988365/) | peer-reviewed |
| Incumbent phone cost | $7-$10 per answered call, +$1.50 for booking | [Smith.ai pricing](https://smith.ai/pricing) | published rate card (most verifiable figure on the page) |
| Front-desk FTE | median $45,930 (May 2025); benefits 30.0% of total comp -> ~$65,600 loaded | [BLS OOH](https://www.bls.gov/ooh/office-and-administrative-support/secretaries-and-administrative-assistants.htm), [BLS ECEC](https://www.bls.gov/news.release/ecec.nr0.htm) | government |
| Marketing already spent | CPL $62.80 family medicine, $84.77 general dentistry, $66.02 healthcare, 3,542 campaigns | [LocaliQ 2025](https://localiq.com/blog/healthcare-search-advertising-benchmarks/) | vendor campaign data, medians, stated method |
| Documentation liability | documentation failure in 88% of telephone claims; avg indemnity $518,932 | [JGIM 2008](https://pubmed.ncbi.nlm.nih.gov/18228110/) | peer-reviewed |
| Referral leakage scale | 43% of execs lose >10% of revenue, 19% lose >20% | [Sage Growth Partners 2018, n=104](https://www.healthcaredive.com/press-release/20181101-87-of-healthcare-execs-say-patient-leakage-is-a-priority-yet-almost-a-qua/) | industry survey |

## Correction made 2026-09-15 after review

The model originally used **58% as "callers who never try again," sourced to CallRail.** That was an
overreach: CallRail measured *"58% do not leave a voicemail,"* which is not the same as never calling
back, and its 78%/82% figures are lifetime-ever and stated-intent, not per-call probabilities. The
only figure in that survey that measures this call being lost is **21% immediately call another
business**. The model now uses **15% conservative / 21% midpoint**: midpoint is exactly the measured
figure and claims nothing above it, conservative sits below it.

At the same time, the two assumption sets were moving **seven multipliers at once**, compounding to a
4.79x spread between Conservative and Midpoint even though no single parameter moved more than 1.39x.
Worse, 1.65x of that swing came from the three assumptions tagged "ours," which have no source at
all. Those three (new-patient share, visits per year, years retained) are now **held at their
conservative value in both sets**, so the toggle only ever moves figures that have a source.

Result: Conservative $37,803 / Midpoint $106,094 at the default inputs, a 2.81x spread. The remaining
spread is the genuine width of the published evidence (missed-call rate 1.35x, never-retry 1.42x,
contribution margin 1.36x, referral lift 1.30x) and cannot honestly be compressed further. A
regression test asserts the spread stays under 3.5x.

## Assumptions that are ours, not sourced

Labeled on the page with the "ours" tag and held constant across both assumption sets. They are also
**editable in place**: each is rendered as a number input in the row that cites it, so a reader can
dial in their own figure rather than take ours. The values below are the defaults, chosen as floors.
No dataset exists for any of them:

- Share of lost bookings that are new patients (15%)
- Visits per patient per year (2.0)
- Years a new patient stays (2) - informed by Accenture's 30%/yr switching, which implies 3-4 years,
  well short of the 7-10 that vendor LTV pages use
- That unanswered calls contain the same 34% share of booking opportunities as answered ones

## Correction made 2026-09-15 (second pass)

The Patient Prism 31% comes from the **Dental Patient Access Report**: 8,280 dental and DSO
locations. Three pages had dropped the word "dental", which silently promoted dental data to a claim
about medical practices. All three now name the population, and lean on Invoca's ~29% (healthcare
generally) for the medical read. Two further overstatements in the homepage strip were fixed at the
same time: "most of them were trying to book" became "about a third" (the source says 34 of every 100
calls were booking opportunities, which is not "most"), and "every assumption sourced" became "every
figure either traced to a primary source or labelled as our own assumption", since the page itself
tags three assumptions as unsourced.

## Known gaps

No credible source exists for: the share of practice *phone* calls arriving after hours; healthcare-
specific voicemail abandonment; a peer-reviewed or association patient LTV; a current national
patient-tenure figure; referral coordinator throughput or backlog size; why patients switch
specifically because nobody called them back; and any controlled study of AI outbound referral
outreach. MGMA per-encounter revenue ($150 primary care / $233 specialty) is widely attributed but
the edition is unstated and the data is paywalled in DataDive, so the page asks the visitor for
their own revenue per visit instead of asserting one.

## Changes made to other pages on 2026-09-15

The debunked 42%-of-calls figure was live on two pages and has been replaced with the Patient Prism
and CallRail figures:

- `answering-service-cost-calculator/index.html` - "Why the calls matter more than the fee"
- `after-hours-answering-service-for-medical-offices/index.html` - opening paragraph and the
  voicemail section

**Outbound links to competitors were removed site-wide**, keeping the attribution text so claims stay
checkable. De-linked: Patient Prism, CallRail, Smith.ai, Ambs, MAP Communications, PATLive, Helpware.
Links kept: government (BLS, CMS), peer-reviewed journals, MGMA, trade press, and LocaliQ and AMN
Healthcare, none of which compete with Samantha. The source URLs stay in the table above because this
file is never served.

**`/answering-service-cost-calculator/` was dropped.** Its premise was citing competitor rate cards,
which stopped being verifiable once those links came out, and the cost-savings page already carries
the front-desk FTE and per-call comparison. The URL now holds a redirect stub to `/cost-savings/`;
`calculator.js` was deleted. `scripts/audit.py` was taught to recognise redirect stubs and to check
that their target resolves.
