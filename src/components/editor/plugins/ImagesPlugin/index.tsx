import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from "lexical";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { CAN_USE_DOM } from "../../shared/canUseDOM";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImagePayload,
} from "../../nodes/ImageNode";
import { Button } from "@/components/ui/button";
import { useGetPhotosByQuery } from "../../utils/useUnsplash";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useEdgeStore } from "@/lib/edgestore";
import { Loader, Loader2 } from "lucide-react";

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

interface InsertImageDialogProps {
  activeEditor: LexicalEditor;
  onClose: () => void;

}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: InsertImageDialogProps): JSX.Element {
  const hasModifier = useRef(false);
  const [URLImage, setURLImage] = useState<string>("");
  const popupRef = useRef<HTMLDivElement>(null);
  const [queryPhoto, setQueryPhoto] = useState<string>("cat");
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [IsLoading, setIsLoading] = useState<boolean>(false);

  const { edgestore } = useEdgeStore();

  const { data, isLoading } = useGetPhotosByQuery({ query: queryPhoto });
  const photos = data?.results || [];




  useEffect(()=>{
    const selObj = window.getSelection();
    if (!selObj || selObj.rangeCount === 0) return;
  
    const selRange = selObj.getRangeAt(0);
    const rect = selRange.getBoundingClientRect();
    setPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
  },[])


  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
      if (e.key === 'Escape') {
        onClose();

      }
      if (e.key === 'Enter') {
        document.getElementById('file-upload')?.click();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor,onClose]);



  const onClick = (src: string, alt?: string) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      altText: `${alt} image` ,
      src: src,
    });
    onClose();
  };

  const handleFileChange =async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const res = await edgestore.publicFiles.upload({
        file,
       
        onProgressChange: () => setIsLoading(true),
      });
      if(res.url)
        setIsLoading(false)
        onClick(res.url!, file.name);
    

    }
  };
  

  const handleEmbedImage = () => {
    if (URLImage && isURLValid(URLImage)) {
      onClick(URLImage,"web");
    }
  };

  const isURLValid = (url: string) => {
    try {
      new URL(url);
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };
  return (
   
      <Tabs
        style={{ position: 'absolute', top: position.top + 40, left: position.left - 30, zIndex: 1000 }}
        ref={popupRef}
        defaultValue="Upload"
        className="w-full max-w-[450px] rounded-md border bg-popover max-sm:p-2 p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      >
        <TabsList className="w-full flex max-sm:gap-0 gap-x-2 flex-row border-border border-b rounded-none justify-start bg-transparent">
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b dark:border-white border-black rounded-none pb-[14px]"
            value="Upload"
          >
            Upload
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b dark:border-white border-black rounded-none pb-[14px]"
            value="link"
          >
            Embed link
          </TabsTrigger>
          <TabsTrigger
            className="gap-x-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b dark:border-white border-black rounded-none pb-[14px]"
            value="Unsplash"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="max-sm:hidden"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M8.501 11v5h7v-5h5.5v10h-18V11zm7-8v5h-7V3z"
              />
            </svg>
            Unsplash
          </TabsTrigger>
        </TabsList>

        <TabsContent
          className="max-h-[250px]  gap-y-3 overflow-y-scroll h-fit w-full flex flex-col "
          value="Upload"
        >
          <div className="relative w-full cursor-pointer">
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 opacity-0  w-full h-full cursor-pointer"
              onChange={handleFileChange}
            />
            {
              IsLoading && 
              <div className="flex flex-row  gap-x-3 my-3 items-center  justify-center">
                <Loader2 className="w-6 h-6 animate-spin"/>
                <span className=" text-muted-foreground text-sm font-medium">Loading image...</span>
              </div>
            }
            <Button type="button" className="w-full" variant={"outline"}>
              Upload file
            </Button>
          </div>
          <span className="text-muted-foreground text-xs text-center">
            The maximum size per file is 5MB
          </span>
        </TabsContent>

        <TabsContent value="link"  className="max-h-[250px]  gap-y-3  h-fit w-full flex flex-col ">
          <Input 
            placeholder="Paste link image link..." 
            value={URLImage}
            onChange={(e)=>setURLImage(e.target.value)}
          />
          <Button 
           disabled={!isURLValid(URLImage)}
           onClick={handleEmbedImage}
            >Embed image</Button>
          <span className="text-center text-muted-foreground text-xs"> works with any image from web.</span>
        </TabsContent>
        <TabsContent
          className="max-h-[350px] p-3 overflow-y-scroll h-fit w-full flex flex-col space-y-3"
          value="Unsplash"
        >
          <Input
            placeholder="Search for an image"
            className="min-h-[40px] h-full"
            onChange={(e) => setQueryPhoto(e.target.value)}
          />
          <section className="flex flex-row justify-between items-center flex-wrap gap-2">
            {isLoading
              ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((e) => (
                  <Skeleton
                    key={e}
                    className="h-[120px] w-[120px] rounded-md"
                  />
                ))
              : photos.map((item: any) => (
                  <div
                    onClick={() => onClick(item.urls.regular, queryPhoto)}
                    key={item.id}
                    className="cursor-pointer relative h-[120px] w-[120px]"
                  >
                    <Image
                      className="object-fill rounded-md"
                      fill
                      loading="lazy"
                      src={item.urls.small}
                      alt="Unsplash image"
                    />
                  </div>
                ))}
          </section>
        </TabsContent>
      </Tabs>
  );
}

export default function ImagesPlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [captionsEnabled, editor]);

  return null;
}

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

let img: HTMLImageElement | null = null;
if (typeof window !== "undefined") {
  img = document.createElement("img");
  img.src = TRANSPARENT_IMAGE;
}

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img!, 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    })
  );

  return true;
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("code, span.editor-image") &&
    target.parentElement &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
  