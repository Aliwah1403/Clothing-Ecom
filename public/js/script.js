// Homepage Products
getProducts("Men").then((data) =>
    createProductSlider(data, "#men-tshirt-products", "Men T-shirt")
);

getProducts("tote-bags").then((data) =>
    createProductSlider(data, "#tote-bags", "Tote Bags")
);

getProducts("shoes").then((data) =>
    createProductSlider(data, "#shoes", "Shoes")
);

getProducts("hoodies").then((data) =>
    createProductSlider(data, "#hoodies", "Hoodies")
);