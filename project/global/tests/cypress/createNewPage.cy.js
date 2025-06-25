describe('WordPress Admin Page Creation', () => {
    before(() => {
        // Login via UI and set cookies
        cy.visit('/wp/wp-admin/');
        cy.get('#user_login').type(Cypress.env('WP_USERNAME'));
        cy.get('#user_pass').type(Cypress.env('WP_PASSWORD'));
        cy.get('#wp-submit').click();
    });

    it('Creates a new page', () => {
        cy.visit('/wp/wp-admin/post-new.php?post_type=page');
        cy.get('.editor-post-title__input').type('My New Page');
        cy.get('.editor-post-publish-button__button').click();
        cy.wait(2000);

        cy.get(
            '.interface-interface-skeleton__actions .editor-post-publish-button__button'
        ).click();
        cy.wait(1000);

        // Verify page is published
        cy.get('.components-snackbar__content').should('contain', 'Page published.');
    });
});
