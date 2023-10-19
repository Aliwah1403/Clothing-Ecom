// toggle image slider selector
const productImages = document.querySelectorAll(".product-images img");
const productImageSlider = document.querySelector(".image-slider");

let activeImageSlider = 0;

productImages.forEach((item, i) => {
  item.addEventListener("click", () => {
    productImages[activeImageSlider].classList.remove("active");
    item.classList.add("active");
    productImageSlider.style.backgroundImage = `url('${item.src}')`;
    activeImageSlider = i;
  });
});

// toggle size buttons
const sizeBtns = document.querySelectorAll(".size-radio-btn");
let checkedBtn = 0;
let size;

sizeBtns.forEach((item, i) => {
  item.addEventListener("click", () => {
    sizeBtns[checkedBtn].classList.remove("check");
    item.classList.add("check");
    checkedBtn = i;
    size = item.innerHTML;
  });
});

// showing appropriate data on the page
const setData = (data) => {
  // changing the page title dependng on the product
  let title = document.querySelector('title');

  // setting the images
  productImages.forEach((img, i) => {
    if (data.images[i]) {
      img.src = data.images[i]
    } else {
      img.style.display = 'none'
    }
  })
  productImages[0].click();

  // setting up size buttons
  sizeBtns.forEach(item => {
    if (!data.sizes.includes(item.innerHTML)) {
      item.style.display = 'none';
    }
  })

  // setting up texts - ie(product description etc)
  const name = document.querySelector('.product-brand');
  const shortDes = document.querySelector('.product-short-des');
  const des = document.querySelector('.des');

  title.innerHTML += name.innerHTML = data.name;
  shortDes.innerHTML = data.shortDes;
  des.innerHTML = data.des;

  // setting pricing
  const sellPrice = document.querySelector('.product-price');
  const actualPrice = document.querySelector('.product-actual-price');
  const discount = document.querySelector('.product-discount');

  sellPrice.innerHTML = `$${data.sellPrice}`;
  actualPrice.innerHTML = `$${data.actualPrice}`;
  discount.innerHTML = `( ${data.discount}% off )`;

  // wishlist and cart buttons
  const wishListBtn = document.querySelector('.wishlist-btn');
  wishListBtn.addEventListener('click', () => {
    wishListBtn.innerHTML = add_product_to_cart_or_wishlist('wishlist', data);
  })

  const cartBtn = document.querySelector('.cart-btn');
  cartBtn.addEventListener('click', () => {
    cartBtn.innerHTML = add_product_to_cart_or_wishlist('cart', data);
  })
}

// fetching data
const fetchProductData = () => {
  fetch('/get-products', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id: productId })
  })
    .then(res => res.json())
    .then(data => {
      setData(data);
      getProducts(data.tags[1]).then(data => createProductSlider(data,
        '.container-for-card-slider', ' Similar Products'))
    })
    .catch(err => {
      location.replace('/404');
    })
}

let productId = null;
if (location.pathname != '/products') {
  productId = decodeURI(location.pathname.split('/').pop());
  fetchProductData();
}