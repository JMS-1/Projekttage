function starten() {
}

function bewegen(ufo) {
    var spielfeld = ufo.offsetParent;

    var breiteGesamt = spielfeld.offsetWidth;
    var höheGesamt = spielfeld.offsetHeight;

    var breiteUfo = ufo.offsetWidth;
    var höheUfo = ufo.offsetHeight;

    var x = Math.floor(Math.random() * (breiteGesamt - breiteUfo));
    var y = Math.floor(Math.random() * (höheGesamt - höheUfo));

    ufo.style.left = x + 'px';
    ufo.style.top = y + 'px';
}