// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var nichtGeprüft = zelle + ' unbenutzt';
var daneben = zelle + ' daneben';
var treffer = zelle + ' treffer';
var versenkt = zelle + ' versenkt';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen, gezogen, starter, auswahl;

// Die Größen der Schiffe
var größen = [5, 4, 3, 3, 2];

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Wichtige Elemente einmal suchen
    starter = document.getElementById('starter');
    auswahl = document.getElementById('auswahl');

    // Wir suchen unser Spielfeld
    var spielfeld = document.getElementById('spielfeld');

    // Darin alle relevanten Zellen
    alleZellen = spielfeld.querySelectorAll('.' + zelle + ':not(.spaltennummer):not(.zeilennummer)');

    // Nur eine kleine Sicherheitsprüfung, ob wir das auch alles richtig gemacht haben
    if (alleZellen.length != 100) {
        alert('Komisches Schiffe versenken mit ' + alleZellen.length + ' Feldern - da muss ich leider passen!');

        // Da brauchen wir erst gar nicht weiter zu machen
        return;
    }

    // Wir erlauben nun das verschieben von allen Schiffen für den Spielaufbau
    var schiffeImPool = document.querySelectorAll('img.vertikal, img.horizontal');
    var indexHorizontal = 0;
    var indexVertikal = 0;

    for (var i = 0; i < schiffeImPool.length; i++) {
        // In der HTML Datei kommen erst die vertikalen, dann die horizontalen Schiffe, absteigend nach der Größe angeordnet
        var poolSchiff = schiffeImPool[i];
        var horizontal = (poolSchiff.className == 'horizontal');
        var index = horizontal ? indexHorizontal++ : indexVertikal++;

        // Daten erweitern
        poolSchiff.spieldaten = {
            index: index,
            horizontal: horizontal,
        };

        poolSchiff.ondragstart = function (ev) {
            ev.dataTransfer.effectAllowed = 'copy';

            // Wir merken uns, was wir gerade durch die Gegend ziehen
            gezogen = this;
        };
    }

    // Theoretisch können wir auf allen Zellen fallen lassen
    for (var i = 0; i < alleZellen.length; i++) {
        var zielfeld = alleZellen[i];

        // Optisch zurücksetzen
        zielfeld.className = zelle;

        // Bisher nicht belegt
        zielfeld.spieldaten = {
            zeile: Math.floor(i / 10),
            spalte: i % 10,
            schiff: -1,
        };

        // Prüfung anschalten
        zielfeld.ondragover = fallenlassenPrüfen;

        // Abschluss anschalten
        zielfeld.ondrop = fallenlassen;
    }

    // Startknopf erst einmal deaktivieren
    starter.setAttribute('disabled', 'disabled');
}

// Wird aufgerufen, wenn eine Schiff gesetzt wurde.
function fallenlassen(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    // Daten zum Spiel auslesen
    var poolSchiffDaten = gezogen.spieldaten;
    var daten = this.spieldaten;

    // Größe des Schiffs ermitteln
    var größe = größen[poolSchiffDaten.index];

    // Grenzwerte ermitteln
    var rechts = daten.spalte + (poolSchiffDaten.horizontal ? größe - 1 : 0);
    var unten = daten.zeile + (poolSchiffDaten.horizontal ? 0 : größe - 1);
    var links = daten.spalte;
    var oben = daten.zeile;

    // Schiff an der alten Position entfernen
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var spielZelle = alleZellen[zs];
        var zellenDaten = spielZelle.spieldaten;

        if (zellenDaten.schiff == poolSchiffDaten.index) {
            spielZelle.className = zelle;
            zellenDaten.schiff = -1;
        }
    }

    // Schiff an die neue Position setzen
    for (var zeile = oben; zeile <= unten; zeile++)
        for (var spalte = links; spalte <= rechts; spalte++) {
            var spielZelle = alleZellen[10 * zeile + spalte];
            var zellenDaten = spielZelle.spieldaten;

            zellenDaten.schiff = poolSchiffDaten.index;
            spielZelle.className = versenkt;
        }

    // Nun schauen wir einmal, ob alles versteckt ist
    var schonVersteckt = 0;

    // Schiff an der alten Position entfernen
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var spielZelle = alleZellen[zs];
        var zellenDaten = spielZelle.spieldaten;

        if (zellenDaten.schiff != -1)
            schonVersteckt |= 1 << zellenDaten.schiff;
    }

    // Dann können wir auch die Schaltfläche zum Starten freigeben
    if (schonVersteckt == 0x1f)
        starter.removeAttribute('disabled');
}

// Prüft, ob ein Schiff an einer bestimmte Stelle versteckt werden kann.
function fallenlassenPrüfen(ev) {
    // Daten zum Spiel auslesen
    var poolSchiffDaten = gezogen.spieldaten;
    var daten = this.spieldaten;

    // Größe des Schiffs ermitteln
    var größe = größen[poolSchiffDaten.index];

    // Grenzwerte ermitteln
    var rechts = daten.spalte + (poolSchiffDaten.horizontal ? größe - 1 : 0);
    var unten = daten.zeile + (poolSchiffDaten.horizontal ? 0 : größe - 1);
    var links = daten.spalte;
    var oben = daten.zeile;

    // Das geht gar nicht
    if ((rechts > 9) || (unten > 9)) {
        ev.dataTransfer.effectAllowed = 'none';
        return;
    }

    // Nun müssen wir noch prüfen, ob hier bereits ein Schiff steht
    for (var zeile = oben; zeile <= unten; zeile++)
        for (var spalte = links; spalte <= rechts; spalte++) {
            var spielZelle = alleZellen[10 * zeile + spalte];
            var zellenDaten = spielZelle.spieldaten;

            // Da steht schon etwas anderes als wir selbst
            if (zellenDaten.schiff != -1)
                if (zellenDaten.schiff != poolSchiffDaten.index) {
                    ev.dataTransfer.effectAllowed = 'none';
                    return;
                }
        }

    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.effectAllowed = 'copy';
}

// Hier können wir gar nicht fallen lassen.
function fallenlassenVerbieten(ev) {
    ev.dataTransfer.effectAllowed = 'none';
}

// Spiel starten
function los() {
    // Auswahl beendet 
    auswahl.style.display = 'none';

    // Schiffe verstecken
    for (var zs = 0; zs < alleZellen.length; zs++)
        alleZellen[zs].className = nichtGeprüft;
}