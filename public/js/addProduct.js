let user = JSON.parse(sessionStorage.user || null);
let loader = document.querySelector(".loader");

// checking if user is logged in or not
window.onload = () => {
  if (user) {
    if (!compareToken(user.authToken, user.email)) {
      location.replace("/login");
    }
  } else {
    location.replace("/login");
  }
};

// price inputs
const actualPrice = document.getElementById("actual-price");

const sellingPrice = document.getElementById("sell-price");
const discountPercentage = document.getElementById("discount");

// will need to change the math
discountPercentage.addEventListener("input", () => {
  if (discountPercentage.value > 100) {
    discountPercentage.value = 90;
  } else {
    let discount = (actualPrice.value * discountPercentage.value) / 100;
    sellingPrice.value = actualPrice.value - discount;
  }
});

sellingPrice.addEventListener("input", () => {
  let discount = (sellingPrice.value / actualPrice.value) * 100;
  discountPercentage.value = discount;
});

// upload images handler
let uploadImages = document.querySelectorAll(".fileupload");
let imagePaths = []; //this will store all our image paths

uploadImages.forEach((fileupload, index) => {
  fileupload.addEventListener('change', () => {
    const file = fileupload.files[0];
    let imageUrl;

    if (file.type.includes('image')) {
      // means user uploaded image
      fetch('/s3url').then(res => res.json())
        .then(url => {
          fetch(url, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
            body: file
          }).then(res => {
            imageUrl = url.split("?")[0];
            imagePaths[index] = imageUrl;
            let label = document.querySelector(`label[for=${fileupload.id}]`);
            label.style.backgroundImage = `url(${imageUrl})`;
            let productImage = document.querySelector('.product-image');
            productImage.style.backgroundImage = `url(${imageUrl})`;
          })
        })
    } else {
      showAlert('upload images only')
    }
  })
})

// form submission
const productName = document.getElementById("product-name");
const shortLine = document.getElementById("short-des");
const des = document.getElementById("des");

let sizes = []; //this will store all the sizes

const stock = document.getElementById("stock");
const tags = document.getElementById("tags");
const tac = document.getElementById("tac");

// buttons
const addProductBtn = document.getElementById("add-btn");
const saveDraft = document.getElementById("save-btn");

// function to store sizes
const storeSizes = () => {
  sizes = [];
  let sizeCheckBox = document.querySelectorAll(".size-checkbox");
  sizeCheckBox.forEach((item) => {
    if (item.checked) {
      sizes.push(item.value);
    }
  });
};

const validateForm = () => {
  if (!productName.value.length) {
    return showAlert("enter product name");
  } else if (shortLine.value.length > 100 || shortLine.value.length < 10) {
    return showAlert(
      "short description must be between 10 to 100 characters long"
    );
  } else if (!des.value.length) {
    return showAlert("enter a detailed description about the product");
  } else if (!imagePaths.length) {
    return showAlert("upload atleast one product image");
  } else if (!sizes.length) {
    return showAlert("select at least one size")
  } else if (
    !actualPrice.value.length ||
    !discount.value.length ||
    !sellingPrice.value.length
  ) {
    return showAlert("you must add pricing for your product");
  } else if (stock.value < 20) {
    return showAlert("You should have at least 20 items in stock")
  } else if (!tags.value.length) {
    return showAlert(
      "enter a few tags to help when ranking your product in search"
    );
  } else if (!tac.checked) {
    return showAlert("agree to our terms and conditions to proceed");
  }
  return true;
};

const productData = () => {
  let tagArr = tags.value.split(',');
  tagArr.forEach((item, i) => tagArr[i] = tagArr[i].trim());
  return (data = {
    name: productName.value,
    shortDes: shortLine.value,
    des: des.value,
    images: imagePaths,
    sizes: sizes,
    actualPrice: actualPrice.value,
    discount: discountPercentage.value,
    sellPrice: sellingPrice.value,
    stock: stock.value,
    tags: tagArr,
    tac: tac.checked,
    email: user.email,
  });
};

addProductBtn.addEventListener("click", () => {
  storeSizes();

  // validating the form
  if (validateForm()) {
    // validateForm() returns true or false while doing validation
    loader.style.display = 'block';
    let data = productData();
    if (productId) {
      data.id = productId;
    }
    sendData("/add-product", data);
  }
});

// saving product to drafts
saveDraft.addEventListener('click', () => {
  // store chosen sizes
  storeSizes();

  // check for product name
  if (!productName.value.length) {
    showAlert('enter product name')
  } else { //don't validate the data
    let data = productData();
    data.draft = true;
    if (productId) {
      data.id = productId;
    }
    sendData("/add-product", data);
  }
})

// Handling an already existing product

const setFormsData = (data) => {
  productName.value = data.name;
  shortLine.value = data.shortDes;
  des.value = data.des;
  actualPrice.value = data.actualPrice;
  discountPercentage.value = data.discount;
  sellingPrice.value = data.sellPrice;
  stock.value = data.stock;
  tags.value = data.tags

  // set up images data
  imagePaths = data.images;
  imagePaths.forEach((url, i) => {
    let label = document.querySelector(`label[for=${uploadImages[i].id}]`);
    label.style.backgroundImage = `url(${url})`;
    let productImage = document.querySelector('.product-image');
    productImage.style.backgroundImage = `url(${url})`;
  })

  // set up sizes data
  sizes = data.sizes;

  let sizeCheckBox = document.querySelectorAll('.size-checkbox');
  sizeCheckBox.forEach(item => {
    if (sizes.includes(item.value)) {
      item.setAttribute('checked', '');
    }
  })

}

const fetchProductData = () => {

  fetch('/get-products', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email: user.email, id: productId })
  })
    .then(res => res.json())
    .then(data => {
      setFormsData(data);
    })
    .catch(err => {
      console.log(err);
    })
}

let productId = null;
if (location.pathname != '/add-product') {
  productId = decodeURI(location.pathname.split('/').pop());

  fetchProductData();
}

