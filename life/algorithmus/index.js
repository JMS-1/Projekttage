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

// Hier wird die nächste Generation berechnet
function naechsteGeneration() {
    // Zuerst einmal schauen wir uns den IST Zustand an
    var vorher = [];
    for (var zs = 0; zs < alleZellen.length; zs++) {
        var zelle = alleZellen[zs];

        vorher.push({
            lebt: (zelle.className == cssLebt),
            zeile: Math.floor(zs / spalten),
            spalte: zs % spalten,
            zelle: zelle,
            nachbarn: 0,
        });
    };

    // Jede lebende Zelle trägt sich bei allen Nachbarn ein
    for (var zs = 0; zs < vorher.length; zs++) {
        var zelle = vorher[zs];

        if (!zelle.lebt)
            continue;

        for (var z = Math.max(0, zelle.zeile - 1), zm = Math.min(zeilen, zelle.zeile + 2) ; z < zm; z++)
            for (var s = Math.max(0, zelle.spalte - 1), sm = Math.min(zeilen, zelle.spalte + 2) ; s < sm; s++)
                vorher[s + z * spalten].nachbarn += 1;

        // Die einfache Schleife macht jede Zelle zu ihrem eigenen Nachbarn, das müssen wir natürlich rückgängig machen
        zelle.nachbarn -= 1;
    };

    // Und nun nur noch abhängig von der Anzahl der Nachbarn den Zustand der Zelle verändern - oder belassen, wie er ist
    for (var zs = 0; zs < vorher.length; zs++) {
        var zelle = vorher[zs];

        if (zelle.nachbarn == 3) {
            // Nur ändern wenn nötig
            if (!zelle.lebt)
                zelle.zelle.className = cssLebt;
        }
        else if (zelle.nachbarn != 2) {
            // Nur ändern wenn nötig
            if (zelle.lebt)
                zelle.zelle.className = cssTot;
        }
    };
}

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
