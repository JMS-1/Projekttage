// Jede Zelle erhält die Information, ob sie lebt oder tot ist
var cssTot = 'zelle';
var cssLebt = cssTot + ' lebt';

// Die folgenden Variablen werden gesetzt, sobald die Seite geladen ist
var schritteInfo, intervall, alleZellen, zeilen, spalten

// Diese Methode wird Aufgerufen, wenn die HTML Seite komplett geladen ist
function starten() {

    // Die wichtigsten visuellen Elemente ermitteln
    schritteInfo = document.getElementById('schritte');
    intervall = document.getElementById('interval');

    // Die Spielfeld und dessen Größe auslesen
    var spielfeld = document.querySelector('#spielfeld');
    zeilen = parseInt(spielfeld.getAttribute('data-zeilen'));
    spalten = parseInt(spielfeld.getAttribute('data-spalten'));

    // Tabelle zusammenbauen
    var html = '';

    for (var z = 0; z < zeilen; z++) {
        html += '<div class="zeile">';

        for (var s = 0; s < spalten; s++)
            html += '<div class="' + cssTot + '" onclick="zelleUmschalten(this)"></div>';

        html += '</div>';
    }

    // HTML Elemente auf einen Rutsch erzeugen lassen - das geht am schnellsten
    spielfeld.innerHTML = html;

    // Hier merken wir uns alle Zellen
    alleZellen = spielfeld.querySelectorAll('.' + cssTot);
};

// Wenn eine Zelle angeklickt wird ändert sie ihren Zustand
function zelleUmschalten(zelle) {
    var zustand = (zelle.className == cssLebt) ? cssTot : cssLebt;

    zelle.className = zustand;
}

// Das Spielfeld löschen
function spielfeldLoeschen() {
    for (var zs = 0; zs < alleZellen.length; zs++) {
        alleZellen[zs].className = cssTot;
    };
};

// Das Spielfeld zufällig füllen
function spielfeldFuellen() {
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var zelle = alleZellen[zs];
        var zustand = (Math.random() <= 0.3) ? cssLebt : cssTot;

        zelle.className = zustand;
    };
};
