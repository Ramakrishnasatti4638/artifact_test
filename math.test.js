const { add, subtract, multiply } = require('./math');

describe('add', () => {
  test('adds two positive numbers', () => expect(add(2, 3)).toBe(5));
  test('adds a positive and a negative number', () => expect(add(10, -4)).toBe(6));
  test('adds two negative numbers', () => expect(add(-3, -7)).toBe(-10));
  test('adds with zero', () => expect(add(5, 0)).toBe(5));
});

describe('subtract', () => {
  test('subtracts two positive numbers', () => expect(subtract(10, 4)).toBe(6));
  test('subtracts resulting in a negative', () => expect(subtract(3, 9)).toBe(-6));
  test('subtracts two negative numbers', () => expect(subtract(-5, -3)).toBe(-2));
  test('subtracts zero', () => expect(subtract(7, 0)).toBe(7));
});

describe('multiply', () => {
  test('multiplies two positive numbers', () => expect(multiply(3, 4)).toBe(12));
  test('multiplies by a negative number', () => expect(multiply(5, -2)).toBe(-10));
  test('multiplies two negative numbers', () => expect(multiply(-3, -6)).toBe(18));
  test('multiplies by zero', () => expect(multiply(9, 0)).toBe(0));
});
