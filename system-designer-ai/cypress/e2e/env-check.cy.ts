describe('Environment Variables Check', () => {
  it('should have access to test user credentials', () => {
    // Log the environment variables to verify they're loaded
    cy.log('Test User Email:', Cypress.env('testUserEmail'));
    cy.log('Test User Password:', Cypress.env('testUserPassword'));

    // Verify the values are not undefined
    expect(Cypress.env('testUserEmail')).to.equal('test@example.com');
    expect(Cypress.env('testUserPassword')).to.equal('testPassword123!');
  });
}); 