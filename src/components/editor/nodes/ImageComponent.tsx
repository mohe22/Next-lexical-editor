
import type {
  BaseSelection,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from 'lexical';

import './ImageNode.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,

  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';

import brokenImage from '../../../../public/images/image-broken.svg';
import ImageResizer from '../ui/ImageResizer';
import {$isImageNode} from './ImageNode';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Loader, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogContainer,
} from "@/components/shared-components/DialogProvider";
const imageCache = new Set();

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
  createCommand('RIGHT_CLICK_IMAGE_COMMAND');

  function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
      throw new Promise<void>((resolve, reject) => {
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => {
          imageCache.add(src);
          resolve();
        };
        img.onerror = () => {
          imageCache.add(src);
          reject();
        };
      });
    }
  }
  

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
  onError,
}: {
  altText: string;
  className: string | null;
  height: 'inherit' | number;
  imageRef: {current: null | HTMLImageElement};
  maxWidth: number;
  src: string;
  width: 'inherit' | number;
  onError: () => void;
}): JSX.Element {
  useSuspenseImage(src);

  
  return (
    <Dialog
    transition={{
      duration: 0.3,
      ease: "easeInOut",
    }}
  >
    <DialogTrigger>
       <img
          className={className || undefined}
          src={src}
          alt={altText}
          ref={imageRef}
          style={{
            height: height === 'inherit' ? 'auto' : height,
            width: width === 'inherit' ? '90vw' : width,
          }}
          id='upload-file'
          onError={onError}
          draggable="true"
        />
    </DialogTrigger>
    <DialogContainer>
      <DialogContent className="relative h-fit w-fit">
        <img
          className={className || undefined}
          src={src}
          alt={altText}
          ref={imageRef}
          style={{
            height: height === 'inherit' ? 'auto' : height,
            width: width === 'inherit' ? '90vw' : width,
          }}
          id='upload-file'
          onError={onError}
          draggable="true"
        />
      </DialogContent>
      <DialogClose
        className="fixed right-6 top-6 h-fit w-fit rounded-full bg-white p-1"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { delay: 0.3, duration: 0.1 },
          },
          exit: { opacity: 0, transition: { duration: 0 } },
        }}
      >
        <XIcon className="h-5 w-5 text-zinc-500" />
      </DialogClose>
    </DialogContainer>
  </Dialog>
 
  );
}

function BrokenImage(): JSX.Element {
  return (
    <div className=' w-[500px] h-[500px]  space-y-4 flex  flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#2F3438]'>
        <Image
          src={brokenImage}
          height={120}
          width={120}
          style={{
            opacity: 0.2,
          }}
        alt='error'
        draggable="false"
      />
      <span className=' text-muted-foreground font-medium  text-sm'>this image can not be loaded</span>
    </div>
  );
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
}: {
  altText: string;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  src: string;
  width: 'inherit' | number;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);


  
 
  

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
       if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [ isSelected],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (
      
        buttonRef.current === event.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [ editor, setSelected],
  );

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;

      if (isResizing) {
        return true;
      }
      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection],
  );

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;
        if (
          domElement.tagName === 'IMG' &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            event as MouseEvent,
          );
        }
      });
    },
    [editor],
  );

  useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW,
      ),
    );

    rootElement?.addEventListener('contextmenu', onRightClick);

    return () => {
      isMounted = false;
      unregister();
      rootElement?.removeEventListener('contextmenu', onRightClick);
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected,
  ]);



  const onResizeEnd = (
    nextWidth: 'inherit' | number,
    nextHeight: 'inherit' | number,
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);
    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };


  

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;
  return (
    <Suspense  fallback={<Separator className='h-[500px] w-[500px] rounded-md flex  items-center justify-center'><Loader className='w-6 h-6 animate-spin'/></Separator>} > 
      <div className='w-full'>

        <div  draggable={draggable} className='w-full'>
          {isLoadError ? (
            <BrokenImage />
          ) : (
            <LazyImage
              className={
                isFocused
                  ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}`
                  : null
              }
              src={src}
              altText={altText}
              imageRef={imageRef}
              
              width={width}
              height={height}
              maxWidth={maxWidth}
              onError={() => setIsLoadError(true)}
            />
          )}
        </div>

       
        {resizable && $isNodeSelection(selection) && isFocused && (
          <ImageResizer
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            maxWidth={maxWidth}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </Suspense>
  );
}
