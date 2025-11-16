# @mdxeditor/typeahead-plugin

MDXEditor plugin for flexible typeahead autocomplete functionality. Supports multiple simultaneous typeahead types (mentions, hashtags, issues, etc.) with customizable trigger characters, data sources, and rendering.

## Installation

```bash
npm install @mdxeditor/typeahead-plugin
```

```bash
pnpm add @mdxeditor/typeahead-plugin
```

## Features

- Multiple typeahead types in a single editor
- Custom trigger characters (@, #, :, etc.)
- Async data source support
- Customizable rendering for menu items and inline display
- Persists to markdown as text directives
- TypeScript support with full type definitions
- Built on Lexical's typeahead system

## Usage

### Basic Example with Mentions

```tsx
import { MDXEditor } from "@mdxeditor/editor";
import { typeaheadPlugin } from "@mdxeditor/typeahead-plugin";

const users = ["Alice", "Bob", "Charlie", "David"];

function App() {
  return (
    <MDXEditor
      markdown="# Hello World"
      plugins={[
        typeaheadPlugin({
          configs: [
            {
              type: "mention",
              trigger: "@",
              searchCallback: async (query) => {
                return users.filter((user) =>
                  user.toLowerCase().includes(query.toLowerCase()),
                );
              },
              renderMenuItem: (user) => <span>@{user}</span>,
            },
          ],
        }),
      ]}
    />
  );
}
```

### Multiple Typeahead Types

```tsx
import { MDXEditor } from "@mdxeditor/editor";
import { typeaheadPlugin } from "@mdxeditor/typeahead-plugin";

const users = ["Alice", "Bob", "Charlie"];
const tags = ["important", "urgent", "feature", "bug"];
const emojis = ["smile", "heart", "rocket", "fire"];

function App() {
  return (
    <MDXEditor
      markdown="# Hello World"
      plugins={[
        typeaheadPlugin({
          configs: [
            {
              type: "mention",
              trigger: "@",
              searchCallback: async (query) => {
                return users.filter((user) =>
                  user.toLowerCase().includes(query.toLowerCase()),
                );
              },
              renderMenuItem: (user) => (
                <div style={{ padding: "4px 8px" }}>
                  <strong>@{user}</strong>
                </div>
              ),
              maxResults: 5,
            },
            {
              type: "hashtag",
              trigger: "#",
              searchCallback: async (query) => {
                return tags.filter((tag) =>
                  tag.toLowerCase().includes(query.toLowerCase()),
                );
              },
              renderMenuItem: (tag) => (
                <div style={{ padding: "4px 8px" }}>#{tag}</div>
              ),
              className: "hashtag-node",
            },
            {
              type: "emoji",
              trigger: ":",
              searchCallback: async (query) => {
                return emojis.filter((emoji) =>
                  emoji.toLowerCase().includes(query.toLowerCase()),
                );
              },
              renderMenuItem: (emoji) => (
                <div style={{ padding: "4px 8px" }}>:{emoji}:</div>
              ),
            },
          ],
        }),
      ]}
    />
  );
}
```

### With API Data Source

```tsx
import { MDXEditor } from "@mdxeditor/editor";
import { typeaheadPlugin } from "@mdxeditor/typeahead-plugin";

function App() {
  return (
    <MDXEditor
      markdown="# Hello World"
      plugins={[
        typeaheadPlugin({
          configs: [
            {
              type: "user",
              trigger: "@",
              searchCallback: async (query) => {
                const response = await fetch(
                  `/api/users/search?q=${encodeURIComponent(query)}`,
                );
                const users = await response.json();
                return users.map((u) => u.username);
              },
              renderMenuItem: (username) => (
                <div className="user-menu-item">
                  <span className="username">@{username}</span>
                </div>
              ),
              maxResults: 10,
            },
          ],
        }),
      ]}
    />
  );
}
```

## API

### Plugin Configuration

The plugin accepts a single parameter object:

```tsx
interface TypeaheadPluginParams {
  configs: TypeaheadConfig[];
}
```

### TypeaheadConfig

Each typeahead configuration has the following properties:

| Property         | Type                                   | Required | Description                                                                                                                            |
| ---------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `type`           | `string`                               | Yes      | Unique identifier for this typeahead type. Used as the text directive name (e.g., `:mention[...]`). Must be unique across all configs. |
| `trigger`        | `string`                               | Yes      | Trigger character(s) - e.g., `'@'`, `'#'`, `':'`                                                                                       |
| `searchCallback` | `(query: string) => Promise<string[]>` | Yes      | Async function to resolve search results based on user's query                                                                         |
| `renderMenuItem` | `(item: string) => JSX.Element`        | Yes      | Render function for autocomplete menu items                                                                                            |
| `className`      | `string`                               | No       | Optional CSS class for styling this typeahead type                                                                                     |
| `maxResults`     | `number`                               | No       | Maximum number of results to show (default: 5)                                                                                         |

## How It Works

The plugin creates a single shared Lexical node type (`TypeaheadNode`) that handles all typeahead types. Each type is differentiated by its `type` identifier.

When you type a trigger character (e.g., `@`), the plugin:

1. Detects the trigger and activates the typeahead
2. Calls your `searchCallback` with the user's query
3. Displays matching results in an autocomplete menu
4. Inserts the selected item as a custom node in the editor
5. Exports to markdown as a text directive: `:mention[Alice]`, `:hashtag[important]`, etc.

### Markdown Persistence

The plugin uses [text directives](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) syntax for markdown persistence:

- Input: Type `@Alice` and select from menu
- In Lexical: Stored as `TypeaheadNode` with `type: "mention"` and `content: "Alice"`
- In Markdown: Exported as `:mention[Alice]`

## Styling

The plugin includes minimal default styles. You can customize appearance using:

1. The `className` property in your config
2. CSS targeting the generated nodes
3. Custom rendering in `renderMenuItem`

Example CSS:

```css
/* Style the inline mention nodes */
.mention-node {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 4px;
  border-radius: 3px;
}

/* Style the autocomplete menu */
.typeahead-menu {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

## Peer Dependencies

This plugin requires:

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

## Contributing

This package is part of the [MDXEditor Extras](https://github.com/mdx-editor/extras) monorepo. See the main repository for contribution guidelines.

## License

MIT
