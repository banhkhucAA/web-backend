const { ObjectId } = require('mongodb');
const { getDb } = require('./database');
 
function getProductCollection() {
 return getDb().collection('MyCandyShop');
}
 
async function getProducts() {
    const products = await getProductCollection().find({}, { projection: { _id: 1, name: 1, year: 1, price: 1, brand: 1, category: 1, image: 1, description:1, quantity: 1} }).toArray();
    return products;
}
 
async function getProductById(id) {
 const product = await getProductCollection().findOne({ _id: new ObjectId(id) },{ projection: { _id: 1, name: 1, year: 1, price: 1, brand: 1, category: 1, image: 1, description:1, quantity: 1}});
 return product;
}

async function getProductsByName(name) {
    const products = await getProductCollection().find({name: { $regex: name, $options: "i" }},{ projection: { _id: 1, name: 1, year: 1, price: 1, brand: 1, category: 1, image: 1, description:1, quantity: 1} }).toArray();
    return products;
   }
 
module.exports = {
 getProducts,
 getProductById,
 getProductsByName,
 getProductCollection,
 getUsers,
 getUserCollection,
 getUser_cartbyID,
 getProduct_fromUserCartbyProductID,
 updateCartProduct_By_UserID_and_ProductID,
 deleteCartProduct_By_UserID_and_ProductID
};

//user cart - specific cart
function getUserCollection() {
    return getDb().collection('Users');
   }

   async function getUsers() {
    const users = await getUserCollection().find({}, { projection: { _id: 1, name: 1, email: 1, password: 1, cart:1} }).toArray();
    return users;
}

   async function getUser_cartbyID(id) {
    const user = await getUserCollection().findOne({ _id: new ObjectId(id) }, { projection: { cart:1} });
    return user;
}

async function getProduct_fromUserCartbyProductID(userId,product) {
    const user = await getUserCollection().findOne({ _id: new ObjectId(userId) }, { projection: { cart:1} });
    let cartItems = user.cart;
    console.log(cartItems[0]._id)
    let productID;
    let foundProduct=null;
    productID = product._id.toString();
        for(i=0;i<cartItems.length;i++)
        {
            if(cartItems[i]._id === productID)
            foundProduct = cartItems[i];
        }
    return foundProduct;
}

async function updateCartProduct_By_UserID_and_ProductID(userID,id,quantity) {
    const result = await getUserCollection().updateOne(
        { _id: new ObjectId(userID),"cart._id": id },
        { $set: { "cart.$.quantity": quantity } });
    return result.modifiedCount > 0;
   }

   async function deleteCartProduct_By_UserID_and_ProductID(userID, productID) {
    const result = await getUserCollection().updateOne(
      { _id: new ObjectId(userID) },
      { $pull: { cart: { _id: productID } } }
    );
    console.log(result.modifiedCount);
    return result.modifiedCount > 0;
  }
