# Fitness

Web app mobile-first per seguire e personalizzare una scheda palestra di 3 giorni, registrare serie e carichi e usare un timer di recupero.

## Funzioni

- Scheda settimanale personalizzabile su tre giorni
- Nomi dei tre allenamenti modificabili
- Recupero predefinito di 60 secondi
- Timer in una bolla compatta, espandibile a richiesta
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Modalità modifica compatta per serie, riordino touch e sostituzione degli esercizi
- Catalogo completo collegato a [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- Lingua dei nomi degli esercizi selezionabile tra italiano e inglese
- Esportazione della giornata in un file Markdown nominato con data e allenamento
- Salvataggio locale di serie, ripetizioni, carichi e note

## Modifica della scheda

Premi **Modifica scheda** per aumentare o diminuire le serie, modificare o trascinare un esercizio. In questa modalità compare anche il campo **Nome allenamento**, che consente di rinominare ciascuna delle tre giornate. I nomi personalizzati vengono usati nelle schede, nei menu e nell'esportazione.

Durante la modifica le card diventano più sottili e mostrano soltanto nome, serie e comandi essenziali, lasciando più spazio verticale su iPhone.

## Esportazione in Joplin

Il pulsante **Esporta giornata** si trova alla fine dell'elenco degli esercizi. Genera un file come `2026-06-10-lower.md`, con data, titolo della giornata, immagini, peso, serie completate e note.

Gli esercizi con zero serie completate vengono indicati nel riepilogo iniziale come saltati e spostati alla fine del documento. Su iPhone la webapp prova a condividere direttamente il file `.md` con il nome corretto; se il destinatario non accetta file Markdown, usa il testo come fallback. Sono disponibili anche **Copia Markdown** e **Scarica .md**.

La cartella o il taccuino di destinazione vengono scelti dentro Joplin.

## Timer iOS tramite Comandi Rapidi

La modalità opzionale **Timer iOS** usa lo schema URL `shortcuts://` per passare la durata scelta a un Comando Rapido. I pulsanti della durata effettuano solo la selezione e il timer parte premendo **Avvia**. In modalità iOS il pulsante **Stop** viene nascosto.

## Dati

Tutti i dati dell'allenamento restano nel browser del dispositivo. La cancellazione dei dati del sito rimuove anche progressi, personalizzazioni della scheda, esercizi aggiunti, nomi degli allenamenti e impostazioni.
