# Co dalej

## Najbliższy krok
Przeklikaj v8 w lokalnej przeglądarce w rozmiarach telefonu, przede wszystkim przewijanie i gęstość ekranów. Użytkownik chciał wrócić do prostoty; nie dodawaj kolejnych informacji automatycznie. Dopiero po ocenie potwierdź kierunek następnej wersji.

## Ostatnio zaproponowane, NIE wdrożone i NIE osobno zaakceptowane
1. Podczas oczekiwania po tapnięciu tylko liczba gotowych osób zamiast statusów każdego gracza. Obecnie tabela statusów nadal istnieje. Zważyć to względem wymogu stałych avatarów — nie usuwać ich pochopnie.
2. Zbalansować krótkie/średnie/długie cele w meczu. Obecny generator nie zapewnia równych proporcji; zapewnia unikalność i odległość kolejnych celów.
3. Dopracować pełny cykl pokoju: dołączanie między meczami, powrót rozłączonego gracza na jego miejsce, prawdziwe przekazanie hosta. Istniejące ekrany/symulacje nie są implementacją sieciową.

## Przed produkcją, poza bieżącym zleceniem
Przemyśleć pomiar czasu między urządzeniami, harmonogram serwerowy, odłączenie jednej osoby bez pauzy wszystkich, idempotencję zapisów, trwały stan pokoju, generowanie kodów i realne adresy QR. Nie zaczynać tego zamiast pracy nad mockupami.
