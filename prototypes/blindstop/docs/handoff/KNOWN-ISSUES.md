# Ograniczenia i rzeczy do sprawdzenia

## Potwierdzone ograniczenia
- Brak sieciowego multiplayera. QR osadzony w pliku reprezentuje kod pokoju, nie działający adres dołączenia. Udostępnianie/kopiowanie może zależeć od możliwości przeglądarki przy file:// lub content://.
- Pauza po ukryciu strony zamraża lokalną symulację. Nie ma serwerowego harmonogramu, pomiaru opóźnień, synchronizacji zegarów ani trwałego zapisu po odświeżeniu.
- Roster stabilny w meczu i jego głównych wynikach. Menu z rankingiem jest osobnym przewijanym widokiem.
- v8 nie została jeszcze wizualnie zweryfikowana na telefonie. Ukrycie paska usunęło jego widoczny tor, ale nie dowodzi usunięcia wszystkich problemów wysokości i przewijania.
- CSS ma historyczne warstwy nadpisania z v3–v8. Przed większą rozbudową warto je uporządkować po sprawdzeniu wizualnym, zachowując wygląd.
- Skrypty w archive budują historyczne wersje. Edytowanie obecnego HTML jest nowym normalnym workflow; tools/check.cjs nie może czytać starej wyekstrahowanej kopii JS.

## Ryzyka wykryte przy przekazaniu; wymagają odtworzenia
- Sprawdź pozostałe ścieżki Back / Leave / Rejoin / Lobby podczas meczu: część z nich wraca do lobby i wyłącza symulację zamiast realizować docelowy powrót do trwającej gry.
- Zmiana hosta w preview i późniejsze zmniejszenie liczby demonstracyjnych osób może wymagać ponownego wyboru aktywnego hosta. Nie zakładaj kompletnej obsługi członkostwa pokoju.
- Klawisz Escape zamykający dialog i focus po przebudowaniu ekranu wymagają testu w prawdziwym DOM.
- Na niskim ekranie minimalna wysokość shell może powodować przewijanie całej strony obok listy. Sprawdź też klawiaturę ekranową i poziome ustawienie telefonu.
- Po pauzie z otwartymi szczegółami host traci automat do świadomego Resume; sprawdź, czy ta informacja jest wystarczająco widoczna.
- Oryginalne avatary pochodzą z repo. Przy publikacji produktu sprawdź ich źródłową licencję; paczka nie rozstrzyga praw do assetów.

Nie opisuj powyższych ryzyk jako udowodnionych błędów bez odtworzenia. Żaden test VM nie sprawdza renderowania, dotyku, czytnika ekranu ani sieci.
