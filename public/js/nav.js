const createNav = () => {
  let nav = document.querySelector(".navbar");

  nav.innerHTML = `
    <div class="nav">
      <a href="/">
        <img src="../images/dark-logo.png" class="brand-logo" alt="brand_logo" />
      </a>  
        <div class="nav-items">
          <div class="search">
            <input
              type="text"
              class="search-box"
              placeholder="Search brand, products"
            />
            <button class="search-btn">Search</button>
          </div>
          <a>
           <img src="../images/user.png" alt="user-icon" id = "user-img"/>
           <div class = "login-logout-popup hide">
              <p class = "account-info">Logged in as, name</p>
              <button class = "btn" id = "user-btn">Log out</button>
           </div>
          </a>
          <a href="/cart"><img src="../images/cart.png" alt="cart-icon" /></a>
        </div>
      </div>

      <ul class="links-container">
        <li class="link-item"><a href="/" class="link">Home</a></li>
        <li class="link-item"><a href="/shop" class="link">Shop</a></li>
        <li class="link-item"><a href="#" class="link">Women</a></li>
        <li class="link-item"><a href="#" class="link">Men</a></li>
        <li class="link-item"><a href="#" class="link">Kids</a></li>
        <li class="link-item"><a href="#" class="link">Accessories</a></li>
      </ul>
  `;
};

createNav();

// nav popup
const userImageButton = document.getElementById("user-img");
const userPopUp = document.querySelector(".login-logout-popup");
const popUpText = document.querySelector(".account-info");
const actionBtn = document.getElementById("user-btn");

userImageButton.addEventListener("click", () => {
  userPopUp.classList.toggle("hide");
});

window.onload = () => {
  let user = JSON.parse(sessionStorage.user || null);

  if (user != null) {
    // means they are logged in
    popUpText.innerHTML = `Logged in as ${user.name}`;
    actionBtn.innerHTML = `log out`;
    actionBtn.addEventListener("click", () => {
      sessionStorage.clear();
      location.reload();
    });
  } else {
    // user is logged out
    popUpText.innerHTML = `Log in to place order`;
    actionBtn.innerHTML = `log in`;
    actionBtn.addEventListener("click", () => {
      location.href = "/login";
    });
  }
};


// search box
const searchBtn = document.querySelector('.search-btn');
const searchBox = document.querySelector('.search-box');

searchBtn.addEventListener('click', () => {
  if (searchBox.value.length) {
    location.href = `/search/${searchBox.value}`
  }
})