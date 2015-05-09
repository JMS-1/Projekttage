﻿// Die einzelnen Zustände der Felder
var zelle = 'zelle';
var nichtGeprüft = zelle + ' unbenutzt';
var daneben = zelle + ' daneben';
var treffer = zelle + ' treffer';
var versenkt = zelle + ' versenkt';

// Diese Variablen werden nach dem Laden der Seite gefüllt.
var alleZellen;

// Wird aufgerufen, sobald die Seite komplett geladen ist.
function starten() {
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
}