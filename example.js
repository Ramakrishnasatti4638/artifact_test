/**
 * Example usage of the mainHandler with input validation
 */

const { mainHandler, ValidationError } = require('./handler');

console.log('='.repeat(70));
console.log('Input Validation Examples for Main Handler');
console.log('='.repeat(70));

// Example 1: Valid input - should succeed
console.log('\n✅ Example 1: Valid Input');
console.log('-'.repeat(70));
try {
  const result = mainHandler({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    action: 'create',
  });
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('❌ Error:', e.message);
}

// Example 2: Missing required field (email)
console.log('\n❌ Example 2: Missing Required Field (email)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Jane Smith',
    age: 25,
    action: 'update',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 3: Invalid field type (age as string)
console.log('\n❌ Example 3: Invalid Field Type (age)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Bob Johnson',
    email: 'bob@example.com',
    age: 'thirty',
    action: 'read',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 4: Invalid email format
console.log('\n❌ Example 4: Invalid Email Format');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Alice Brown',
    email: 'not-an-email',
    age: 28,
    action: 'delete',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 5: Age out of range (too high)
console.log('\n❌ Example 5: Age Out of Range (too high)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    age: 200,
    action: 'create',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 6: Age out of range (negative)
console.log('\n❌ Example 6: Age Out of Range (negative)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Diana Evans',
    email: 'diana@example.com',
    age: -5,
    action: 'update',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 7: Non-integer age
console.log('\n❌ Example 7: Non-Integer Age');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Emma Fox',
    email: 'emma@example.com',
    age: 27.5,
    action: 'create',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 8: Invalid action value
console.log('\n❌ Example 8: Invalid Action Value');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'Frank Garcia',
    email: 'frank@example.com',
    age: 35,
    action: 'execute',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 9: Name too short
console.log('\n❌ Example 9: Name Too Short (< 2 characters)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'A',
    email: 'user@example.com',
    age: 40,
    action: 'read',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 10: Name too long
console.log('\n❌ Example 10: Name Too Long (> 100 characters)');
console.log('-'.repeat(70));
try {
  mainHandler({
    name: 'A'.repeat(101),
    email: 'user@example.com',
    age: 45,
    action: 'create',
  });
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 11: Non-object input
console.log('\n❌ Example 11: Non-Object Input (string instead of object)');
console.log('-'.repeat(70));
try {
  mainHandler('invalid input');
} catch (e) {
  console.error(`Error Field: ${e.field}`);
  console.error(`Error Message: ${e.message}`);
}

// Example 12: All valid actions
console.log('\n✅ Example 12: All Valid Actions');
console.log('-'.repeat(70));
const validActions = ['create', 'update', 'delete', 'read'];
validActions.forEach((action) => {
  try {
    const result = mainHandler({
      name: 'Test User',
      email: 'test@example.com',
      age: 30,
      action,
    });
    console.log(`  ✓ Action "${action}" is valid`);
  } catch (e) {
    console.error(`  ✗ Action "${action}" failed: ${e.message}`);
  }
});

// Example 13: Valid edge case - age 0
console.log('\n✅ Example 13: Edge Case - Age 0');
console.log('-'.repeat(70));
try {
  const result = mainHandler({
    name: 'Newborn',
    email: 'newborn@example.com',
    age: 0,
    action: 'create',
  });
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('❌ Error:', e.message);
}

// Example 14: Valid edge case - age 150
console.log('\n✅ Example 14: Edge Case - Age 150');
console.log('-'.repeat(70));
try {
  const result = mainHandler({
    name: 'Very Old Person',
    email: 'veryold@example.com',
    age: 150,
    action: 'read',
  });
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('❌ Error:', e.message);
}

// Example 15: Complex email formats (valid)
console.log('\n✅ Example 15: Various Valid Email Formats');
console.log('-'.repeat(70));
const validEmails = [
  'simple@example.com',
  'user+tag@example.co.uk',
  'name.surname@sub.example.com',
  'a@b.c',
];
validEmails.forEach((email) => {
  try {
    mainHandler({
      name: 'Test User',
      email,
      age: 25,
      action: 'create',
    });
    console.log(`  ✓ Email "${email}" is valid`);
  } catch (e) {
    console.error(`  ✗ Email "${email}" failed: ${e.message}`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('Examples Complete');
console.log('='.repeat(70));
