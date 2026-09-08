# Playai — przegląd ekranów i propozycja mockupu v2

Status: **propozycja do oceny przez Artura, nie zatwierdzona zmiana specyfikacji**.

Podstawa: `main` przy `4fcda993654b94cc78d79172fc6b955f3cec032a`, README, SPEC, SCREENS, ARCHITECTURE, ROADMAP, DESIGN, AGENTS, kontrakty TypeScript oraz oryginalny mockup. Nowy plik: `mockup-v2.html`. Oryginał i dokumenty kanoniczne pozostają bez zmian.

## Kierunek

Uczestnik ma zrozumieć trzy rzeczy bez tłumaczenia przez gospodarza: jak wejść, kiedy zacząć liczyć i co oznacza jego wynik. Gospodarz potrzebuje dodatkowo jasnej granicy między końcem gry a końcem wieczoru. Projekt zachowuje biały papier, ciepły tusz, skromną typografię, ręcznie rysowane znaki oraz kolor wyłącznie w twarzach i zakreśleniach.

Największa zmiana dotyczy hierarchii informacji i działania, nie nowego stylu. To nadal Blindstop we wspólnym pokoju. Nie dodaję kont, ustawień gry, wyboru gier, języków, dźwięku ani płatności. Polska warstwa recenzji znajduje się poza angielską aplikacją.

## Jak używać pliku

Plik jest samodzielny: CSS, JavaScript, osiem twarzy z istniejącego zestawu i kod QR są osadzone. Nie potrzebuje serwera, instalacji ani sieci. Używa Inter, jeżeli font jest dostępny na urządzeniu; w innym przypadku fontu systemowego. Nie pobiera fontów z sieci.

- Dropdown pozwala przejrzeć 24 stany, także z 2, 5 lub 8 graczami. Przegląd zatrzymuje czas, żeby móc czytać ekran.
- Przyciski w aplikacji prowadzą przez formularz i lobby. Prawidłowy kod demonstracyjny: `K7QMX`.
- „Zagraj w demo” lub Start gospodarza uruchamia trzysekundowe odliczanie i dziesięć lokalnych rund. Twój tap jest rzeczywiście mierzony przez `performance.now()`. Wyniki innych osób są symulowane.
- Po dziesięciu rundach można wrócić do lobby, zagrać ponownie, zakończyć wieczór i udostępnić tabelę jako tekst. Gdy systemowe udostępnianie jest niedostępne, jest próba kopiowania i ostatecznie zaznaczalny tekst.
- QR jest prawdziwym kodowaniem tekstu `K7QMX`, **nie działającym zaproszeniem do pokoju sieciowego**. Informuje o tym panel prototypu po otwarciu zaproszenia. Docelowe QR musi zawierać URL rzeczywistego pokoju. Fragment `#join=K7QMX` w adresie tego HTML pokazuje stan formularza po wejściu z zaproszenia.
- Schowanie dokumentu w trakcie lokalnego demo zatrzymuje je i pokazuje stan powrotu po rundzie. Nie udaje synchronizacji z nieistniejącym serwerem.

## Przegląd ekran po ekranie

| Widok | Problem / ryzyko w punkcie wyjścia | Propozycja v2 |
|---|---|---|
| 01. Wejście | „Seven seconds” sugeruje stały cel, choć zakres wynosi 3–12 sekund. Czas pojedynczej rundy nie mówi, na co zgadza się uczestnik. | Krótkie „Count in your head. Trust your timing.” oraz 10 rund i około 4 minuty. Create / Join pozostają od razu dostępne. |
| 02. Tworzenie | Statyczne elementy przypominają formularz, ale nie sprawdzają danych. | Prawdziwy formularz; imię do 12 znaków; wybór twarzy i przełączanie Create / Join bez utraty wpisanego tekstu. |
| 03. Dołączanie | Oryginał pokazuje cztery znaki, dokument wymaga pięciu. Oddzielne pola utrudniają wklejanie i klawiaturę. | Jeden input, pięć znaków, wielkie litery, walidacja alfabetu. Odrębne komunikaty o formacie i nieznanym pokoju. |
| 04. Wejście z zaproszenia | Osoba po zeskanowaniu QR może zostać zmuszona do ponownego wpisania kodu. | Kod jest już ustawiony; zostają imię, twarz i Join. |
| 05. Lobby gospodarza | Można zacząć bez zrozumienia reguł. Krzyżyk usunięcia gracza jest zbyt łatwy do przypadkowego dotknięcia. | Krótka instrukcja, czytelny kod, 44-pikselowy cel usunięcia i potwierdzenie z imieniem. Samotny gospodarz nie może wystartować. |
| 06. Lobby uczestnika | Łatwo pomylić gospodarza z własną rolą. | Osobno oznaczone „you” i „host”; zamiast Start komunikat z imieniem gospodarza. |
| 07. Odliczanie | Cel pojawia się dopiero w momencie, od którego gracz ma już liczyć. Czytanie liczby zabiera czas. | Cel jest widoczny przez odliczanie. Zdanie zapowiada, że ciemne pole jest sygnałem startu. To propozycja zmiany treści SCREENS §5. |
| 08. Runda | Element wizualny nie jest rzeczywistym przyciskiem; dodatkowe treści mogłyby zdradzać rytm. | Jedno duże pole obsługujące klik, dotyk i klawiaturę. Żadnego timera ani animacji. Cel pozostaje czytelny. |
| 09. Oczekiwanie | Bez jasnego potwierdzenia ludzie klikają ponownie. Wczesny wynik odciąga uwagę od wspólnego odsłonięcia. | Locked in, lista oczekujących, wynik nadal ukryty. Drugie tapnięcie w demo nie dodaje pomiaru. |
| 10. Wynik rundy | Trzy sekundy to mało na przeczytanie wszystkich wierszy i interpretację samego znaku minus. | Duży własny wynik oraz słowo early / late. Zwycięzca i ranking są dalej widoczni, ale nie przesłaniają odpowiedzi „jak mi poszło?”. Trzy sekundy pozostają zgodne ze SPEC. |
| 11. Brak tapnięcia | Kara 3 s nie jest zmierzonym czasem i nie ma kierunku early / late. | „No tap” oraz „3.00 s penalty”, bez fałszywego słupka na osi czasu. |
| 12. Wynik gry — gospodarz | Sam wynik 0.19 nie określa jednostki; punkty za miejsce mogą pomylić się z błędem. | Sekundy przy średnim błędzie, oddzielne zdobyte punkty, Play again i Back to room. |
| 13. Wynik gry — uczestnik | SCREENS pokazuje Play again bez rozróżnienia ról, a start należy do gospodarza. | Uczestnik ma Back to room i informację, kto może wystartować. |
| 14. Lobby po grze | Łatwo odebrać wynik końcowy jako zamknięcie całego pokoju. | Ten sam kod, ludzie i kolory; punkty wieczoru oraz End the evening gospodarza. |
| 15. Wieczór | Podsumowanie opisano, ale nie narysowano; inny ekran mówi, że wyniki nie są zapisane. | Pełna tabela, zwycięzca, liczba gier, własna obserwacja i udostępnienie tekstu. Zakończenie wymaga potwierdzenia. |
| 16. Powrót | Kontynuacja konkuruje z rozpoczynaniem od zera. | Rejoin jest głównym przyciskiem, nowy pokój drugorzędnym. |
| 17. Nieznany pokój | „Rooms close when the last player goes” przeczy warunkowi wieku >8h i braku aktywności >1h. | Neutralna, prawdziwa treść i bezpośrednia możliwość poprawienia kodu. |
| 18. Pełny pokój | To nie to samo co nieistniejący pokój. | Osobna przyczyna i ponowienie z zachowaniem formularza. |
| 19. Gra w toku | Nowa osoba nie może dołączyć, ale powracająca może. | Osobny ekran dla nowego uczestnika; nie używać go do obsługi reconnectu. |
| 20. Offline | Samo wygaszenie koloru nie blokuje wysłania ruchu. | Pole naprawdę disabled; komunikat o ponownym łączeniu. |
| 21. Powrót po rundzie | Lokalnie zachowany ekran może pokazywać nieaktualną fazę. | Jawna informacja, że runda minęła. Docelowo przejście według aktualnego stanu serwera. |
| 22. Zmiana gospodarza | Gracz może dostać przyciski bez zrozumienia dlaczego. | Krótki komunikat z nowym gospodarzem, zgodne role i akcje. |
| 23. Usunięcie | Room gone błędnie sugeruje, że pokój przestał istnieć. | Własna przyczyna wyjścia i możliwość założenia pokoju. |
| 24. Błąd | Błąd techniczny nie powinien udawać literówki w kodzie. | Osobny komunikat i ponowienie. |

Potwierdzenia usunięcia, opuszczenia i końca wieczoru oraz zaproszenie to dialogi, nie kolejne obowiązkowe kroki podstawowego flow.

## Co zachować bez zmian

1. Jeden kod przez wieczór, maksymalnie osiem osób.
2. Dziesięć rund, wynik rundy przechodzi sam po trzech sekundach.
3. Gracz nie widzi własnego pomiaru przed odsłonięciem.
4. Gospodarz gra razem z innymi; uczestnik nie steruje pokojem.
5. Wynik gry w sekundach oraz punkty wieczoru za miejsce to osobne wielkości.
6. W grze nie ma ciągle animowanego odliczania ani ozdobnych wskazówek rytmu.
7. Angielski UI, teksty za kluczami i18n, podstawowe kolory z dostarczonych tokenów.
8. Brak game pickera do chwili pojawienia się drugiej gry.

## Decyzje, których mockup nie może rozstrzygnąć za produkt

### A. Nazwa

Playai jest platformą, Blindstop grą. Zachowuję Blindstop w interfejsie, żeby nie wymyślać nowej marki w zadaniu o ekranach. Nazwa publiczna pozostaje otwarta.

### B. Kara może nagradzać brak ruchu

SPEC ustala stałą karę 3.00 s. Jeśli ktoś pomyliłby się o więcej, brak tapnięcia daje mu lepszy wynik. V2 nie zmienia tej reguły. To kwestia mechaniki do sprawdzenia, a nie kosmetyka UI. Trzeba też ustalić, czy przy samych brakach ruchów pokazujemy remis czy brak zwycięzcy.

### C. Wynik końcowy a powrót do lobby

ARCHITECTURE mówi: koniec gry od razu oddaje punkty do pokoju i usuwa stan gry. SCREENS zakłada, że gracze oglądają jeszcze wynik. Potrzebny jest jawny model: np. niemodyfikowalne podsumowanie ostatniej gry przechowywane w pokoju, podczas gdy ekran wyniku jest lokalnym widokiem. Nie należy przedłużać stanu „playing” w nieskończoność tylko dlatego, że ktoś nie zamknął wyniku.

Mockup prezentuje proponowane przyciski, ale nie implementuje kontraktu serwera.

### D. Obserwacje po usunięciu stanu gry

„You go early in 7 of 10 rounds” w podsumowaniu wieczoru wymaga zachowania agregatów. Sam `totals` nie wystarczy. Kontrakt potrzebuje małego wyniku podsumowującego, niezależnego od usuwanego wewnętrznego stanu gry. Demo zachowuje lokalną historię bieżącej gry; nie udaje docelowej architektury ani agregacji wielu różnych gier.

### E. Punkty osób, które wyszły

Pokój przechowuje punkty po skończonych grach. Usunięcie osoby nie powinno usuwać jej udziału z tabeli wieczoru. W v2 takie punkty pozostają; szczegółową zasadę powrotu i wiązania tożsamości musi ustalić backend. Zmiana liczby graczy w panelu to zmiana danych testowych, nie operacja na żywym pokoju.

### F. Trzy sekundy z ośmioma osobami

Nie wydłużam ustalonej przerwy. Nowa hierarchia pozwala odczytać własny wynik szybciej, ale czytelność pełnej tabeli w trzy sekundy wymaga testu na prawdziwych telefonach. Nie wolno twierdzić, że została potwierdzona przez sam mockup.

### G. Długie przerwy i stany reconnect

Telefon może wrócić do innej rundy, wyniku, lobby albo zamkniętego pokoju. Lokalny timer nie rozstrzyga prawdy. Wygląd scenariuszy jest zaproponowany; decyzję w aplikacji podejmuje świeża odpowiedź serwera.

## Ograniczenia i weryfikacja

To lokalny prototyp UX. Nie ma multiplayera, autoryzacji, trwałego pokoju, prawdziwego QR-zaproszenia, serwera ani telemetrii. Osoby poza Tobą są symulowane. Widoki błędów wybiera się w panelu; nie pochodzą z rzeczywistego backendu. Katalog twarzy został ograniczony do ośmiu istniejących plików, aby plik był samodzielny.

Sprawdzono składnię JavaScript oraz wykonanie rendererów 24 widoków przy 2/5/8 graczach. Przeprowadzono programowy przebieg dziesięciu rund z kontrolowanymi timerami, ochronę przed drugim tapnięciem, zachowanie punktów przy powrocie do lobby, brak Play again uczestnika, disabled na offline, podpis kary oraz zachowanie punktów usuniętej osoby. Sprawdzono osadzone odwołania i brak zależności sieciowych.

Nie przeprowadzono testów wizualnych w przeglądarce ani na fizycznym telefonie. To nadal wymaga obejrzenia przez Artura, zwłaszcza przy otwartej klawiaturze, ośmiu osobach i dłuższych imionach. Przy powiększeniu i niskim ekranie treść może przewijać się zamiast zostać ucięta.

Dotychczasowa uwaga DESIGN o pochodzeniu avatarów nadal obowiązuje. V2 wykorzystuje istniejące ilustracje; nie rozstrzyga ich praw ani licencji.

## Proponowany następny krok

Obejrzeć v2 na telefonie, rozegrać lokalne 10 rund i wskazać konkretne ekrany do zmiany. Po decyzji przenieść przyjęte poprawki do SCREENS/SPEC. Dopiero potem budować etap 1 aplikacji zgodnie z ROADMAP. Ta propozycja nie zatwierdza sama siebie i nie uruchamia budowy backendu.
