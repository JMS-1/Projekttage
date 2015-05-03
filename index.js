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

        var href = verweis.href.substr(0, verweis.href.length - 4)
        var jsRef = href + 'js';
        var cssRef = href + 'css';

        var add = '';
        if (!verweis.hasAttribute('data-nojs'))
            add += '<a href="' + jsRef + ' " class="code">JS</a>';
        add += '<a href="' + cssRef + '" class="code">CSS</a>';

        if (add != '')
            verweis.parentElement.innerHTML += add;
    }

    alleVerweise = document.querySelectorAll('a:not(.code)');

    for (var i = 0; i < alleVerweise.length; i++) {
        var verweis = alleVerweise[i];

        verweis.onmouseenter = zeigen;
        verweis.onmouseleave = verstecken;
    }

    verstecken();
}