import { getAddress } from './checkout.js'

fetch('/order', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
        order: JSON.parse(localStorage.cart),
        email: JSON.parse(sessionStorage.user).email,
        add: getAddress(),
    })
}).then(res => {
    console.log("Order saved to firestore")
    window.location.href = '/success';
}).catch(err => {
    console.log(err);
})