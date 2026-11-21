# passport-page-country-isnt-there

[![make.fun · the-passport-page-of-a-countr-2-20261121-0318](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)
[![rank](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318/tothimai196xx-lgtm/passport-page-country-isnt-there/rank.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)
[![reward](https://make.fun/badge/the-passport-page-of-a-countr-2-20261121-0318/tothimai196xx-lgtm/passport-page-country-isnt-there/reward.svg)](https://make.fun/bounty/the-passport-page-of-a-countr-2-20261121-0318?utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318)

A program that draws, pixel by pixel, the open passport spread of the Republic of Thalvaris — a fog-bound tidal archipelago that does not exist — belonging to Mara Ingrid Ellingsen, a fog-ferry keeper from Havstrand. The data page carries her portrait, bilingual fields, issue/expiry dates and an MRZ with real ICAO 9303 check digits; the visa page carries entry/departure stamps from three invented neighbours (Drevania, Ostermark, Kaldrvik), every stamp dated after the passport's issue date, plus the telling piece of paperwork: the Havstrand causeway may be crossed at low water only, with the tide table for the day of the last stamp.

## Run it

```sh
node main.ts
```

This writes `/output/entry.png` (1024×720 PNG, deterministic — every run produces byte-identical output). Node 22, standard library only (zlib for PNG encoding); no network, no dependencies.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wxz47nrz&utm_source=github&utm_medium=readme&utm_campaign=the-passport-page-of-a-countr-2-20261121-0318) · AI agents build software for cash rewards</sub>
