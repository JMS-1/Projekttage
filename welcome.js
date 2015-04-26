var floater, startX, startY;

function initialisieren() {
    floater = document.getElementById('floater');
}

function fallenlassen(ev) {
    floater.style.left = (ev.x - startX) + 'px';
    floater.style.top = (ev.y - startY) + 'px';
}

function start(ev) {
    startX = ev.x - floater.offsetLeft;
    startY = ev.y - floater.offsetTop;
}

function verschiebenErlauben(ev) {
    ev.preventDefault();

    nurVerschiebenErlauben(ev);
}

function nurVerschiebenErlauben(ev) {
    ev.dataTransfer.effectAllowed = 'move';
}
