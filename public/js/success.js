fetch('/order', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
        order: JSON.parse(localStorage.cart),
        email: JSON.parse(sessionStorage.user).email,
        add: JSON.parse(sessionStorage.getItem('address')),
    })
}).then(res => {
    console.log("Order saved to firestore")
    window.location.href = '/success';
}).catch(err => {
    console.log(err);
})