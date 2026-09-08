# Ustalenia UX/UI

## Wymagania użytkownika
- Przeklikiwalny mockup ma wyglądać jak prawdziwa aplikacja na telefonie, bez ramek urządzenia, panelu recenzenta i opisów dookoła.
- Zegar/cel i główny tekst wyśrodkowane względem ekranu.
- Elementy klikalne jako przyciski; bez podkreślonych linków udających akcje.
- Stałe miejsca avatarów podczas meczu. Zmieniają się wartości i statusy; nie zmienia się kolejność graczy. Kolejność według wyniku dopiero na finale. Podsumowanie wieczoru również jest rankingiem.
- Dedykowany Tap, nie tapowanie całego ekranu.
- Spójne położenie dolnych akcji, równe wysokości; jeden rząd. Górne akcje jako lekkie przyciski ikonowe z dostępnymi nazwami.
- Użyć oryginalnych wyśrodkowanych twarzy. Osadzone jest 25, pełen wybór w modalnym oknie. ViewBox 90 90 900 900; identyfikatory wewnętrznych SVG rozdzielone, aby się nie nadpisywały.
- Do 20 graczy; nie zmniejszać tekstu i avatarów w nieskończoność. Przewijać listę.
- 1–20 rund; aktualnie domyślnie 5 (wcześniej było 10). Skróty wyboru: 1, 3, 5, 10, 20.
- Cele z częścią ułamkową i dwa miejsca po przecinku.
- Domyślnie host uruchamia następną rundę. Opcjonalnie automat 8 sekund z pauzą.

## Ostatnia korekta: v8
v7 była zbyt gęsta. W v8 ukryto pionowy pasek przewijania listy, pozostawiając natywne przewijanie i klawiaturę. Usunięto zapas miejsca/obliczenia szerokości paska z v6–v7.

Na wyniku rundy: błąd użytkownika, zwycięzca, tabela, dolna akcja. Nie ma przełącznika This round / Overall na głównym ekranie. Dokładny cel, własny czas i miejsce są w Menu → Round details; ranking meczu w Menu → Overall standings. Na finale osobiste szczegóły są w Menu → Your game.

Otwarcie menu przez hosta podczas automatycznych wyników zatrzymuje automat. Po zamknięciu trzeba świadomie nacisnąć Resume. To celowa ochrona czasu na czytanie.

Styl: białe tło, ciepły ciemny tekst, delikatne kolorowe pola avatarów, mało dekoracji. Copy po angielsku, rozmowa z użytkownikiem po polsku.

Nie traktuj ostatnich propozycji dalszych zmian jako zaakceptowanych decyzji. Są w NEXT.md.
