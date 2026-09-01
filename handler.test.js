const { mainHandler, ValidationError } = require('./handler');

describe('mainHandler - Input Validation', () => {
  describe('Valid inputs', () => {
    test('should handle valid input successfully', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        action: 'create',
      };
      const result = mainHandler(input);
      expect(result.status).toBe('success');
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
      expect(result.data.age).toBe(30);
      expect(result.data.action).toBe('create');
    });

    test('should accept all valid actions', () => {
      const actions = ['create', 'update', 'delete', 'read'];
      actions.forEach((action) => {
        const input = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: 25,
          action,
        };
        const result = mainHandler(input);
        expect(result.status).toBe('success');
        expect(result.data.action).toBe(action);
      });
    });

    test('should accept edge case ages', () => {
      const testCases = [
        { age: 0, desc: 'age 0' },
        { age: 150, desc: 'age 150' },
        { age: 1, desc: 'age 1' },
        { age: 99, desc: 'age 99' },
      ];
      testCases.forEach(({ age, desc }) => {
        const input = {
          name: 'Test User',
          email: 'test@example.com',
          age,
          action: 'read',
        };
        const result = mainHandler(input);
        expect(result.status).toBe('success');
        expect(result.data.age).toBe(age);
      });
    });

    test('should accept emails with various formats', () => {
      const emails = [
        'simple@example.com',
        'user+tag@example.co.uk',
        'name.surname@sub.example.com',
        'a@b.c',
      ];
      emails.forEach((email) => {
        const input = {
          name: 'Test User',
          email,
          age: 30,
          action: 'read',
        };
        const result = mainHandler(input);
        expect(result.status).toBe('success');
        expect(result.data.email).toBe(email);
      });
    });
  });

  describe('Missing required fields', () => {
    test('should reject missing name', () => {
      const input = {
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('name');
        expect(e.message).toContain('required');
      }
    });

    test('should reject missing email', () => {
      const input = {
        name: 'John Doe',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('email');
      }
    });

    test('should reject missing age', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('age');
      }
    });

    test('should reject missing action', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 30,
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('action');
      }
    });

    test('should reject null input', () => {
      expect(() => mainHandler(null)).toThrow(ValidationError);
    });

    test('should reject undefined input', () => {
      expect(() => mainHandler(undefined)).toThrow(ValidationError);
    });

    test('should reject non-object input', () => {
      expect(() => mainHandler('invalid')).toThrow(ValidationError);
      expect(() => mainHandler(123)).toThrow(ValidationError);
      expect(() => mainHandler([])).toThrow(ValidationError);
    });
  });

  describe('Invalid field types', () => {
    test('should reject non-string name', () => {
      const input = {
        name: 123,
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('name');
        expect(e.message).toContain('string');
      }
    });

    test('should reject non-string email', () => {
      const input = {
        name: 'John Doe',
        email: 12345,
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('email');
        expect(e.message).toContain('string');
      }
    });

    test('should reject non-number age', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 'thirty',
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('age');
        expect(e.message).toContain('number');
      }
    });

    test('should reject non-integer age', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 30.5,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('age');
        expect(e.message).toContain('integer');
      }
    });

    test('should reject non-string action', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 30,
        action: 123,
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('action');
        expect(e.message).toContain('string');
      }
    });
  });

  describe('String length constraints', () => {
    test('should reject name shorter than 2 characters', () => {
      const input = {
        name: 'A',
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('name');
        expect(e.message).toContain('at least 2');
      }
    });

    test('should reject name longer than 100 characters', () => {
      const input = {
        name: 'A'.repeat(101),
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('name');
        expect(e.message).toContain('at most 100');
      }
    });

    test('should accept name with exactly 2 characters', () => {
      const input = {
        name: 'AB',
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      const result = mainHandler(input);
      expect(result.status).toBe('success');
    });

    test('should accept name with exactly 100 characters', () => {
      const input = {
        name: 'A'.repeat(100),
        email: 'test@example.com',
        age: 30,
        action: 'create',
      };
      const result = mainHandler(input);
      expect(result.status).toBe('success');
    });
  });

  describe('Email validation', () => {
    test('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];
      invalidEmails.forEach((email) => {
        const input = {
          name: 'John Doe',
          email,
          age: 30,
          action: 'create',
        };
        expect(() => mainHandler(input)).toThrow(ValidationError);
        try {
          mainHandler(input);
        } catch (e) {
          expect(e.field).toBe('email');
          expect(e.message).toContain('format');
        }
      });
    });

    test('should reject empty email string', () => {
      const input = {
        name: 'John Doe',
        email: '',
        age: 30,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
    });
  });

  describe('Number range constraints', () => {
    test('should reject age below 0', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: -1,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('age');
        expect(e.message).toContain('at least 0');
      }
    });

    test('should reject age above 150', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 151,
        action: 'create',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('age');
        expect(e.message).toContain('at most 150');
      }
    });
  });

  describe('Action enum validation', () => {
    test('should reject invalid action values', () => {
      const invalidActions = ['invalid', 'CREATE', 'Update', 'destroy', 'write'];
      invalidActions.forEach((action) => {
        const input = {
          name: 'John Doe',
          email: 'test@example.com',
          age: 30,
          action,
        };
        expect(() => mainHandler(input)).toThrow(ValidationError);
        try {
          mainHandler(input);
        } catch (e) {
          expect(e.field).toBe('action');
          expect(e.message).toContain('one of');
        }
      });
    });

    test('should reject empty string action', () => {
      const input = {
        name: 'John Doe',
        email: 'test@example.com',
        age: 30,
        action: '',
      };
      expect(() => mainHandler(input)).toThrow(ValidationError);
      try {
        mainHandler(input);
      } catch (e) {
        expect(e.field).toBe('action');
        expect(e.message).toContain('required');
      }
    });
  });

  describe('Error properties', () => {
    test('ValidationError should have correct structure', () => {
      const input = {
        name: 'John',
        email: 'invalid-email',
        age: 30,
        action: 'create',
      };
      try {
        mainHandler(input);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect(e.name).toBe('ValidationError');
        expect(e.field).toBe('email');
        expect(e.message).toBeTruthy();
      }
    });
  });
});
