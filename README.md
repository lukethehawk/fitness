# Fitness

Web app mobile-first per seguire una scheda Upper/Lower di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale Upper / Lower su tre giorni
- Prossimo allenamento calcolato in base al giorno corrente
- Recupero predefinito di 60 secondi
- Timer con notifica di sistema quando disponibile
- Salvataggio locale di serie, ripetizioni, carichi e note
- Aggiunta di esercizi personalizzati
- Selettore gratuito con più varianti coerenti per ogni esercizio
- Anteprime animate e istruzioni da [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- WorkoutX disponibile come guida opzionale
- Installabile come PWA

## Varianti degli esercizi

Premi **Esercizi** accanto a un esercizio per aprire una lista curata di movimenti coerenti. Per esempio, la categoria bicipiti propone curl con bilanciere, manubri, martello, inclinato, concentrato e ai cavi.

Le anteprime alternano le due immagini disponibili nel repository `free-exercise-db`: non sono GIF native, ma consentono di vedere le due fasi del movimento senza consumare richieste API. Il database è distribuito nel pubblico dominio tramite Unlicense.

Le istruzioni vengono scaricate solo quando premi **Istruzioni** e poi conservate nella memoria locale del browser.

## Guide WorkoutX

WorkoutX rimane disponibile come alternativa opzionale dentro il selettore delle varianti. La chiave API viene inserita dal menu dell'app e salvata esclusivamente nel browser tramite `localStorage`; non è inclusa nel repository.

Le GIF WorkoutX vengono richieste con autenticazione e conservate nella cache del browser per limitare il consumo della quota mensile.

## Installazione

Apri [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/) dal browser del telefono e usa **Aggiungi a schermata Home** o **Installa app**.

Per ricevere la notifica alla fine del recupero, concedi il permesso quando richiesto. Il supporto a schermo bloccato dipende dal sistema operativo e dalle impostazioni di risparmio energetico del browser/PWA.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, esercizi personalizzati, cache delle guide e chiave WorkoutX salvata.
