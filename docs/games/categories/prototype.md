# Categories — exploratory mockup

The user approved Categories as the third game, with Bluff next. Drawing games are deferred. This is a standalone HTML mockup extension, not production multiplayer.

## Name and purpose

Use Categories as the English catalogue name. Stop the Bus is another established English name; see [British Council teaching material](https://www.teachingenglish.org.uk/sites/teacheng/files/2024-03/teaching-kids-holidays-online-lesson-plan.pdf). Validate text entry, locking answers, shared answer review and individual points in the persistent room.

## Initial bounded scope

One round, fixed letter B, four categories: Country, City, Animal, Food. Two to twenty simulated participants. Catalogue -> preparation -> answer form -> locked answers / explicit participant simulation -> category review -> round standings -> preparation or catalogue.

Keep drafts while typing without rerendering the focused form. Stop requires all four fields to be filled. The host can end writing early with blanks permitted. This exploratory version uses manual completion; it does not claim synchronized timers or real remote submissions.

Other participants have hidden fixture drafts in this local simulation. Stop or host early finish freezes all sheets atomically, including blanks; opening review never generates new answers after the stop. The Preview controls dialog explains the local simulation.

After writing ends, review one category at a time in stable participant order. The host records acceptance or rejection separately for each participant's answer, then confirms the category as a whole. Empty answers and wrong initial letters cannot earn points. No dictionary or AI validation is claimed. Scores: 10 for an accepted unique answer, 5 for an accepted duplicate, 0 for a blank or rejected answer. Compare duplicates after trimming and case normalization. Do not expose others' answers while writing.

Round points are shown separately. Cross-game conversion into evening totals is not decided; preserve existing totals rather than mixing incompatible raw scales. The user's direction is point-based games, including a later scoring decision for Impostor. Do not present that pending integration as implemented.

## Recovery and limits

Preserve room identity, participants and drafts/review state across local leave/rejoin. Keep host-only decisions guarded; guest preview actions must be explicitly identified as simulation. No extra settings, word database, drawing, production backend or Bluff implementation in this iteration.

## Approved clarity refinement — 2026-09-09

Show provisional points and their reason beside each reviewed answer (unique, duplicate, blank, wrong letter, rejected), using the same calculation as final totals. Rejections immediately recalculate duplicate groups. The host can return to earlier categories and change judgments before Show results finalizes the round. Preserve judgments across navigation and local leave/rejoin. Final results sort by descending points with shared competition ranks (1, 1, 3), retaining room order within ties. Show a filled-field count near Stop until complete, then explain that Stop ends writing for everyone; update without rerendering inputs. This refinement does not add rounds, random letters, grace time, voting, settings or evening conversion.
