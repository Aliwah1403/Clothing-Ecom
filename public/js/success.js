<<<<<<< HEAD
// Getting date and time order was made
const getDateTime = () => {
    let date = new Date();

    let currentTime = new Date(date.getTime());

    // Extract the date components (day, month, year)
    let day = currentTime.getDate().toString().padStart(2, '0');
    let month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
    let year = currentTime.getFullYear().toString();

    // Extract the time components (hours, minutes, seconds)
    let hours = currentTime.getHours().toString().padStart(2, '0');
    let minutes = currentTime.getMinutes().toString().padStart(2, '0');
    let seconds = currentTime.getSeconds().toString().padStart(2, '0');

    // Format the date and time
    let formattedDateTime = `${day}-${month}-${year} - ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;

}

// Order route activated after /success route goes through
=======
import { getAddress } from './checkout.js'

>>>>>>> ce3c00a77c4728278f7852534340c4d2a4e8f07a
fetch('/order', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
        order: JSON.parse(localStorage.cart),
        email: JSON.parse(sessionStorage.user).email,
<<<<<<< HEAD
        name: JSON.parse(sessionStorage.user).name,
        add: JSON.parse(sessionStorage.getItem('address')),
        time: getDateTime(),
=======
        add: getAddress(),
>>>>>>> ce3c00a77c4728278f7852534340c4d2a4e8f07a
    })
}).then(res => {
    console.log("Order saved to firestore")
    window.location.href = '/success';
}).catch(err => {
    console.log(err);
})

// Deleting the order from cart after successful payment
const successOrder = () => {
    delete localStorage.cart;
}

window.addEventListener('load', () => {
    successOrder();
})