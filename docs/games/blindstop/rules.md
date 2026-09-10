# Reguły aktualnego mockupu v8

## Runda
- 2–20 aktywnych osób; domyślnie 8 osób demonstracyjnych.
- Liczba rund ustalana przed meczem (1–20, domyślnie 5), zamrożona na jego czas.
- Jeden wspólny cel na rundę. Generator używa 3.11–11.89 s; część setna 11–89, bez wielokrotności 5. Nie powtarza celu w meczu i zachowuje minimum 0.80 s różnicy kolejnych celów. Ten dokładny filtr jest decyzją implementacyjną, nie osobnym wymaganiem użytkownika.
- Odliczanie 3 sekund; po zniknięciu odliczania użytkownik liczy w głowie. Brak widocznego bieżącego zegara.
- Pierwszy Tap na pointerdown albo Space/Enter rejestruje czas; następne tapnięcia nie zmieniają wyniku.
- Błąd = czas tapnięcia minus cel. Ujemny: early, dodatni: late. Wynik kwantowany do 0.01 s, zero pokazywane jako 0.00 s.
- Wyniki ukryte do zakończenia wszystkich prób. Runda zamyka się wcześniej, jeśli wszyscy tapnęli, albo najpóźniej cel + 8 sekund. Brak tapnięcia oznacza Missed, nie fikcyjną karę 3 s.
- Ranking rundy: najniższy bezwzględny błąd, każdy Missed poniżej każdego tapnięcia. Remisy dzielą miejsce; następne miejsce pomija zajęte pozycje (1, 1, 3).

## Mecz i wieczór
- Najpierw większa liczba ukończonych rund, następnie niższa średnia bezwzględnego błędu z ukończonych rund.
- Średnia zaokrąglona do 0.01 s przed rankingiem; równe wyświetlone średnie przy równej liczbie ukończonych rund dają remis.
- Obecna implementacja koduje porządek jako misses*1000+mean. W produkcji preferuj jawne porównanie pary wartości. Bez tapnięć UI nie pokazuje średniej, chociaż pomocnicza funkcja mean zwraca 0; nie używać samego mean do rankingu!
- Punkty wieczoru za mecz: N − miejsce + 1. Remis daje równe punkty; osoba bez żadnego tapnięcia dostaje 0. Punkty dodawane raz przy zakończeniu meczu. Wyniki nieukończonego meczu nie dodają punktów wieczoru.
- Jeżeli nikt nie tapnął, finał nie ogłasza zwycięzcy; wszyscy mają 0 punktów za ten mecz.

## Tempo i próba
- Host dostaje przed pierwszym meczem opcję jednej próby bez punktów albo startu gry od razu. Cel próby 6.37 s. Próba nie dopisuje historii i nie uruchamia automatu. Rewanż nie proponuje jej ponownie.
- Ręcznie: wyniki czekają na hosta. Automat: 8 sekund, z pauzą. Po ostatniej rundzie automat może otworzyć finał, ale finał sam nie uruchamia rewanżu.
- Rewanż zachowuje skład, ustawienia i punkty wieczoru; zeruje historię bieżącego meczu.

## Symulacja, nie multiplayer
Boty tapują według deterministycznej funkcji czasu. Join uses preview code K7QMX and waits for the host; it no longer starts a simulated game after four seconds. Menu ma osobny zestaw Preview controls. Pauza zamraża lokalny czas; wznowienie zachowuje już zapisane tapnięcia. To nie jest docelowa reguła pauzowania całej gry po utracie połączenia przez jedną osobę.


## Accepted room UX update — 2026-09-08

Game scoring and target generation are unchanged. Pacing is now captured as `gamePace` when a game starts. Room setup saves immediately; a new room resets to manual pacing and 5 rounds, while rematches retain room settings. Manual results never show countdown controls. Automatic progression and its final transition still wait 8 seconds and support explicit pause/resume.

Names, avatars, and evening points belong to the local room and survive game selection, finals, returning to the room, and rematches. Editing identity is available only from the room. The game-selection mockup lists Blindstop only and does not implement another game or network membership.


## Separate preparation flow — 2026-09-08

Game selection opens preparation, not a round. Replay returns to preparation with retained settings. The host starts explicitly. Returning to the catalogue preserves room membership and evening totals. These navigation changes do not alter scoring, targets or automatic result timing.
