# Fitness

Web app mobile-first e generica per seguire e personalizzare una scheda palestra, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Da 1 a 7 giorni di allenamento, aggiungibili e rimovibili
- Giorno della settimana e nome di ogni allenamento modificabili
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Modalità modifica compatta per serie, riordino touch e sostituzione degli esercizi
- Catalogo completo collegato a [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- Tutte le card, incluse quelle preconfigurate, modificabili dal catalogo completo
- Nome di ogni esercizio liberamente personalizzabile
- Lingua dei nomi del database selezionabile tra italiano e inglese
- Esportazione della giornata in Markdown con data e allenamento
- Salvataggio locale di serie, ripetizioni, carichi e note

## Modifica della scheda

Premi **Modifica scheda** per gestire i giorni di allenamento, aumentare o diminuire le serie, rinominare e trascinare un esercizio. Puoi aggiungere fino a sette giornate, assegnare a ciascuna un giorno della settimana e rimuovere quelle che non servono. Deve rimanere almeno una giornata.

I nuovi giorni partono vuoti: usa **Aggiungi esercizio** per scegliere le card dal catalogo. Prima della rimozione di una giornata viene chiesta conferma, perché vengono eliminati anche i suoi esercizi personalizzati e i dati registrati.

Il pulsante **Modifica** di ogni card apre il catalogo completo con filtri per muscolo, attrezzatura, ricerca e anteprima animata.

Puoi scegliere qualsiasi esercizio del database anche per sostituire una card preconfigurata e poi assegnargli un nome personale. La webapp conserva separatamente il nome visualizzato e il collegamento tecnico al database: immagini, istruzioni ed esportazioni restano quindi coerenti.

Le modifiche mantengono l'identificatore interno della card, quindi pesi, note e serie già registrate non vengono cancellati quando cambi nome o esercizio.

## Esportazione in Joplin

Il pulsante **Esporta giornata** genera un diario Markdown con data, titolo, immagini, peso, serie completate e note. Gli esercizi con zero serie completate vengono indicati come saltati e spostati alla fine. Il nome personalizzato dell'esercizio viene esportato insieme all'immagine associata dal database.

Su iPhone **Condividi con Joplin** invia il Markdown come testo. **Scarica .md** crea invece il file nominato con data italiana e nome dell'allenamento.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, giorni e personalizzazioni della scheda, esercizi aggiunti, nomi degli allenamenti e impostazioni.
