# Fitness

Web app mobile-first per seguire una scheda Upper/Lower di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale Upper / Lower su tre giorni
- Prossimo allenamento calcolato in base al giorno corrente
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Conto alla rovescia visibile nella bolla e ripristinato alla riapertura
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Modalità modifica per serie, ordine e sostituzione degli esercizi
- Creazione guidata per gruppo muscolare, tipologia e variante
- Salvataggio locale di serie, ripetizioni, carichi e note
- Aggiunta di esercizi personalizzati
- Selettore gratuito con più varianti coerenti per ogni esercizio
- Anteprime animate e istruzioni da [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- WorkoutX disponibile come guida opzionale

## Modifica della scheda

Premi **Modifica scheda** accanto al titolo dell'allenamento per:

- aumentare o diminuire il numero di serie con `−` e `+`;
- spostare un esercizio verso l'alto o verso il basso;
- sostituire un esercizio scegliendo gruppo muscolare, tipologia e variante;
- modificare serie e intervallo di ripetizioni.

Le modifiche mantengono l'identificatore interno della card, quindi pesi, note e serie già registrate non vengono cancellati quando cambi nome, variante, numero di serie o posizione.

Dal **Menu** puoi inoltre creare un nuovo esercizio partendo dal catalogo guidato. La scelta segue il percorso gruppo muscolare → tipologia → esercizio e collega automaticamente la nuova card alle immagini e alle istruzioni di `free-exercise-db`.

## Timer iOS tramite Comandi Rapidi

La modalità opzionale **Timer iOS** usa lo schema URL ufficiale `shortcuts://` per passare la durata scelta a un Comando Rapido. Non richiede backend, server, Telegram o Web Push.

1. Apri l'app **Comandi Rapidi**.
2. Crea un nuovo comando chiamato **Timer Palestra**.
3. Configuralo per ricevere input testuale.
4. Converti l'input del comando in un numero, se necessario.
5. Aggiungi l'azione **Avvia timer** usando quel numero di secondi come durata.
6. Salva il comando.
7. Nella webapp aperta in Safari vai su **Menu**.
8. Attiva **Usa timer nativo iOS tramite Comandi Rapidi**.
9. Inserisci come nome comando **Timer Palestra**.
10. Premi **Test timer iOS 10 secondi**.

Quando la modalità è attiva, i pulsanti `60s`, `90s`, `120s` e `180s` selezionano soltanto la durata. Il timer locale e il Comando Rapido partono esclusivamente premendo **Avvia**.

In modalità iOS il pulsante **Stop** viene nascosto, perché potrebbe fermare solo il countdown della webapp e non il timer nativo. Nella modalità interna della webapp rimane invece disponibile.

Alla scadenza **Avvia** diventa **Nuovo timer**. Il primo tocco ripristina la durata selezionata senza avviare un altro timer; per partire nuovamente occorre premere **Avvia**.

## Varianti degli esercizi

Premi **Esercizi** accanto a un esercizio per aprire una lista curata di movimenti coerenti. Per esempio, la categoria bicipiti propone curl con bilanciere, manubri, martello, inclinato, concentrato e ai cavi.

Le anteprime alternano le due immagini disponibili nel repository `free-exercise-db`: non sono GIF native, ma consentono di vedere le due fasi del movimento senza consumare richieste API. Il database è distribuito nel pubblico dominio tramite Unlicense.

Le istruzioni vengono scaricate solo quando premi **Istruzioni** e poi conservate nella memoria locale del browser.

## Guide WorkoutX

WorkoutX rimane disponibile come alternativa opzionale dentro il selettore delle varianti. La chiave API viene inserita dal menu dell'app e salvata esclusivamente nel browser tramite `localStorage`; non è inclusa nel repository.

Le GIF WorkoutX vengono richieste con autenticazione e conservate nella cache del browser per limitare il consumo della quota mensile.

## Installazione

Apri [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/) direttamente in Safari. Per il flusso con Comandi Rapidi non è necessario installare la webapp sulla schermata Home.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, personalizzazioni della scheda, esercizi aggiunti, impostazioni del timer iOS, cache delle guide e chiave WorkoutX salvata.
