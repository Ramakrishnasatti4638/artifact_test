# Input Validation for Main Handler

This repository demonstrates comprehensive input validation for a main handler function with production-ready error handling.

## Features

✅ **Type validation** - Ensures fields are the correct data type  
✅ **Required field validation** - Checks all required fields are present  
✅ **String constraints** - Validates length (min/max) and format patterns  
✅ **Number constraints** - Validates range (min/max) and integer requirements  
✅ **Email validation** - RFC-compliant email format checking  
✅ **Enum validation** - Restricts values to allowed options  
✅ **Custom error class** - ValidationError with field information for better debugging  

## Implementation

### Validation Functions

The handler includes reusable validation utilities:

- **`validateRequired(value, field)`** - Ensures value is not null, undefined, or empty
- **`validateString(value, field, options)`** - Validates strings with optional minLength, maxLength, pattern
- **`validateNumber(value, field, options)`** - Validates numbers with optional min, max, integer constraints
- **`validateEmail(value, field)`** - Validates email format

### Main Handler

```javascript
function mainHandler(input) {
  // Validates input is an object
  // Validates all required fields are present
  // Validates each field type and constraints
  // Validates enum values
  // Returns { status, message, data } on success
  // Throws ValidationError on failure
}
```

**Input Parameters:**
- `name` (string): 2-100 characters, required
- `email` (string): valid email format, required
- `age` (number): integer, 0-150, required
- `action` (string): one of ['create', 'update', 'delete', 'read'], required

**Returns:**
```javascript
{
  status: 'success',
  message: 'Handler processed <action> action for <name>',
  data: { name, email, age, action }
}
```

**Throws:** `ValidationError` with `name`, `message`, and `field` properties on validation failure.

## Test Coverage

27 comprehensive tests covering:

### Valid Inputs
- ✓ Basic valid input processing
- ✓ All valid actions (create, update, delete, read)
- ✓ Edge case ages (0, 150, 1, 99)
- ✓ Various email formats

### Required Field Validation
- ✓ Missing name/email/age/action fields
- ✓ Null/undefined/non-object input

### Type Validation
- ✓ Non-string name/email/action
- ✓ Non-number age
- ✓ Non-integer age

### String Constraints
- ✓ Name < 2 characters (rejected)
- ✓ Name > 100 characters (rejected)
- ✓ Boundary: name with exactly 2 and 100 characters (accepted)

### Email Validation
- ✓ Invalid formats (rejected)
- ✓ Empty string (rejected)

### Number Range Validation
- ✓ Age < 0 (rejected)
- ✓ Age > 150 (rejected)

### Enum Validation
- ✓ Invalid actions (rejected)
- ✓ Empty string action (rejected)

### Error Structure
- ✓ ValidationError has correct properties and format

## Usage

### Installation

```bash
npm install
```

### Running Tests

```bash
npm test
```

For verbose output:
```bash
npm run test:verbose
```

### Example Code

```javascript
const { mainHandler, ValidationError } = require('./handler');

// Valid input
try {
  const result = mainHandler({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    action: 'create'
  });
  console.log(result);
  // Output: { status: 'success', message: '...', data: {...} }
} catch (e) {
  console.error('Validation failed:', e.message);
}

// Invalid input - missing email
try {
  mainHandler({
    name: 'John Doe',
    age: 30,
    action: 'create'
  });
} catch (e) {
  console.error(e.name);      // 'ValidationError'
  console.error(e.field);     // 'email'
  console.error(e.message);   // 'email is required'
}

// Invalid input - bad email format
try {
  mainHandler({
    name: 'John Doe',
    email: 'invalid-email',
    age: 30,
    action: 'create'
  });
} catch (e) {
  console.error(e.message);   // 'email format is invalid'
}

// Invalid input - age out of range
try {
  mainHandler({
    name: 'John Doe',
    email: 'john@example.com',
    age: 200,
    action: 'create'
  });
} catch (e) {
  console.error(e.message);   // 'age must be at most 150'
}
```

## See Also

- `handler.js` - Main handler with validation logic
- `handler.test.js` - 27 comprehensive test cases
- `example.js` - Usage examples

## Architecture

```
Input Object
    ↓
Object Type Check
    ↓
Required Field Check
    ↓
Individual Field Validation
  ├─ Type Check
  ├─ Constraint Check (length, range, format)
  └─ Enum Check (if applicable)
    ↓
Valid? Process & Return Success
    ↕
Invalid? Throw ValidationError with field info
```

## Error Handling

The `ValidationError` class extends the standard Error class with additional context:

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;  // Which field failed validation
  }
}
```

This allows callers to:
- Identify which field caused the error
- Display field-specific error messages in UIs
- Log validation failures with context
- Implement custom error handling per field

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        0.762 s
```

All tests passing! ✅
