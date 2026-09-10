# Playai / Blindstop — przekazanie do lokalnego Codexa

Stan: 2026-09-08. Etap: interaktywne mockupy HTML, bez produkcyjnego multiplayera.

## Zacznij tutaj
1. Otwórz ten folder jako projekt w swoim środowisku z Codexem.
2. Otwórz `mockups/blindstop.html` w przeglądarce. To robocza kopia v8, bez instalacji zależności.
3. Wklej Codexowi treść `START-HERE.txt`.
4. Testy logiki: `node tools/check.cjs` (Node.js musi być dostępny).

Opcjonalnie serwuj folder lokalnie: `python -m http.server 8000` lub na Windows `py -m http.server 8000`, a następnie otwórz http://localhost:8000/mockups/blindstop.html. Nie jest to serwer multiplayer.

## Co jest źródłem prawdy
- `mockups/blindstop.html`: jedyny bieżący plik do dalszej edycji.
- `docs/DECISIONS.md`: intencje i wymagania użytkownika.
- `docs/GAME-RULES.md`: aktualnie zaimplementowane reguły.
- `docs/STATE.md`: etap, ograniczenia, status GitHuba.
- `docs/NEXT.md`: propozycje i problemy do sprawdzenia, nie zatwierdzony zakres.
- `history/`: niezmienne poprzednie wersje, w tym v8 przed dalszymi zmianami.
- `archive/`: historyczne skrypty budujące kolejne wersje, testy oraz dane avatarów. Nie uruchamiaj ich jako normalnego procesu budowania bieżącej wersji: odtwarzają historyczne pliki i mogą nadpisać późniejsze poprawki.

To uporządkowane przekazanie ustaleń i dostępnych plików, nie dosłowny zapis całej rozmowy ani kopia repozytorium GitHub.

## Włączenie do istniejącego repo
Repo wskazane przez użytkownika: https://github.com/sellab-git/playai . Nie było skutecznego zapisu naszych zmian do repo. Nie zakładaj, że repo nadal ma stan odczytany wcześniej.

Najpierw odczytaj aktualne instrukcje repo i status Git. Umieść paczkę np. w `prototypes/blindstop/`, zachowując jej strukturę. Nie zastępuj istniejącego rootowego AGENTS.md plikiem z paczki. Lokalny Codex powinien porównać stare specyfikacje z naszymi późniejszymi ustaleniami i opisać różnice. Nie zmieniaj przy okazji aplikacji produkcyjnej.

`MANIFEST.json` zawiera SHA-256 plików w momencie przekazania. Po świadomej edycji roboczego mockupu jego suma oczywiście się zmieni.
