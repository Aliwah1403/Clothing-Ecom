// creating small prodyct cards
const createSmallCards = (data) => {
    return `
        <div class="sm-product">
            <img
              src="${data.image}"
              class="sm-product-img"
              alt=""
            />

            <div class="sm-text">
              <p class="sm-product-name">${data.name}</p>
              <p class="sm-des">${data.shortDes}</p>
            </div>

            <div class="item-counter">
              <button class="counter-btn decrement">-</button>
              <p class="item-count">${data.item}</p>
              <button class="counter-btn increment">+</button>
            </div>

            <p class="sm-price" data-price = "${data.sellPrice}">$${data.sellPrice * data.item}</p>
            <button class="sm-delete-btn">
              <img src="images/close.png" alt="" />
            </button>
          </div>
`
        ;
}



let totalBill = 0;
let deliveryOption = 1;


const setProducts = (name) => {
    const element = document.querySelector(`.${name}`);
    let data = JSON.parse(localStorage.getItem(name));
    if (data == null || !data.length) {
        element.innerHTML = `<img src="images/empty-cart.png" class="empty-img" alt="" />`
    } else {
        for (let i = 0; i < data.length; i++) {
            element.innerHTML += createSmallCards(data[i]);
            if (name == 'cart') {
                totalBill += Number(data[i].sellPrice * data[i].item);
            }
            updateBill();
        }

    }

    setupEvents(name);
}

// Delivery Options
// const show = (anything) => {
//     document.querySelector('.textBox').value = anything;
// }
// const dropdown = document.querySelector('.dropdown');
// dropdown.addEventListener('click', () => {
//     dropdown.classList.toggle('active')
// })




let finalPrice = 0;
// Code to update the bill depending on the delivery location chosen
const updateBill = () => {
    let billPrice = document.querySelector('.bill');
    // totalBill = calculateTotalBill(devOption);
    // billPrice.innerHTML = `$${totalBill}`;

    switch (parseInt(deliveryOption)) {
        case 1:
             billPrice.innerHTML = `$${totalBill}`;
                finalPrice = totalBill;
             break;

        case 2:
                finalPrice = totalBill + 100;
             break;

        case 3:
                finalPrice = totalBill + 200;
             break;

        case 4:
                finalPrice = totalBill + 250;
             break;

        case 5:
                finalPrice = totalBill + 300;
             break;

        case 6:
                finalPrice = totalBill + 800;
             break;
        default:
                 finalPrice = totalBill;
            }
            billPrice.innerHTML = `$${finalPrice}`
}

const dropdown = document.getElementById('deliveryDropdown')
dropdown.addEventListener('change', () => {
    deliveryOption = dropdown.value;
    updateBill()
})


const setupEvents = (name) => {
    // setting up counter event
    const counterMinus = document.querySelectorAll(`.${name} .decrement`)
    const counterPlus = document.querySelectorAll(`.${name} .increment`)
    const counts = document.querySelectorAll(`.${name} .item-count`)
    const price = document.querySelectorAll(`.${name} .sm-price`)
    const deleteBtn = document.querySelectorAll(`.${name} .sm-delete-btn`)

    let product = JSON.parse(localStorage.getItem(name));

    counts.forEach((item, i) => {
        let cost = Number(price[i].getAttribute('data-price'));

        counterMinus[i].addEventListener('click', () => {
            if (item.innerHTML > 1) {
                item.innerHTML--;
                totalBill -= cost;
                price[i].innerHTML = `$${item.innerHTML * cost}`;
                if (name == 'cart') {
                    updateBill();
                }
                product[i].item = item.innerHTML;
                localStorage.setItem(name, JSON.stringify(product));
            }
        })

        counterPlus[i].addEventListener('click', () => {
            if (item.innerHTML < 9) {
                item.innerHTML++;
                totalBill += cost;
                price[i].innerHTML = `$${item.innerHTML * cost}`;
                if (name == 'cart') {
                    updateBill();
                }
                product[i].item = item.innerHTML;
                localStorage.setItem(name, JSON.stringify(product));
            }
        })
    })

    deleteBtn.forEach((item, i) => {
        item.addEventListener('click', () => {
            product = product.filter((data, index) => index != i);
            localStorage.setItem(name, JSON.stringify(product));
            location.reload();
        })
    })
}

setProducts('cart');
setProducts('wishlist');