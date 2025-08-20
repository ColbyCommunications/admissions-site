describe("Header Menu", () => {
	it("Should Expand", () => {
		cy.visit("/");
		cy.get("#menu-toggle-main").click();
		cy.get("#mainNav").should("have.attr", "style", "display: block;");
	});
});
