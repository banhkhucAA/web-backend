var express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
const methodOverride = require('method-override');

const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(function(req, res, next) {
  res.locals.baseUrl = req.protocol + '://' + req.get('host');
  next();
});

app.use(methodOverride('_method'));

const url = 'mongodb://127.0.0.1:27017/myProject';

const port = 8080;

// const home = require('./routes/home.js');
const {about,products,products2,cart,addToCart, products_search,login,register,register_account,login_cart,home} = require('./routes/page.js');
app.listen(port, () => {
  connectDb()
  console.log(`Server listening at http://localhost:8080`);
 });

const {connectDb} = require('./database');
const {
 getProductById,
 updateCartProduct_By_UserID_and_ProductID,
 deleteCartProduct_By_UserID_and_ProductID
} = require('./product');//đây là lấy từ product.js

const checkLoggedIn = function(req, res, next) {
  if (!req.session.user&&(req.path=="/cart"||req.path=="/add-to-cart")) {
    let messages = "Please login before seeing your cart";
    res.render('login_fromcart.html',{messages});
  } else {
    next();
  }
};

function checkNotLoggedIn(req, res, next) {
  if (req.session.user) {
    res.redirect('/'); // Chuyển hướng đến trang chính đã đăng nhập
  } else {
    next();
  }
}

//Routing   
app.get("/",home);
app.get("/about",about);
app.get("/products",products);
// app.get("/products",collection);
app.get("/products2",products2);
app.get("/cart",checkLoggedIn,cart);//////////////đoạn sửa
app.get("/cart/:id",cart);
app.get("/products_search",products_search);
app.get("/login",checkNotLoggedIn,login)

app.get("/register",register)

app.post("/login_cart",login_cart)
app.post("/login_home",login_cart)

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.post('/add-to-cart',checkLoggedIn, async (req, res) => {
  let userID;
  const productId = req.body.productId;
  if(req.session.user) userID = req.session.user._id;
  else userID = null;
  const product = await getProductById(productId);
  if (!product) {
    return res.status(404).send('Product not found');
  }
  await addToCart(req,res,userID,product);
});

app.post("/register_account",async (req, res) => {
  const user = req.body;
  register_account(req,res,user);
});

//Template Engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + "/views");

//config public folder acces -> cac file tinh
app.use(express.static(__dirname + "/public"));
 
app.use(express.json());

app.delete('/cart/remove/:id', async (req, res) => {
  userId = req.session.user._id;
  const result = await deleteCartProduct_By_UserID_and_ProductID(userId,req.params.id);
  if (!result) {
  return res.status(404).send('Product not found');
  }else
  {
    return cart(req, res);
  }
});

app.put('/cart/update/:id', async (req, res) => {
  userId = req.session.user._id;
  let quantity = parseInt(req.body.productQuantity,10)
  console.log(quantity)
  const result = await updateCartProduct_By_UserID_and_ProductID(userId,req.params.id,quantity);
   return cart(req, res);
 });



 


