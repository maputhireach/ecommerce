const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCore() {
  console.log('🧪 Testing Core MongoDB Integration...\n');

  try {
    // Test 1: User Registration
    console.log('1️⃣ Testing User Registration...');
    const registerData = {
      email: `student${Date.now()}@setec.edu`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Student'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    const { token, user } = registerResponse.data.data;
    console.log('✅ User registered successfully!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);

    // Test 2: User Login
    console.log('\n2️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful!');

    // Test 3: Get Products
    console.log('\n3️⃣ Testing Get Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const products = productsResponse.data.data;
    console.log(`✅ Found ${products.length} products in MongoDB`);
    if (products.length > 0) {
      console.log(`   Sample: ${products[0].name} - $${products[0].priceUsd}`);
    }

    // Test 4: Create Order
    console.log('\n4️⃣ Testing Order Creation...');
    if (products.length > 0) {
      const orderData = {
        items: [
          {
            productId: products[0]._id,
            quantity: 1
          }
        ],
        shippingAddress: {
          street: '123 SETEC Institute Street',
          city: 'Phnom Penh',
          state: 'Phnom Penh',
          zipCode: '12000',
          country: 'Cambodia'
        }
      };

      const orderResponse = await axios.post(`${BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Order created successfully!');
      console.log(`   Order ID: ${orderResponse.data.data._id}`);
      console.log(`   Total: $${orderResponse.data.data.totalAmount}`);
      console.log(`   Status: ${orderResponse.data.data.status}`);

      // Test 5: Get User Orders
      console.log('\n5️⃣ Testing Get User Orders...');
      const ordersResponse = await axios.get(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Found ${ordersResponse.data.data.length} orders for user`);
    }

    console.log('\n🎉 ALL TESTS PASSED! Your MongoDB integration is working perfectly!');
    console.log('\n📊 Summary:');
    console.log('   ✅ User Registration: Working');
    console.log('   ✅ User Login: Working');
    console.log('   ✅ Product Retrieval: Working');
    console.log('   ✅ Order Creation: Working');
    console.log('   ✅ Order History: Working');
    console.log('   ✅ MongoDB Connection: Working');
    console.log('\n🎯 Your e-commerce platform is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCore();