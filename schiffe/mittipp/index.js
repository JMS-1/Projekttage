// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var nichtGeprüft = zelle + ' unbenutzt';
var daneben = zelle + ' daneben';
var treffer = zelle + ' treffer';
var versenkt = zelle + ' versenkt';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen, gezogen, starter, auswahl, spielzüge, tippAnzeige, tipp, tippSchalter;

// Die Größen der Schiffe
var größen = [5, 4, 3, 3, 2];

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Wichtige Elemente einmal suchen
    tipp = document.getElementById('tipp');
    auswahl = document.getElementById('auswahl');
    starter = document.getElementById('starter');
    tippSchalter = document.getElementById('tippAn');
    tippAnzeige = document.getElementById('tippAnzeige');

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

        // Wir wollen auf das Anklicken reagieren
        zielfeld.onclick = prüfen;
    }

    // Startknopf erst einmal deaktivieren
    starter.setAttribute('disabled', 'disabled');
    tippSchalter.setAttribute('disabled', 'disabled');

    // Tipp ausblenden
    tippAnzeige.className = 'keinTipp';
    tipp.textContent = 0;

    // Und den Zähler zurücksetzen
    spielzüge = 0;
}

// Tips anzeigen.
function tippAn() {
    tippAnzeige.className = '';
}

// Wird beim Anklicken einer Zelle aufgerufen.
function prüfen() {
    // Spielinformationen auslesen
    var daten = this.spieldaten;

    // Anzahl der Treffer im Umfeld ermitteln
    var umfeld = 0;

    for (var zeile = Math.max(0, daten.zeile - 1), zeileMax = Math.min(9, daten.zeile + 1) ; zeile <= zeileMax; zeile++)
        for (var spalte = Math.max(0, daten.spalte - 1), spalteMax = Math.min(9, daten.spalte + 1) ; spalte <= spalteMax; spalte++)
            if ((zeile != daten.zeile) || (spalte != daten.spalte))
                if (alleZellen[10 * zeile + spalte].spieldaten.schiff != -1)
                    umfeld += 1;

    // Anzeigen
    tipp.textContent = umfeld;

    // Nur, wenn diese Zelle noch nicht benutzt wurde
    if (this.className != nichtGeprüft)
        return;

    // Das war ein Versuch
    spielzüge += 1;

    // Kein Treffer
    if (daten.schiff == -1) {
        this.className = daneben;
        return;
    }

    // Erst einmal als normalen Treffer markieren
    this.className = treffer;

    // Anzahl der Treffer zählen
    var trefferSchiff = 0;

    for (var zs = 0; zs < alleZellen.length; zs++) {
        var spielZelle = alleZellen[zs];
        var schiff = spielZelle.spieldaten.schiff;

        // Uns intereesiert nur das gerade getroffene Schiff
        if (schiff == daten.schiff)
            if (spielZelle.className == treffer)
                trefferSchiff += 1;
    }

    // Noch nicht versenkt
    if (trefferSchiff != größen[daten.schiff])
        return;

    // Schauen wir mal gleichzeitig, ob alles versenkt ist
    var alleVersenkt = true;

    // Das Schiff ist nun versenkt
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var spielZelle = alleZellen[zs];
        var schiff = spielZelle.spieldaten.schiff;

        // Das aktuelle Schiff
        if (schiff == daten.schiff)
            spielZelle.className = versenkt;

        // Alle Schiffe
        if (schiff != -1)
            if (spielZelle.className != versenkt)
                alleVersenkt = false;
    }

    // Melden
    if (alleVersenkt)
        alert('Alle Schiff mit ' + spielzüge + ' Bomben versenkt!');
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

    // Tipps können nun benutzt werden
    tippSchalter.removeAttribute('disabled');
}