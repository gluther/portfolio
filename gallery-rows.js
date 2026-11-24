/*
 * Gallery row order for collection pages.
 *
 * The grid is CSS columns, which fill top-to-bottom. This deals the tiles
 * round-robin into flex columns so the HTML order reads across rows:
 * 1, 2, 3 on the first row, then 4 under 1, and so on. Each photo keeps its
 * natural shape. 3 columns on desktop, 2 at <=1024px (same breakpoint as the
 * page CSS). The spacing still comes from the page's column-gap rules, which
 * also apply to flex.
 *
 * Load this AFTER the page's lightbox script: the lightbox records the photo
 * order from the page first, so its arrows keep the same 1, 2, 3... order.
 * Layout styles are set inline (not in style.css) so a cached stylesheet
 * can't leave the grid half-converted. Without JS the CSS columns still work.
 */
(function () {
    var grid = document.querySelector('.collection-grid');
    if (!grid) return;
    var tiles = Array.prototype.filter.call(grid.children, function (el) {
        return el.classList.contains('collection-photo');
    });
    if (!tiles.length) return;

    var twoCols = window.matchMedia('(max-width: 1024px)');
    var current = 0;

    function layout() {
        var n = twoCols.matches ? 2 : 3;
        if (n === current) return;
        current = n;
        var cols = [];
        for (var c = 0; c < n; c++) {
            var col = document.createElement('div');
            col.className = 'masonry-col';
            col.style.flex = '1 1 0';
            col.style.minWidth = '0';
            cols.push(col);
        }
        tiles.forEach(function (tile, i) { cols[i % n].appendChild(tile); });
        while (grid.firstChild) grid.removeChild(grid.firstChild);
        cols.forEach(function (col) { grid.appendChild(col); });
        grid.style.columns = 'auto';
        grid.style.display = 'flex';
        grid.style.alignItems = 'flex-start';
        grid.classList.add('is-rows');
    }

    layout();
    if (twoCols.addEventListener) twoCols.addEventListener('change', layout);
    else if (twoCols.addListener) twoCols.addListener(layout);
})();
