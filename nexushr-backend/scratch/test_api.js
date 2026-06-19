const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => { reject(err); });
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => { reject(err); });
    req.end();
  });
}

async function testAsUser(username, password) {
  console.log(`\nLogging in as ${username}...`);
  const loginRes = await post('http://localhost:8080/api/auth/login', {
    username,
    password
  });
  console.log('Login Status:', loginRes.statusCode);
  if (loginRes.statusCode !== 200) {
    console.log('Login failed');
    return;
  }
  const token = JSON.parse(loginRes.body).token;
  
  console.log(`--- Checking /api/ai/skillgap/2 as ${username} ---`);
  const skillRes = await get('http://localhost:8080/api/ai/skillgap/2', token);
  console.log('Status:', skillRes.statusCode);
  console.log('Body:', skillRes.body);
}

async function main() {
  try {
    await testAsUser('alice', 'employee123');
    await testAsUser('manager', 'manager123');
  } catch (err) {
    console.error('Error running test:', err);
  }
}

main();
