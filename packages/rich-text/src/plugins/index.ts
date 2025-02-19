import { FieldExtensionSDK } from '@contentful/app-sdk';
import {
  createDeserializeAstPlugin,
  createDeserializeHtmlPlugin,
  PlateProps,
} from '@udecode/plate-core';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';

import { PlatePlugin } from '../internal/types';
import { createSoftBreakPlugin, createExitBreakPlugin, createResetNodePlugin } from './Break';
import { createCommandPalettePlugin } from './CommandPalette';
import { isCommandPromptPluginEnabled } from './CommandPalette/useCommands';
import { createDragAndDropPlugin } from './DragAndDrop';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
} from './EmbeddedEntityBlock';
import { createEmbeddedEntityInlinePlugin } from './EmbeddedEntityInline';
import { createEmbeddedResourceBlockPlugin } from './EmbeddedResourceBlock';
import { createHeadingPlugin } from './Heading';
import { createHrPlugin } from './Hr';
import { createHyperlinkPlugin } from './Hyperlink';
import { createListPlugin } from './List';
import { createMarksPlugin } from './Marks';
import { createNormalizerPlugin } from './Normalizer';
import { createParagraphPlugin } from './Paragraph';
import { createPasteHTMLPlugin } from './PasteHTML';
import { createQuotePlugin } from './Quote';
import { createSelectOnBackspacePlugin } from './SelectOnBackspace';
import { createTablePlugin } from './Table';
import { createTextPlugin } from './Text';
import { createTrackingPlugin, RichTextTrackingActionHandler } from './Tracking';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createVoidsPlugin } from './Voids';

export const getPlugins = (
  sdk: FieldExtensionSDK,
  onAction: RichTextTrackingActionHandler,
  restrictedMarks?: string[]
): PlatePlugin[] => [
  // AST must come after the HTML deserializer
  createDeserializeHtmlPlugin(),
  createDeserializeAstPlugin(),
  createDeserializeDocxPlugin(),

  // Tracking - This should come first so all plugins below will have access to `editor.tracking`
  createTrackingPlugin(onAction),

  // Global / Global shortcuts
  createDragAndDropPlugin(),
  // Enable command palette plugin only, if at least action type is allowed
  ...(Object.values(isCommandPromptPluginEnabled(sdk)).some(Boolean)
    ? [createCommandPalettePlugin()]
    : []),

  // Block Elements
  createParagraphPlugin(),
  createListPlugin(),
  createHrPlugin(),
  createHeadingPlugin(),
  createQuotePlugin(),
  createTablePlugin(),
  createEmbeddedEntryBlockPlugin(sdk),
  createEmbeddedAssetBlockPlugin(sdk),
  createEmbeddedResourceBlockPlugin(sdk),

  // Inline elements
  createHyperlinkPlugin(sdk),
  createEmbeddedEntityInlinePlugin(sdk),

  // Marks
  createMarksPlugin(),

  // Other
  createTrailingParagraphPlugin(),
  createTextPlugin(restrictedMarks),
  createVoidsPlugin(),
  createSelectOnBackspacePlugin(),

  // Pasting content from other sources
  createPasteHTMLPlugin(),

  // These plugins drive their configurations from the list of plugins
  // above. They MUST come last.
  createSoftBreakPlugin(),
  createExitBreakPlugin(),
  createResetNodePlugin(),
  createNormalizerPlugin(),
];

export const disableCorePlugins: PlateProps['disableCorePlugins'] = {
  // Temporarily until the upstream issue is fixed.
  // See: https://github.com/udecode/plate/issues/1329#issuecomment-1005935946
  deserializeAst: true,
  deserializeHtml: true,

  // Note: Enabled by default since v9.0.0 but it causes Cypress's
  // .click() command to fail
  eventEditor: true,
};
