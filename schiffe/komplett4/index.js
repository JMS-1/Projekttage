// Einige CSS Klassennamen, die wir im Code verwenden
var unsichtbar = 'unsichtbar';
var legendeSichtbar = 'legende';

// Beschreibt den Zustand einer Zelle.
var ZellenZustand = {
    leer: 0,
    schiff: 1,
    nichtGeprüft: 2,
    daneben: 3,
    treffer: 4,
    versenkt: 5,
};

// Beschreibt den Inhalt einer Zelle.
function ZellInhalt(spielfeld, zeile, spalte) {
    this.spielfeld = spielfeld;
    this.zeile = zeile;
    this.spalte = spalte;

    this.zustand = ZellenZustand.leer;
    this.onZustandVerändert = null;
    this.schiff = null;
}

// Die grundlegende CSS Klasse
ZellInhalt.klasse = 'zelle';

// Ändert den Zustand der Zelle.
ZellInhalt.prototype.ändereZustand = function (neuerZustand) {
    if (neuerZustand == this.zustand)
        return;

    this.zustand = neuerZustand;

    if (this.onZustandVerändert != null)
        this.onZustandVerändert();
}

// Aktiviert das Verstecken der Schiffe.
ZellInhalt.prototype.starteVerstecken = function () {
    this.schiff = null;
    this.ändereZustand(ZellenZustand.leer);
}

// Beginnt den Suchmodus.
ZellInhalt.prototype.starteSuchen = function () {
    this.ändereZustand(ZellenZustand.nichtGeprüft);
}

// Ändert das der Zelle zugeordnete Schiff.
ZellInhalt.prototype.setzeSchiff = function (schiff) {
    if (schiff == this.schiff)
        return;

    this.schiff = schiff;
    this.ändereZustand((this.schiff == null) ? ZellenZustand.leer : ZellenZustand.schiff);
}

// Prüft, ob die Zelle noch leer ist oder zu einem bestimmten Schiff gehört.
ZellInhalt.prototype.kannErsetztWerdenDurch = function (schiff) {
    return (this.schiff == null) || (this.schiff == schiff);
}

// Prüft, ob ein Schiff in einer bestimmten Orientierung an dieser Zelle platziert werden kann.
ZellInhalt.prototype.kannSchiffZugeordnetWerden = function (schiff, breite, hoehe) {
    // Vom Schiff besetzte Zellen ermitteln
    var links = this.spalte;
    var rechts = links + breite - 1;
    if (rechts > 9)
        return false;
    var oben = this.zeile;
    var unten = oben + hoehe - 1;
    if (unten > 9)
        return false;

    // Schiff darf kein anders überlappen
    for (var zeile = oben; zeile <= unten; zeile++)
        for (var spalte = links; spalte <= rechts; spalte++)
            if (!this.spielfeld[10 * zeile + spalte].kannErsetztWerdenDurch(schiff))
                return false;

    // Sieht gut aus, wir überlappen höchstens das Schiff an einer anderen Stelle
    return true;
}

ZellInhalt.prototype.schiffZuordnen = function (schiff, breite, hoehe) {
    // Schiff an der alten Position entfernen
    for (var i = 0; i < this.spielfeld.length; i++)
        if (this.spielfeld[i].schiff == schiff)
            this.spielfeld[i].setzeSchiff(null);

    // Vom Schiff besetzte Zellen ermitteln
    var links = this.spalte;
    var rechts = links + breite - 1;
    var oben = this.zeile;
    var unten = oben + hoehe - 1;

    // Schiff eintragen
    for (var zeile = oben; zeile <= unten; zeile++)
        for (var spalte = links; spalte <= rechts; spalte++)
            this.spielfeld[10 * zeile + spalte].setzeSchiff(schiff);
}

// Prüft, ob diese Zelle von einem Schiff belegt ist.
ZellInhalt.prototype.istEinTreffer = function () {
    if (this.schiff == null)
        this.ändereZustand(ZellenZustand.daneben);
    else
        this.ändereZustand(ZellenZustand.treffer);

    return (this.zustand == ZellenZustand.treffer);
}

// Prüft, ob das Schiff zu dieser Zelle versenkt wurde.
ZellInhalt.prototype.istNunVersenkt = function () {
    // Einfach alle Zellen anschauen
    for (var i = 0; i < this.spielfeld.length; i++) {
        var zelle = this.spielfeld[i];
        if (zelle.schiff == this.schiff)
            if (zelle.zustand != ZellenZustand.treffer)
                return false;
    }

    // Ja, das sind wir wohl
    return true;
}

// Versenkt das zugehörige Schiff
ZellInhalt.prototype.versenken = function () {
    for (var i = 0; i < this.spielfeld.length; i++) {
        var zelle = this.spielfeld[i];
        if (zelle.schiff == this.schiff)
            zelle.ändereZustand(ZellenZustand.versenkt);
    }
}

// Verbindet eine Beschreibung einer Zelle mit der Oberfläche
function ZelleVerbinder(inhalt, anzeige) {
    // Veränderungen im Modell an die Oberfläche übertragen
    inhalt.onZustandVerändert = function () {
        switch (inhalt.zustand) {
            case ZellenZustand.leer:
                anzeige.className = ZellInhalt.klasse;
                break;
            case ZellenZustand.nichtGeprüft:
                anzeige.className = ZellInhalt.klasse + ' unbenutzt';
                break;
            case ZellenZustand.daneben:
                anzeige.className = ZellInhalt.klasse + ' daneben';
                break;
            case ZellenZustand.treffer:
                anzeige.className = ZellInhalt.klasse + ' treffer';
                break;
            case ZellenZustand.schiff:
            case ZellenZustand.versenkt:
                anzeige.className = ZellInhalt.klasse + ' versenkt';
                break;
        }
    }

    // Aktionen in der Oberfläche an das Modell übergeben
    anzeige.onclick = function (ev) {
        if ((inhalt.zustand == ZellenZustand.leer) || (inhalt.zustand == ZellenZustand.schiff))
            schiffVerstecken(ev, inhalt, anzeige);
        else
            aufTrefferPrüfen(inhalt);
    }

    // Erstmalig setzen
    inhalt.onZustandVerändert();
}

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var auswahl, starten, legende, versuche, neustart, tippSchalter, tipp, tippAnzeige;

// Das Modell des Spielfelds
var spielfeld = [];

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Was wird so an DOM Elementen brauchen
    tippSchalter = document.getElementById('tippSchalter');
    tippAnzeige = document.getElementById('tippAnzeige');
    starten = document.getElementById('aufbauFertig');
    neustart = document.getElementById('neustart');
    auswahl = document.getElementById('auswahl');
    legende = document.getElementById('legende');
    tipp = document.getElementById('tipp');

    // Alle relevanten Zellen auf dem Spielfeld
    var alleZellen = document.querySelectorAll('#spielfeld .' + ZellInhalt.klasse + ':not(.spaltennummer):not(.zeilennummer)');

    // Nur eine kleine Sicherheitsprüfung, ob wir das auch alles richtig gemacht haben
    if (alleZellen.length != 100) {
        alert('Komisches Schiffe versenken mit ' + alleZellen.length + ' Feldern - da muss ich leider passen!');

        return;
    }

    // Zelleninhalte einmal einrichten
    for (var i = 0; i < alleZellen.length; i++) {
        // Modell anlegen
        var zelle = new ZellInhalt(spielfeld, Math.floor(i / 10), i % 10);

        // Verbinder Anlegen
        new ZelleVerbinder(zelle, alleZellen[i]);

        // Modell merken
        spielfeld.push(zelle);
    }

    // Aufbauen
    spieler1();
}

// Schaltet in den Aufbaumodus um.
function spieler1() {
    // Erst einmal alles auf den Anfangszustand setzen
    spielfeld.forEach(function (zelle) { zelle.starteVerstecken(); });

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
    spielfeld.forEach(function (zelle) { zelle.starteSuchen(); });

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
function schiffVerstecken(ev, zelle, anzeige) {
    // Die Auswahlliste oben links in die Zelle setzen
    var meinePosition = anzeige.getBoundingClientRect();
    auswahl.style.left = (meinePosition.left + 4) + "px";
    auswahl.style.top = (meinePosition.top + 4) + "px";
    auswahl.className = '';

    // Auswahl vorbereiten
    var alleSchiffe = auswahl.querySelectorAll('div');

    for (var i = 0; i < alleSchiffe.length; i++) {
        // Die Daten der aktuellen Auswahl ermitteln
        var auswahlSchiff = alleSchiffe[i];
        var schiff = auswahlSchiff.getAttribute("data-id");
        var breite = parseInt(auswahlSchiff.getAttribute("data-breite"));
        var hoehe = parseInt(auswahlSchiff.getAttribute("data-hoehe"));

        // Nur die tatsächlich möglichen Schiffe anzeigen - die Schiffe dürfen sich nicht überlappen und müssen ganz auf das Spielfeld passen
        if (schiff.length > 0)
            if (zelle.kannSchiffZugeordnetWerden(schiff, breite, hoehe))
                auswahlSchiff.className = '';
            else
                auswahlSchiff.className = unsichtbar;

        // Was soll bei der Auswahl passieren
        auswahlSchiff.onclick = function () {
            // Auf jeden Fall wird die Auswahlliste ausgeblendet
            auswahl.className = unsichtbar;

            // Es wurde keine Auswahl getroffen
            var schiff = this.getAttribute("data-id");
            if (schiff.length < 1)
                return;

            var breite = parseInt(this.getAttribute("data-breite"));
            var hoehe = parseInt(this.getAttribute("data-hoehe"));

            // Schiff positionieren - eventuell an der bisherigen Position entfernen
            zelle.schiffZuordnen(schiff, breite, hoehe);

            // Nachsehen, ob alle Schiffe versteckt sind
            var versteckt = 0;

            for (var i = 0; i < spielfeld.length; i++)
                if (spielfeld[i].schiff != null)
                    versteckt |= 1 << spielfeld[i].schiff;

            if (versteckt == 0x1f)
                starten.removeAttribute('disabled');
        }
    }
}

// Prüft auf einen Treffer.
function aufTrefferPrüfen(zelle) {
    // Treffer im Umfeld zählen
    var umfeld = 0;

    for (var zeile = zelle.zeile - 1; zeile <= zelle.zeile + 1; zeile++)
        if ((zeile >= 0) && (zeile <= 9))
            for (var spalte = zelle.spalte - 1; spalte <= zelle.spalte + 1; spalte++)
                if ((spalte >= 0) && (spalte <= 9))
                    if ((zeile != zelle.zeile) || (spalte != zelle.spalte))
                        if (spielfeld[10 * zeile + spalte].schiff != null)
                            umfeld++;

    // Diese Zahl auch beim wiederholten Klicken straffrei anzeigen
    tipp.textContent = '(Anzahl der Treffer in der Umgebung: ' + umfeld + ')';

    // Das haben wir schon geprüft
    if (zelle.zustand != ZellenZustand.nichtGeprüft)
        return;

    // Das zählen wir dann als echten Versuch
    versuche++;

    // Da ist aber kein Schiff
    if (!zelle.istEinTreffer())
        return;

    // Schauen wir einmal, ob das Schiff versenkt wurde
    if (!zelle.istNunVersenkt())
        return;

    // Schiff als versenkt markieren
    zelle.versenken();

    // Schauen wir einmal, ob nun alle Schiffe versenkt sind
    for (var i = 0; i < spielfeld.length; i++) {
        var zelle = spielfeld[i];
        if (zelle.schiff != null)
            if (zelle.zustand != ZellenZustand.versenkt)
                return;
    }

    // Fertig
    alert('Alle Schiff mit ' + versuche + ' Bomben versenkt!');
}