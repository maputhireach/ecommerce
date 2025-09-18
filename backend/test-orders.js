const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testCreateOrder() {
  try {
    // First register a test user
    console.log('🔄 Registering test user...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
    });

    let token;
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      token = registerData.data.token;
      console.log('✅ Test user registered successfully');
    } else {
      // User might already exist, try to login
      console.log('🔄 User exists, trying to login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'password123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.data.token;
        console.log('✅ Test user logged in successfully');
      } else {
        throw new Error('Failed to authenticate test user');
      }
    }

    // Get products first
    console.log('🔄 Fetching products...');
    const productsResponse = await fetch(`${API_BASE}/products`);
    const productsData = await productsResponse.json();
    const products = productsData.data;
    console.log(`✅ Found ${products.length} products`);

    // Create a test order
    console.log('🔄 Creating test order...');
    const orderData = {
      items: [
        {
          productId: products[0]._id,
          quantity: 2
        },
        {
          productId: products[1]._id,
          quantity: 1
        }
      ],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      }
    };

    const orderResponse = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (orderResponse.ok) {
      const orderResult = await orderResponse.json();
      console.log('✅ Test order created successfully');
      console.log(`Order ID: ${orderResult.data.id}`);
      console.log(`Total: $${orderResult.data.totalAmount}`);
    } else {
      const errorData = await orderResponse.json();
      console.error('❌ Failed to create order:', errorData);
    }

    // Fetch orders to verify
    console.log('🔄 Fetching user orders...');
    const ordersResponse = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      console.log(`✅ User has ${ordersData.data.length} orders`);
      ordersData.data.forEach((order, index) => {
        console.log(`Order ${index + 1}: #${order.id.slice(-8)} - ${order.status} - $${order.totalAmount}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCreateOrder();