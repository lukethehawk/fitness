# Fitness

Web app mobile-first per seguire una scheda Upper/Lower di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale Upper / Lower su tre giorni
- Prossimo allenamento calcolato in base al giorno corrente
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Conto alla rovescia visibile nella bolla e ripristinato alla riapertura
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Salvataggio locale di serie, ripetizioni, carichi e note
- Aggiunta di esercizi personalizzati
- Selettore gratuito con più varianti coerenti per ogni esercizio
- Anteprime animate e istruzioni da [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- WorkoutX disponibile come guida opzionale
- Installabile come PWA

## Timer iOS tramite Comandi Rapidi

La modalità opzionale **Timer iOS** usa lo schema URL ufficiale `shortcuts://` per passare la durata scelta a un Comando Rapido. Non richiede backend, server, Telegram o Web Push.

1. Apri l'app **Comandi Rapidi**.
2. Crea un nuovo comando chiamato **Timer Palestra**.
3. Configuralo per ricevere input testuale.
4. Converti l'input del comando in un numero, se necessario.
5. Aggiungi l'azione **Avvia timer** usando quel numero di secondi come durata.
6. Salva il comando.
7. Nella PWA apri **Menu**.
8. Attiva **Usa timer nativo iOS tramite Comandi Rapidi**.
9. Inserisci come nome comando **Timer Palestra**.
10. Premi **Test timer iOS 10 secondi**.

Quando la modalità è attiva, toccando `60s`, `90s`, `120s` o `180s` parte anche il countdown locale come riferimento visivo e viene aperto il Comando Rapido con la durata selezionata.

La PWA non controlla direttamente l'app Orologio: il collegamento passa da Comandi Rapidi. iOS può mostrare una conferma o aprire l'app Comandi, ma il timer nativo è più affidabile a schermo bloccato rispetto al timer JavaScript.

Il bridge usa questo formato documentato da Apple:

```text
shortcuts://run-shortcut?name=Timer%20Palestra&input=text&text=60
```

## Limite del timer web su iPhone

Il timer salva l'orario esatto di fine. Se la PWA viene sospesa e poi riaperta, il conto alla rovescia si riallinea automaticamente.

iOS può però sospendere il JavaScript quando la PWA passa in background o lo schermo si blocca. Il Comando Rapido aggira questo limite avviando il timer nativo, senza introdurre un backend.

## Varianti degli esercizi

Premi **Esercizi** accanto a un esercizio per aprire una lista curata di movimenti coerenti. Per esempio, la categoria bicipiti propone curl con bilanciere, manubri, martello, inclinato, concentrato e ai cavi.

Le anteprime alternano le due immagini disponibili nel repository `free-exercise-db`: non sono GIF native, ma consentono di vedere le due fasi del movimento senza consumare richieste API. Il database è distribuito nel pubblico dominio tramite Unlicense.

Le istruzioni vengono scaricate solo quando premi **Istruzioni** e poi conservate nella memoria locale del browser.

## Guide WorkoutX

WorkoutX rimane disponibile come alternativa opzionale dentro il selettore delle varianti. La chiave API viene inserita dal menu dell'app e salvata esclusivamente nel browser tramite `localStorage`; non è inclusa nel repository.

Le GIF WorkoutX vengono richieste con autenticazione e conservate nella cache del browser per limitare il consumo della quota mensile.

## Installazione

Apri [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/) dal browser del telefono e usa **Aggiungi a schermata Home** o **Installa app**.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, esercizi personalizzati, impostazioni del timer iOS, cache delle guide e chiave WorkoutX salvata.
