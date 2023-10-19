const createFooter = () => {
  let footer = document.querySelector("footer");

  footer.innerHTML = `
          <div class="footer-content">
        <img src="../images/light-logo.png" class="logo" alt="light-logo" />
        <div class="footer-ul-container">
          <ul class="category">
            <li class="category-title">Men</li>
            <li><a href="#" class="footer-link">t-shirts</a></li>
            <li><a href="#" class="footer-link">sweatshirts</a></li>
            <li><a href="#" class="footer-link">jeans</a></li>
            <li><a href="#" class="footer-link">jeans</a></li>
            <li><a href="#" class="footer-link">trousers</a></li>
            <li><a href="#" class="footer-link">shoes</a></li>
            <li><a href="#" class="footer-link">casuals</a></li>
            <li><a href="#" class="footer-link">formal</a></li>
            <li><a href="#" class="footer-link">sports</a></li>
            <li><a href="#" class="footer-link">watches</a></li>
          </ul>

          <ul class="category">
            <li class="category-title">Women</li>
            <li><a href="#" class="footer-link">t-shirts</a></li>
            <li><a href="#" class="footer-link">sweatshirts</a></li>
            <li><a href="#" class="footer-link">jeans</a></li>
            <li><a href="#" class="footer-link">jeans</a></li>
            <li><a href="#" class="footer-link">trousers</a></li>
            <li><a href="#" class="footer-link">shoes</a></li>
            <li><a href="#" class="footer-link">casuals</a></li>
            <li><a href="#" class="footer-link">formal</a></li>
            <li><a href="#" class="footer-link">sports</a></li>
            <li><a href="#" class="footer-link">watches</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-title">about company</p>
      <p class="info">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ut
        risus sodales, aliquet ipsum in, ornare sapien. Donec fermentum faucibus
        libero in tristique. Mauris et massa quis ex porttitor vestibulum eu vel
        eros. Donec vitae felis euismod, eleifend ante ac, venenatis arcu. Sed
        in rhoncus eros. Sed sed ante et nunc placerat auctor. Lorem ipsum dolor
        sit amet, consectetur adipiscing elit. Sed tincidunt fermentum lectus,
        eu imperdiet justo porttitor ac. Sed ac consectetur dui. Ut eleifend,
        dui eget ullamcorper porta, velit sem luctus turpis, eget egestas urna
        nunc at neque. Ut efficitur euismod
      </p>
      <p class="info">
        support emails - help@clothing.com, customersupport@clothing.com
      </p>
      <p class="info">telephone - 180 00 00 001, 180 00 00 002</p>
      <div class="footer-social-container">
        <div>
          <a href="#" class="social-link">terms & services</a>
          <a href="#" class="social-link">privacy page</a>
        </div>
        <div>
          <a href="#" class="social-link">instagram</a>
          <a href="#" class="social-link"> facebook</a>
          <a href="#" class="social-link"> twitter</a>
        </div>
      </div>
      <p class="footer-credit">Copyright@2023</p>
    `;
};

createFooter();
