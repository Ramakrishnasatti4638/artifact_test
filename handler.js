/**
 * Main request handler with input validation
 */

// Validation schemas and helper functions
const ValidationError = class extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
};

const validateString = (value, field, { minLength = 0, maxLength = Infinity, pattern = null } = {}) => {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }
  if (value.length < minLength) {
    throw new ValidationError(`${field} must be at least ${minLength} characters`, field);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} must be at most ${maxLength} characters`, field);
  }
  if (pattern && !pattern.test(value)) {
    throw new ValidationError(`${field} format is invalid`, field);
  }
  return value;
};

const validateNumber = (value, field, { min = -Infinity, max = Infinity, integer = false } = {}) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${field} must be a number`, field);
  }
  if (integer && !Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer`, field);
  }
  if (value < min) {
    throw new ValidationError(`${field} must be at least ${min}`, field);
  }
  if (value > max) {
    throw new ValidationError(`${field} must be at most ${max}`, field);
  }
  return value;
};

const validateEmail = (value, field = 'email') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateString(value, field, { minLength: 1, maxLength: 254, pattern: emailRegex });
};

const validateRequired = (value, field) => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${field} is required`, field);
  }
  return value;
};

/**
 * Main handler function that processes requests
 * @param {Object} input - The input object to validate and process
 * @param {string} input.name - User's full name
 * @param {string} input.email - User's email address
 * @param {number} input.age - User's age
 * @param {string} input.action - The action to perform
 * @returns {Object} Result object with status and data
 */
function mainHandler(input) {
  // Validate input object exists
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Input must be an object', 'input');
  }

  // Validate required fields
  validateRequired(input.name, 'name');
  validateRequired(input.email, 'email');
  validateRequired(input.age, 'age');
  validateRequired(input.action, 'action');

  // Validate individual fields
  const validatedName = validateString(input.name, 'name', { minLength: 2, maxLength: 100 });
  const validatedEmail = validateEmail(input.email);
  const validatedAge = validateNumber(input.age, 'age', { min: 0, max: 150, integer: true });
  const validatedAction = validateString(input.action, 'action', { minLength: 1, maxLength: 50 });

  // Validate action is one of allowed values
  const allowedActions = ['create', 'update', 'delete', 'read'];
  if (!allowedActions.includes(validatedAction)) {
    throw new ValidationError(
      `action must be one of: ${allowedActions.join(', ')}`,
      'action'
    );
  }

  // Process the validated input
  return {
    status: 'success',
    message: `Handler processed ${validatedAction} action for ${validatedName}`,
    data: {
      name: validatedName,
      email: validatedEmail,
      age: validatedAge,
      action: validatedAction,
    },
  };
}

module.exports = { mainHandler, ValidationError };
