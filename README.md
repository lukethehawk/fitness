# Fitness

Webapp mobile-first, gratuita e open source per creare e seguire una scheda palestra personalizzata direttamente dal browser.

Permette di organizzare gli allenamenti, registrare carichi, serie e note, usare un timer di recupero e condividere i dati in Markdown o Excel. Non richiede account e non invia i dati a un server.

**Versione attuale:** 1.0.40  
**Webapp:** [lukethehawk.github.io/fitness](https://lukethehawk.github.io/fitness/)

## Funzioni principali

- Da 1 a 7 giorni di allenamento, aggiungibili e rimovibili
- Nome dell'allenamento e giorno della settimana modificabili
- Esercizi iniziali completamente sostituibili o eliminabili
- Aggiunta di nuovi esercizi dal catalogo completo
- Serie aumentabili o diminuibili per ogni esercizio
- Riordino tramite trascinamento in una modalità modifica compatta
- Nome degli esercizi liberamente personalizzabile
- Registrazione di peso, serie completate e note
- Lingua dei nomi del catalogo selezionabile tra italiano e inglese
- Timer di recupero compatto con durata predefinita di 60 secondi
- Modalità opzionale con timer nativo iOS tramite Comandi Rapidi
- Esportazione della giornata o della settimana in Markdown e Excel
- Versione visibile, avviso aggiornamenti e changelog consultabile nell'app
- Salvataggio locale sul dispositivo, senza account o backend

## Scheda personalizzabile

Premi **Modifica scheda** per modificare la struttura dell'allenamento.

Da questa modalità puoi:

- aggiungere o rimuovere giornate;
- assegnare un giorno della settimana;
- rinominare ogni allenamento;
- aumentare o diminuire le serie;
- trascinare gli esercizi per cambiarne l'ordine;
- modificare, sostituire, rinominare o eliminare qualsiasi esercizio, compresi quelli preconfigurati.

Puoi configurare da una a sette giornate. I nuovi giorni partono vuoti e possono essere popolati tramite **Aggiungi esercizio**.

La sostituzione o la rinomina di una card mantiene il suo identificatore interno, quindi i dati già registrati non vengono persi.

## Catalogo esercizi

Il catalogo è collegato a [free-exercise-db](https://github.com/yuhonas/free-exercise-db) e offre:

- ricerca per nome;
- filtri per gruppo muscolare e attrezzatura;
- numerose varianti per ogni parte del corpo;
- immagini animate per riconoscere il movimento;
- scelta dei nomi in italiano o inglese.

Ogni esercizio mantiene il collegamento tecnico con il database anche quando viene rinominato. In questo modo immagini, istruzioni ed esportazioni restano coerenti.

## Timer di recupero

Il timer è raccolto in una bolla compatta che può essere aperta quando serve. La selezione di 60, 90, 120 o 180 secondi imposta la durata; il conto alla rovescia parte soltanto premendo **Avvia**.

### Timer interno

Funziona direttamente nella webapp e può usare le notifiche consentite dal browser. Su iPhone il sistema può sospendere JavaScript quando Safari passa in background o lo schermo viene bloccato, quindi l'avviso non è sempre garantito.

### Timer nativo iOS

Nelle impostazioni è disponibile il collegamento opzionale con **Comandi Rapidi**. Quando è attivo, la webapp passa la durata selezionata a un comando rapido che avvia il timer nativo dell'iPhone, più affidabile a schermo bloccato.

Configurazione suggerita:

1. Apri l'app **Comandi Rapidi** su iPhone.
2. Crea un comando chiamato `Timer Palestra`.
3. Configuralo per ricevere l'input del comando rapido.
4. Usa l'input come durata dell'azione **Avvia timer**.
5. Facoltativamente aggiungi alla fine **Apri app → Safari**.
6. Nella webapp apri le impostazioni del timer iOS.
7. Attiva la modalità e inserisci `Timer Palestra` come nome del comando.
8. Usa il pulsante di test da 10 secondi.

Questa modalità non richiede backend, Telegram o Web Push. iOS può comunque aprire Comandi Rapidi o mostrare una conferma durante l'avvio.

## Esportazione e condivisione

Il pulsante **Esporta o condividi**, in fondo alla giornata, permette di scegliere due opzioni indipendenti:

- **Periodo:** Giornata oppure Settimana
- **Formato:** Markdown oppure Excel

### Markdown

Il diario Markdown include:

- data e nome dell'allenamento;
- esercizi svolti;
- immagini associate;
- peso utilizzato;
- serie completate;
- note;
- riepilogo degli esercizi saltati.

Gli esercizi con zero serie completate vengono indicati come saltati e raccolti in fondo. Il file può essere condiviso con Joplin, altre app di note, email, servizi cloud o applicazioni compatibili.

### Excel

L'esportazione Excel crea un vero file `.xlsx`, senza immagini, pensato per filtri, ordinamenti e analisi.

Ogni esercizio occupa una riga. Le colonne comprendono:

- data e giorno;
- nome dell'allenamento;
- esercizio e parte del corpo;
- programma e serie previste;
- serie completate;
- peso usato;
- note;
- stato dell'esercizio.

Il foglio contiene filtri automatici, larghezze già impostate e intestazione bloccata.

### Limite dello storico

L'esportazione fotografa i dati attualmente salvati nelle giornate della scheda. La webapp non conserva ancora uno storico separato per ogni settimana: dopo un reset, i dati precedenti non sono più disponibili nell'app. Per creare uno storico è consigliabile esportare la settimana prima di azzerarla.

## Aggiornamenti e novità

In fondo alla scheda è visibile la versione installata.

Quando viene pubblicata una nuova release:

1. compare un breve avviso;
2. resta disponibile il pulsante **Aggiorna**;
3. premendo il pulsante viene sostituita la cache della webapp;
4. allenamenti, impostazioni e dati salvati nel browser non vengono cancellati.

Il pulsante **Novità** apre un changelog leggibile con le principali funzioni introdotte, dalla versione più recente alle prime tappe del progetto.

## Dati e privacy

I dati vengono memorizzati nel `localStorage` del browser utilizzato. Non sono previsti account, database remoto o sincronizzazione automatica tra dispositivi.

Restano sul dispositivo:

- struttura e nomi degli allenamenti;
- esercizi aggiunti e personalizzazioni;
- carichi, serie e note;
- impostazioni della lingua e del timer.

La cancellazione dei dati del sito, l'uso di un altro browser o il reset completo dell'app può rimuovere queste informazioni. L'aggiornamento tramite il pulsante interno non cancella il `localStorage`.

## Installazione

La webapp può essere utilizzata direttamente dal browser oppure aggiunta alla schermata Home come PWA.

Su iPhone, se il comando rapido deve riaprire automaticamente la webapp al termine del timer, può essere più pratico utilizzarla direttamente in Safari: le PWA installate non sempre vengono mostrate da iOS tra le app selezionabili in **Apri app**.

## Tecnologie e licenza

Il progetto è una webapp statica in HTML, CSS e JavaScript, pubblicata tramite GitHub Pages.

Le immagini e i dati del catalogo provengono da [free-exercise-db](https://github.com/yuhonas/free-exercise-db). Per condizioni d'uso e attribuzione del database fare riferimento al relativo repository.

Il codice di questa webapp è disponibile pubblicamente in questo repository.
