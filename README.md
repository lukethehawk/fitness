# Scheda palestra 3 giorni

Webapp statica mobile-first per consultare e tracciare una routine Upper / Lower di tre giorni.

## Funzioni

- Tre schede: Upper A, Lower e Upper B.
- Peso, note e serie completate salvati in `localStorage`.
- Timer pause da 60, 90, 120 e 180 secondi con vibrazione, quando supportata.
- Esercizi personalizzati assegnabili a ciascun giorno.
- Reset dei dati del solo giorno aperto o reset completo.
- Dashboard con allenamento consigliato in base al giorno della settimana.
- Nessuna dipendenza esterna e nessun backend.

## Uso locale

Apri direttamente `index.html` in un browser moderno. I dati restano nel browser e nel dispositivo in cui vengono inseriti.

Per una prova con server locale, dalla cartella del progetto puoi usare un qualsiasi server statico, per esempio:

```powershell
npx serve .
```

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository GitHub.
2. Carica nella radice del repository `index.html`, `style.css`, `app.js` e `README.md`.
3. Apri **Settings > Pages** nel repository.
4. In **Build and deployment**, scegli **Deploy from a branch**.
5. Seleziona il branch `main`, cartella `/ (root)`, quindi premi **Save**.
6. Dopo il deploy, GitHub mostrerà l'indirizzo pubblico della webapp.

Di solito l'indirizzo è:

```text
https://NOME-UTENTE.github.io/NOME-REPOSITORY/
```

## Modificare la scheda

Gli allenamenti iniziali si trovano nell'oggetto `WORKOUTS` all'inizio di `app.js`. Ogni esercizio usa questa struttura:

```javascript
{
  id: "identificatore-unico",
  name: "Nome esercizio",
  setsReps: "3x8-12",
  focus: "Gruppo muscolare",
  description: "Indicazione tecnica breve."
}
```

L'`id` deve essere unico e non andrebbe cambiato dopo l'uso, perché collega l'esercizio ai dati salvati nel browser.

## Nota sui dati

I dati sono locali al browser tramite `localStorage`: non vengono sincronizzati tra dispositivi e possono essere rimossi cancellando i dati del sito dal browser.
