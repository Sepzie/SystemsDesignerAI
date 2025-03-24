// A simple test to validate test setup
describe('Simple Test', () => {
  it('adds numbers correctly', () => {
    expect(1 + 2).toBe(3);
  });

  it('concatenates strings', () => {
    expect('hello ' + 'world').toBe('hello world');
  });

  it('validates object equality', () => {
    const obj1 = { name: 'Test', value: 123 };
    const obj2 = { name: 'Test', value: 123 };
    expect(obj1).toEqual(obj2);
  });

  it('performs asynchronous operations', async () => {
    const promise = Promise.resolve(42);
    const result = await promise;
    expect(result).toBe(42);
  });
}); 