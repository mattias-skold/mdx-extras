# @mdxeditor/source-preview-plugin

MDXEditor plugin for displaying source code editor alongside a rich-text preview in a side-by-side view. Allows seamless switching between rich-text editing and viewing/editing the raw markdown source.

## Installation

```bash
npm install @mdxeditor/source-preview-plugin
```

```bash
pnpm add @mdxeditor/source-preview-plugin
```

## Features

- Side-by-side source and preview display
- Seamless switching between rich-text and source modes
- Bring your own source editor (supports Monaco, CodeMirror, or any custom editor)
- Built with gurx reactive state management
- TypeScript support with full type definitions

## Usage

This plugin wraps the MDXEditor with a source code editor that can be toggled alongside the rich-text WYSIWYG editor.

### Basic Example with Textarea

```tsx
import { MDXEditor } from "@mdxeditor/editor";
import { sourceWithPreviewPlugin } from "@mdxeditor/source-preview-plugin";
import type { SourceEditor } from "@mdxeditor/source-preview-plugin";

// Define your source editor component
const MySourceEditor: SourceEditor = ({ markdown, onChange }) => {
  return (
    <textarea
      value={markdown}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", height: "100%", fontFamily: "monospace" }}
    />
  );
};

function App() {
  return (
    <MDXEditor
      markdown="# Hello World"
      plugins={[
        sourceWithPreviewPlugin({
          viewMode: "rich-text", // or 'source'
          editor: MySourceEditor,
        }),
      ]}
    />
  );
}
```

### Advanced Example with Monaco Editor

```tsx
import { MDXEditor } from "@mdxeditor/editor";
import { sourceWithPreviewPlugin } from "@mdxeditor/source-preview-plugin";
import type { SourceEditor } from "@mdxeditor/source-preview-plugin";
import Editor from "@monaco-editor/react";

const MonacoSourceEditor: SourceEditor = ({ markdown, onChange }) => {
  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      value={markdown}
      onChange={(value) => onChange(value || "")}
      options={{
        minimap: { enabled: false },
        lineNumbers: "on",
        wordWrap: "on",
      }}
    />
  );
};

function App() {
  return (
    <MDXEditor
      markdown="# Hello World"
      plugins={[
        sourceWithPreviewPlugin({
          viewMode: "source",
          editor: MonacoSourceEditor,
        }),
      ]}
    />
  );
}
```

## API

### Plugin Configuration

The plugin accepts the following options:

- **`editor`** (required): A React component that implements the `SourceEditor` interface for editing markdown source
- **`viewMode`** (optional): Initial view mode, either `'rich-text'` or `'source'`. Default: `'rich-text'`

### SourceEditor Interface

Your source editor component should match this interface:

```tsx
interface SourceEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

type SourceEditor = React.ComponentType<SourceEditorProps>;
```

The component receives:

- `markdown`: The current markdown content as a string
- `onChange`: Callback to update the markdown content

## How It Works

The plugin uses gurx for reactive state management:

- **`viewMode$`**: Controls whether the editor is in 'rich-text' or 'source' mode
- **`sourceEditor$`**: Stores the source editor component
- **`updateBothSourceAndMarkdown$`**: Signal that syncs source and preview

When in source mode, the rich-text editor becomes read-only, and changes made in the source editor are synchronized back to the preview.

## Peer Dependencies

This plugin requires:

- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

## Contributing

This package is part of the [MDXEditor Extras](https://github.com/mdx-editor/extras) monorepo. See the main repository for contribution guidelines.

## License

MIT
