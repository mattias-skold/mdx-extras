import { addEditorWrapper$, realmPlugin, rootEditor$, ViewMode, viewMode$ } from '@mdxeditor/editor'
import { withLatestFrom } from '@mdxeditor/gurx'
import { sourceEditor$, SourceEditor, SourceWithPreviewWrapper } from './SourceWithPreviewWrapper'
export type { SourceEditor, SourceEditorProps } from './SourceWithPreviewWrapper'


/**
 * @group Diff/Source
 */
export const sourceWithPreviewPlugin = realmPlugin<{
  /**
   * The initial view mode of the editor.
   * @default 'rich-text'
   */
  viewMode?: ViewMode
  /**
   * the component used to edit the source code.
   */
  editor: SourceEditor
}>({
  init(r, params) {
    r.sub(r.pipe(viewMode$, withLatestFrom(rootEditor$)), ([mode, editor]) => {
      editor?.setEditable(mode !== 'source')
    })



    r.pubIn({
      [viewMode$]: params?.viewMode ?? 'rich-text',
      [addEditorWrapper$]: SourceWithPreviewWrapper,
      ...(params?.editor ? {[sourceEditor$]: params.editor} : {})
    })
  }
})
