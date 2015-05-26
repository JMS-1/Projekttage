var fehler = 'testergebnis';
var keinFehler = fehler + ' ok';

var wert1, wert2, test1, test2, intervall, senden;

function starten() {
    wert1 = document.getElementById('wert1');
    wert2 = document.getElementById('wert2');

    test1 = document.getElementById('wert1test');
    test2 = document.getElementById('wert2test');

    intervall = document.getElementById('wert12test');

    senden = document.getElementById('senden');

    pruefen();
}

function pruefen() {
    var eingabe1 = wert1.value;
    var zahl1 = parseInt(eingabe1);

    var eingabe2 = wert2.value;
    var zahl2 = parseInt(eingabe2);

    test1.className = fehler;
    test2.className = fehler;
    intervall.className = keinFehler;
    senden.setAttribute('disabled', 'disabled');

    if (zahl1 == eingabe1)
        test1.className = keinFehler;
    if (zahl2 == eingabe2)
        test2.className = keinFehler;

    if ((test1.className == keinFehler) && (test2.className == keinFehler))
        if (zahl1 < zahl2)
            senden.removeAttribute('disabled');
        else
            intervall.className = fehler;
}