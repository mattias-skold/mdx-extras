import type { Story } from "@ladle/react";
import { MDXEditorMethods, MDXEditor, toolbarPlugin, DiffSourceToggleWrapper } from "@mdxeditor/editor";
import '@mdxeditor/editor/style.css'
import { useRef } from "react";
import { sourceWithPreviewPlugin } from "..";
import Editor from '@monaco-editor/react';

/**
 * Basic example story for the Source Preview Plugin
 */
export const Welcome: Story = () => {
  const ref = useRef<MDXEditorMethods>(null)
  return (
    <div className="App">
      <MDXEditor
        ref={ref}
        onChange={(md) => {
          console.log('change', md)
        }}
        markdown="Hello world"
        plugins={[
          sourceWithPreviewPlugin({
            editor: ({defaultValue, onChange}) => (
              <div style={{paddingTop: '2rem'}}>
              <Editor
                height="600px"
                width="100%"
                defaultLanguage="markdown"
                defaultValue={defaultValue}
                onChange={(value) => {
                  onChange(value ?? '')
                }}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  tabSize: 2,
                  insertSpaces: true
                }}
              /></div>
            )
          }),
          toolbarPlugin({
            toolbarContents: () => <DiffSourceToggleWrapper>Hi!</DiffSourceToggleWrapper>
          })
        ]}
      />
    </div>
  )
};

Welcome.meta = {
  title: "Welcome",
};
