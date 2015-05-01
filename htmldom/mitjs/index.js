var mitte;

function starten() {
    mitte = document.getElementById('mitte');
}

function innenKlicken() {
    alert('Autsch');
}

function mitteKlicken(element) {
    element.className = 'getroffen'
}

function aussenKlicken() {
    mitte.className = 'getroffen';

    function rückgängig() {
        mitte.className = 'mitte';
    }

    window.setTimeout(rückgängig, 1500);
}