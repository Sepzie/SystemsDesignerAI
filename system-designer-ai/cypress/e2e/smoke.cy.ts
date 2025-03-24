describe('Smoke Test', () => {
  it('should load the application', () => {
    cy.visit('/');
    cy.get('h1').should('be.visible');
  });

  it('should handle basic navigation', () => {
    cy.visit('/');
    cy.get('a').contains('Login').click();
    cy.url().should('include', '/login');
  });
}); 