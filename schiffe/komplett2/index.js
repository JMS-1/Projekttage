// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
    // Datenmodell (Model) und Steuerung (Controller) für das Spielfeld erstellen
    var modellFürSpielfeld = new SpielfeldModell();
    var anzeigeFürTippSchalter = document.getElementById('tippAnzeige');
    var anzeigeFürSpielfeld = document.getElementById('spielfeld');
    var anzeigeFürNeustart = document.getElementById('neustart');
    var anzeigeFürAuswahl = document.querySelector('.auswahl');
    var anzeigeFürStart = document.getElementById('start');
    var anzeigeFürTipp = document.getElementById('tipp');
    var controllerFürSpielfeld = new SpielfeldController(modellFürSpielfeld, anzeigeFürSpielfeld, anzeigeFürAuswahl, anzeigeFürStart, anzeigeFürNeustart, anzeigeFürTippSchalter, anzeigeFürTipp);

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
    var controllerFürAuswahl = new AuswahlController(modellFürSpielfeld.auswahl, anzeigeFürAuswahl.querySelectorAll('[name="größe"]'), anzeigeFürAuswahl.querySelectorAll('[name="orientierung"]'));
}
