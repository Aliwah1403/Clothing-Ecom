// packages
const express = require("express")
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const path = require("path");
const nodemailer = require('nodemailer');
const Intasend = require('intasend-node');


// firebase admin setup
let serviceAccount = require("./ecom-try-fullstack-2-firebase-adminsdk-86lsr-af05397965.json");
// let serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();

// aws configuration
const aws = require("aws-sdk");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const {
  PutObjectCommand,
  S3
} = require("@aws-sdk/client-s3");

const dotenv = require("dotenv");
const { url } = require("inspector");

dotenv.config();

// aws parameters
const region = "af-south-1";
const bucketName = "clothing-ecom";
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
  region,
  accessKeyId,
  secretAccessKey,
});

// initialise s3
const s3 = new S3();

// generate image upload link
async function generateUrl() {
  let date = new Date();
  let id = parseInt(Math.random() * 10000000000);

  const imageName = `${id}${date.getTime()}.jpg`;

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 300, //300ms
    ContentType: "image/jpeg",
  };
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand(params), {
    expiresIn: 300
  });
  return uploadUrl;
}

// static path
let staticPath = path.join(__dirname, "public");

const app = express();

// middlewares
app.use(express.static(staticPath));
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// signup route
app.get("/signup", (req, res) => {
  res.sendFile(path.join(staticPath, "signup.html"));
});

app.post("/signup", (req, res) => {
  let { name, email, password, number, tac, notification } = req.body;

  // form validations
  if (name.length < 3) {
    return res.json({ alert: "name must be atleast 3 letters long" });
  } else if (!email.length) {
    return res.json({ alert: "Enter your email" });
  } else if (password.length < 8) {
    return res.json({ alert: "Password must be atleast 8 characters long" });
  } else if (!number.length) {
    return res.json({ alert: "Enter your phone number" });
  } else if (!Number(number) || number.length < 10) {
    return res.json({ alert: "invalid number, please enter a valid one" });
  } else if (!tac) {
    return res.json({
      alert: "Please accept terms and conditions to continue",
    });
  }

  // store user in db
  db.collection("users")
    .doc(email)
    .get()
    .then((user) => {
      if (user.exists) {
        return res.json({ alert: "email already exists" });
      } else {
        // encrypting password before storing it
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            req.body.password = hash;
            db.collection("users")
              .doc(email)
              .set(req.body)
              .then((data) => {
                res.json({
                  name: req.body.name,
                  email: req.body.email,
                  number: req.body.number,
                  seller: req.body.seller,
                });
              });
          });
        });
      }
    });
});

// log in route
app.get("/login", (req, res) => {
  res.sendFile(path.join(staticPath, "login.html"));
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;

  if (!email.length || !password.length) {
    return res.json({ alert: "fill in all the inputs" });
  }

  db.collection("users")
    .doc(email)
    .get()
    .then((user) => {
      if (!user.exists) {
        // if user does not exixst
        return res.json({ alert: "log in email does not exist" });
      } else {
        bcrypt.compare(password, user.data().password, (err, result) => {
          if (result) {
            let data = user.data();
            return res.json({
              name: data.name,
              email: data.email,
              number: data.number,
              seller: data.seller,
            });
          } else {
            return res.json({ alert: "password is incorrect! " });
          }
        });
      }
    });
});

// seller route
app.get("/seller", (req, res) => {
  res.sendFile(path.join(staticPath, "seller.html"));
});

app.post("/seller", (req, res) => {
  let { name, about, address, number, tac, legit, email } = req.body;
  if (
    !name.length ||
    !address.length ||
    !about.length ||
    number.length < 10 ||
    !Number(number)
  ) {
    return res.json({ alert: "some information(s) is/are invalid" });
  } else if (!tac || !legit) {
    return res.json({ alert: "agree to our terms and conditions" });
  } else {
    // update users seller status
    db.collection('sellers').doc(email).set(req.body)
      .then(data => {
        db.collection('users').doc(email).update({
          seller: true
        }).then(data => {
          res.json(true);
        })
      })
  }
});

// add products
app.get("/add-product", (req, res) => {
  res.sendFile(path.join(staticPath, "addProduct.html"));
});

app.get("/add-product/:id", (req, res) => {
  res.sendFile(path.join(staticPath, "addProduct.html"));
});

// getting the upload link
app.get("/s3url", (req, res) => {
  generateUrl().then((url) => res.json(url));
});

// adding products
app.post("/add-product", (req, res) => {
  let {
    name,
    shortDes,
    des,
    images,
    sizes,
    actualPrice,
    discount,
    sellPrice,
    stock,
    tags,
    tac,
    email,
    draft,
    id
  } = req.body;


  // validation
  if (!draft) {
    if (!name.length) {
      return res.json({ alert: "enter product name" });
    } else if (shortDes.length > 100 || shortDes.length < 10) {
      return res.json({
        alert: "short description must be between 10 to 100 characters long",
      });
    } else if (!des.length) {
      return res.json({
        alert: "enter a detailed description about the product",
      });
    } else if (!images.length) {
      return res.json({ alert: "upload at least one product image" });
    } else if (!sizes.length) {
      return res.json({ alert: "select atleast one size" });
    } else if (!actualPrice.length || !discount.length || !sellPrice.length) {
      return res.json({ alert: "you must add pricing for your product" });
    } else if (stock < 20) {
      return res.json({ alert: "You should have at least 20 items in stock" });
    } else if (!tags.length) {
      return res.json({
        alert: "enter a few tags to help when ranking your product in search",
      });
    } else if (!tac) {
      return res.json({ alert: "agree to our terms and conditions to proceed" });
    }
  }

  // adding products
  let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
  db.collection("products")
    .doc(docName)
    .set(req.body)
    .then((data) => {
      res.json({ product: name });
    })
    .catch((err) => {
      return res.json({ alert: "an error occured. Try again" });
    });
});


// get products
app.post("/get-products", (req, res) => {
  let { email, id, tag } = req.body;

  if (id) {
    docRef = db.collection('products').doc(id)
  } else if (tag) {
    docRef = db.collection('products').where('tags', 'array-contains', tag)
  } else {
    docRef = db.collection("products").where("email", "==", email)
  }

  docRef.get()
    .then(products => {
      if (products.empty) {
        return res.json("no products");
      }
      let productArr = [];
      if (id) {
        return res.json(products.data())
      } else {
        products.forEach(item => {
          let data = item.data();
          data.id = item.id;
          productArr.push(data);
        });
        res.json(productArr);
      }

    });
});

app.post('/delete-product', (req, res) => {
  let { id } = req.body;

  db.collection('products').doc(id).delete()
    .then(data => {
      res.json('success');
    }).catch(err => {
      res.json('err')
    })
})

// product page
app.get('/products/:id', (req, res) => {
  res.sendFile(path.join(staticPath, "product.html"))
})

// search page results
app.get('/search/:key', (req, res) => {
  res.sendFile(path.join(staticPath, "search.html"));
})

// shop page
app.get('/shop', (req, res) => {
  res.sendFile(path.join(staticPath, "shop.html"));
})

// cart page
app.get('/cart', (req, res) => {
  res.sendFile(path.join(staticPath, "cart.html"));
})

// checkout page
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(staticPath, "checkout.html"));
})

// intasend payment
let intasend = new Intasend(
  publishable_key = process.env.PUBLISHABLE_KEY,
  secret_key = process.env.SECRET_KEY,
  test_mode = true,

);

let DOMAIN = process.env.DOMAIN;

app.post('/intasend-checkout', async (req, res) => {
  try {
    let collection = await intasend.collection();
    const chargeResult = await collection.charge({
      first_name: req.body.first_name,
      phone_number: req.body.phone_number,
      email: req.body.email,
      api_ref: 'test',
      country: 'KE',
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zipcode: req.body.zipcode,
      amount: req.body.amount,
      host: `${DOMAIN}`,
      redirect_url: `${DOMAIN}/success`,
      currency: 'KES',
    });

    // Successful response with URL
    const url = chargeResult.url;
    res.status(200).json({ url });

  } catch (error) {
    console.error(`Charge Error: ${error}`);
    res.status(500).json({ alert: 'Payment processing failed' });
  }
});

// success page
app.get('/success', async (req, res) => {
  res.sendFile(path.join(staticPath, "success.html"));

  let { checkout_id, tracking_id } = req.query;


  try {
    let collection = await intasend.collection();
    const statusResult = await collection.status(tracking_id)

    const session = await checkout_id;
    const customer = await statusResult.meta.customer;
    const email = await statusResult.meta.customer.email;
    const name = await `${statusResult.meta.customer.first_name} ${statusResult.meta.customer.last_name}`

    // Have an email get sent to user to inform order being sent
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    })

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Clothing : Order Placed',
      html: `
         <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>

        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            min-height: 90vh;
            background: #f5f5f5;
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .heading {
            text-align: center;
            font-size: 40px;
            width: 50%;
            display: block;
            line-height: 50px;
            margin: 30px auto 60px;
            text-transform: capitalize;
          }

          .heading span {
            font-weight: 300;
          }

          .btn {
            width: 200px;
            height: 50px;
            border-radius: 5px;
            background: #3f3f3f;
            color: #fff;
            display: block;
            margin: auto;
            font-size: 18px;
            text-transform: capitalize;
          }
        </style>
      </head>
      <body>
        <h1 class="heading">
          dear ${name}, <span>your order(Order - ${tracking_id}) has been successfully placed</span>
        </h1>
        <button class="btn">Continue Shopping</button>
      </body>
    </html>

        `
    }
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        // res.json({ 'alert': "oops! seems like an error occurred. Please try again" })
        console.log('An error occurred sending the mail')
      } else {
        // res.json({ 'alert': "your order has been placed" })
        console.log("Order email placed")
      }
    })

  } catch (err) {
    // res.redirect('/404')
    console.log(err);
  }

})

app.post('/order', async (req, res) => {
  const { order, email, add, name } = req.body;

  try {
    let orderNumber = Math.floor(Math.random() * 12371928773392)

    let docName = `${email}-order-${orderNumber}`;
    db.collection('order').doc(docName).set(req.body)
      .then(data => {
        // res.redirect('/checkout?payment=done')
        // console.log('Added to DB ')

        const orderItems = order.map(item => `
  <div class="sm-product">
    <img src="${item.image}" class="sm-product-img" alt="Product Image" />
    <div class="sm-text">
      <p class="sm-product-name">${item.name}</p>
      <p class="sm-size">${item.size}</p>
    </div>
    <div class="quantity">
      <h3>${item.item}x</h3>
    </div>
  </div>
`).join('');

        // Email to owners about order
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
          }
        })

        const mailOptions = {
          from: process.env.EMAIL,
          to: process.env.EMAIL,
          subject: `A new order has been placed`,
          html: `
            <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
          * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f5f5f5;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  display: block;
  margin: 30px auto 60px;
  min-height: auto;
}

.heading {
  text-align: center;
  margin: 0 auto;
  font-size: 30px;
  width: 50%;
  display: block;
  line-height: 50px;
  text-transform: capitalize;
}

.heading span {
  font-weight: 300;
}

.customer-order {
  margin-top: 5%;
  min-width: 700px;
  padding: 10px 20px;
}

.customer-order h2 {
  font-weight: 500;
}

/* Order details */
.cart-section {
  width: 100%;
  padding: 20px 10vw;
  display: flex;
  justify-content: space-between;
}

.product-list {
  width: 100%;
  margin-top: 2%;
}

.checkout-section {
  width: 28%;
}

.section-heading {
  font-size: 30px;
  font-weight: 500;
  margin: 20px 0;
}

.cart {
  width: 100%;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #d8d8d8;
  margin-bottom: 60px;
}

.sm-product {
    width: 100%;
    height: 100px;
    display: flex;
    overflow: hidden;
    margin-bottom: 20px;
    align-items: center;
}

.cart .sm-product:last-child,
.wishlist .sm-product:last-child {
  margin-bottom: 0;
}

.sm-product-img {
  height: 100px;
  width: 100px;
  object-fit: cover;
  border-radius: 5px;
}

.sm-text {
  width: 50%;
}

.sm-product-name {
  font-size: 25px;
  font-weight: 700;
  text-transform: capitalize;
}

.sm-des {
  font-size: 18px;
  opacity: 0.5;
  line-height: 25px;
  text-transform: capitalize;
  margin-top: 10px;
}

.item-counter {
  width: 90px;
  height: 30px;
  display: flex;
  margin-right: 20px;
}

.counter-btn,
.item-count {
  width: 30px;
  height: 30px;
}

.counter-btn {
  background: #f3f3f3;
  border: 1px solid rgb(216, 216, 216);
  border-radius: 1px;
  cursor: pointer;
}

.item-count {
  text-align: center;
  line-height: 30px;
  background: #f5f5f5;
}

.sm-price {
  font-size: 30px;
  font-weight: 500;
  color: #383838;
}

    </style>
</head>

<body>
    <div class="container">
        <h1 class="heading">
            <span>You have received a new order from</span>, ${name}
        </h1>

        <div class="customer-order">
            <h2>Item(s) Ordered</h2>
            <div class="product-list">
                <div class="cart">
                    <!-- Customer Order(s) -->
                    ${orderItems}
                </div>
            </div>
        </div>
    </div>

</body>

</html>
          `
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            // res.send('error')
          } else {
            console.log('Owner received order successfully')
            // res.status(200).send('Email sent successfully')
          }
        })


      })
      .catch(err => {
        console.log(err)
      })
  } catch (err) {
    res.redirect('/404');
    console.log('Error storing order: ', err)
  }

})


// order-checkout route
// app.post('/order', (req, res) => {
//   const { order, email, add } = req.body;

//   let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.PASSWORD
//     }
//   })

//   const mailOption = {
//     from: 'aliwahcurtis5@gmail.com',
//     to: email,
//     subject: 'Clothing : Order Placed',
//     html: `
//      <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Document</title>

//     <style>
//       * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//       }

//       body {
//         min-height: 90vh;
//         background: #f5f5f5;
//         font-family: sans-serif;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }

//       .heading {
//         text-align: center;
//         font-size: 40px;
//         width: 50%;
//         display: block;
//         line-height: 50px;
//         margin: 30px auto 60px;
//         text-transform: capitalize;
//       }

//       .heading span {
//         font-weight: 300;
//       }

//       .btn {
//         width: 200px;
//         height: 50px;
//         border-radius: 5px;
//         background: #3f3f3f;
//         color: #fff;
//         display: block;
//         margin: auto;
//         font-size: 18px;
//         text-transform: capitalize;
//       }
//     </style>
//   </head>
//   <body>
//     <h1 class="heading">
//       dear ${email.split('@')[0]}, <span>your order has been successfully placed</span>
//     </h1>
//     <button class="btn">check status</button>
//   </body>
// </html>

//     `
//   }

//   let docName = email + Math.floor(Math.random() * 12371928773392);
//   db.collection('order').doc(docName).set(req.body)
//     .then(data => {
//       transporter.sendMail(mailOption, (err, info) => {
//         if (err) {
//           res.json({ 'alert': "oops! seems like an error occurred. Please try again" })
//         } else {
//           res.json({ 'alert': "your order has been placed" })
//         }
//       })
//     })
// })

// 404 route
app.get("/404", (req, res) => {
  res.sendFile(path.join(staticPath, "404.html"));
});

app.use((req, res) => {
  res.redirect("/404");
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
