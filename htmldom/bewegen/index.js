var floater, startX, startY;

function starten() {
    floater = document.getElementById('floater');
}

function fallenlassen(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    floater.style.left = (ev.screenX - startX) + 'px';
    floater.style.top = (ev.screenY - startY) + 'px';

    return false;
}

function start(ev) {
    startX = ev.screenX - floater.offsetLeft;
    startY = ev.screenY - floater.offsetTop;
}

function verschiebenErlauben(ev) {
    ev.preventDefault();

    nurVerschiebenErlauben(ev);
}

function nurVerschiebenErlauben(ev) {
    ev.dataTransfer.effectAllowed = 'move';
}
