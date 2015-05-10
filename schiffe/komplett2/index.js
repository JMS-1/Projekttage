// Ein Objekt zur Beschreibung einer Zelle auf dem Spielfeld
ZustandZelle = { aufstellen: 0, nichtGeprüft: 1, daneben: 2, treffer: 3, versenkt: 4 };

function ZelleModell(zeile, spalte, spielfeld) {
    this.zeile = zeile;
    this.spalte = spalte;
    this.spielfeld = spielfeld;

    this.schiff = null;
    this.zustand = ZustandZelle.aufstellen;

    this.zustandWurdeVerändern = null;
}

ZelleModell.prototype.zustandÄndern = function () {
    this.spielfeld.zustandÄndern(this);
}

ZelleModell.prototype.setzeSchiff = function (neuesSchiff) {
    this.schiff = neuesSchiff;
    this.setzeZustand((neuesSchiff == null) ? ZustandZelle.aufstellen : ZustandZelle.versenkt);
}

ZelleModell.prototype.setzeZustand = function (neuerZustand) {
    if (neuerZustand == this.zustand)
        return;

    this.zustand = neuerZustand;

    var ereignis = this.zustandWurdeVerändern;
    if (ereignis != null)
        ereignis(this);
}

// Ein Objekt zur Verbindung der Benutzeroberfläche mit dem Modell der Zelle
function ZelleController(modell, anzeige, spielfeld) {
    function zustandAnzeigen() {
        anzeige.className = SpielfeldController.klasse;

        switch (modell.zustand) {
            case ZustandZelle.nichtGeprüft:
                anzeige.className += ' unbenutzt';
                break;
            case ZustandZelle.daneben:
                anzeige.className += ' daneben';
                break;
            case ZustandZelle.treffer:
                anzeige.className += ' treffer';
                break;
            case ZustandZelle.versenkt:
                anzeige.className += ' versenkt';
                break;
        }
    }

    // Veränderungen im Modell in die Anzeige spiegeln
    modell.zustandWurdeVerändern = zustandAnzeigen;

    // Veränderungen in der Anzeige in das Modell spiegeln
    anzeige.onclick = function () {
        modell.zustandÄndern();
    }

    zustandAnzeigen();
}

// Das Modell zur Auswahl einer Schiffsart beim Aufbau
function AuswahlModell() {
    this.größe = 5;
    this.index = 'A';
    this.horizontal = true;
}

// Die Steuerung der Anzeihe einer Schiffsart beim Aufbau
function AuswahlController(modell, größen, orientierungen) {
    for (var i = 0; i < größen.length; i++)
        größen[i].onchange = function () {
            modell.größe = parseInt(this.value);
            modell.index = this.value.substring(this.value.length - 1);
        };

    for (var i = 0; i < orientierungen.length; i++)
        orientierungen[i].onchange = function () {
            modell.horizontal = (this.value == 'H');
        };

    function setDefault(schalter, wert) {
        if (wert)
            schalter.setAttribute('checked', 'checked');
        else
            schalter.removeAttribute('checked');
    }

    var größe = modell.größe + modell.index;
    for (var i = 0; i < größen.length; i++)
        setDefault(größen[i], größen[i].value == größe);

    var orientierung = modell.horizontal ? 'H' : 'V';
    for (var i = 0; i < orientierungen.length; i++)
        setDefault(orientierungen[i], orientierungen[i].value == orientierung);
}

// Ein Objekt zur Beschreibung eines Schiffs
function Schiff(auswahl) {
    this.größe = auswahl.größe;
    this.horizontal = auswahl.horizontal;
    this.index = auswahl.index;

    this.breite = this.horizontal ? this.größe : 1;
    this.höhe = this.horizontal ? 1 : this.größe;
}

Schiff.prototype.istIdentitisch = function (schiff) {
    return (schiff != null) && (schiff.größe == this.größe) && (schiff.index == this.index);
}

Schiff.prototype.kannErsetzen = function (schiff) {
    return (schiff == null) || this.istIdentitisch(schiff);
}

// Ein Objekt zur Beschreibung des Spielfelds
SpielModus = { aufbauen: 0, spielen: 1, fertig: 2 };

function SpielfeldModell() {
    this.modus = SpielModus.aufbauen;
    this.auswahl = new AuswahlModell();
    this.istAufgebaut = false;
    this.zellen = [];

    this.aufbauAbgeschlossen = null;
}

SpielfeldModell.prototype.neueZelle = function () {
    var zeile = Math.floor(this.zellen.length / 10);
    var spalte = this.zellen.length % 10;

    var zelle = new ZelleModell(zeile, spalte, this);

    this.zellen.push(zelle);

    return zelle;
}

SpielfeldModell.prototype.zustandÄndern = function (zelle) {
    if (this.modus == SpielModus.aufbauen) {
        var schiff = new Schiff(this.auswahl);

        // Das Schiff muss sich vollständig im Bereich des Spielfelds befinden
        if ((zelle.zeile + schiff.höhe) > 10)
            return;
        if ((zelle.spalte + schiff.breite) > 10)
            return;

        // Das Schiff darf sich nicht mit einem anderen Schiff überlappen
        for (var z = 0; z < schiff.höhe; z++)
            for (var s = 0; s < schiff.breite; s++)
                if (!schiff.kannErsetzen(this.zellen[10 * (zelle.zeile + z) + (zelle.spalte + s)].schiff))
                    return;

        // Das Schiff an seiner bisherigen Aufstellung entfernen
        for (var zs = 0; zs < this.zellen.length; zs++)
            if (schiff.istIdentitisch(this.zellen[zs].schiff))
                this.zellen[zs].setzeSchiff(null);

        // Das Schiff an der neuen Aufstellung einsetzn
        for (var z = 0; z < schiff.höhe; z++)
            for (var s = 0; s < schiff.breite; s++)
                this.zellen[10 * (zelle.zeile + z) + (zelle.spalte + s)].setzeSchiff(schiff);

        if (this.istAufgebaut)
            return;
        if (!this.allesVersteckt())
            return;

        this.istAufgebaut = true;

        var ereignis = this.aufbauAbgeschlossen;
        if (ereignis != null)
            ereignis(this);
    }
}

SpielfeldModell.prototype.allesVersteckt = function () {
    var versteckt = 0;

    for (var zs = 0; zs < this.zellen.length; zs++)
        if (this.zellen[zs].schiff != null)
            versteckt += 1;

    return (versteckt == 17);
}

// Ein Objekt zur Verbindung der Benutzeroberfläche mit dem Modell des Spielfelds
function SpielfeldController(modell, anzeige, start) {
    function startfreigabe() {
        if (modell.istAufgebaut)
            start.removeAttribute('disabled');
        else
            start.setAttribute('disabled', 'disabled');
    }

    modell.aufbauAbgeschlossen = startfreigabe;

    startfreigabe();
}

SpielfeldController.klasse = 'zelle';

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Datenmodell (Model) und Steuerung (Controller) für das Spielfeld erstellen
    var modellFürSpielfeld = new SpielfeldModell();
    var anzeigeFürSpielfeld = document.getElementById('spielfeld');
    var anzeigeFürStart = document.getElementById('start');
    var controllerFürSpielfeld = new SpielfeldController(modellFürSpielfeld, anzeigeFürSpielfeld, anzeigeFürStart);

    // Alle relevanten Zellen
    var alleZellen = anzeigeFürSpielfeld.querySelectorAll('.' + SpielfeldController.klasse + ':not(.spaltennummer):not(.zeilennummer)')

    // Nur eine kleine Sicherheitsprüfung, ob wir das auch alles richtig gemacht haben
    if (alleZellen.length != 100) {
        alert('Komisches Schiffe versenken mit ' + alleZellen.length + ' Feldern - da muss ich leider passen!');

        // Da brauchen wir erst gar nicht weiter zu machen
        return;
    }

    // Datenmodell (Model) und Steuerung (Controller) für die Zellen erstellen
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var modellFürZelle = modellFürSpielfeld.neueZelle();
        var verbinderFürZelle = new ZelleController(modellFürZelle, alleZellen[zs]);
    }

    // Steuerung für den Spielaufbau anlegen
    var anzeigeFürAuswahl = document.querySelector('.auswahl');
    var controllerFürAuswahl = new AuswahlController(modellFürSpielfeld.auswahl, anzeigeFürAuswahl.querySelectorAll('[name="größe"]'), anzeigeFürAuswahl.querySelectorAll('[name="orientierung"]'));
}
