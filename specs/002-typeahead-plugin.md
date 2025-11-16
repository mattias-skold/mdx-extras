# Typeahead Plugin Implementation PRP

## Purpose

Enable MDXEditor to support multiple simultaneous typeahead autocomplete features (mentions, hashtags, issues, etc.), each with customizable trigger characters, data sources, and rendering, all using a single shared Lexical node type.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal

Build a flexible, generic typeahead plugin for MDXEditor that allows users to register multiple typeahead configurations (e.g., @mentions, #hashtags, :emoji) in a single editor instance. Each configuration should specify its own:

- Trigger character(s)
- Text directive name (for MDAST serialization)
- Data source resolver function
- Autocomplete menu item renderer

**Important**: All typeahead types share a single `TypeaheadNode` Lexical node type, differentiated by their `directiveName` for MDAST serialization and `type` identifier for internal tracking.

The plugin should replace the hard-coded mentions implementation in `packages/typeahead-plugin/src/basis`.

## Why

- **Flexibility**: Users need different typeahead behaviors (users, issues, emojis, custom data)
- **Reusability**: One plugin handles all typeahead patterns instead of creating separate plugins
- **MDXEditor Integration**: Properly serializes to/from MDAST text directives
- **Extensibility**: Easy to add new typeahead types without modifying core plugin code

## What

A plugin factory function that accepts an array of typeahead configurations and returns an MDXEditor `realmPlugin`. The plugin:

1. Registers a **single shared `TypeaheadNode`** Lexical node type
2. Registers **single import/export visitors** that handle all configurations by looking up the type identifier
3. Manages multiple `LexicalTypeaheadMenuPlugin` instances (one per configuration)
4. Each configuration uses a unique `type` identifier that serves as both the internal type and MDAST directive name

**Key Design Decision**: `config.type` equals `config.directiveName` (same value). This simplifies the architecture:

- Single identifier per typeahead configuration
- Direct mapping between MDAST directives and internal types
- Each config must have a unique type identifier

### Success Criteria

- [ ] Plugin supports multiple typeahead types in same editor instance
- [ ] Each type has its own trigger character (e.g., @, #, :)
- [ ] Each type serializes to/from MDAST using custom text directive names
- [ ] Data source callbacks are async-capable (return Promises)
- [ ] Menu rendering is customizable per typeahead type
- [ ] No console errors or warnings
- [ ] All TypeScript type checks pass
- [ ] All ESLint checks pass
- [ ] Example story in Ladle works with 2+ typeahead types
- [ ] Reference implementation in `basis/` folder can be deleted

## Clarifications

### Session 2025-11-16

- Q: How should the single import visitor handle nodes that have the same directiveName but need to create different TypeaheadNode instances? → A: directiveName must be unique per config
- Q: How should config.type relate to config.directiveName? → A: type equals directiveName (same value)
- Q: Should the TypeaheadNode store the config.type or config.directiveName internally? → A: Store config.type in \_\_typeaheadType
- Q: What should happen if markdown contains a text directive that doesn't match any registered config? → A: Ignore it (let generic directive handler process)

## All Needed Context

### Documentation & References

```yaml
- url: https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/LexicalTypeaheadMenuPlugin.tsx
  why: Core Lexical plugin - understand props and trigger function API
  critical: Multiple plugin instances can coexist; triggerFn must return null when not matching

- file: packages/typeahead-plugin/src/basis/mentions/mdxEditorMentionsPlugin.ts
  why: Reference pattern for realmPlugin, MDAST visitors, node registration
  critical: Use pubIn to register nodes/visitors/components; bump visitor priority to 100

- file: packages/typeahead-plugin/src/basis/mentions/MentionNode.ts
  why: Pattern for custom TextNode with special behavior
  critical: Constructor must accept optional NodeKey; use $applyNodeReplacement; setMode('segmented').toggleDirectionless()

- file: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/index.tsx
  why: Pattern for using LexicalTypeaheadMenuPlugin with MenuOption, trigger regex, search callbacks
  critical: Use useBasicTypeaheadTriggerMatch to exclude conflicting triggers; useCellValue for gurx state

- file: packages/source-preview-plugin/src/index.tsx
  why: Example of realmPlugin pattern with params and gurx state
  critical: Use realmPlugin<ParamsType> generic to define config interface

- doc: https://mdxeditor.dev/editor/docs/extending-the-editor
  why: MDXEditor plugin authoring guide
  critical: Use addLexicalNode$, addImportVisitor$, addExportVisitor$, addComposerChild$

- doc: https://github.com/mdx-editor/gurx
  why: Gurx reactive state management library
  critical: Cell for stateful values, Signal for stateless triggers, use useCellValue in components
```

### Current Codebase Tree

```
packages/typeahead-plugin/
├── src/
│   ├── basis/                  # Reference implementation (will be deleted)
│   │   └── mentions/
│   │       ├── MentionNode.ts
│   │       ├── mdxEditorMentionsPlugin.ts
│   │       └── MentionsPlugin/
│   │           ├── index.tsx
│   │           └── style.css
│   ├── examples/
│   │   └── hello.stories.tsx
│   └── index.tsx              # Current stub - main implementation goes here
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.mjs
```

### Desired Codebase Tree

```
packages/typeahead-plugin/
├── src/
│   ├── TypeaheadNode.ts       # Generic custom TextNode for typeahead entities
│   ├── TypeaheadPlugin.tsx    # Component managing multiple LexicalTypeaheadMenuPlugin instances
│   ├── index.tsx              # Plugin factory function + type exports
│   ├── types.ts               # TypeScript interfaces for plugin config
│   ├── styles.css             # Basic typeahead menu styles
│   └── examples/
│       ├── mentions.stories.tsx    # Example: @mentions
│       └── multi.stories.tsx       # Example: @mentions + #hashtags
├── (basis/ deleted)
└── ...
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Lexical custom nodes must accept optional NodeKey in constructor
// See: packages/typeahead-plugin/src/basis/mentions/MentionNode.ts:65
constructor(data: string, key?: NodeKey) {
  super(data, key);
}

// CRITICAL: Multiple LexicalTypeaheadMenuPlugin instances work but triggerFn must check exclusivity
// See: https://github.com/facebook/lexical/discussions/3714
// Use useBasicTypeaheadTriggerMatch to handle conflicts
const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', { minLength: 0 });
const checkForMyTrigger = (text: string) => {
  const slashMatch = checkForSlashTriggerMatch(text, editor);
  if (slashMatch !== null) return null; // Don't trigger if another plugin matches
  return getMyMatch(text);
};

// CRITICAL: MDAST text directive format
// See: packages/typeahead-plugin/src/basis/mentions/mdxEditorMentionsPlugin.ts:8-19
{
  type: 'textDirective',
  name: 'mention', // This is the directive name per typeahead type
  children: [{ type: 'text', value: 'username' }]
}

// CRITICAL: Visitor priority must be higher than generic directive visitor
// See: packages/typeahead-plugin/src/basis/mentions/mdxEditorMentionsPlugin.ts:18
priority: 100

// CRITICAL: TextNode must use segmented mode for proper editing behavior
// See: packages/typeahead-plugin/src/basis/mentions/MentionNode.ts:128
mentionNode.setMode('segmented').toggleDirectionless();

// GOTCHA: MenuOption key property used for React list keys
// See: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/index.tsx:137
// Each option needs a unique key property

// GOTCHA: Portal rendering requires anchorElementRef.current check
// See: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/index.tsx:243
anchorElementRef.current && results.length ? ReactDOM.createPortal(...) : null

// CRITICAL: gurx Cell values accessed via useCellValue hook in components
// See: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/index.tsx:93
const searchCallback = useCellValue(userSearchCallback$)
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/types.ts

import type { JSX } from "react";
import type { LexicalNode, NodeKey, TextNode } from "lexical";
import type {
  MenuOption,
  MenuTextMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type {
  MdastImportVisitor,
  LexicalExportVisitor,
} from "@mdxeditor/editor";

/**
 * Configuration for a single typeahead type (e.g., mentions, hashtags)
 */
export interface TypeaheadConfig<TOption extends MenuOption = MenuOption> {
  /**
   * Unique identifier for this typeahead type.
   * Used as both:
   * - Internal type identifier (stored in TypeaheadNode.__typeaheadType)
   * - MDAST text directive name (e.g., :mention[...], :hashtag[...])
   *
   * MUST be unique across all configs in the plugin.
   *
   * Examples: 'mention', 'hashtag', 'emoji', 'issue'
   */
  type: string;

  /**
   * Trigger character(s) - e.g., '@', '#', ':'
   */
  trigger: string;

  /**
   * Async function to resolve search results
   * @param query - User's search string
   * @returns Promise resolving to array of matching items
   */
  searchCallback: (query: string) => Promise<string[]>;

  /**
   * Render function for menu items
   * @param item - The data item to render
   * @returns React element to display in menu
   */
  renderMenuItem: (item: string) => JSX.Element;

  /**
   * Optional: Custom CSS class for this typeahead type
   */
  className?: string;

  /**
   * Optional: Max results to show
   * @default 5
   */
  maxResults?: number;
}

/**
 * Plugin parameters
 */
export interface TypeaheadPluginParams {
  /**
   * Array of typeahead configurations.
   * Each config.type must be unique.
   */
  configs: TypeaheadConfig[];
}
```

### List of Tasks

```yaml
Task 1: Create TypeScript types and interfaces
  CREATE src/types.ts:
    - Define TypeaheadConfig interface
    - Define TypeaheadPluginParams interface
    - Export all types
  PATTERN: packages/source-preview-plugin/src/SourceWithPreviewWrapper.tsx (type exports)

Task 2: Create generic TypeaheadNode
  CREATE src/TypeaheadNode.ts:
    - Extend Lexical TextNode
    - Store typeahead type identifier and content
    - Implement static methods: getType, clone, importJSON
    - Implement createDOM, exportDOM, exportJSON
    - Add helper: $createTypeaheadNode, $isTypeaheadNode
  PATTERN: packages/typeahead-plugin/src/basis/mentions/MentionNode.ts
  CRITICAL: Use segmented mode, handle NodeKey properly

Task 3: Create TypeaheadPlugin React component
  CREATE src/TypeaheadPlugin.tsx:
    - Accept array of TypeaheadConfig
    - For each config, create gurx Cell for search callback
    - Render multiple LexicalTypeaheadMenuPlugin instances
    - Each instance has unique triggerFn checking its trigger character
    - Handle query changes, option selection, menu rendering
  PATTERN: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/index.tsx
  CRITICAL: Ensure triggerFn functions don't conflict

Task 4: Create MDAST visitors (single instances for all configs)
  MODIFY src/index.tsx:
    - Create createMdastImportVisitor function that accepts all configs array
    - Create createLexicalExportVisitor function that accepts all configs array
    - Import visitor: testNode checks if directive name matches ANY config.type
    - Import visitor: visitNode looks up config by type (= directive name)
    - Export visitor: testNode checks if node is TypeaheadNode with registered type
    - Export visitor: visitNode looks up config by node's __typeaheadType
  PATTERN: packages/typeahead-plugin/src/basis/mentions/mdxEditorMentionsPlugin.ts:8-34
  CRITICAL: Set priority: 100 for both visitors
  CRITICAL: Use Map for O(1) config lookup by type
  CRITICAL: If testNode returns false, generic directive visitor handles it

Task 5: Create main plugin factory function
  MODIFY src/index.tsx:
    - Export typeaheadPlugin function accepting TypeaheadPluginParams
    - Use realmPlugin to create MDXEditor plugin
    - Register the SINGLE shared TypeaheadNode (once, not per config)
    - Register SINGLE import visitor (handles all configs)
    - Register SINGLE export visitor (handles all configs)
    - Register TypeaheadPlugin component via addComposerChild$
  PATTERN: packages/source-preview-plugin/src/index.tsx
  PATTERN: packages/typeahead-plugin/src/basis/mentions/mdxEditorMentionsPlugin.ts
  CRITICAL: TypeaheadNode registered once; visitors registered once (not per config)

Task 6: Add basic CSS styles
  CREATE src/styles.css:
    - Style typeahead popup menu
    - Style menu items, selected state
    - Basic hover/focus styles
  PATTERN: packages/typeahead-plugin/src/basis/mentions/MentionsPlugin/style.css

Task 7: Create Ladle example stories
  CREATE src/examples/mentions.stories.tsx:
    - Simple example with @mentions only
    - Mock user search callback
    - Demonstrate basic usage

  CREATE src/examples/multi.stories.tsx:
    - Example with @mentions AND #hashtags
    - Show multiple typeahead configs working together
    - Mock callbacks for both types

  PATTERN: packages/source-preview-plugin/src/examples/* (if exists)
  CRITICAL: Import MDXEditor, initialize with plugin

Task 8: Update package exports
  MODIFY src/index.tsx:
    - Export typeaheadPlugin function
    - Export TypeaheadConfig, TypeaheadPluginParams types
    - Export $createTypeaheadNode, $isTypeaheadNode helpers
  PATTERN: packages/source-preview-plugin/src/index.tsx

Task 9: Delete reference implementation
  DELETE packages/typeahead-plugin/src/basis/:
    - Remove entire basis/ folder
    - Update any imports if needed
  VERIFY: No imports reference basis/ folder
```

### Per Task Pseudocode

```typescript
// Task 2: TypeaheadNode.ts
import {
  TextNode,
  NodeKey,
  SerializedTextNode,
  $applyNodeReplacement,
} from "lexical";

export interface SerializedTypeaheadNode extends SerializedTextNode {
  typeaheadType: string;
  content: string;
}

export class TypeaheadNode extends TextNode {
  __typeaheadType: string;
  __content: string;

  static getType(): string {
    return "typeahead";
  }

  static clone(node: TypeaheadNode): TypeaheadNode {
    return new TypeaheadNode(
      node.__typeaheadType,
      node.__content,
      node.__text,
      node.__key,
    );
  }

  constructor(
    typeaheadType: string,
    content: string,
    text?: string,
    key?: NodeKey,
  ) {
    super(text ?? content, key); // CRITICAL: Pass key to parent
    this.__typeaheadType = typeaheadType;
    this.__content = content;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = `typeahead typeahead-${this.__typeaheadType}`;
    dom.spellcheck = false;
    return dom;
  }

  exportJSON(): SerializedTypeaheadNode {
    return {
      ...super.exportJSON(),
      typeaheadType: this.__typeaheadType,
      content: this.__content,
    };
  }

  static importJSON(serialized: SerializedTypeaheadNode): TypeaheadNode {
    return $createTypeaheadNode(serialized.typeaheadType, serialized.content);
  }

  // CRITICAL: Use segmented mode for proper editing
  setSegmentedMode(): this {
    return this.setMode("segmented").toggleDirectionless();
  }
}

export function $createTypeaheadNode(
  type: string,
  content: string,
): TypeaheadNode {
  const node = new TypeaheadNode(type, content);
  return $applyNodeReplacement(node.setSegmentedMode());
}
```

```typescript
// Task 3: TypeaheadPlugin.tsx core structure
export function TypeaheadPlugin({ configs }: { configs: TypeaheadConfig[] }) {
  const [editor] = useLexicalComposerContext();

  return (
    <>
      {configs.map((config) => (
        <SingleTypeaheadInstance
          key={config.type}
          config={config}
          editor={editor}
          allConfigs={configs} // Pass all configs to check for conflicts
        />
      ))}
    </>
  );
}

function SingleTypeaheadInstance({ config, editor, allConfigs }) {
  const [queryString, setQueryString] = useState<string | null>(null);
  const results = useTypeaheadSearch(config, queryString);

  // CRITICAL: Build trigger regex dynamically from config.trigger
  const triggerRegex = useMemo(() => buildTriggerRegex(config.trigger), [config.trigger]);

  // CRITICAL: Check conflicts with other configs' triggers
  const otherTriggers = allConfigs
    .filter(c => c.type !== config.type)
    .map(c => c.trigger);

  const checkForMatch = useCallback((text: string) => {
    // Check if any other trigger matches first
    for (const otherTrigger of otherTriggers) {
      if (checkOtherTriggerMatches(text, otherTrigger)) {
        return null; // Let other plugin handle it
      }
    }
    return checkForTypeaheadMatch(text, triggerRegex, config.trigger);
  }, [triggerRegex, otherTriggers, config.trigger]);

  const options = useMemo(
    () => results
      .slice(0, config.maxResults ?? 5)
      .map(item => new TypeaheadOption(item, config.renderMenuItem(item))),
    [results, config]
  );

  const onSelectOption = useCallback((selectedOption, nodeToReplace, closeMenu) => {
    editor.update(() => {
      const node = $createTypeaheadNode(config.type, selectedOption.value);
      if (nodeToReplace) {
        nodeToReplace.replace(node);
      }
      node.select();
      closeMenu();
    });
  }, [editor, config.type]);

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <TypeaheadMenu
                options={options}
                selectedIndex={selectedIndex}
                onSelect={selectOptionAndCleanUp}
                onHover={setHighlightedIndex}
                className={config.className}
              />,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
```

```typescript
// Task 4: MDAST visitors (single instances handling all configs)
function createMdastImportVisitor(
  configs: TypeaheadConfig[],
): MdastImportVisitor<TextDirective> {
  // CRITICAL: Build lookup map for O(1) access
  // Since type === directiveName, use type as the key
  const configsByType = new Map(configs.map((c) => [c.type, c]));
  const registeredTypes = new Set(configs.map((c) => c.type));

  return {
    testNode: (node) => {
      // Test if this textDirective matches ANY registered config type
      // If not, return false so generic directive visitor can handle it
      return node.type === "textDirective" && registeredTypes.has(node.name);
    },
    visitNode: ({ mdastNode, lexicalParent }) => {
      // Look up the config for this type (= directive name)
      const config = configsByType.get(mdastNode.name);
      if (!config) return; // Should never happen if testNode works correctly

      const content = (mdastNode.children[0] as Mdast.Text).value;
      (lexicalParent as ElementNode).append(
        $createTypeaheadNode(config.type, content),
      );
    },
    priority: 100, // CRITICAL: Higher than generic directive visitor
  };
}

function createLexicalExportVisitor(
  configs: TypeaheadConfig[],
): LexicalExportVisitor<TypeaheadNode, TextDirective> {
  // CRITICAL: Build lookup map by type for O(1) access
  const configsByType = new Map(configs.map((c) => [c.type, c]));

  return {
    testLexicalNode: (node) => {
      // Test if this is a TypeaheadNode with a registered type
      return $isTypeaheadNode(node) && configsByType.has(node.__typeaheadType);
    },
    visitLexicalNode({ actions, lexicalNode, mdastParent }) {
      // Look up the config for this typeahead type
      const config = configsByType.get(lexicalNode.__typeaheadType);
      if (!config) return; // Should never happen if testLexicalNode works correctly

      // Since type === directiveName, use config.type directly
      actions.appendToParent(mdastParent, {
        name: config.type,
        type: "textDirective",
        children: [{ type: "text", value: lexicalNode.__content }],
      });
    },
    priority: 100, // CRITICAL: Higher than generic directive visitor
  };
}
```

```typescript
// Task 5: Main plugin factory
export const typeaheadPlugin = realmPlugin<TypeaheadPluginParams>({
  init: (realm, params) => {
    if (!params?.configs || params.configs.length === 0) {
      throw new Error('typeaheadPlugin requires at least one config');
    }

    // Validate: all config.type values must be unique
    const types = params.configs.map(c => c.type);
    const uniqueTypes = new Set(types);
    if (types.length !== uniqueTypes.size) {
      throw new Error('typeaheadPlugin: config.type values must be unique');
    }

    // CRITICAL: Single registrations for node and visitors
    // TypeaheadNode: one class for all typeahead types
    // Visitors: one import + one export, both handle all configs internally
    realm.pubIn({
      [addLexicalNode$]: TypeaheadNode,
      [addImportVisitor$]: createMdastImportVisitor(params.configs),
      [addExportVisitor$]: createLexicalExportVisitor(params.configs),
      [addComposerChild$]: () => <TypeaheadPlugin configs={params.configs} />,
    });
  },
});
```

### Integration Points

```yaml
DEPENDENCIES:
  - add to package.json: (already present)
    - @mdxeditor/editor: ^3.49.0
    - @mdxeditor/gurx: ^1.2.4
    - @lexical/react: (peer dependency via @mdxeditor/editor)
    - lexical: (peer dependency via @mdxeditor/editor)

EXPORTS:
  - index.tsx:
      - export typeaheadPlugin (function)
      - export type TypeaheadConfig
      - export type TypeaheadPluginParams
      - export $createTypeaheadNode (helper)
      - export $isTypeaheadNode (helper)

LADLE_STORIES:
  - src/examples/mentions.stories.tsx
  - src/examples/multi.stories.tsx
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# From packages/typeahead-plugin/
pnpm type-check
# Expected: No TypeScript errors

pnpm lint
# Expected: No ESLint errors

pnpm format:check
# Expected: All files properly formatted
```

### Level 2: Build

```bash
# From packages/typeahead-plugin/
pnpm build
# Expected: Clean build with no errors, dist/ folder created with:
#   - index.js (ES module)
#   - index.d.ts (type declarations)
#   - index.js.map (source map)

# Verify exports
cat dist/index.d.ts | grep -E "export.*(typeaheadPlugin|TypeaheadConfig)"
# Expected: Exports are present
```

### Level 3: Interactive Test

```bash
# From packages/typeahead-plugin/
pnpm dev
# Expected: Ladle dev server starts

# Manual testing:
# 1. Open http://localhost:61000 in browser
# 2. Navigate to "Mentions" story
#    - Type @ followed by letters
#    - Verify autocomplete menu appears
#    - Select an item
#    - Verify it's inserted as styled mention
# 3. Navigate to "Multi" story
#    - Type @ and verify mentions work
#    - Type # and verify hashtags work
#    - Verify both work independently without conflicts
# 4. Check browser console for errors (should be none)
```

### Level 4: Cleanup Verification

```bash
# Verify basis/ folder is deleted
test ! -d packages/typeahead-plugin/src/basis && echo "✓ basis/ deleted" || echo "✗ basis/ still exists"

# Verify no imports reference basis/
grep -r "from.*basis" packages/typeahead-plugin/src/ && echo "✗ Found basis imports" || echo "✓ No basis imports"
```

## Final Validation Checklist

- [ ] `pnpm type-check` passes with no errors
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm format:check` passes
- [ ] `pnpm build` completes successfully
- [ ] dist/index.d.ts contains all expected exports
- [ ] Ladle dev server starts without errors
- [ ] Mentions story works (@ trigger, autocomplete, insertion)
- [ ] Multi story works (both @ and # triggers work independently)
- [ ] No console errors in browser
- [ ] basis/ folder is deleted
- [ ] No imports reference basis/ anywhere in src/

---

## Anti-Patterns to Avoid

- ❌ Don't hardcode trigger characters - accept them as config parameters
- ❌ Don't create separate nodes per typeahead type - use single generic TypeaheadNode with type field
- ❌ Don't forget NodeKey parameter in constructor - Lexical requires it
- ❌ Don't skip visitor priority - must be 100 to override generic directive visitor
- ❌ Don't forget to check triggerFn conflicts - multiple plugins need exclusivity logic
- ❌ Don't use normal TextNode mode - must use 'segmented' mode for proper editing
- ❌ Don't forget null checks in portal rendering - anchorElementRef.current can be null
- ❌ Don't mutate config objects - treat as immutable

## Additional Notes

### Why Single Node vs Multiple Node Types?

**Critical Design Decision**: Using a single `TypeaheadNode` with a `typeaheadType` field instead of creating separate node classes per configuration.

**Benefits**:

- Single Lexical node registration (registered once in realm.pubIn)
- Easier styling via CSS class modifiers (`.typeahead-mention`, `.typeahead-hashtag`)
- Reduced code duplication (one node implementation)
- Same serialization pattern for all types

**How configs differentiate**:
Each configuration specifies a unique `type` identifier which serves dual purpose:

1. Internal identifier stored in `TypeaheadNode.__typeaheadType`
2. MDAST text directive name (e.g., `:mention[...]`, `:hashtag[...]`)

**Example**:

- Config A: `{ type: 'mention', trigger: '@', searchCallback: ... }`
- Config B: `{ type: 'hashtag', trigger: '#', searchCallback: ... }`

**Import flow**:

1. Single import visitor sees `:mention[alice]` in MDAST
2. Checks if 'mention' is in registered types → YES
3. Looks up 'mention' → finds Config A
4. Creates `TypeaheadNode(__typeaheadType='mention', __content='alice')`

**Export flow**:

1. Single export visitor sees `TypeaheadNode(__typeaheadType='mention')`
2. Checks if 'mention' is in registered types → YES
3. Looks up 'mention' → finds Config A
4. Outputs `:mention[alice]` to MDAST (using config.type as directive name)

**Unknown directives**:

- MDAST has `:emoji[smile]` but no config with `type='emoji'`
- Import visitor testNode returns `false`
- Generic MDXEditor directive visitor handles it instead

This is more efficient than creating N visitor instances—just one of each, with O(1) config lookup.

### Trigger Conflict Resolution Strategy

The plugin uses a "first-match wins" approach:

1. Each `SingleTypeaheadInstance` checks if other triggers match first
2. If another trigger matches, return `null` (let other plugin handle it)
3. Only if no other trigger matches, check own trigger pattern
4. This prevents multiple menus showing simultaneously

### Testing Strategy

The Ladle stories serve as both examples and manual integration tests:

- `mentions.stories.tsx`: Single typeahead type (simplest case)
- `multi.stories.tsx`: Multiple typeahead types (tests conflict resolution)

For production usage, users should add their own unit/integration tests for:

- Custom search callbacks
- Menu rendering logic
- MDAST serialization round-trips

### Styling Approach

Basic styles provided in `styles.css`:

- Minimal, functional menu styling
- CSS class hooks for customization (`.typeahead-{type}`)
- Users can override styles in their own CSS
- Consider: Add `className` prop to config for menu customization

### Future Enhancements (Out of Scope)

- Keyboard navigation customization
- Custom trigger patterns (regex instead of single character)
- Accessibility improvements (ARIA labels, screen reader support)
- Loading states for async search
- Empty state rendering
- Error handling for failed searches
