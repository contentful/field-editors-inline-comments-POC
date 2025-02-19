import { getIframe } from '../fixtures/utils';

describe('Markdown Editor / History', () => {
  const selectors = {
    getInput: () => {
      return getIframe().findByTestId('markdown-textarea').find('[contenteditable]');
    },
    getToggleAdditionalActionsButton: () => {
      return getIframe().findByTestId('markdown-action-button-toggle-additional');
    },
    getRedoButton() {
      return getIframe().findByTestId('markdown-action-button-redo');
    },
    getUndoButton() {
      return getIframe().findByTestId('markdown-action-button-undo');
    },
  };

  const type = (value) => {
    return selectors.getInput().focus().type(value, { force: true });
  };

  const checkValue = (value) => {
    cy.getMarkdownInstance().then((markdown) => {
      expect(markdown.getContent()).eq(value);
    });
  };

  beforeEach(() => {
    cy.visit('/?path=/story/editors-markdown--default');
    cy.wait(500);
    getIframe().findByTestId('markdown-editor').should('be.visible');
    selectors.getToggleAdditionalActionsButton().click();
  });

  it('should redo and undo properly', () => {
    checkValue('');
    type('Hello!{enter}');
    cy.wait(1500);
    type('This is new sentence!');

    checkValue('Hello!\nThis is new sentence!');

    selectors.getUndoButton().click();
    checkValue('Hello!\n');
    selectors.getUndoButton().click();
    checkValue('');

    selectors.getRedoButton().click();
    checkValue('Hello!\n');
    selectors.getRedoButton().click();
    checkValue('Hello!\nThis is new sentence!');
  });
});
