function getCatalogByTitle() {

    const title = document.getElementById('title').value;

    if (title == '' && (location.href.includes('?'))) {
        var dirPath = dirname(location.href);
        fullPath = `${dirPath}/catalogo`;
        window.location = fullPath;
        return;
    }

    if (title != '') {
        var dirPath = dirname(location.href);
        fullPath = `${dirPath}/catalogo?title=${title}`;
        window.location = fullPath;
    }

}

function dirname(path) {
   return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}