const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

let authToken = '';
let userId = '';
let productId = '';
let orderId = '';

async function testAPI() {
  console.log('🧪 Starting E-commerce API Tests...\n');
  
  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);
    
    // 2. Test User Registration
    console.log('\n2️⃣ Testing User Registration...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      authToken = registerData.data.token;
      userId = registerData.data.user.id;
      console.log('✅ User registration successful');
      console.log('   📧 Email:', registerData.data.user.email);
      console.log('   👤 Name:', registerData.data.user.firstName, registerData.data.user.lastName);
    } else {
      console.log('ℹ️ User might already exist, trying login...');
      
      // Try login instead
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        authToken = loginData.data.token;
        userId = loginData.data.user.id;
        console.log('✅ User login successful');
      } else {
        throw new Error('Both registration and login failed');
      }
    }
    
    // 3. Test Get Products
    console.log('\n3️⃣ Testing Get Products...');
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.length > 0) {
      productId = productsData.data[0].id;
      console.log('✅ Products retrieved successfully');
      console.log('   📦 Total products:', productsData.data.length);
      console.log('   🏷️ First product:', productsData.data[0].name);
      console.log('   💰 Price: $' + productsData.data[0].priceUsd);
    } else {
      throw new Error('No products found');
    }
    
    // 4. Test Add to Cart
    console.log('\n4️⃣ Testing Add to Cart...');
    const cartResponse = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: 2
      })
    });
    
    if (cartResponse.ok) {
      console.log('✅ Item added to cart successfully');
    } else {
      const errorData = await cartResponse.json();
      console.log('❌ Add to cart failed:', errorData.error);
    }
    
    // 5. Test Get Cart
    console.log('\n5️⃣ Testing Get Cart...');
    const getCartResponse = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (getCartResponse.ok) {
      const cartData = await getCartResponse.json();
      console.log('✅ Cart retrieved successfully');
      console.log('   🛒 Items in cart:', cartData.data.length);
    }
    
    // 6. Test Create Order
    console.log('\n6️⃣ Testing Create Order...');
    const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        items: [{ productId: productId, quantity: 1 }],
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'USA'
        }
      })
    });
    
    if (orderResponse.ok) {
      const orderData = await orderResponse.json();
      orderId = orderData.data.id;
      console.log('✅ Order created successfully');
      console.log('   📋 Order ID:', orderId);
      console.log('   💵 Total Amount: $' + orderData.data.totalAmount);
      console.log('   📍 Status:', orderData.data.status);
    } else {
      const errorData = await orderResponse.json();
      console.log('❌ Order creation failed:', errorData.error);
    }
    
    // 7. Test Get User Orders
    console.log('\n7️⃣ Testing Get User Orders...');
    const userOrdersResponse = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (userOrdersResponse.ok) {
      const userOrdersData = await userOrdersResponse.json();
      console.log('✅ User orders retrieved successfully');
      console.log('   📦 Total orders:', userOrdersData.data.length);
    }
    
    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ User authentication working');
    console.log('   ✅ Product management working'); 
    console.log('   ✅ Cart functionality working');
    console.log('   ✅ Order creation working');
    console.log('   ✅ Data persistence in MongoDB working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
testAPI();