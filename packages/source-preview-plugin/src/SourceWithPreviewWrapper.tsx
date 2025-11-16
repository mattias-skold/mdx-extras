import { markdown$, markdownSourceEditorValue$, setMarkdown$, viewMode$ } from '@mdxeditor/editor'
import { Cell, Signal, useCellValues, usePublisher } from '@mdxeditor/gurx'
import React from 'react'

export interface SourceEditorProps {
  defaultValue: string
  onChange: (value: string) => void
}

export type SourceEditor = React.FC<SourceEditorProps>


export const sourceEditor$ = Cell<SourceEditor>(() => {
  return (<>Pass <code>editor</code> parameter to <code>sourceWithPreviewPlugin</code> to enable source editing.</>)
})

// the built-in source editor did not have to update the markdown (there was no preview)
const updateBothSourceAndMarkdown$ = Signal<string>((r) => {
  r.link(updateBothSourceAndMarkdown$, setMarkdown$)
  r.link(updateBothSourceAndMarkdown$, markdownSourceEditorValue$)
})


export const SourceWithPreviewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, markdown, SourceEditorComponent] = useCellValues(viewMode$, markdown$, sourceEditor$)

  const updateMarkdown = usePublisher(updateBothSourceAndMarkdown$)

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
      {viewMode === 'source' && (
        <div style={{ width: '50%' }}>
          <SourceEditorComponent defaultValue={markdown} onChange={updateMarkdown} />

          {/* {error ? ( */}
          {/*   <div className={styles.markdownParseError}> */}
          {/*     <p>{error.error}.</p> */}
          {/*   </div> */}
          {/* ) : null} */}
        </div>
      )}
      <div className="mdxeditor-rich-text-editor" style={{ width: '50%' }}>
        {children}
      </div>
    </div>
  )
}
