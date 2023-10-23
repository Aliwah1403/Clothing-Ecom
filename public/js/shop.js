getProducts("shop").then((data) =>
    createProductCards(data, "#shop")
);


// getProducts(searchKey).then((data) => createProductCards(data, '.card-container')); 