// Der Zustand einer Zelle des Spielfelds
ZustandZelle = { aufstellen: 0, nichtGeprüft: 1, daneben: 2, treffer: 3, versenkt: 4 };

// Legt eine neue Zelle an
function ZelleModell(zeile, spalte, spielfeld) {
    // Die Parameter der Zelle
    this.zeile = zeile;
    this.spalte = spalte;
    this.spielfeld = spielfeld;

    // Die weiteren Eigenschaften der Zelle mit den Voreinstellungen
    this.schiff = null;
    this.zustand = ZustandZelle.aufstellen;

    // Die Ereignisse, die von der Zelle ausgelöst werden können
    this.zustandWurdeVerändern = null;
}

// Fordert das Spielmodell auf, den Zustand der Zelle zu verändern
ZelleModell.prototype.zustandÄndern = function () {
    this.spielfeld.zustandÄndern(this);
}

// Legt das mit der Zelle verbundene Schiff fest
ZelleModell.prototype.setzeSchiff = function (neuesSchiff) {
    this.schiff = neuesSchiff;
    this.setzeZustand((neuesSchiff == null) ? ZustandZelle.aufstellen : ZustandZelle.versenkt);
}

// Verändert den Zustand der Zelle und löst bei Bedarf ein entsprechende Ereignis aus
ZelleModell.prototype.setzeZustand = function (neuerZustand) {
    if (neuerZustand == this.zustand)
        return;

    this.zustand = neuerZustand;

    var ereignis = this.zustandWurdeVerändern;
    if (ereignis != null)
        ereignis(this);
}

// Das Modell zur Auswahl einer Schiffsart beim Aufbau
function AuswahlModell() {
    // Die Voreinstellungen wählen den Flugzeutträger horizontal aus
    this.größe = 5;
    this.index = 'A';
    this.horizontal = true;
}

// Ein Objekt zur Beschreibung eines Schiffs
function SchiffModell(auswahl) {
    // Parameter übernehmen
    this.größe = auswahl.größe;
    this.horizontal = auswahl.horizontal;
    this.index = auswahl.index;

    // Voreinstellung für weitere Eigenschaften eines Schiffs berechnen
    this.breite = this.horizontal ? this.größe : 1;
    this.höhe = this.horizontal ? 1 : this.größe;
    this.zellen = [];
}

// Prüft, ob dieses Schiff identisch zu einem anderen ist
SchiffModell.prototype.istIdentitisch = function (schiff) {
    return (schiff != null) && (schiff.größe == this.größe) && (schiff.index == this.index);
}

// Prüft, ob ein anderes Schiff durch dieses Schiff ersetzt werden kann
SchiffModell.prototype.kannErsetzen = function (schiff) {
    return (schiff == null) || this.istIdentitisch(schiff);
}

// Prüft, ob ein Schiff gerade eben durch einen weiteren Treffer versenkt wurde
SchiffModell.prototype.wurdeGeradeVersenkt = function () {
    for (var i = 0; i < this.zellen.length; i++)
        if (this.zellen[i].zustand != ZustandZelle.treffer)
            return false;

    return true;
}

// Der Zustand des Spiels
SpielModus = { aufbauen: 0, spielen: 1, fertig: 2 };

// Legt ein neues Spiel an
function SpielfeldModell() {
    // Voreinstellungen für das Spiel festlegen
    this.auswahl = new AuswahlModell();
    this.modus = SpielModus.aufbauen;
    this.istAufgebaut = false;
    this.trefferImUmfeld = 0;
    this.versuche = 0;
    this.zellen = [];

    // Ereigenisse, die von dem Spiel ausgelöst werden können
    this.aufbauAbgeschlossen = null;
    this.modusVerändert = null;
    this.tippVerändert = null;
}

// Erstellt eine Zelle auf dem Spielfeld
SpielfeldModell.prototype.neueZelle = function () {
    var zeile = Math.floor(this.zellen.length / 10);
    var spalte = this.zellen.length % 10;

    var zelle = new ZelleModell(zeile, spalte, this);

    this.zellen.push(zelle);

    return zelle;
}

// Versteckt ein Schiff auf dem Spielfeld und löst beim ersten Verstecken des letzten Schiffs ein Ereignis aus
SpielfeldModell.prototype.versteckeSchiff = function (zelle) {
    var schiff = new SchiffModell(this.auswahl);

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

    // Wenn wir bisher noch nicht fertig mit dem Aufbau waren sollten wir prüfen, ob wir es nun sind
    if (this.istAufgebaut)
        return;
    if (!this.allesVersteckt())
        return;

    this.istAufgebaut = true;

    var ereignis = this.aufbauAbgeschlossen;
    if (ereignis != null)
        ereignis(this);
}

// Prüft, ob ein Schuss zu einem Treffer auf einem Schiff führt und löst beim Versenken des letzten Schiffs sowie bei Veränderung des Cheat Wertes ein Ereignis aus
SpielfeldModell.prototype.prüfeAufTreffer = function (zelle) {
    var umfeld = 0;

    // Wir zählen hier, wie viele der umliegenden Zellen einem Schiff zugeordnet sind
    for (var z = Math.max(0, zelle.zeile - 1) ; z <= Math.min(9, zelle.zeile + 1) ; z++)
        for (var s = Math.max(0, zelle.spalte - 1) ; s <= Math.min(9, zelle.spalte + 1) ; s++)
            if ((z != zelle.zeile) || (s != zelle.spalte))
                if (this.zellen[10 * z + s].schiff != null)
                    umfeld++;

    // Bei Bedarf melden wir diesen Wert als Cheat
    if (umfeld != this.trefferImUmfeld) {
        this.trefferImUmfeld = umfeld;

        var ereignis = this.tippVerändert;
        if (ereignis != null)
            ereignis(this);
    }

    // Die Zelle wurde bereits beschossen
    if (zelle.zustand != ZustandZelle.nichtGeprüft)
        return;

    this.versuche += 1;

    // Der Zelle ist kein Schiff zugeordnet
    var schiff = zelle.schiff;
    if (schiff == null) {
        zelle.setzeZustand(ZustandZelle.daneben);
        return;
    }

    // Den regulären Treffer vermerken
    zelle.setzeZustand(ZustandZelle.treffer);

    // Wenn das Schiff durch diesen Treffer nicht versenkt wurde, brauchen wir nichts mehr zu tun
    if (!schiff.wurdeGeradeVersenkt())
        return;

    // Alle Zellen des Schiffs werden als versenkt markiert
    for (var zs = 0; zs < schiff.zellen.length; zs++)
        schiff.zellen[zs].setzeZustand(ZustandZelle.versenkt);

    // Wenn alle Schiffe versenkt sind, ist das Spiel zu Ende
    for (var zs = 0; zs < this.zellen.length; zs++)
        if (this.zellen[zs].schiff != null)
            if (this.zellen[zs].zustand != ZustandZelle.versenkt)
                return;

    this.modus = SpielModus.fertig;

    var ereignis = this.modusVerändert;
    if (ereignis != null)
        ereignis(this);
}

// Ändert den Zustand einer einzelnen Zelle, abhängig vom aktuellen Modus, in dem sich das Spiel befindet
SpielfeldModell.prototype.zustandÄndern = function (zelle) {
    switch (this.modus) {
        case SpielModus.aufbauen:
            this.versteckeSchiff(zelle);
            break;
        case SpielModus.spielen:
            this.prüfeAufTreffer(zelle);
            break;
    }
}

// Prüft, ob alle Schiffe nun versteckt sind
SpielfeldModell.prototype.allesVersteckt = function () {
    var versteckt = 0;

    // Wir zählen einfach die Anzahl der Zellen, die mit einem Schiff verbunden sind, maximal gibt es 5 + 4 + 2 * 3 + 2 = 17
    for (var zs = 0; zs < this.zellen.length; zs++)
        if (this.zellen[zs].schiff != null)
            versteckt += 1;

    return (versteckt == 17);
}

// Beginnt das Spiel nach dem Verstecken aller Schiffe und löst ein entsprechendes Ereignis aus
SpielfeldModell.prototype.spielStarten = function () {
    if (this.modus != SpielModus.aufbauen)
        return;

    // Alle Zellen werden nun in den Spielzustand versetzt
    for (var zs = 0; zs < this.zellen.length; zs++) {
        var zelle = this.zellen[zs];
        zelle.setzeZustand(ZustandZelle.nichtGeprüft);

        // Damit nachher die Auswertung einfacher ist merken wir uns zu jedem Schiff alle Zellen, auf denen es steht
        var schiff = zelle.schiff;
        if (schiff != null)
            schiff.zellen.push(zelle);
    }

    // Nun nur noch den Ratemodus aktivieren
    this.modus = SpielModus.spielen;

    var ereignis = this.modusVerändert;
    if (ereignis != null)
        ereignis(this);
}

// Noch einmal ganz von vorne beginnen
SpielfeldModell.prototype.neuStarten = function () {
    // Alle Zellen werden nun in den Anfangszustand versetzt
    for (var zs = 0; zs < this.zellen.length; zs++) 
        this.zellen[zs].setzeSchiff(null);

    // Zurück zum Anfang
    this.modus = SpielModus.aufbauen;
    this.istAufgebaut = false;
    this.trefferImUmfeld = 0;
    this.versuche = 0;

    var ereignis = this.modusVerändert;
    if (ereignis != null)
        ereignis(this);
}

