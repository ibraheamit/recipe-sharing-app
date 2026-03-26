const fs = require('fs');
const https = require('https');

// Read the db.json file
const rawData = fs.readFileSync('mock-api/db.json');
const data = JSON.parse(rawData);

// Convert arrays to objects for Firebase
const firebaseData = {
  users: {},
  recipes: {},
  favorites: {}
};

if (data.users) {
  data.users.forEach(u => {
    firebaseData.users[u.id] = u;
  });
}

if (data.recipes) {
  data.recipes.forEach(r => {
    firebaseData.recipes[r.id] = r;
  });
}

if (data.favorites) {
  data.favorites.forEach(f => {
    firebaseData.favorites[f.id] = f;
  });
}

const payload = JSON.stringify(firebaseData);

const options = {
  hostname: 'recipeshare-88cf0-default-rtdb.firebaseio.com',
  path: '/.json',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(payload);
req.end();
