describe('WordPress Admin Page Creation', () => {
    before(() => {
        // Login via UI and set cookies
        cy.visit('/wp/wp-login.php');
        cy.get('#user_login').type(Cypress.env('WP_USERNAME'));
        cy.get('#user_pass').type(Cypress.env('WP_PASSWORD'));
        cy.get('#wp-submit').click();
        cy.url().should('include', '/wp/wp-admin/');
    });

    it('Creates a new page', () => {
        cy.visit('/wp/wp-admin/post-new.php?post_type=page');
        cy.get('#title').type('My New Page');
        // Optionally add content
        cy.get('#content').type('This is the page content.');
        cy.get('#publish').click();
        // Verify page is published
        cy.get('.notice-success').should('contain', 'Page published.');
    });
});
