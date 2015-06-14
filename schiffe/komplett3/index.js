// Einige CSS Klassennamen, die wir im Code verwenden
var unsichtbar = 'unsichtbar';
var legendeSichtbar = 'legende';

// Beschreibt den Inhalt einer Zelle.
function ZellInhalt(zeile, spalte) {
    this.schiff = null;
    this.zeile = zeile;
    this.spalte = spalte;
}

// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var nichtGeprüft = zelle + ' unbenutzt';
var versenkt = zelle + ' versenkt';
var daneben = zelle + ' daneben';
var treffer = zelle + ' treffer';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen, spielfeld, auswahl, starten, legende, versuche, neustart, tippSchalter, tipp, tippAnzeige;

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Was wird so an DOM Elementen brauchen
    tippSchalter = document.getElementById('tippSchalter');
    tippAnzeige = document.getElementById('tippAnzeige');
    starten = document.getElementById('aufbauFertig');
    spielfeld = document.getElementById('spielfeld');
    neustart = document.getElementById('neustart');
    auswahl = document.getElementById('auswahl');
    legende = document.getElementById('legende');
    tipp = document.getElementById('tipp');

    // Alle relevanten Zellen auf dem Spielfeld
    alleZellen = spielfeld.querySelectorAll('.' + zelle + ':not(.spaltennummer):not(.zeilennummer)');

    // Nur eine kleine Sicherheitsprüfung, ob wir das auch alles richtig gemacht haben
    if (alleZellen.length != 100) {
        alert('Komisches Schiffe versenken mit ' + alleZellen.length + ' Feldern - da muss ich leider passen!');
    }

    // Aufbauen
    spieler1();
}

// Schaltet in den Aufbaumodus um.
function spieler1() {
    // Erst einmal alles auf den Anfangszustand setzen
    for (var i = 0; i < alleZellen.length; i++) {
        var eineZelle = alleZellen[i];

        eineZelle.className = zelle;
        eineZelle.onclick = schiffVerstecken;

        eineZelle.inhalt = new ZellInhalt(Math.floor(i / 10), i % 10);
    }

    // Und den Rest
    starten.setAttribute('disabled', 'disabled');
    tippSchalter.className = unsichtbar;
    neustart.className = unsichtbar;
    legende.className = unsichtbar;
    starten.className = '';
}

// Schaltet in den Spielmodus um.
function spieler2() {
    // Erst einmal alles auf den Anfangszustand setzen
    for (var i = 0; i < alleZellen.length; i++) {
        var eineZelle = alleZellen[i];

        // Hier nur die optischen Einstellungen
        eineZelle.className = nichtGeprüft;
        eineZelle.onclick = aufTrefferPrüfen;
    }

    // Und den Rest
    legende.className = legendeSichtbar;
    starten.className = unsichtbar;
    tippAnzeige.checked = false;
    tippSchalter.className = '';
    neustart.className = '';
    tipp.textContent = '';
    versuche = 0;
}

// Wählt eine Zelle als linke obere Ecke eines zu versteckenden Schiffs aus.
function schiffVerstecken(ev) {
    // Wir müssen beachten, dass this in der onclick Funktion einen neuen Wert erhält, also: zwischenspeichern
    var dieZelle = this;

    // Die Auswahlliste oben links in die Zelle setzen
    var meinePosition = dieZelle.getBoundingClientRect();
    auswahl.style.left = (meinePosition.left + 4) + "px";
    auswahl.style.top = (meinePosition.top + 4) + "px";
    auswahl.className = '';

    // Auswahl vorbereiten
    for (var i = 0; i < auswahl.childNodes.length; i++)
        auswahl.childNodes[i].onclick = function () {
            // Auf jeden Fall wird die Auswahlliste ausgeblendet
            auswahl.className = unsichtbar;

            // Welches Schiff wurde zum verstecken ausgesucht?
            var id = this.getAttribute("data-id");
            if (id.length < 1)
                return;

            var breite = parseInt(this.getAttribute("data-breite"));
            var hoehe = parseInt(this.getAttribute("data-hoehe"));

            // Vom Schiff besetzte Zellen ermitteln
            var inhalt = dieZelle.inhalt;
            var links = inhalt.spalte;
            var rechts = links + breite - 1;
            if (rechts > 9)
                return;
            var oben = inhalt.zeile;
            var unten = oben + hoehe - 1;
            if (unten > 9)
                return;

            // Schiff darf kein anders überlappen
            for (var zeile = oben; zeile <= unten; zeile++)
                for (var spalte = links; spalte <= rechts; spalte++) {
                    var zielZelle = alleZellen[10 * zeile + spalte];
                    var zielInhalt = zielZelle.inhalt;
                    var schiff = zielInhalt.schiff;

                    if (schiff != null)
                        if (schiff != id)
                            return;
                }

            // Schiff an der alten Position entfernen
            for (var i = 0; i < alleZellen.length; i++) {
                var zielZelle = alleZellen[i];
                var zielInhalt = zielZelle.inhalt;

                if (zielInhalt.schiff == id) {
                    zielZelle.className = zelle;
                    zielInhalt.schiff = null;
                }
            }

            // Schiff eintragen
            for (var zeile = oben; zeile <= unten; zeile++)
                for (var spalte = links; spalte <= rechts; spalte++) {
                    var zielZelle = alleZellen[10 * zeile + spalte];

                    zielZelle.className = versenkt;
                    zielZelle.inhalt.schiff = id;
                }

            // Nachsehen, ob alle Schiffe versteckt sind
            var versteckt = 0;

            for (var i = 0; i < alleZellen.length; i++) {
                var zielZelle = alleZellen[i];
                var zielInhalt = zielZelle.inhalt;

                if (zielInhalt.schiff != null)
                    versteckt |= 1 << zielInhalt.schiff;
            }

            if (versteckt == 0x1f)
                starten.removeAttribute('disabled');
        }
}

// Prüft auf einen Treffer.
function aufTrefferPrüfen() {
    var inhalt = this.inhalt;

    // Treffer im Umfeld zählen
    var umfeld = 0;

    for (var zeile = inhalt.zeile - 1; zeile <= inhalt.zeile + 1; zeile++)
        if ((zeile >= 0) && (zeile <= 9))
            for (var spalte = inhalt.spalte - 1; spalte <= inhalt.spalte + 1; spalte++)
                if ((spalte >= 0) && (spalte <= 9))
                    if (alleZellen[10 * zeile + spalte].inhalt.schiff != null)
                        umfeld++;

    // Diese Zahl auch beim wiederholten Klicken straffrei anzeigen
    tipp.textContent = '(Anzahl der Treffer in der Umgebung: ' + umfeld + ')';

    // Das haben wir schon geprüft
    if (this.className != nichtGeprüft)
        return;

    // Das zählen wir dann als echten Versuch
    versuche++;

    // Da ist aber kein Schiff
    if (inhalt.schiff == null) {
        this.className = daneben;

        return;
    }

    // Zumindest getroffen
    this.className = treffer;

    // Schauen wir einmal, ob das Schiff versenkt wurde
    for (var i = 0; i < alleZellen.length; i++) {
        var testZelle = alleZellen[i];
        if (testZelle.inhalt.schiff == inhalt.schiff)
            if (testZelle.className != treffer)
                return;
    }

    // Schiff als versenkt markiertn
    for (var i = 0; i < alleZellen.length; i++) {
        var testZelle = alleZellen[i];
        if (testZelle.inhalt.schiff == inhalt.schiff)
            testZelle.className = versenkt;
    }

    // Schauen wir einmal, ob nun alle Schiffe versenkt sind
    for (var i = 0; i < alleZellen.length; i++) {
        var testZelle = alleZellen[i];
        if (testZelle.inhalt.schiff != null)
            if (testZelle.className != versenkt)
                return;
    }

    // Fertig
    alert('Alle Schiff mit ' + versuche + ' Bomben versenkt!');
}