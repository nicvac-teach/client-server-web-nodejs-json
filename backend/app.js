const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const FileStore = require('session-file-store')(session);

const app = express();

// Configurazione EJS
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    store: new FileStore({
        path: './sessions',  // cartella dove salvare i file delle sessioni
        ttl: 86400          // tempo di vita della sessione in secondi (24 ore)
    }),
    secret: 'la mia chiave segreta',  // Chiave per cifrare la sessione
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000  // Cookie valido per 24 ore
    }
}));

app.get('/', (req, res) => {
    // Controlliamo se esiste una sessione con il nome
    if (req.session.name) {
        // Se la sessione esiste, mostra la pagina di saluto
        res.render('greet', { 
            message: 'Bentornato', 
            name: req.session.name 
        });
    } else {
        // Se non esiste, mostra il form
        res.render('form');
    }
});

app.post('/greet', (req, res) => {
    const name = req.body.name;
    
    // Salviamo il nome nella sessione
    req.session.name = name;
    
    // Generiamo un ID di sessione casuale
    req.session.id = uuidv4();
    
    res.render('greet', { 
        message: 'Benvenuto', 
        name: name 
    });
});

app.post('/logout', (req, res) => {
    // Distruggiamo la sessione
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});