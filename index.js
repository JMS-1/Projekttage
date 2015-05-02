function starten() {
    var alleVerweise = document.querySelectorAll('a');
    var rahmen = document.getElementById('vorschau');

    function zeigen() {
        rahmen.src = this.href;
        rahmen.style.display = '';
    }

    function verstecken() {
        rahmen.style.display = 'none';
    }

    for (var i = 0; i < alleVerweise.length; i++) {
        var verweis = alleVerweise[i];

        verweis.onmouseenter = zeigen;
        verweis.onmouseleave = verstecken;
    }

    verstecken();
}