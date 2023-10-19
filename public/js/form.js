// redirecting to homepage if user logged in
window.onload = () => {
  if (sessionStorage.user) {
    user = JSON.parse(sessionStorage.user);
    if (compareToken(user.authToken, user.email)) {
      location.replace("/");
    }
  }
};

const loader = document.querySelector(".loader");

const submitBtn = document.querySelector(".submit-btn");
const name = document.getElementById("name") || null;
const email = document.getElementById("email");
const password = document.getElementById("password");
const number = document.getElementById("number") || null;
const tac = document.getElementById("terms-and-cond") || null;
const notification = document.getElementById("notification") || null;

submitBtn.addEventListener("click", () => {
  if (name != null) {
    //signup page
    if (name.value.length < 3) {
      showAlert("name must be atleast 3 letters long");
    } else if (!email.value) {
      showAlert("Enter your email");
    } else if (password.value.length < 8) {
      showAlert("Password must be atleast 8 characters long");
    } else if (!number.value.length) {
      showAlert("Enter your phone number");
    } else if (!Number(number.value) || number.value.length < 10) {
      showAlert("invalid number, please enter a valid one");
    } else if (!tac.checked) {
      showAlert("Please accept terms and conditions to continue");
    } else {
      // submit form
      loader.style.display = "block";

      sendData("/signup", {
        name: name.value,
        email: email.value,
        password: password.value,
        number: number.value,
        tac: tac.checked,
        notification: notification.checked,
        seller: false,
      });
    }
  } else {
    // login page
    if (!email.value.length || !password.value.length) {
      showAlert("fill in all the inputs");
    } else {
      loader.style.display = "block";

      sendData("/login", {
        email: email.value,
        password: password.value,
      });
    }
  }
});

