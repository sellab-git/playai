# Weryfikacja

Komenda z katalogu paczki: `node tools/check.cjs`. Wymaga Node.js 18 lub nowszego; nie wymaga npm install. Test czyta JS bezpośrednio z aktualnego `mockups/blindstop.html`, nie z archiwalnej kopii.

Sprawdzone w Node VM: ekrany dla 2/8/12/16/20 graczy, pełne mecze 1/5/20 rund, cele ułamkowe i odstępy, granice ustawień, zachowanie scrollTop, sortowanie finału, automat 8 s, próba bez punktów, ukończone rundy przed średnią, remisy, gra bez tapnięć, pauza/wznowienie z zachowaniem zapisu, symulacja zmiany hosta, szczegóły na żądanie, pauza na czytanie menu, brak wskazanych starych tekstów.

Testy korzystają z atrap DOM i czasu. Nie dowodzą poprawnych wymiarów, działania CSS, dotyku ani wielu telefonów. Nie są pełnym audytem całej aplikacji.

Lokalnie sprawdź w przeglądarce: 360×640, około 393×780, 430×900; skład 2/8/20; listy przy górze i po przewinięciu; menu Overall standings; klawiaturę ekranową formularza; wszystkie 25 twarzy; ręczny i automatyczny koniec; brak paska i możliwość przewijania; focus i przyciski. Zachowaj rzeczywiste wyniki obserwacji.
