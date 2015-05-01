var mitte;

function starten() {
    mitte = document.getElementById('mitte');
}

function innenKlicken() {
    alert('Autsch');
}

function mitteKlicken(ev) {
    event.srcElement.className = 'getroffen'
}

function aussenKlicken() {
    mitte.className = 'getroffen';

    function rückgängig() {
        mitte.className = 'mitte';
    }

    window.setTimeout(rückgängig, 1500);
}