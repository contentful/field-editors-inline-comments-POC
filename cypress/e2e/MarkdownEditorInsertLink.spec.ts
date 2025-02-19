import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / Insert Link Dialog', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getDialogTitle() {
      return getIframe().findByTestId('dialog-title').find('h2');
    },
    getInsertDialogButton() {
      return getIframe().findByTestId('markdown-action-button-link');
    },
    getModalContent() {
      return getIframe().findByTestId('insert-link-modal');
    },
    inputs: {
      getLinkTextInput() {
        return getIframe().findByTestId('link-text-field');
      },
      getTargetUrlInput() {
        return getIframe().findByTestId('target-url-field');
      },
      getLinkTitle() {
        return getIframe().findByTestId('link-title-field');
      },
    },
    getConfirmButton() {
      return getIframe().findByTestId('insert-link-confirm');
    },
    getCancelButton() {
      return getIframe().findByTestId('insert-link-cancel');
    },
    getInvalidMessage() {
      return getIframe().findByText('Invalid URL');
    },
  };

  const type = (value) => {
    return selectors.getInput().focus().type(value, { force: true });
  };

  const clearAll = () => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.clear();
    });
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  const selectBackwards = (skip, len) => {
    cy.getMarkdownInstance().then((markdown) => {
      markdown.selectBackwards(skip, len);
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.viewport('macbook-16');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
  });

  it('should have correct title', () => {
    selectors.getInsertDialogButton().click();
    selectors.getDialogTitle().should('have.text', 'Insert link');
  });

  it('should insert nothing if click on cancel button or close window with ESC', () => {
    checkValue('');

    // close with button
    selectors.getInsertDialogButton().click();
    selectors.getCancelButton().click();
    selectors.getModalContent().should('not.exist');
    checkValue('');

    // close with esc
    selectors.getInsertDialogButton().click();
    selectors.inputs.getTargetUrlInput().type('{esc}');
    selectors.getModalContent().should('not.exist');
    checkValue('');
  });

  it('should show validation error when url is incorrect', () => {
    checkValue('');

    selectors.getInsertDialogButton().click();

    // type correct value

    const correctValues = ['https://contentful.com', 'http://google.com', 'ftp://somefile'];

    correctValues.forEach((value) => {
      selectors.inputs.getTargetUrlInput().clear().type(value);
      selectors.getInvalidMessage().should('not.exist');
      selectors.getConfirmButton().should('not.be.disabled');
    });

    // clear and type incorrect value

    const incorrectValues = [
      'does not look like an url, bro',
      'htp://contentful.com',
      'http:/oops.com',
    ];

    incorrectValues.forEach((value) => {
      selectors.inputs.getTargetUrlInput().clear().type(value);
      selectors.getInvalidMessage().should('be.visible');
      selectors.getConfirmButton().should('be.disabled');
    });
  });

  describe('when there is no text selected', () => {
    it('should have correct default state', () => {
      checkValue('');

      selectors.getInsertDialogButton().click();

      selectors.inputs
        .getLinkTextInput()
        .should('be.visible')
        .should('have.value', '')
        .should('not.be.disabled');
      selectors.inputs.getTargetUrlInput().should('be.visible').should('have.value', '');

      selectors.inputs.getLinkTitle().should('be.visible').should('have.value', '');

      selectors.getConfirmButton().should('be.disabled');
      selectors.getInvalidMessage().should('not.exist');
    });

    it('should paste link in a correct format', () => {
      checkValue('');

      // with all fields provided
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('Contentful');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com "Contentful")');

      // without title field
      clearAll();
      checkValue('');
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().type('best headless CMS ever');
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('[best headless CMS ever](https://contentful.com)');

      // only with url
      clearAll();
      checkValue('');
      selectors.getInsertDialogButton().click();
      selectors.inputs.getLinkTextInput().clear();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('<https://contentful.com>');
    });
  });

  describe('when there is text selected', () => {
    it('should have correct default state', () => {
      type('check out Contentful');
      selectBackwards(0, 10);
      selectors.getInsertDialogButton().click();

      selectors.inputs
        .getLinkTextInput()
        .should('be.visible')
        .should('have.value', 'Contentful')
        .should('be.disabled');
      selectors.inputs
        .getTargetUrlInput()
        .should('be.visible')
        .should('have.value', '')
        .should('have.focus');
      selectors.inputs.getLinkTitle().should('be.visible').should('have.value', '');

      selectors.getConfirmButton().should('be.disabled');
      selectors.getInvalidMessage().should('not.exist');
    });

    it('should paste link in a correct format', () => {
      type('check out Contentful');
      selectBackwards(0, 10);

      // with all fields provided

      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.inputs.getLinkTitle().clear().type('The best headless CMS ever');

      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com "The best headless CMS ever")');

      // without title field

      clearAll();
      type('check out Contentful');
      selectBackwards(0, 10);
      selectors.getInsertDialogButton().click();
      selectors.inputs.getTargetUrlInput().clear().type('https://contentful.com');
      selectors.getConfirmButton().click();
      selectors.getModalContent().should('not.exist');
      checkValue('check out [Contentful](https://contentful.com)');
    });
  });
});
