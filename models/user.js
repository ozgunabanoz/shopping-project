const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          quantity: { type: Number, required: true }
        }
      ]
    }
  }
});

userSchema.methods.addToCart = async function(product) {
  let newQty = 1;
  let cartProductIndex = this.cart.items.findIndex(
    p => p.productId.toString() === product._id.toString()
  );
  let updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQty;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQty
    });
  }

  let updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;

  try {
    return await this.save();
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.deleteItemFromCart = async function(productId) {
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  );

  this.cart.items = updatedCartItems;

  try {
    await this.save();
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.clearCart = async function() {
  this.cart = { items: [] };

  try {
    return await this.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model('User', userSchema);
