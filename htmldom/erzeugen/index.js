var prototyp;
var container;

function starten() {
    var bild = document.getElementById('prototyp');

    prototyp = bild.outerHTML;
    container = bild.parentElement;
}

function vermehren() {
    container.innerHTML += prototyp;
}