const { getDb } = require('../database');
const { ObjectId } = require('mongodb');
const {getProductsByName,getUsers,getUserCollection,getUser_cartbyID,getProduct_fromUserCartbyProductID,getProducts} = require('../product');
const Joi = require('joi');

module.exports = {
    home: async function(req,res){
        let userName;
        if(req.session.user) userName = req.session.user.name;
        else userName = null;
        res.render('home.html',{userName});
    },
    login: async function(req,res){
        let messages=null;
        res.render('login_fromhome.html',{messages});
    },
    login_cart: async function(req,res){
        const users = await getUsers();
        const user = {
            email: req.body.userEmail,
            password: req.body.userPassword
        }
        let messages;
        let foundUser = null;
        for(i=0;i<users.length;i++)
        {
            if(user.email===users[i].email&&user.password===users[i].password)
            {
                foundUser = users[i];
                break;       
            }else{
                messages = "Can not loggin, your account doesn't exist.";
            }
        }
        if(!foundUser)
        {
            let messages = "Can not loggin, your account doesn't exist.";
            res.render('login_fromhome.html',{messages});
        }
        else{
        req.session.user = foundUser;
        messages = "Đăng nhập thành công";
        let userID;
        userID = req.session.user._id;
        const Mycart = await getUser_cartbyID(userID);
        let cartItems;
        cartItems = Mycart.cart;
        const cartTotal = cartItems.length;
        let TotalNumber = 0;
        let TotalPrice = 0;
        for(let i=0;i<cartTotal;i++)
        {
            TotalNumber = TotalNumber + cartItems[i].quantity;
            TotalPrice = TotalPrice + cartItems[i].price*cartItems[i].quantity;
        }
        if(req.path=="/login_cart")
            res.render('cart.html', { cartItems: cartItems, cartTotal: TotalNumber,cartPrice:TotalPrice,userId:userID,userName:req.session.user.name });
        else
        {
            res.render('home.html',{userName:foundUser.name})
        };
    }
},
    register: async function(req,res){
        let messages = null;
        res.render('register.html',{messages});
    },
    register_account: async function(req,res,user){
        user = {
            email: user.userEmail,
            password: user.userPassword,
            name: user.userName,
            cart: []
        }
        let messages = "Register successfully."
        const users = await getUsers()
        if(users.length==0)
        {
            await getUserCollection().insertOne(user);
        }else{
            let foundUser = null;;
            for(i=0;i<users.length;i++)
            {
                if(users[i].email===user.email)
                {
                    messages = "Sorry, your email has been registered.";
                    foundUser = users[i];
                    break;
                }
            }
            if(!foundUser)
            {
                await getUserCollection().insertOne(user);
            }
        }
        res.render('register.html',{messages:messages});
    },

    about: function (req, res) {
        res.render('about.html', { title: 'About My Candy Shop' });
    },
    products: async function (req, res) {
        let userName = null;
        const Items = await getProducts();
        const Total = Items.length;
        if(req.session.user)
        userName = req.session.user.name;
        res.render('products.html', { Items: Items, Total: Total, userName:userName});
    },
    collection: function (req, res) {
        res.render('collection.html', { title: 'About My Collection' });
    },
    products2: function (req, res) {
        res.render('products2.html', { title: 'About My Products 2' });
    },
    cart: async function (req, res) {
        let userID;
        userID = req.session.user._id;
        const Mycart = await getUser_cartbyID(userID);
             let cartItems;
             cartItems = Mycart.cart;
             
        const cartTotal = cartItems.length;
        let TotalNumber = 0;
        let TotalPrice = 0;
        for(let i=0;i<cartTotal;i++)
        {
            TotalNumber = TotalNumber + cartItems[i].quantity;
            TotalPrice = TotalPrice + cartItems[i].price*cartItems[i].quantity;
        }
        
        if(req.session.user) userName = req.session.user.name
        else userName = null;
        res.render('cart.html', { cartItems: cartItems, cartTotal: TotalNumber,cartPrice:TotalPrice,userId:userID,userName:userName});
    },
    products_search: async function (req, res) {
        const Items = await getProductsByName(req.query.name);
        const Total = Items.length;
        if(req.session.user)
        userName = req.session.user.name;
        else userName = null;
        res.render('products.html', { Items: Items, Total: Total,userName:userName });
    },
    addToCart: async function (req,res,userID,product) {
        try{
            let foundProduct = null;
             foundProduct = await getProduct_fromUserCartbyProductID(userID,product);
            const newProduct = {
                _id: product._id.toString(),
                name: product.name,
                price: product.price,
                year: product.year,
                brand: product.brand,
                category: product.category,
                image: product.image,
                description: product.description,
                quantity: 1
              };
            const { error, value } = Joi.object({
                _id: Joi.string().required(),
                name: Joi.string().required(),
                price: Joi.number().min(1).required(),
                year: Joi.number().min(2000).required(),
                brand: Joi.string().required(),
                category: Joi.string().required(),
                image: Joi.string().required(),
                description: Joi.string().required(),
                quantity: Joi.number().min(1).required(),
              }).validate(newProduct);
              if (error) {
                return res.status(400).send(error.details[0].message);
              }
            if(!foundProduct)
            {
              const result = await getDb().collection('Users').updateOne(
                { _id: new ObjectId(userID) },
                { $addToSet: { cart: newProduct } }
              );
            }else{
                const result = await getDb().collection('Users').updateOne(
                    { _id: new ObjectId(userID), "cart._id": newProduct._id },
                    { $inc: { "cart.$.quantity": 1 } }
                  );
            }
              const Mycart = await getUser_cartbyID(userID);
             let cartItems;
             cartItems = Mycart.cart;
             
        const cartTotal = cartItems.length;
        let TotalNumber = 0;
        let TotalPrice = 0;
        for(let i=0;i<cartTotal;i++)
        {
            TotalNumber = TotalNumber + cartItems[i].quantity;
            TotalPrice = TotalPrice + cartItems[i].price*cartItems[i].quantity;
        }
        
        if(req.session.user) userName = req.session.user.name
        else userName = null;
        res.render('cart.html', { cartItems: cartItems, cartTotal: TotalNumber,cartPrice:TotalPrice,userId:userID,userName:userName});
              
         }catch (error) {
        console.log(error);
      }
 }};