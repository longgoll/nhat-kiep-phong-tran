# Source Code Index (Auto-Generated)

> File tự động sinh bởi `npm run gen:code-index` (hoặc `npm run gen:index`) từ `scripts/gen-code-index.mjs`.
> AI đọc file này trước khi tìm hoặc mở file trong `src/` để biết chính xác file con, số dòng (`L...`) và tránh đọc nhầm file lớn gây tốn token.

- **Tổng số file TS/TSX:** 107 | **Tổng số dòng:** 23574 | **File > 550 dòng (ngoài tests):** 1

## `src/components`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/components/AdultDashboard.tsx` | 264 | 9.9 | `AdultDashboard` (L24) |
| `src/components/BirthCertificateView.tsx` | 236 | 11.7 | `BirthCertificateView` (L40) |
| `src/components/CareerModal.tsx` | 207 | 9.9 | `CareerModal` (L31) |
| `src/components/ChildhoodView.tsx` | 492 | 21.4 | `ChildhoodView` (L73) |
| `src/components/ColorModeToggle.tsx` | 38 | 1.4 | `ColorModeToggle` (L9) |
| `src/components/EventModal.tsx` | 230 | 10.2 | `EventModal` (L97) |
| `src/components/FamilyLifeCard.tsx` | 126 | 4.7 | `FamilyLifeCard` (L51) |
| `src/components/FamilyWealthCard.tsx` | 219 | 9.9 | `HOUSING_NAMES` (L11), `FamilyWealthCard` (L30) |
| `src/components/FeudalPortrait.tsx` | 98 | 3.4 | `FeudalPortrait` (L10) |
| `src/components/FeudalSceneBanner.tsx` | 501 | 18.1 | `FeudalSceneBanner` (L375) |
| `src/components/LegacyArchiveModal.tsx` | 166 | 7.6 | `LegacyArchiveModal` (L10) |
| `src/components/LifeGrid.tsx` | 216 | 8.9 | `LifeGrid` (L39) |
| `src/components/LifeTimeline.tsx` | 191 | 7.5 | `LifeTimeline` (L45) |
| `src/components/LifeTopBar.tsx` | 291 | 11.6 | `LifeTopBar` (L21) |
| `src/components/ProgressionModules.tsx` | 116 | 4.9 | `ProgressionModules` (L10) |
| `src/components/StartScreen.tsx` | 174 | 7.8 | `StartScreen` (L12) |
| `src/components/StatExplainer.tsx` | 44 | 2.1 | `StatExplainer` (L4) |
| `src/components/TombstoneView.tsx` | 330 | 14.2 | `TombstoneView` (L19) |

## `src/components/adult`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/components/adult/AdultCenterColumn.tsx` | 168 | 8.0 | `AdultCenterColumn` (L11) |
| `src/components/adult/AdultLeftColumn.tsx` | 526 | 26.3 | `AdultLeftColumn` (L32) |
| `src/components/adult/AdultRightColumn.tsx` | 120 | 5.2 | `AdultRightColumn` (L10) |
| `src/components/adult/NpcListModal.tsx` | 34 | 1.5 | `NpcListModal` (L4) |
| `src/components/adult/SpendInvestModal.tsx` | 504 | 27.2 | `SpendInvestModal` (L28) |
| `src/components/adult/constants.tsx` | 59 | 2.0 | `TIER_DOTS` (L4), `LIFESTYLE_OPTIONS` (L12), `PAUSE_MESSAGES` (L20), `StatBar` (L27) |

## `src/components/progression`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/components/progression/ExamPanel.tsx` | 81 | 3.6 | `ExamPanel` (L4) |
| `src/components/progression/GuildAndPropertyPanel.tsx` | 174 | 8.4 | `GuildAndPropertyPanel` (L24) |
| `src/components/progression/OfficialCourtPanel.tsx` | 265 | 14.2 | `OfficialCourtPanel` (L27) |
| `src/components/progression/RebellionPanel.tsx` | 71 | 2.9 | `RebellionPanel` (L11) |

## `src/data`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/data/registry.ts` | 91 | 2.7 | `ALL_ACTIONS` (L50), `CHILDHOOD_ACTIVITIES` (L51), `ALL_CHILDHOOD_EVENTS` (L58), `ALL_ADULTHOOD_EVENTS` (L64), `ALL_EVENTS` (L69), `CHILDHOOD_AMBIENT_DATA` (L76) |

## `src/engine`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/adultLifeActions.ts` | 35 | 0.9 | *(barrel re-exports)* |
| `src/engine/careerSystem.ts` | 34 | 0.8 | *(barrel re-exports)* |
| `src/engine/childhoodEngine.ts` | 13 | 0.4 | *(barrel re-exports)* |
| `src/engine/conditionEvaluator.ts` | 151 | 7.0 | `evaluateConditions` (L4), `computeWeight` (L140) |
| `src/engine/daySimulator.ts` | 18 | 0.4 | *(barrel re-exports)* |
| `src/engine/decisionGenerator.ts` | 9 | 0.3 | *(barrel re-exports)* |
| `src/engine/economy.ts` | 47 | 1.4 | `BASE_RICE_PRICE_COPPER` (L3), `calculateRicePrice` (L19), `CurrencyBreakdown` (L23), `breakdownCopper` (L29), `formatCopper` (L38) |
| `src/engine/effectApplier.ts` | 10 | 0.2 | *(barrel re-exports)* |
| `src/engine/endingSummary.ts` | 185 | 7.7 | `EndingSummary` (L6), `computeFinalTitle` (L30), `buildEndingSummary` (L37) |
| `src/engine/familyEconomy.ts` | 207 | 7.4 | `FamilyCashflowBreakdown` (L7), `computeFamilyMonthlyNetCopper` (L29), `applyMoveOutInheritance` (L125), `applyFinalInheritanceIfEligible` (L162) |
| `src/engine/lifeInitializer.ts` | 11 | 0.2 | *(barrel re-exports)* |
| `src/engine/lifeStatus.ts` | 372 | 14.6 | `getEducationLabel` (L8), `getSpecialFateRole` (L74), `hasActiveLivelihood` (L88), `getCurrentLivelihoodLabel` (L102), `getCohortPeerStatusLabel` (L134), `getFeudalIncomeRankLabel` (L151), `getPersonalPossessions` (L165), `getFeudalTransportLabel` (L180), `getStatusLineParts` (L220), `FocusStatusBadge` (L271), `getFocusStatusBadges` (L283) |
| `src/engine/officialSystem.ts` | 40 | 1.0 | *(barrel re-exports)* |
| `src/engine/originConfigs.ts` | 132 | 3.1 | `OriginCoreConfig` (L3), `ORIGIN_CORE_CONFIG` (L25) |
| `src/engine/prng.ts` | 50 | 1.7 | `mulberry32Next` (L5), `generateRandomSeed` (L13), `randomInt` (L22), `pickWeightedIndex` (L31) |
| `src/engine/progressionModules.ts` | 35 | 0.7 | *(barrel re-exports)* |
| `src/engine/yearPlanner.ts` | 303 | 10.8 | `isEventContextuallyAllowed` (L72), `planYear` (L162) |

## `src/engine/adultActions`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/adultActions/financeAndFamily.ts` | 206 | 8.2 | `buyGoldReserve` (L11), `sellGoldReserve` (L30), `applySeasonalGoldAndInflation` (L51), `getMarriageRequirements` (L81), `canMarrySpouse` (L90), `marrySpouse` (L109), `canHaveChild` (L149), `haveChild` (L165) |
| `src/engine/adultActions/focusAndAnnual.ts` | 406 | 14.4 | `LIFE_FOCUS_OPTIONS` (L14), `getDailyFocusModifiers` (L74), `generateAnnualLifeFlavorLogs` (L148), `AUTO_ACTION_CANDIDATES` (L251), `GIFT_ETIQUETTE_OPTIONS` (L258), `applyAnnualGiftEtiquette` (L264), `runAnnualAutoActions` (L286), `getLifeFocusOptions` (L310), `ensureValidLifeFocus` (L385) |
| `src/engine/adultActions/instantCatalogCore.ts` | 389 | 13.2 | `INSTANT_ACTIONS_CORE` (L3) |
| `src/engine/adultActions/instantCatalogExtended.ts` | 396 | 13.3 | `INSTANT_ACTIONS_EXTENDED` (L3) |
| `src/engine/adultActions/instantExecution.ts` | 493 | 19.5 | `INSTANT_ADULT_ACTIONS` (L10), `isInstantActionVisible` (L15), `getEffectiveInstantActionCost` (L109), `getInstantActionCooldownRemaining` (L134), `getCreditLimitCopper` (L144), `canAffordInstantAction` (L156), `getAskFamilyMoneyProfile` (L170), `executeInstantAdultAction` (L207), `processRentalExpirations` (L409), `rankInstantActions` (L432) |
| `src/engine/adultActions/types.ts` | 45 | 1.2 | `LifeFocusOption` (L4), `InstantAdultActionDef` (L11) |

## `src/engine/career`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/career/actions.ts` | 475 | 15.3 | `applyForCareer` (L29), `resignCareer` (L88), `canPromoteCareer` (L118), `promoteCareer` (L138), `startVenture` (L149), `upgradeVenture` (L196), `closeVenture` (L228), `getCareerIncomeMultiplier` (L260), `recordDailyCareerProgress` (L283), `getJobApplyCooldownRemaining` (L332), `getCareerAcceptanceChance` (L338), `attemptApplyForCareer` (L363), +2 more |
| `src/engine/career/evaluation.ts` | 291 | 9.1 | `getSlotConflictReason` (L49), `evaluateCareerOption` (L56), `getAvailableCareers` (L176), `getRecommendedCareerOffers` (L184), `getAvailableVentures` (L196) |
| `src/engine/career/typesAndCatalog.ts` | 432 | 13.9 | `CAREER_TRACK_LABELS` (L3), `CareerRequirement` (L12), `CareerJobDef` (L35), `EvaluatedCareerOption` (L57), `VentureDef` (L66), `EvaluatedVentureOption` (L84), `CAREER_CATALOG` (L94) |
| `src/engine/career/ventureCatalog.ts` | 94 | 3.0 | `VENTURE_CATALOG` (L3) |

## `src/engine/childhood`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/childhood/focusOptions.ts` | 299 | 12.1 | `ChildhoodFocusOption` (L5), `CHILDHOOD_FOCUS_OPTIONS` (L14), `getLivingParentTerm` (L57), `getChildhoodFocusOptions` (L83), `getAvailableChildhoodActivities` (L290) |
| `src/engine/childhood/monthSimulator.ts` | 425 | 16.7 | `StepYearResult` (L43), `resolveEventChoice` (L48), `advanceChildhoodMonth` (L160) |
| `src/engine/childhood/teenTransition.ts` | 169 | 6.9 | `applyTeenTransition` (L6) |

## `src/engine/decisions`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/decisions/careerAndExamDecisions.ts` | 262 | 9.6 | `getEligibleExamLevelForPrompt` (L27), `buildCareerAndExamDecision` (L44) |
| `src/engine/decisions/lifeMilestoneDecisions.ts` | 260 | 10.1 | `buildLifeMilestoneDecision` (L6) |
| `src/engine/decisions/officialDecisions.ts` | 385 | 16.0 | `buildOfficialDecision` (L9) |
| `src/engine/decisions/priorities.ts` | 55 | 2.0 | `DecisionCandidate` (L9), `collectDynamicDecisionCandidates` (L29), `buildDynamicDecisionById` (L39), `generateDynamicDecision` (L50) |
| `src/engine/decisions/sideEffects.ts` | 268 | 7.9 | `applyDynamicDecisionSideEffects` (L28) |

## `src/engine/effects`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/effects/applyEffects.ts` | 391 | 14.6 | `applyEffects` (L13) |
| `src/engine/effects/statAndLogHelpers.ts` | 193 | 6.1 | `MAX_MILESTONES` (L7), `clamp` (L9), `applyDirectStatDelta` (L17), `applyMoodSocialDelta` (L25), `applyStatDelta` (L39), `appendLog` (L51), `computeFamilyLivingTier` (L72), `getExpectedHealthBaseline` (L84), `applyAnnualStatMeanReversion` (L96) |

## `src/engine/init`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/init/createLife.ts` | 564 ⚠️ | 20.3 | `createNewLife` (L27) |
| `src/engine/init/npcGenerator.ts` | 364 | 11.3 | `NpcGenInput` (L9), `generateInitialFamilyNpcs` (L30) |
| `src/engine/init/originData.ts` | 336 | 17.3 | `ORIGIN_METADATA` (L10), `BIRTH_PLACES_BY_ORIGIN` (L81), `FAMILY_NAMES_BY_ORIGIN` (L89), `MALE_GIVEN_NAMES` (L97), `FEMALE_GIVEN_NAMES` (L98), `RUSTIC_MALE_NICKNAMES` (L99), `RUSTIC_FEMALE_NICKNAMES` (L100), `DYNASTY_NAMES` (L102), `TRAIT_LABELS` (L104), `INTEREST_LABELS` (L116), `FAMILY_TIER_LABELS` (L125), `FATHER_OCCUPATIONS` (L141), +7 more |

## `src/engine/official`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/official/actions.ts` | 385 | 13.7 | `manageOfficialStaff` (L9), `sendSeasonalSuperiorGift` (L66), `donateDisasterReliefAsOfficial` (L110), `setOfficialFamilyAccompany` (L140), `triggerDingYouLeave` (L166), `triggerKimCachTongNhung` (L193), `rewardMilitaryTroops` (L212), `equipMilitaryGear` (L241), `canBribeForPromotion` (L267), `bribeForEarlyPromotion` (L314) |
| `src/engine/official/evaluationAndRules.ts` | 257 | 9.8 | `checkOfficialPropertyRule` (L13), `checkHousingTiemLe` (L62), `canRequestKhaoKhoa` (L79), `evaluateKhaoKhoa` (L107) |
| `src/engine/official/ranksAndMeta.ts` | 399 | 12.1 | `OfficialRankSpec` (L11), `OFFICIAL_RANK_SPECS` (L28), `COMMERCIAL_PROPERTY_IDS` (L211), `LAND_PROPERTY_IDS` (L222), `POSTING_LABELS` (L228), `getOfficialPostingLabel` (L235), `isHomePostingAtBirthPlace` (L250), `isOfficialPostedAway` (L259), `getOfficialShortPostingPlace` (L266), `getOfficialResidenceLabel` (L276), `FACTION_LABELS` (L292), `getOfficialRankSpec` (L299), +7 more |

## `src/engine/progression`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/progression/examsAndOfficial.ts` | 491 | 18.4 | `OFFICIAL_RANKS` (L12), `toggleCrossDress` (L26), `ExamLevel` (L46), `getExamEligibility` (L48), `takeExam` (L148), `appointOrPromoteOfficial` (L290), `canGrantRoyalPrivilege` (L359), `grantRoyalPrivilege` (L386), `canBuyOfficialTitle` (L426), `buyOfficialTitle` (L460) |
| `src/engine/progression/propertyAndHousing.ts` | 307 | 9.8 | `PropertySpec` (L14), `PROPERTY_CATALOG` (L25), `HOUSING_UPGRADES` (L132), `HOUSING_ORDER` (L138), `getPropertyMarketCost` (L145), `getHousingMarketCost` (L157), `getPropertySeasonalIncome` (L169), `getVisibleProperties` (L196), `getPropertySeasonalSocial` (L207), `getMaxPropertyLimit` (L217), `buyProperty` (L221), `sellProperty` (L264), +1 more |
| `src/engine/progression/rebellion.ts` | 107 | 4.1 | `contributeRebellionTreasury` (L5), `canRecruitRebellionArmy` (L19), `recruitRebellionArmy` (L43), `getRebellionSuccessChance` (L66), `launchRebellion` (L81) |

## `src/engine/simulation`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/engine/simulation/advanceDays.ts` | 395 | 15.2 | `advanceDays` (L41) |
| `src/engine/simulation/configAndHelpers.ts` | 121 | 3.4 | `AutoPauseReason` (L11), `AutoPauseConfig` (L19), `DEFAULT_AUTO_PAUSE_CONFIG` (L26), `AdvanceDaysResult` (L33), `LIFESTYLE_TABLE` (L40), `HOUSING_DAILY_UPKEEP` (L51), `WORLD_LIVING_COST_MULT` (L58), `HOUSING_SLEEP_RECOVERY` (L65), `getAgingProfile` (L75), `getSeasonLabel` (L88), `getWorldStateLabel` (L101), `getDayInSeason` (L114), +1 more |
| `src/engine/simulation/dailyEconomy.ts` | 421 | 15.0 | `resolveSlotAction` (L35), `canExecuteAction` (L71), `scaleActionRewards` (L78), `emptyLedger` (L141), `addLedger` (L150), `getFamilyCoveredLifestyleTier` (L191), `applyMonthlyFamilyAllowance` (L239), `getDailyFixedExpenseSummary` (L274), `applyDailyLifestyle` (L302), `rollWorldStateOnNewSeason` (L397) |
| `src/engine/simulation/periodicTicks.ts` | 364 | 13.9 | `processMonthlyTick` (L26), `processAnnualBirthdayTick` (L143) |

## `src/`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/App.tsx` | 44 | 1.4 | `App` (L12) |
| `src/main.tsx` | 11 | 0.2 | — |

## `src/stores`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/stores/activeLife/scheduleAndEconomyActions.ts` | 246 | 6.3 | `createScheduleAndEconomyActions` (L15) |
| `src/stores/activeLife/types.ts` | 60 | 2.2 | `ActiveLifeStore` (L12) |
| `src/stores/activeLife/workerBridge.ts` | 52 | 1.5 | `getWorker` (L6), `pickAutoChoiceIndex` (L16) |
| `src/stores/useActiveLifeStore.ts` | 374 | 13.2 | `useActiveLifeStore` (L28) |
| `src/stores/useLegacyArchiveStore.ts` | 185 | 6.2 | `CodexEntryDef` (L9), `CODEX_CATALOG` (L16), `THEME_LABELS` (L55), `getThemeWrapperClass` (L78), `useLegacyArchiveStore` (L109) |

## `src/types`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/types/activeLife.ts` | 286 | 8.3 | `OriginClass` (L1), `Gender` (L2), `TimeSlot` (L3), `LifestyleTier` (L4), `HousingTier` (L5), `Season` (L6), `WorldState` (L7), `NPC` (L9), `CohortPeer` (L20), `FallbackRule` (L31), `MilestoneRecord` (L40), `LogEntry` (L48), +23 more |
| `src/types/dsl.ts` | 201 | 4.4 | `ConditionSpec` (L12), `EffectSpec` (L72), `WeightModifier` (L125), `WeightSpec` (L130), `EventOutcome` (L135), `EventChoice` (L141), `GameEventDef` (L148), `InfancyMilestoneLogDef` (L163), `FocusAmbientLogDef` (L170), `ChildhoodAmbientData` (L176), `ActionDef` (L181), `ChildhoodActivityDef` (L192) |
| `src/types/legacy.ts` | 30 | 0.8 | `TombstoneRecord` (L3), `DashboardTheme` (L17), `ColorMode` (L18), `LegacyArchiveState` (L20) |

## `src/workers`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/workers/simulation.worker.ts` | 71 | 2.0 | `WorkerRequest` (L10), `WorkerResponse` (L24) |

## `src/__tests__`
| File | Dòng | KB | Exports chính |
| :--- | ---: | ---: | :--- |
| `src/data/__tests__/dataIntegrity.test.ts` | 72 | 3.0 | — |
| `src/engine/__tests__/auditGlobalSetup.ts` | 261 | 11.9 | `setup` (L14), `teardown` (L22) |
| `src/engine/__tests__/auditRunner.ts` | 634 | 19.6 | `ALL_ORIGINS` (L50), `ArchetypeConfig` (L52), `ARCHETYPES` (L68), `LifeAuditRecord` (L380), `AuditShardOutput` (L404), `getAuditConfigFromEnv` (L572), `AUDIT_SHARDS_DIR` (L594), `runAuditForOrigin` (L596) |
| `src/engine/__tests__/auditShard.ban_nong.audit.ts` | 7 | 0.2 | — |
| `src/engine/__tests__/auditShard.dia_chu.audit.ts` | 7 | 0.2 | — |
| `src/engine/__tests__/auditShard.hoang_toc.audit.ts` | 7 | 0.2 | — |
| `src/engine/__tests__/auditShard.quan_lai.audit.ts` | 7 | 0.2 | — |
| `src/engine/__tests__/auditShard.thu_cong.audit.ts` | 7 | 0.2 | — |
| `src/engine/__tests__/careerSystem.test.ts` | 183 | 6.9 | — |
| `src/engine/__tests__/coreEngine.test.ts` | 626 | 24.1 | — |
| `src/engine/__tests__/daySimulator.test.ts` | 473 | 17.0 | — |
| `src/engine/__tests__/deadRelativeAudit.test.ts` | 326 | 12.8 | — |
| `src/engine/__tests__/economyAndFoodAudit.test.ts` | 211 | 9.7 | — |
| `src/engine/__tests__/fullLifeBalanceAudit.test.ts` | 202 | 9.1 | — |
| `src/engine/__tests__/lifeAuditSimulation.test.ts` | 251 | 9.1 | — |
| `src/engine/__tests__/officialSystem.test.ts` | 306 | 12.5 | — |
| `src/engine/__tests__/progressionModules.test.ts` | 305 | 13.5 | — |
