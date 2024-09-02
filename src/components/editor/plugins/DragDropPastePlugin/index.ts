

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {DRAG_DROP_PASTE} from '@lexical/rich-text';
import {isMimeType, mediaFileReader} from '@lexical/utils';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {useEffect} from 'react';

import {INSERT_IMAGE_COMMAND} from '../ImagesPlugin';
import { useEdgeStore } from '@/lib/edgestore';

const ACCEPTABLE_IMAGE_TYPES = [
  'image/',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/webp',
];

export default function DragDropPaste(): null {
  const [editor] = useLexicalComposerContext();
  
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        (async () => {
          console.log(files);
          for (const file of files) {
            const res = await edgestore.publicFiles.upload({
              file
            });
            if(res.url){
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: file.name,
                src: res.url,
              });
            }
          }
        })();
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);
  return null;
}