// Jede Zelle erhält die Information, ob sie lebt oder tot ist
var cssTot = 'zelle';

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
            html += '<div class="' + cssTot + '"></div>';

        html += '</div>';
    }

    // HTML Elemente auf einen Rutsch erzeugen lassen - das geht am schnellsten
    spielfeld.innerHTML = html;

    // Hier merken wir uns alle Zellen
    alleZellen = spielfeld.querySelectorAll('.' + cssTot);
};
