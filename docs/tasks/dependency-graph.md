# Dependency Graph

> **PROVISIONAL** — every task additionally depends on gate **G0** (OD-01 + design/ADR approval), which is not drawn.

Source of truth: the `Dependencies` field of each task file. The graphs below were generated from those fields and checked mechanically: **88 tasks, 0 missing references, 0 cycles**, every `Blocks` list equals the reverse of the dependencies.

## 1. Feature-level overview

```mermaid
flowchart TD
    G0{{"G0 approval gate<br/>OD-01, design + ADRs"}}
    TOOL["Tooling & conventions<br/>401–403"]
    LIB["Shared core lib<br/>404–405"]
    DOM["Domain primitives<br/>money 406–407 · dates 408"]
    DB["Database foundation<br/>409–413"]
    ST["State foundation<br/>414–415"]
    UI["Theme + UI kit<br/>416–419"]
    NAV["Routes, gate, onboarding<br/>420–423"]
    CP4(["Phase 4 checkpoint 424"])
    TXC["Transaction core<br/>501–505"]
    TXUI["Transaction UI & workflows<br/>506–511"]
    CP5(["Phase 5 checkpoint 512"])
    AGG["Aggregates + calculators<br/>601–603"]
    DASH["Dashboard + reports<br/>604–607"]
    CP6(["Phase 6 checkpoint 608"])
    BUD["Budgets<br/>701–707"]
    GOAL["Goals<br/>708–715"]
    CP7(["Phase 7 checkpoint 716"])
    RENG["Recommendation domain<br/>801–807"]
    RUI["Recommendation delivery<br/>808–810"]
    CP8(["Phase 8 checkpoint 811"])
    SET["Settings, privacy, delete<br/>901–904"]
    EXP["Export<br/>905–906"]
    PROT["Backup exclusion<br/>907–908"]
    HARD["A11y, performance, migration<br/>909–911"]
    REL["Device verification + release<br/>912–917"]

    G0 --> TOOL --> LIB --> DOM
    LIB --> DB
    DOM --> DB
    LIB --> ST --> UI --> NAV
    DB --> NAV
    NAV --> CP4
    DB --> TXC
    DOM --> TXC
    NAV --> TXC
    TXC --> TXUI --> CP5
    TXC --> AGG
    DOM --> AGG
    AGG --> DASH
    TXUI --> DASH --> CP6
    DOM --> BUD
    AGG --> BUD
    DOM --> GOAL
    AGG --> GOAL
    DASH --> BUD
    BUD --> GOAL
    BUD --> CP7
    GOAL --> CP7
    CP6 --> CP7
    BUD --> RENG
    GOAL --> RENG
    RENG --> RUI
    AGG --> RUI
    CP7 --> CP8
    RUI --> CP8
    NAV --> SET
    DASH --> SET
    RUI --> SET
    DB --> EXP
    SET --> EXP
    EXP --> SET
    NAV --> PROT
    CP8 --> HARD
    SET --> HARD
    EXP --> HARD
    HARD --> REL
    PROT --> REL
```

Notes on the overview: arrows summarise task-level edges. `SET ↔ EXP` is not a cycle at task level: TASK-905 → TASK-906 → TASK-904 (delete-all reuses the export temp-file cleanup) while TASK-901 → TASK-906.

## 2. Task-level graphs by phase

Legend: teal = CRITICAL, red = task-specific BLOCKED (OD/DG/external), grey rounded = prerequisite from another phase.
<!--MERMAID-->
### Phase 4 — Foundation

```mermaid
flowchart LR
    TASK401["TASK-401<br/>Layer lint rules"]
    TASK402["TASK-402<br/>Test tooling"]
    TASK403["TASK-403<br/>Unused deps cleanup"]:::blocked
    TASK404["TASK-404<br/>Result, IDs, Clock"]:::critical
    TASK405["TASK-405<br/>Errors + logger"]:::critical
    TASK406["TASK-406<br/>Money core"]:::critical
    TASK407["TASK-407<br/>Money parse/format"]:::critical
    TASK408["TASK-408<br/>Calendar dates"]:::critical
    TASK409["TASK-409<br/>Db adapter + connection"]:::critical
    TASK410["TASK-410<br/>SQLite test harness"]:::blocked
    TASK411["TASK-411<br/>Migration runner"]:::blocked
    TASK412["TASK-412<br/>Baseline schema 0001"]:::blocked
    TASK413["TASK-413<br/>Repository helpers"]:::critical
    TASK414["TASK-414<br/>Core stores"]
    TASK415["TASK-415<br/>useServiceQuery"]
    TASK416["TASK-416<br/>Theme tokens"]
    TASK417["TASK-417<br/>Layout/action UI"]
    TASK418["TASK-418<br/>Feedback UI"]
    TASK419["TASK-419<br/>Value display UI"]
    TASK420["TASK-420<br/>Routes + tabs"]:::blocked
    TASK421["TASK-421<br/>DatabaseGate"]:::blocked
    TASK422["TASK-422<br/>Profile + onboarding"]:::critical
    TASK423["TASK-423<br/>Retire draft code"]
    TASK424["TASK-424<br/>Phase 4 checkpoint"]
    TASK423 --> TASK403
    TASK401 --> TASK404
    TASK404 --> TASK405
    TASK404 --> TASK406
    TASK405 --> TASK406
    TASK406 --> TASK407
    TASK402 --> TASK408
    TASK404 --> TASK408
    TASK405 --> TASK409
    TASK402 --> TASK410
    TASK409 --> TASK410
    TASK409 --> TASK411
    TASK410 --> TASK411
    TASK411 --> TASK412
    TASK405 --> TASK413
    TASK406 --> TASK413
    TASK410 --> TASK413
    TASK412 --> TASK413
    TASK404 --> TASK414
    TASK405 --> TASK414
    TASK406 --> TASK414
    TASK404 --> TASK415
    TASK405 --> TASK415
    TASK414 --> TASK415
    TASK414 --> TASK416
    TASK416 --> TASK417
    TASK405 --> TASK418
    TASK414 --> TASK418
    TASK417 --> TASK418
    TASK407 --> TASK419
    TASK417 --> TASK419
    TASK417 --> TASK420
    TASK418 --> TASK420
    TASK411 --> TASK421
    TASK412 --> TASK421
    TASK414 --> TASK421
    TASK418 --> TASK421
    TASK420 --> TASK421
    TASK412 --> TASK422
    TASK413 --> TASK422
    TASK414 --> TASK422
    TASK415 --> TASK422
    TASK419 --> TASK422
    TASK421 --> TASK422
    TASK420 --> TASK423
    TASK421 --> TASK423
    TASK422 --> TASK423
    TASK401 --> TASK424
    TASK402 --> TASK424
    TASK404 --> TASK424
    TASK405 --> TASK424
    TASK406 --> TASK424
    TASK407 --> TASK424
    TASK408 --> TASK424
    TASK409 --> TASK424
    TASK410 --> TASK424
    TASK411 --> TASK424
    TASK412 --> TASK424
    TASK413 --> TASK424
    TASK414 --> TASK424
    TASK415 --> TASK424
    TASK416 --> TASK424
    TASK417 --> TASK424
    TASK418 --> TASK424
    TASK419 --> TASK424
    TASK420 --> TASK424
    TASK421 --> TASK424
    TASK422 --> TASK424
    TASK423 --> TASK424
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```

### Phase 5 — Transactions

```mermaid
flowchart LR
    TASK405(["TASK-405<br/>Errors + logger"]):::ext
    TASK407(["TASK-407<br/>Money parse/format"]):::ext
    TASK408(["TASK-408<br/>Calendar dates"]):::ext
    TASK412(["TASK-412<br/>Baseline schema 0001"]):::ext
    TASK413(["TASK-413<br/>Repository helpers"]):::ext
    TASK414(["TASK-414<br/>Core stores"]):::ext
    TASK415(["TASK-415<br/>useServiceQuery"]):::ext
    TASK417(["TASK-417<br/>Layout/action UI"]):::ext
    TASK418(["TASK-418<br/>Feedback UI"]):::ext
    TASK419(["TASK-419<br/>Value display UI"]):::ext
    TASK420(["TASK-420<br/>Routes + tabs"]):::ext
    TASK422(["TASK-422<br/>Profile + onboarding"]):::ext
    TASK501["TASK-501<br/>Categories + methods"]:::critical
    TASK502["TASK-502<br/>Txn domain + schema"]:::blocked
    TASK503["TASK-503<br/>Txn repo CRUD"]:::critical
    TASK504["TASK-504<br/>History query"]:::blocked
    TASK505["TASK-505<br/>Txn service"]:::critical
    TASK506["TASK-506<br/>Input primitives"]:::blocked
    TASK507["TASK-507<br/>Txn form"]:::critical
    TASK508["TASK-508<br/>Add txn workflow"]:::critical
    TASK509["TASK-509<br/>Detail/edit/delete"]
    TASK510["TASK-510<br/>Filters"]:::blocked
    TASK511["TASK-511<br/>History screen"]
    TASK512["TASK-512<br/>Phase 5 checkpoint"]
    TASK412 --> TASK501
    TASK413 --> TASK501
    TASK405 --> TASK502
    TASK407 --> TASK502
    TASK408 --> TASK502
    TASK501 --> TASK502
    TASK412 --> TASK503
    TASK413 --> TASK503
    TASK502 --> TASK503
    TASK503 --> TASK504
    TASK408 --> TASK504
    TASK414 --> TASK505
    TASK422 --> TASK505
    TASK501 --> TASK505
    TASK502 --> TASK505
    TASK503 --> TASK505
    TASK407 --> TASK506
    TASK408 --> TASK506
    TASK417 --> TASK506
    TASK419 --> TASK506
    TASK418 --> TASK507
    TASK419 --> TASK507
    TASK501 --> TASK507
    TASK502 --> TASK507
    TASK506 --> TASK507
    TASK415 --> TASK508
    TASK420 --> TASK508
    TASK505 --> TASK508
    TASK507 --> TASK508
    TASK505 --> TASK509
    TASK507 --> TASK509
    TASK508 --> TASK509
    TASK414 --> TASK510
    TASK419 --> TASK510
    TASK420 --> TASK510
    TASK501 --> TASK510
    TASK504 --> TASK510
    TASK506 --> TASK510
    TASK415 --> TASK511
    TASK504 --> TASK511
    TASK506 --> TASK511
    TASK508 --> TASK511
    TASK509 --> TASK511
    TASK510 --> TASK511
    TASK508 --> TASK512
    TASK509 --> TASK512
    TASK510 --> TASK512
    TASK511 --> TASK512
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```

### Phase 6 — Dashboard & Analytics

```mermaid
flowchart LR
    TASK406(["TASK-406<br/>Money core"]):::ext
    TASK407(["TASK-407<br/>Money parse/format"]):::ext
    TASK408(["TASK-408<br/>Calendar dates"]):::ext
    TASK414(["TASK-414<br/>Core stores"]):::ext
    TASK415(["TASK-415<br/>useServiceQuery"]):::ext
    TASK419(["TASK-419<br/>Value display UI"]):::ext
    TASK420(["TASK-420<br/>Routes + tabs"]):::ext
    TASK501(["TASK-501<br/>Categories + methods"]):::ext
    TASK503(["TASK-503<br/>Txn repo CRUD"]):::ext
    TASK504(["TASK-504<br/>History query"]):::ext
    TASK506(["TASK-506<br/>Input primitives"]):::ext
    TASK508(["TASK-508<br/>Add txn workflow"]):::ext
    TASK509(["TASK-509<br/>Detail/edit/delete"]):::ext
    TASK510(["TASK-510<br/>Filters"]):::ext
    TASK511(["TASK-511<br/>History screen"]):::ext
    TASK512(["TASK-512<br/>Phase 5 checkpoint"]):::ext
    TASK601["TASK-601<br/>Txn aggregates"]:::critical
    TASK602["TASK-602<br/>Summary calculators"]:::critical
    TASK603["TASK-603<br/>Category distribution"]
    TASK604["TASK-604<br/>Period store + picker"]
    TASK605["TASK-605<br/>Dashboard hooks"]
    TASK606["TASK-606<br/>Dashboard screen"]:::blocked
    TASK607["TASK-607<br/>Reports"]
    TASK608["TASK-608<br/>Phase 6 checkpoint"]
    TASK503 --> TASK601
    TASK504 --> TASK601
    TASK408 --> TASK601
    TASK406 --> TASK602
    TASK407 --> TASK602
    TASK406 --> TASK603
    TASK501 --> TASK603
    TASK408 --> TASK604
    TASK414 --> TASK604
    TASK419 --> TASK604
    TASK420 --> TASK604
    TASK506 --> TASK604
    TASK415 --> TASK605
    TASK509 --> TASK605
    TASK601 --> TASK605
    TASK602 --> TASK605
    TASK604 --> TASK605
    TASK419 --> TASK606
    TASK508 --> TASK606
    TASK511 --> TASK606
    TASK604 --> TASK606
    TASK605 --> TASK606
    TASK415 --> TASK607
    TASK510 --> TASK607
    TASK511 --> TASK607
    TASK601 --> TASK607
    TASK602 --> TASK607
    TASK603 --> TASK607
    TASK604 --> TASK607
    TASK512 --> TASK608
    TASK606 --> TASK608
    TASK607 --> TASK608
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```

### Phase 7 — Budgets & Goals

```mermaid
flowchart LR
    TASK406(["TASK-406<br/>Money core"]):::ext
    TASK407(["TASK-407<br/>Money parse/format"]):::ext
    TASK408(["TASK-408<br/>Calendar dates"]):::ext
    TASK412(["TASK-412<br/>Baseline schema 0001"]):::ext
    TASK413(["TASK-413<br/>Repository helpers"]):::ext
    TASK415(["TASK-415<br/>useServiceQuery"]):::ext
    TASK418(["TASK-418<br/>Feedback UI"]):::ext
    TASK419(["TASK-419<br/>Value display UI"]):::ext
    TASK420(["TASK-420<br/>Routes + tabs"]):::ext
    TASK422(["TASK-422<br/>Profile + onboarding"]):::ext
    TASK504(["TASK-504<br/>History query"]):::ext
    TASK506(["TASK-506<br/>Input primitives"]):::ext
    TASK507(["TASK-507<br/>Txn form"]):::ext
    TASK601(["TASK-601<br/>Txn aggregates"]):::ext
    TASK602(["TASK-602<br/>Summary calculators"]):::ext
    TASK606(["TASK-606<br/>Dashboard screen"]):::ext
    TASK608(["TASK-608<br/>Phase 6 checkpoint"]):::ext
    TASK701["TASK-701<br/>Budget domain"]:::critical
    TASK702["TASK-702<br/>Budget repo"]:::blocked
    TASK703["TASK-703<br/>Budget service"]
    TASK704["TASK-704<br/>Budget form"]
    TASK705["TASK-705<br/>Budgets tab"]:::blocked
    TASK706["TASK-706<br/>Budget detail"]
    TASK707["TASK-707<br/>Home budgets section"]
    TASK708["TASK-708<br/>Goal progress + required"]:::critical
    TASK709["TASK-709<br/>Tracking, projection, gap"]:::blocked
    TASK710["TASK-710<br/>Goal schema + repo"]:::blocked
    TASK711["TASK-711<br/>Goal service"]
    TASK712["TASK-712<br/>Goal forms"]
    TASK713["TASK-713<br/>Goals tab"]
    TASK714["TASK-714<br/>Goal detail"]:::blocked
    TASK715["TASK-715<br/>Home goals section"]
    TASK716["TASK-716<br/>Phase 7 checkpoint"]
    TASK406 --> TASK701
    TASK407 --> TASK701
    TASK408 --> TASK702
    TASK412 --> TASK702
    TASK413 --> TASK702
    TASK701 --> TASK702
    TASK415 --> TASK703
    TASK504 --> TASK703
    TASK601 --> TASK703
    TASK701 --> TASK703
    TASK702 --> TASK703
    TASK418 --> TASK704
    TASK506 --> TASK704
    TASK507 --> TASK704
    TASK703 --> TASK704
    TASK415 --> TASK705
    TASK419 --> TASK705
    TASK420 --> TASK705
    TASK703 --> TASK705
    TASK704 --> TASK705
    TASK704 --> TASK706
    TASK705 --> TASK706
    TASK606 --> TASK707
    TASK705 --> TASK707
    TASK406 --> TASK708
    TASK407 --> TASK708
    TASK408 --> TASK708
    TASK602 --> TASK709
    TASK708 --> TASK709
    TASK407 --> TASK710
    TASK408 --> TASK710
    TASK412 --> TASK710
    TASK413 --> TASK710
    TASK708 --> TASK710
    TASK415 --> TASK711
    TASK422 --> TASK711
    TASK601 --> TASK711
    TASK709 --> TASK711
    TASK710 --> TASK711
    TASK418 --> TASK712
    TASK419 --> TASK712
    TASK506 --> TASK712
    TASK711 --> TASK712
    TASK415 --> TASK713
    TASK419 --> TASK713
    TASK420 --> TASK713
    TASK711 --> TASK713
    TASK712 --> TASK713
    TASK712 --> TASK714
    TASK713 --> TASK714
    TASK707 --> TASK715
    TASK713 --> TASK715
    TASK714 --> TASK715
    TASK608 --> TASK716
    TASK704 --> TASK716
    TASK705 --> TASK716
    TASK706 --> TASK716
    TASK707 --> TASK716
    TASK712 --> TASK716
    TASK713 --> TASK716
    TASK714 --> TASK716
    TASK715 --> TASK716
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```

### Phase 8 — Recommendations

```mermaid
flowchart LR
    TASK406(["TASK-406<br/>Money core"]):::ext
    TASK408(["TASK-408<br/>Calendar dates"]):::ext
    TASK415(["TASK-415<br/>useServiceQuery"]):::ext
    TASK418(["TASK-418<br/>Feedback UI"]):::ext
    TASK419(["TASK-419<br/>Value display UI"]):::ext
    TASK420(["TASK-420<br/>Routes + tabs"]):::ext
    TASK501(["TASK-501<br/>Categories + methods"]):::ext
    TASK601(["TASK-601<br/>Txn aggregates"]):::ext
    TASK701(["TASK-701<br/>Budget domain"]):::ext
    TASK702(["TASK-702<br/>Budget repo"]):::ext
    TASK709(["TASK-709<br/>Tracking, projection, gap"]):::ext
    TASK710(["TASK-710<br/>Goal schema + repo"]):::ext
    TASK715(["TASK-715<br/>Home goals section"]):::ext
    TASK716(["TASK-716<br/>Phase 7 checkpoint"]):::ext
    TASK801["TASK-801<br/>Reco model"]:::critical
    TASK802["TASK-802<br/>History analysis"]:::blocked
    TASK803["TASK-803<br/>Engine + ranking"]:::critical
    TASK804["TASK-804<br/>BUD rules"]
    TASK805["TASK-805<br/>ANOM rules"]
    TASK806["TASK-806<br/>GAP rules"]
    TASK807["TASK-807<br/>Merge + safety"]
    TASK808["TASK-808<br/>Reco service"]
    TASK809["TASK-809<br/>Reco screens"]
    TASK810["TASK-810<br/>Home reco section"]
    TASK811["TASK-811<br/>Phase 8 checkpoint"]
    TASK406 --> TASK801
    TASK408 --> TASK801
    TASK701 --> TASK801
    TASK406 --> TASK802
    TASK408 --> TASK802
    TASK701 --> TASK803
    TASK709 --> TASK803
    TASK801 --> TASK803
    TASK802 --> TASK803
    TASK803 --> TASK804
    TASK803 --> TASK805
    TASK803 --> TASK806
    TASK804 --> TASK807
    TASK805 --> TASK807
    TASK806 --> TASK807
    TASK415 --> TASK808
    TASK501 --> TASK808
    TASK601 --> TASK808
    TASK702 --> TASK808
    TASK710 --> TASK808
    TASK807 --> TASK808
    TASK418 --> TASK809
    TASK419 --> TASK809
    TASK420 --> TASK809
    TASK808 --> TASK809
    TASK715 --> TASK810
    TASK809 --> TASK810
    TASK716 --> TASK811
    TASK810 --> TASK811
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```

### Phase 9 — Security & Release

```mermaid
flowchart LR
    TASK403(["TASK-403<br/>Unused deps cleanup"]):::ext
    TASK411(["TASK-411<br/>Migration runner"]):::ext
    TASK412(["TASK-412<br/>Baseline schema 0001"]):::ext
    TASK413(["TASK-413<br/>Repository helpers"]):::ext
    TASK416(["TASK-416<br/>Theme tokens"]):::ext
    TASK420(["TASK-420<br/>Routes + tabs"]):::ext
    TASK421(["TASK-421<br/>DatabaseGate"]):::ext
    TASK422(["TASK-422<br/>Profile + onboarding"]):::ext
    TASK424(["TASK-424<br/>Phase 4 checkpoint"]):::ext
    TASK501(["TASK-501<br/>Categories + methods"]):::ext
    TASK503(["TASK-503<br/>Txn repo CRUD"]):::ext
    TASK601(["TASK-601<br/>Txn aggregates"]):::ext
    TASK606(["TASK-606<br/>Dashboard screen"]):::ext
    TASK702(["TASK-702<br/>Budget repo"]):::ext
    TASK710(["TASK-710<br/>Goal schema + repo"]):::ext
    TASK810(["TASK-810<br/>Home reco section"]):::ext
    TASK811(["TASK-811<br/>Phase 8 checkpoint"]):::ext
    TASK901["TASK-901<br/>Settings hub"]
    TASK902["TASK-902<br/>Currency lock"]
    TASK903["TASK-903<br/>Privacy + About"]:::blocked
    TASK904["TASK-904<br/>Delete all data"]:::critical
    TASK905["TASK-905<br/>Export builder"]
    TASK906["TASK-906<br/>Export + share"]:::blocked
    TASK907["TASK-907<br/>Android backup excl."]:::blocked
    TASK908["TASK-908<br/>iOS backup module"]:::blocked
    TASK909["TASK-909<br/>A11y audit"]
    TASK910["TASK-910<br/>Performance 50k"]:::blocked
    TASK911["TASK-911<br/>Migration on device"]:::critical
    TASK912["TASK-912<br/>Android verification"]
    TASK913["TASK-913<br/>iOS verification"]:::blocked
    TASK914["TASK-914<br/>Release config"]:::blocked
    TASK915["TASK-915<br/>Production builds"]:::blocked
    TASK916["TASK-916<br/>Release docs"]
    TASK917["TASK-917<br/>Final regression"]:::blocked
    TASK416 --> TASK901
    TASK420 --> TASK901
    TASK422 --> TASK901
    TASK606 --> TASK901
    TASK810 --> TASK901
    TASK601 --> TASK902
    TASK702 --> TASK902
    TASK710 --> TASK902
    TASK901 --> TASK902
    TASK901 --> TASK903
    TASK411 --> TASK904
    TASK421 --> TASK904
    TASK901 --> TASK904
    TASK902 --> TASK904
    TASK906 --> TASK904
    TASK412 --> TASK905
    TASK413 --> TASK905
    TASK501 --> TASK905
    TASK503 --> TASK905
    TASK702 --> TASK905
    TASK710 --> TASK905
    TASK901 --> TASK906
    TASK905 --> TASK906
    TASK421 --> TASK907
    TASK411 --> TASK908
    TASK421 --> TASK908
    TASK811 --> TASK909
    TASK902 --> TASK909
    TASK903 --> TASK909
    TASK904 --> TASK909
    TASK906 --> TASK909
    TASK811 --> TASK910
    TASK411 --> TASK911
    TASK412 --> TASK911
    TASK421 --> TASK911
    TASK424 --> TASK911
    TASK904 --> TASK912
    TASK906 --> TASK912
    TASK907 --> TASK912
    TASK909 --> TASK912
    TASK910 --> TASK912
    TASK911 --> TASK912
    TASK908 --> TASK913
    TASK909 --> TASK913
    TASK403 --> TASK914
    TASK907 --> TASK914
    TASK912 --> TASK915
    TASK913 --> TASK915
    TASK914 --> TASK915
    TASK903 --> TASK916
    TASK914 --> TASK916
    TASK911 --> TASK917
    TASK912 --> TASK917
    TASK913 --> TASK917
    TASK915 --> TASK917
    TASK916 --> TASK917
    classDef ext fill:#eeeeee,stroke:#999999,color:#333333
    classDef blocked fill:#fde2e2,stroke:#b91c1c,color:#111111
    classDef critical fill:#ccfbf1,stroke:#0f766e,color:#111111
```
<!--/MERMAID-->

## 3. Blocking vs optional dependencies

All edges above are **blocking** (the dependent task must not start before the prerequisite is DONE). Optional or soft relationships are deliberately **not** edges:

| From | To | Nature | Why it is not blocking |
|---|---|---|---|
| TASK-908 | TASK-903 | Optional | The privacy screen ships without the iOS sentence; it is added only once TASK-908 is DONE. |
| TASK-906 | TASK-911 | Optional | Export is the preferred before/after comparison artefact; a debug query is an acceptable substitute. |
| TASK-424 | TASK-501, TASK-502, TASK-506, TASK-602, TASK-701, TASK-708, TASK-801, TASK-802 | Soft (checkpoint) | These depend only on Phase 4 *domain/DB* tasks and may start before the Phase 4 checkpoint; see roadmap §3. |
| TASK-403 | TASK-424 | None | The LOW-priority cleanup does not gate the foundation checkpoint. |

## 4. Independent tasks (no task dependencies)

TASK-401 and TASK-402. Both can start immediately after G0, in parallel.

## 5. Critical path

The longest dependency chain (26 tasks) — any delay on it delays release:

```text
401 Layer lint → 404 Result/IDs/Clock → 405 Errors+logger → 406 Money core → 414 Core stores → 416 Theme
→ 417 Layout UI → 418 Feedback UI → 420 Routes+tabs → 421 DatabaseGate → 422 Onboarding → 505 Txn service
→ 508 Add txn → 509 Detail/edit/delete → 511 History screen → 606 Dashboard → 707 Home budgets
→ 715 Home goals → 810 Home recos → 901 Settings → 902 Currency lock → 904 Delete all data
→ 909 A11y audit → 912 Android verification → 915 Production builds → 917 Final regression
```

(901 → 906 → 904 is an equal-length alternative through the export flow.)

Near-critical chains (≤ 3 tasks shorter) that must be watched:

| Chain | Why it matters |
|---|---|
| 405 → 409 → 410 → 411 → 412 → 421 | Database foundation; blocked by OD-19, OD-14, OD-06, OD-09, OD-20, OD-11 — the **largest decision risk** on the path. |
| 708 → 709 → 803 → 804/805/806 → 807 → 808 → 809 → 810 | Goal tracking + recommendations; blocked by OD-03/04/05/22. |
| 422 → 711 → 713 → 714 → 715 | Goals UI feeding the dashboard hotspot. |

The UI chain (414 → 421) is on the critical path because the database gate (421) needs both the DB chain and the UI kit; starting UI primitives early (Wave 2) is the main lever.

## 6. Parallelizable groups

Tasks in the same group share no files (except listed append-only hotspots) and have no edges between them. Run them in parallel only after their prerequisites are DONE.

| Group | Tasks | Shared files / hotspots | Integration checkpoint |
|---|---|---|---|
| P1 | 401, 402 | `package.json` (402 only), `eslint.config.js` (401 only) | — |
| P2 | 406 → 407 · 408 · 409 | `src/domain/*/index.ts` per module (separate) | TASK-424 |
| P3 | 410 · 414 · 802 | none | — |
| P4 | 411 · 415 · 416 · 602 · 701 · 708 | none | — |
| P5 | 412 · 417 · 709 · 801 | `src/domain/recommendations/index.ts` (801 vs 802: append) | — |
| P6 | 413 · 418 · 419 · 803 | `src/shared/ui/index.ts` (418, 419: append) | — |
| P7 | 501 · 506 · 702 · 710 · 804 · 805 · 806 | `rules/index.ts` (804/805/806: one appended line each); `package.json` (506) | TASK-807 |
| P8 | 502 · 603 · 604 · 807 | `src/app/_layout.tsx` (604 modal registration) | — |
| P9 | 503 · 507 · 907 · 908 | `app.json` (907 only) | — |
| P10 | 504 · 505 · 905 | `transactionsRepo.ts` read-only for 505/905 | — |
| P11 | 508 · 510 · 601 | `src/app/_layout.tsx` (508, 510 modal registration: append) | TASK-512 |
| P12 | 509 · 703 · 711 · 808 · 911 · 914 | none (605 follows 509: same service file) | — |
| P13 | 704 · 712 · 809 · 511 | `src/app/_layout.tsx` (704, 712 modal registration: append) | — |
| P14 | 705 · 713 · 606 · 607 | `(tabs)/*.tsx` (each a different file) | TASK-608 |
| P15 | 902 · 903 · 906 · 910 | `SettingsScreen.tsx` rows (append) | — |

**Must remain sequential** (shared file edited non-trivially):

| Sequence | Shared file |
|---|---|
| 503 → 504 → 601 | `src/data/repositories/transactionsRepo.ts` |
| 505 → 509 → 605 | `src/features/transactions/services/transactionService.ts` (509 adds edit; 605 adds summary/recent) |
| 606 → 707 → 715 → 810 → 901 | `src/features/dashboard/components/DashboardScreen.tsx` |
| 420 → 421 → 422 → 423 | `src/app/_layout.tsx` (structural changes) |
| 901 → 902 → 904 | `src/features/settings/services/settingsService.ts` |
| 803 → 807 | `mergeAndSuppress.ts`, `engine.ts` |

**Append-only hotspots** (parallel edits allowed; resolve by keeping both additions): `src/app/_layout.tsx` modal registrations (508, 509, 510, 604, 704, 712, 714), `src/shared/ui/index.ts`, feature `index.ts` files, `SettingsScreen.tsx` rows (902, 903, 904, 906), `src/domain/recommendations/rules/index.ts` (804, 805, 806), `package.json` (506, 906 via `npx expo install`).

## 7. Tasks requiring approval before execution

| Approval | Tasks that cannot start without it | Downstream impact (transitively waiting) |
|---|---|---|
| **G0** — OD-01 PRS re-review; Phase 2 design + ADR-0001…0012 accepted | **All 88** | Everything |
| OD-02 tab set (ADR-0010) | 420 | 421 → whole app shell |
| OD-03, OD-04 goal tracking/projection | 709 | 711, 713 – 716, 803 – 811 |
| OD-05 lookback 12 months | 709 | as above |
| OD-06 priority values | 412, 710 | all DB-dependent work |
| OD-09 goal balance history | 412, 710 | all DB-dependent work |
| OD-10 budgets current month only (ADR-0006) | 702 | 703 – 707, 808 |
| OD-11 profile name (optional) | 412 (column CHECK) | — |
| OD-12 earliest transaction date | 502, 506 | 503 – 512 |
| OD-13 web unsupported | 403, 420 | — |
| OD-14 schema re-baseline (ADR-0005, ADR-0009) | 411, 412 | all DB-dependent work |
| OD-15 backup exclusion details (ADR-0011) | 907, 908, (903 sentence) | 912, 913 |
| OD-16 new dependencies | 506, 906 | 507 – 512, 604; 904 |
| OD-17 unused packages | 403 | 914 |
| OD-18 reference device | 910 | 912 |
| OD-19 test SQLite engine | 410 | 411 → all DB work |
| OD-20 "Food (eating out)" label | 412 | — |
| OD-21 goal-deposit guidance text | 714, 903 | 715, 716 |
| OD-22 partial first month | 802 | 803 – 811 |
| DG-02, DG-11 | 421 | 422 → everything after |
| DG-03 | 504, 510 | 511, 601, 703 |
| DG-04, DG-10 | 606 | 707, 715, 810, 901 |
| DG-05 | 705 | 706, 707 |
| DG-06 | 903 | 909, 916 |
| DG-07 | 914 | 915 |
| DG-09 (automated variant only) | 917 | — |
| DG-12 | 910 | 912 |
| External: macOS/Xcode, Apple account | 908, 913 | 915 (iOS part) |
| External: signing credentials, store accounts | 915 | 917 |
| External: iOS bundle identifier (PO input) | 914 | 915 |
