// Erstellt die Verbindung zwischen einer Zelle des Spielfelds und der zugehörigen Anzeige
function ZelleController(modell, anzeige, spielfeld) {
    // Zeigt den Zustand der Zelle über CSS Klassen an
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

    // Anfangszustand in die Oberfläche übernehmen
    zustandAnzeigen();
}

// Erszellt die Verbindung zwischen der Auswahl des Schiffs für das Verstecken mit der Benutzeroberfläche
function AuswahlController(modell, größen, orientierungen) {
    // Oberfläche mit dem Modell verbinden, hier die Änderungen an der Auswahl der Größe des Schiffs, sprich der Art übernehmen
    for (var i = 0; i < größen.length; i++)
        größen[i].onchange = function () {
            modell.größe = parseInt(this.value);
            modell.index = this.value.substring(this.value.length - 1);
        };

    // Oberfläche mit dem Modell verbinden, hier die Änderungen an der Orientierung des Schiffs übernehmen
    for (var i = 0; i < orientierungen.length; i++)
        orientierungen[i].onchange = function () {
            modell.horizontal = (this.value == 'H');
        };

    // Übernimmt die aktuellen Einstellungen aus dem Modell in die Öberfläche
    function setDefault(schalter, wert) {
        if (wert)
            schalter.setAttribute('checked', 'checked');
        else
            schalter.removeAttribute('checked');
    }

    // Modell in die Oberfläche übernehmen, hier die Größe anzeigen
    var größe = modell.größe + modell.index;
    for (var i = 0; i < größen.length; i++)
        setDefault(größen[i], größen[i].value == größe);

    // Modell in die Oberfläche übernehmen, hier die Orientierung anzeigen
    var orientierung = modell.horizontal ? 'H' : 'V';
    for (var i = 0; i < orientierungen.length; i++)
        setDefault(orientierungen[i], orientierungen[i].value == orientierung);
}

// Verbindet ein Spiel mit der Benutzeroberfläche
function SpielfeldController(modell, anzeige, auswahl, start, neustart, tippSchalter, tipp) {
    // Aktualisiert die Anzeige der Freigabe des Spielstarts nach dem Verstecken des letzten Schiffs
    function startfreigabe() {
        if (modell.istAufgebaut)
            start.removeAttribute('disabled');
        else
            start.setAttribute('disabled', 'disabled');
    }

    // Aktualisiert die Anzeige für den Tipp
    function tippAnzeige() {
        tipp.textContent = '(Anzahl der Treffer in der Umgebung: ' + modell.trefferImUmfeld + ')';
    }

    // Der Spielmodus wurde verändert, etwa weil das Spiel gewonnen wurde
    function spielModusVerändert() {
        switch (modell.modus) {
            case SpielModus.aufbauen:
                auswahl.style.display = '';
                break;
            case SpielModus.spielen:
                auswahl.style.display = 'none';
                break;
            case SpielModus.fertig:
                alert('Herzlichen Glückwunsch, mit nur ' + modell.versuche + ' Versuchen hast Du alle Schiffe gefunden!');
                break;
        }
    }

    // Modell mit der Oberfläche verbinden
    modell.modusVerändert = spielModusVerändert;
    modell.aufbauAbgeschlossen = startfreigabe;
    modell.tippVerändert = tippAnzeige;

    // Setzt die Oberfläche auf den Anfangszustand zurück.
    function neuStarten() {
        tippSchalter.checked = false;
        startfreigabe();
        tippAnzeige();
    }

    // Oberfläche mit dem Modell verbinden
    start.onclick = function () {
        modell.spielStarten();
    }

    neustart.onclick = function () {
        modell.neuStarten();

        // Für die Oberfläche sind wir selbst zuständig
        neuStarten();
    }

    // Anfangszustand in die Oberfläche übernehmen
    neuStarten();
}

SpielfeldController.klasse = 'zelle';
