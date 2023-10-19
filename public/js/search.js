const searchKey = decodeURI(location.pathname.split('/').pop());

const searchSpanElement = document.getElementById('search-key');
searchSpanElement.innerHTML = searchKey;

getProducts(searchKey).then((data) => createProductCards(data, '.card-container')); 