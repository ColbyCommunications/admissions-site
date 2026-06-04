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
        cy.get('iframe[name="editor-canvas"]') // 1. Target by attribute name, NOT id #
        .its('0.contentDocument.body') // 2. Access the iframe body
        .should('not.be.empty') // 3. Ensure the blob-loaded body isn't empty
        .then(cy.wrap) // 4. Wrap body element 
        .find('.editor-post-title__input', { timeout: 15000 }) // 5. Add safety timeout for Gutenberg
        .should('be.visible')
        .type('My New Page');
        
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
