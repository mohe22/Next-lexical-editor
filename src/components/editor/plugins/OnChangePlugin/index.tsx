import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { useEffect } from "react";
import { useDebouncedCallback } from 'use-debounce';

export function OnChangePlugin({ onChange }: { onChange: (val: EditorState) => void }) {
  const [editor] = useLexicalComposerContext();

  const debouncedOnChange = useDebouncedCallback((editorState: EditorState) => {
    onChange(editorState);
  }, 1000); 

  useEffect(() => {
    // Register the update listener and use the debounced onChange function
    return editor.registerUpdateListener(({ editorState }) => {
      debouncedOnChange(editorState);
    });
  }, [editor, debouncedOnChange]);

  return null;
}
