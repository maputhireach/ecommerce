const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('🧪 Testing MongoDB connection...');
  
  try {
    // Start in-memory MongoDB server
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log('📊 Connecting to in-memory MongoDB:', uri);
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully');
    
    // Simple test - create a basic schema and document
    const TestSchema = new mongoose.Schema({
      name: String,
      value: Number
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({ name: 'test', value: 42 });
    await testDoc.save();
    console.log('✅ Document created and saved');
    
    const found = await TestModel.findOne({ name: 'test' });
    console.log('✅ Document retrieved:', found.name, found.value);
    
    // Cleanup
    await mongoose.disconnect();
    await mongod.stop();
    
    console.log('🎉 Basic MongoDB test passed!');
    console.log('\n📝 Your MongoDB connection is working correctly.');
    console.log('\n🚀 You can now start your backend server!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMongoDB();