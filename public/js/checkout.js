window.onload = () => {
    if (!sessionStorage.user) {
        location.replace('/login');
    }
}


// Delivery dropdown
const dropdown = document.getElementById('deliveryDropdown')
dropdown.addEventListener('change', () => {
    deliveryOption = dropdown.value;
    updateBill()
})


const placeOrderBtn = document.querySelector('.place-order-btn');
placeOrderBtn.addEventListener('click', () => {
    let address = getAddress();
    // if (address) {
    //     fetch('/order', {
    //         method: 'POST',
    //         headers: new Headers({ 'Content-Type': 'application/json' }),
    //         body: JSON.stringify({
    //             order: JSON.parse(localStorage.cart),
    //             email: JSON.parse(sessionStorage.user).email,
    //             add: address,
    //         })
    //     }).then(res => res.json())
    //         .then(data => {
    //             if (data.alert == 'your order has been placed') {
    //                 delete localStorage.cart;
    //                 showAlert(data.alert, 'success');
    //             } else {
    //                 showAlert(data.alert);
    //             }
    //         })
    // }

    // Sending the data to the backend
    fetch('/intasend-checkout', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            address: address.address,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
            email: JSON.parse(sessionStorage.user).email,
            first_name: JSON.parse(sessionStorage.user).name,
            phone_number: JSON.parse(sessionStorage.user).number,
            amount: finalPrice,
        }),
    })
        .then((res) => {
            if (res.ok) {
                return res.json(); // Parse the JSON response
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then((data) => {
            const redirectUrl = data.url;
            window.location.href = redirectUrl;
        })
        .catch((err) => console.log('Error:', err));
})


export const getAddress = () => {
    // validation
    let address = document.getElementById('address').value;
    let street = document.getElementById('street').value;
    let city = document.getElementById('city').value;
    let state = document.getElementById('state').value;
    let zipcode = document.getElementById('zipcode').value;
    let landmark = document.getElementById('landmark').value;

    if (!address.length || !street.length || !city.length || !state.length ||
        !zipcode.length || !landmark.length) {
        return showAlert('fill in all the inputs');
    } else {
        return { address, street, city, state, zipcode, landmark };
    }
}