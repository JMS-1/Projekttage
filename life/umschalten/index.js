// Jede Zelle erhält die Information, ob sie lebt oder tot ist
var cssTot = 'zelle';
var cssLebt = cssTot + ' lebt';

// Diese Methode wird Aufgerufen, wenn die HTML Seite komplett geladen ist
function starten() {

    // Die Spielfeld und dessen Größe auslesen
    var spielfeld = document.getElementById('spielfeld');
    var zeilen = parseInt(spielfeld.getAttribute('data-zeilen'));
    var spalten = parseInt(spielfeld.getAttribute('data-spalten'));

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
}

// Wenn eine Zelle angeklickt wird ändert sie ihren Zustand
function zelleUmschalten(zelle) {
    var zustand = (zelle.className == cssLebt) ? cssTot : cssLebt;

    zelle.className = zustand;
}
