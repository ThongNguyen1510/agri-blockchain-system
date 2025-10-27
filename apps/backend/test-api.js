// Test script để kiểm tra API backend
const API_URL = "http://localhost:3000";

async function testAPI() {
  console.log("🔍 Testing AgroChain API...");
  
  // Test 1: Health check
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return;
  }

  // Test 2: Login test
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "testseller1@gmail.com",
        password: "password123"
      })
    });

    console.log("🔐 Login response status:", loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log("✅ Login successful:", {
        hasToken: !!loginData.accessToken,
        userEmail: loginData.user?.email,
        userRole: loginData.user?.role
      });
      
      // Test 3: Test protected endpoint
      const token = loginData.accessToken;
      const batchesResponse = await fetch(`${API_URL}/batches`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      console.log("📦 Batches endpoint status:", batchesResponse.status);
      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json();
        console.log("✅ Batches endpoint works:", batchesData.length, "batches found");
      } else {
        const errorText = await batchesResponse.text();
        console.log("❌ Batches endpoint failed:", errorText);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log("❌ Login failed:", errorText);
    }
    
  } catch (error) {
    console.error("❌ Login test failed:", error.message);
  }
}

testAPI();
