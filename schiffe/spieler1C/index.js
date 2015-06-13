// Beschreibt den Inhalt einer Zelle.
function ZellInhalt(zeile, spalte) {
    this.schiff = null;
    this.zeile = zeile;
    this.spalte = spalte;
}

// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var versenkt = zelle + ' versenkt';
var unsichtbar = 'unsichtbar';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen, spielfeld, auswahl, starten;

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Wir suchen unser Spielfeld
    starten = document.getElementById('aufbauFertig');
    spielfeld = document.getElementById('spielfeld');
    auswahl = document.getElementById('auswahl');

    // Darin alle relevanten Zellen
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
}

// Wählt eine Zelle als linke obere Ecke eines zu versteckenden Schiffs aus.
function schiffVerstecken(ev) {
    var dieZelle = this;
    var meinePosition = dieZelle.getBoundingClientRect();

    auswahl.style.left = (meinePosition.left + 4) + "px";
    auswahl.style.top = (meinePosition.top + 4) + "px";
    auswahl.className = '';

    // Auswahl vorbereiten
    for (var i = 0; i < auswahl.childNodes.length; i++)
        auswahl.childNodes[i].onclick = function () {
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
