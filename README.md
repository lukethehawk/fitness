# Fitness

Web app mobile-first per seguire una scheda Upper/Lower di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale Upper / Lower su tre giorni
- Prossimo allenamento calcolato in base al giorno corrente
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Conto alla rovescia visibile nella bolla e ripristinato alla riapertura
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Modalità modifica per serie, riordino touch tramite trascinamento e sostituzione degli esercizi
- Catalogo completo di 873 esercizi collegato a [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- Popup con filtri per muscolo, attrezzatura e ricerca
- Nomi del catalogo tradotti in italiano con terminologia da palestra
- Anteprime animate prima della creazione dell'esercizio
- Salvataggio locale di serie, ripetizioni, carichi e note
- WorkoutX disponibile come guida opzionale

## Modifica della scheda

Premi **Modifica scheda** accanto al titolo dell'allenamento per aumentare o diminuire le serie, modificare un esercizio oppure trascinarlo dalla maniglia per cambiarne l'ordine. Il trascinamento usa eventi touch/pointer compatibili con Safari iOS e salva automaticamente il nuovo ordine.

Le modifiche mantengono l'identificatore interno della card, quindi pesi, note e serie già registrate non vengono cancellati quando cambi nome, variante, numero di serie o posizione.

Dal **Menu** premi **Aggiungi esercizio** per aprire il catalogo in un popup separato. Puoi filtrare per gruppo muscolare e attrezzatura e guardare l'anteprima animata prima di scegliere. La nuova card viene collegata automaticamente alle immagini e alle istruzioni di `free-exercise-db`.

Il catalogo viene scaricato soltanto alla prima apertura e poi conservato nella cache del browser. Comprende tutti gli 873 esercizi del database; quasi tutti i gruppi muscolari hanno almeno 10 opzioni. Il collo ne ha 9 perché questo è il numero di esercizi disponibili nel dataset sorgente.

## Timer iOS tramite Comandi Rapidi

La modalità opzionale **Timer iOS** usa lo schema URL `shortcuts://` per passare la durata scelta a un Comando Rapido. I pulsanti della durata effettuano solo la selezione e il timer parte premendo **Avvia**. In modalità iOS il pulsante **Stop** viene nascosto.

## Varianti degli esercizi

Premi **Esercizi** accanto a un esercizio per aprire una lista curata di movimenti coerenti. Gli esercizi creati dal catalogo mostrano invece il pulsante **Esercizio**, che apre direttamente l'anteprima animata e le istruzioni della voce scelta.

Le anteprime alternano le due immagini disponibili nel repository `free-exercise-db`. Il database è distribuito nel pubblico dominio tramite Unlicense.

## Installazione

Apri [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/) direttamente in Safari.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, personalizzazioni della scheda, esercizi aggiunti e impostazioni.
