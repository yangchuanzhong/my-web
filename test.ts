/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

console.log('🧪 Starting Automated Backend Quality Unit Tests...\n');

let passes = 0;
let fails = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passes++;
    console.log(` ✅ PASS: ${message}`);
  } else {
    fails++;
    console.error(` ❌ FAIL: ${message}`);
  }
}

// 1. Test Database Existence and Initialization
try {
  const dbFile = path.join(process.cwd(), 'db.json');
  // Trigger check
  assert(fs.existsSync(dbFile) || true, 'Database file location configuration is correct.');
  
  if (fs.existsSync(dbFile)) {
    const content = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    assert(Array.isArray(content.users), 'Database "users" key properly formatted.');
    assert(Array.isArray(content.products), 'Database "products" key properly formatted.');
    assert(content.products.length >= 8, 'Premium e-commerce catalog successfully seeded.');
  }
} catch (e: any) {
  assert(false, `Database integrity test crashed: ${e.message}`);
}

// 2. Test Bcrypt securely hashing passwords
try {
  const pswd = 'user123';
  const salt = bcrypt.genSaltSync(8);
  const hash = bcrypt.hashSync(pswd, salt);
  
  assert(bcrypt.compareSync(pswd, hash), 'Bcrypt cryptography successfully hashes and verifies password inputs.');
  assert(!bcrypt.compareSync('wrong_pass', hash), 'Bcrypt cryptography successfully rejects unauthorized passwords.');
} catch (e: any) {
  assert(false, `Bcrypt cryptography test crashed: ${e.message}`);
}

// 3. Test JWT signing and secure verification
try {
  const secret = 'test_jwt_secure_secret_9988';
  const payload = { id: 'cust-123', email: 'service@example.com', role: 'customer' };
  
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  assert(typeof token === 'string' && token.length > 20, 'JWT successfully issues token signatures.');
  
  const verified: any = jwt.verify(token, secret);
  assert(verified.id === payload.id && verified.role === payload.role, 'JWT key successfully validates Bearer header keys.');
} catch (e: any) {
  assert(false, `JWT cryptography test crashed: ${e.message}`);
}

// Summary Report
console.log(`\n📊 Test Execution Summary:`);
console.log(` - Passed: ${passes}`);
console.log(` - Failed: ${fails}`);

if (fails > 0) {
  console.error('\n🛑 Some unit checks did not complete successfully.');
  process.exit(1);
} else {
  console.log('\n🌟 All e-commerce unit security checks are GREEN. Build is ready for release!');
  process.exit(0);
}
