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
    expiresIn: "/* add value from 'Expires' from v2 call if present, else remove */"
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
      // redirect_url: `${DOMAIN}/success?session_id={checkout_id}&order=${JSON.stringify(req.body)}`,
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


// app.get('/success', async (req,res) => {
//   let {order, session_id} = req.query;

//   try {
//     const session = await
//   } catch (error) {

//   }
// })

// 404 route
app.get("/404", (req, res) => {
  res.sendFile(path.join(staticPath, "404.html"));
});

app.use((req, res) => {
  res.redirect("/404");
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
