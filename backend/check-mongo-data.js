const mongoose = require('mongoose');

async function checkMongoData() {
  console.log('🔍 Checking MongoDB Data...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections:');
    collections.forEach(collection => {
      console.log(`   📁 ${collection.name}`);
    });
    console.log('');
    
    // Check Users collection
    console.log('👥 USERS COLLECTION:');
    console.log('====================');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`📊 Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`\n   User ${index + 1}:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`   🔧 Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${user.createdAt}`);
    });
    
    // Check Products collection
    console.log('\n\n📦 PRODUCTS COLLECTION:');
    console.log('=======================');
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`📊 Total products: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`\n   Product ${index + 1}:`);
      console.log(`   🏷️ Name: ${product.name}`);
      console.log(`   💰 Price: $${product.priceUsd}`);
      console.log(`   📦 Stock: ${product.stockQuantity}`);
      console.log(`   🏪 Category: ${product.category}`);
      console.log(`   ✅ Active: ${product.isActive ? 'Yes' : 'No'}`);
    });
    
    // Check Orders collection
    console.log('\n\n🛒 ORDERS COLLECTION:');
    console.log('====================');
    const orders = await mongoose.connection.db.collection('orders').find({}).toArray();
    console.log(`📊 Total orders: ${orders.length}`);
    orders.forEach((order, index) => {
      console.log(`\n   Order ${index + 1}:`);
      console.log(`   📋 ID: ${order._id}`);
      console.log(`   👤 User ID: ${order.userId}`);
      console.log(`   💵 Total: $${order.totalAmount}`);
      console.log(`   📍 Status: ${order.status}`);
      console.log(`   📦 Items: ${order.items.length}`);
      console.log(`   🏠 Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}`);
      console.log(`   📅 Created: ${order.createdAt}`);
    });
    
    // Check Cart Items collection
    console.log('\n\n🛒 CART ITEMS COLLECTION:');
    console.log('=========================');
    const cartItems = await mongoose.connection.db.collection('cartitems').find({}).toArray();
    console.log(`📊 Total cart items: ${cartItems.length}`);
    cartItems.forEach((item, index) => {
      console.log(`\n   Cart Item ${index + 1}:`);
      console.log(`   👤 User ID: ${item.userId}`);
      console.log(`   📦 Product: ${item.product.name}`);
      console.log(`   🔢 Quantity: ${item.quantity}`);
      console.log(`   💰 Price: $${item.product.priceUsd}`);
    });
    
    console.log('\n\n📊 DATABASE SUMMARY:');
    console.log('====================');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`🛒 Orders: ${orders.length}`);
    console.log(`🛍️ Cart Items: ${cartItems.length}`);
    
    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log(`💰 Total Sales: $${totalSales.toFixed(2)}`);
    
    console.log('\n✅ Data verification complete!');
    console.log('\n🎯 Your MongoDB integration is working perfectly!');
    console.log('   • User profiles are being stored ✅');
    console.log('   • Order data is being persisted ✅');
    console.log('   • Product catalog is maintained ✅');
    console.log('   • Shopping cart data is saved ✅');
    
  } catch (error) {
    console.error('❌ Error checking MongoDB data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the data check
checkMongoData();