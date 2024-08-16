
"use client"
import './index.css';
import { IS_APPLE } from "../../shared/environment";

import {$isCodeHighlightNode} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$findMatchingParent, $getNearestNodeOfType, mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {Dispatch, useCallback, useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';
import {getDOMRangeRect} from '../../utils/getDOMRangeRect';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {setFloatingElemPosition} from '../../utils/setFloatingElemPosition';
import ToolButton from '@/components/ui/ToolButton';
import { BoldIcon, Code2, Italic, Link2, Sparkles, StrikethroughIcon, UnderlineIcon } from 'lucide-react';
import ToolTip from '@/providers/ToolTip';
import { Separator } from '@/components/ui/separator';
import FontDropDown from '../ToolbarPlugin/Font-DropDown';
import { blockTypeToBlockName, rootTypeToRootName } from '../ToolbarPlugin/types';
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';
import { BlockFormatDropDown } from '../ToolbarPlugin/BlockFormatDropDown';
import { GetIcon } from '../ToolbarPlugin';
import { $isTableNode } from '@lexical/table';
import { useTheme } from 'next-themes';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import ShinyButton from '@/components/magicui/shiny-button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { $isListNode, ListNode } from '@lexical/list';
import { $isHeadingNode } from '@lexical/rich-text';
import AI from '../../ui/AI';

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  fontFamily,
  blockType,
  isUnderline,
  isCode,
  isStrikethrough,
  setIsLinkEditMode,
  bgColor,
  fontColor,
  rootType,



}: {

  fontColor:string
  bgColor:string
  fontFamily:string
  blockType:keyof typeof blockTypeToBlockName
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
  rootType:keyof typeof rootTypeToRootName

  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);
  const {theme} = useTheme()

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);



  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'none') {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = 'none';
        }
      }
    }
  }
  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
        popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);

      return () => {
        document.removeEventListener('mousemove', mouseMoveListener);
        document.removeEventListener('mouseup', mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink,
      );
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener('resize', update);
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateTextFormatFloatingToolbar]);
  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      editor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [editor]
  );
  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: `var(${value})` }, false);
    },
    [applyStyleText]
  );
  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": `var(${value})` }, skipHistoryStack);
    },
    [applyStyleText]
  );
  
  const CommandList = [
    {
      label:"AI",
      title:"Ask AI",
      render:(
        <AI editor={editor}/>
      )
    },
    {
      lable:"div-0",
      render:(
        <Separator orientation='vertical' className='h-[30px] w-[1px] mx-1'/>
      )
    },
    {
      label: "BlockType",
      title: "Block Type",
      render:(
        <BlockFormatDropDown
          ActiveBlockName={
            blockTypeToBlockName[blockType] as string
          }
          ActiveBlockIcon={GetIcon({ blockType })}
          blockType={blockType}
          rootType={rootType}
          editor={editor}
        />
      )
    },
    {
      label: "font-family",
      title: "font",
      render: (
        <FontDropDown
          editor={editor}
          value={fontFamily}
        />
      ),
    },
    {
      label: "Bold",
      command: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
      title: IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)",
      icon: <BoldIcon className={"w-4 h-4"} />,
      active: isBold,
    },
    {
      label: "italic",
      command: () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
      title: IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)",
      icon: <Italic className={"w-4 h-4"} />,
      active: isItalic,
    },
    {
      label: "Underline",
      command: () =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
      icon: <UnderlineIcon className={"w-4 h-4"}/>,
      title: IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)",
      active: isUnderline,
    },
    {
      label:"Strikethrough",
      title:"Strikethrough",
      command:()=>{
        editor.dispatchCommand(
          FORMAT_TEXT_COMMAND,
          'strikethrough',
        )
      },
      icon:<StrikethroughIcon className={"w-4 h-4"} />,
      active:isStrikethrough
    },  
    {
      label: "code",
      command: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
      icon: <Code2 className={"w-4 h-4"} />,
      title: "Insert code block",
      active: isCode,
    },
    {
      label: "Link",
      command: () => insertLink(),
      title: "Insert link",
      icon: <Link2 className={"w-4 h-4"} />,
      active: isLink,
    },
    {
      lable:"div-1",
      render:(
        <Separator orientation='vertical' className='h-[30px] w-[1px] mx-1'/>
      )
    },
    {
      label: "color",
      title:"font color",
      render: (
        <DropdownColorPicker
          theme={theme!}
          buttonClassName="h-[30px] px-1 "
          buttonIconClassName={
            <div
              className="h-[25px] w-[25px] rounded-full p-1 flex items-center justify-center   text-xs"
              style={{ background: fontColor }}
            >
              A
            </div>
          }
          color={fontColor}
          Onchange={onFontColorSelect}
          title="font color"
        />
      ),
    },
    {
      label: "Background color",
      title:"Background color",
      render: (
        <DropdownColorPicker
          theme={theme!}
          buttonClassName="h-[30px]  px-1 "
          buttonIconClassName={
            <div
              className="h-[25px] w-[25px] rounded-full p-1 "
              style={{ background: bgColor }}
            />
          }
          color={bgColor}
          Onchange={onBgColorSelect}
          title="background color"
        />
      ),
    },
   
  ];

  
  return (
    <div ref={popupCharStylesEditorRef} className={

      ` 
      absolute  w-fit min-w-[350px] gap-x-1 h-[40px] top-0  p-2 flex flex-row items-center  z-50 will-change-transform   rounded-md border bg-popover  
      text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out 
      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[side=top]:slide-in-from-bottom-2     
      data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2
      `
    }>
        
        
     {
        CommandList.map((e) => {
          if (e.render) {
            if (e.title) {
              return (
                <ToolTip
                  key={e.label}
                  label={e.title}
                >
                  {e.render}
                </ToolTip>
              );
            } else {
              return (
                <React.Fragment key={e.label} >
                  {e.render}
                </React.Fragment>
              );
            }
          } else {
            return (
              <ToolTip
                key={e.label}
                label={e.title}
                side='top'
              >
                <ToolButton
                  checked={e.active}
                  onClick={e.command}
                  style="h-[30px]"
                >
                  {e.icon}
                </ToolButton>
              </ToolTip>
            );
          }
        })
      }

      <BorderBeam size={100} duration={20} delay={9} />

    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#ffffff"); 
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [blockType, setBlockType] =useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] =useState<keyof typeof rootTypeToRootName>("root");

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      setIsCode(selection.hasFormat('code'));

      // Update link state
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ''
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '');
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false);
        return;
      }

      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      setFontColor(
        $getSelectionStyleValueForProperty(
          selection,
          "color",
        )
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
        )
      );
      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }
      // const blockNode = node.getTopLevelElementOrThrow();
      const anchorNode = selection.anchor.getNode();
      let element =anchorNode.getKey() === "root"
        ? anchorNode
        : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode
        );
        
        const type = parentList
          ? parentList.getListType()
          : element.getListType();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          // @ts-ignore
          : element.getType();
        setBlockType(type as keyof typeof blockTypeToBlockName);

     
      }      

      
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup);
    return () => {
      document.removeEventListener('selectionchange', updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, updatePopup]);

  if (!isText) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isUnderline={isUnderline}
      isCode={isCode}
      fontColor={fontColor}
      bgColor={bgColor}
      blockType={blockType}
      fontFamily={fontFamily}
      setIsLinkEditMode={setIsLinkEditMode}
      rootType={rootType}

    />,
    anchorElem,
  );
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}: {
  anchorElem?: HTMLElement;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
