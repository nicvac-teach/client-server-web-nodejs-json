[⬅️ [TORNA ALL'INDICE] ](../README.md)

# Esercitazione con JSON

## Obiettivo
Creare un'applicazione web che gestisce una lista di studenti. Per ogni studente memorizziamo:
- ID univoco (generato automaticamente)
- Nome completo
- Numero di crediti acquisiti

L'applicazione deve:
1. Mantenere i dati in un file JSON sul server
2. Mostrare una tabella con tutti gli studenti
3. Permettere l'inserimento di nuovi studenti
4. Aggiornare automaticamente la vista dopo ogni inserimento

## Passo 1: Creazione File JSON Iniziale
Creiamo il file `backend/data/studenti.json` con alcuni dati di esempio:
```json
{
    "studenti": [
        {
            "id": 1,
            "nome": "Mario Rossi",
            "crediti": 42
        },
        {
            "id": 2,
            "nome": "Laura Bianchi",
            "crediti": 36
        }
    ]
}
```

## Passo 2: Server Express
Creiamo il file `backend/app.js`:
```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Configurazione
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Percorso del file JSON
const dataPath = path.join(__dirname, 'data', 'studenti.json');

// Funzione per leggere il file JSON
function leggiStudenti() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Errore lettura file:', error);
        return { studenti: [] };
    }
}

// Funzione per salvare nel file JSON
function salvaStudenti(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
        return true;
    } catch (error) {
        console.error('Errore scrittura file:', error);
        return false;
    }
}

// Route principale
app.get('/', (req, res) => {
    const data = leggiStudenti();
    res.render('index', { studenti: data.studenti });
});

// Route per aggiungere studente
app.post('/aggiungi-studente', (req, res) => {
    // Leggi dati esistenti
    const data = leggiStudenti();
    
    // Calcola nuovo ID
    const nuovoId = data.studenti.length > 0 
        ? Math.max(...data.studenti.map(s => s.id)) + 1 
        : 1;
    
    // Crea nuovo studente
    const nuovoStudente = {
        id: nuovoId,
        nome: req.body.nome,
        crediti: parseInt(req.body.crediti)
    };
    
    // Aggiungi al array e salva
    data.studenti.push(nuovoStudente);
    salvaStudenti(data);
    
    // Redirect alla home
    res.redirect('/');
});

// Avvio server
app.listen(3000, () => {
    console.log('Server attivo sulla porta 3000');
});
```

### Spiegazione del Codice Server

1. **Configurazione Iniziale**
   ```javascript
   app.use(express.urlencoded({ extended: true }));
   app.set('view engine', 'ejs');
   app.set('views', path.join(__dirname, '..', 'views'));
   ```
   - Configura il parsing dei dati form
   - Imposta EJS come template engine
   - Definisce la cartella delle views relativa alla root del progetto

2. **Gestione File JSON**
   ```javascript
   function leggiStudenti() {
       try {
           const data = fs.readFileSync(dataPath, 'utf8');
           return JSON.parse(data);
       } catch (error) {
           return { studenti: [] };
       }
   }
   ```
   - Legge il file in modo sincrono
   - Gestisce eventuali errori
   - Ritorna un oggetto vuoto se il file non esiste

3. **Route GET '/'**
   ```javascript
   app.get('/', (req, res) => {
       const data = leggiStudenti();
       res.render('index', { studenti: data.studenti });
   });
   ```
   - Legge i dati dal JSON
   - Passa l'array studenti al template

4. **Route POST '/aggiungi-studente'**
   ```javascript
   app.post('/aggiungi-studente', (req, res) => {
       const data = leggiStudenti();
       const nuovoId = data.studenti.length > 0 
           ? Math.max(...data.studenti.map(s => s.id)) + 1 
           : 1;
       // ...
   });
   ```
   - Calcola nuovo ID basato su ID massimo esistente
   - Crea nuovo oggetto studente
   - Aggiorna il file JSON

## Passo 3: Template EJS
Creiamo il file `views/index.ejs`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Gestione Studenti</title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <meta charset="UTF-8">
</head>
<body>
    <div class="w3-container">
        <h2 class="w3-text-blue">Lista Studenti</h2>
        
        <!-- Tabella Studenti -->
        <table class="w3-table-all w3-card-4 w3-margin-bottom">
            <tr class="w3-blue">
                <th>ID</th>
                <th>Nome</th>
                <th>Crediti</th>
            </tr>
            <% studenti.forEach(function(s) { %>
                <tr>
                    <td><%= s.id %></td>
                    <td><%= s.nome %></td>
                    <td><%= s.crediti %></td>
                </tr>
            <% }); %>
        </table>

        <!-- Form Nuovo Studente -->
        <form action="/aggiungi-studente" method="POST" 
              class="w3-container w3-card-4 w3-margin">
            <h3>Aggiungi Nuovo Studente</h3>
            
            <label class="w3-text-blue">Nome</label>
            <input class="w3-input w3-border" type="text" 
                   name="nome" required>
            
            <label class="w3-text-blue">Crediti</label>
            <input class="w3-input w3-border" type="number" 
                   name="crediti" min="0" max="180" required>
            
            <button class="w3-btn w3-blue w3-margin-top" 
                    type="submit">Aggiungi</button>
        </form>
    </div>
</body>
</html>
```

### Spiegazione del Template

1. **Struttura HTML**
   - Usa W3.CSS per lo stile
   - Container principale centrato
   - Divisione chiara tra tabella e form

2. **Tabella Studenti**
   ```ejs
   <% studenti.forEach(function(s) { %>
       <tr>
           <td><%= s.id %></td>
           <td><%= s.nome %></td>
           <td><%= s.crediti %></td>
       </tr>
   <% }); %>
   ```
   - Itera sull'array degli studenti
   - Escape automatico dei dati con <%= %>
   - Struttura tabellare responsive

3. **Form Inserimento**
   ```ejs
   <form action="/aggiungi-studente" method="POST">
       <input name="nome" required>
       <input name="crediti" type="number" min="0" max="180" required>
   </form>
   ```
   - Validazione HTML5 dei campi
   - Limiti sui crediti (0-180)
   - Stile coerente con la tabella

## Come Testare

1. Avvia il server:
```bash
node backend/app.js
```

2. Apri il browser:
```
http://localhost:3000
```

Il programma mostrerà:
- Tabella con gli studenti esistenti
- Form per aggiungere nuovo studente
- Dopo l'inserimento, la pagina si aggiorna automaticamente


[⬅️ [TORNA ALL'INDICE] ](../README.md)