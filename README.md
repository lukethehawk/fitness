# Fitness

Web app mobile-first per seguire una scheda Upper/Lower di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale Upper / Lower su tre giorni
- Prossimo allenamento calcolato in base al giorno corrente
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Conto alla rovescia visibile nella bolla e ripristinato alla riapertura
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Modalità modifica compatta per serie, riordino touch tramite trascinamento e sostituzione degli esercizi
- Catalogo completo di 873 esercizi collegato a [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- Popup con filtri per muscolo, attrezzatura e ricerca
- Lingua dei nomi degli esercizi selezionabile tra italiano e inglese
- Esportazione della giornata in Markdown tramite Condividi, copia o download
- Anteprime animate prima della creazione dell'esercizio
- Salvataggio locale di serie, ripetizioni, carichi e note
- WorkoutX disponibile come guida opzionale

## Modifica della scheda

Premi **Modifica scheda** accanto al titolo dell'allenamento per aumentare o diminuire le serie, modificare un esercizio oppure trascinarlo dalla maniglia per cambiarne l'ordine. Il trascinamento usa eventi touch/pointer compatibili con Safari iOS e salva automaticamente il nuovo ordine.

Durante la modifica le card diventano più sottili e mostrano soltanto nome, serie e comandi essenziali. In questo modo su iPhone resta più spazio verticale per trascinare e riordinare gli esercizi.

Le modifiche mantengono l'identificatore interno della card, quindi pesi, note e serie già registrate non vengono cancellati quando cambi nome, variante, numero di serie o posizione.

Dal **Menu** premi **Aggiungi esercizio** per aprire il catalogo in un popup separato. Puoi filtrare per gruppo muscolare e attrezzatura e guardare l'anteprima animata prima di scegliere. La nuova card viene collegata automaticamente alle immagini e alle istruzioni di `free-exercise-db`.

Il catalogo viene scaricato soltanto alla prima apertura e poi conservato nella cache del browser. Comprende tutti gli 873 esercizi del database; quasi tutti i gruppi muscolari hanno almeno 10 opzioni. Il collo ne ha 9 perché questo è il numero di esercizi disponibili nel dataset sorgente.

## Lingua degli esercizi

Dal **Menu**, nella sezione **Lingua esercizi**, puoi attivare o disattivare **Nomi in italiano**. La scelta viene salvata sul dispositivo e si applica sia al catalogo sia agli esercizi aggiunti alla scheda. Disattivando il toggle vengono ripristinati i nomi originali inglesi del database.

## Esportazione in Joplin

Premi **Esporta giornata** nella scheda aperta per generare un diario Markdown con data, esercizi, immagini associate, peso usato, serie completate e note. Puoi usare **Condividi** su iPhone e scegliere Joplin, copiare il Markdown oppure scaricare il file `.md`.

La cartella o il taccuino di destinazione vengono scelti dentro Joplin. La webapp non salva token del Joplin Server: la Data API ufficiale appartiene al servizio Web Clipper locale dell'app desktop, mentre Joplin Server gestisce la sincronizzazione.

## Timer iOS tramite Comandi Rapidi

La modalità opzionale **Timer iOS** usa lo schema URL `shortcuts://` per passare la durata scelta a un Comando Rapido. I pulsanti della durata effettuano solo la selezione e il timer parte premendo **Avvia**. In modalità iOS il pulsante **Stop** viene nascosto.

## Varianti degli esercizi

Premi **Esercizi** accanto a un esercizio per aprire una lista curata di movimenti coerenti. Gli esercizi creati dal catalogo mostrano invece il pulsante **Esercizio**, che apre direttamente l'anteprima animata e le istruzioni della voce scelta.

Le anteprime alternano le due immagini disponibili nel repository `free-exercise-db`. Il database è distribuito nel pubblico dominio tramite Unlicense.

## Installazione

Apri [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/) direttamente in Safari.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, personalizzazioni della scheda, esercizi aggiunti e impostazioni.
