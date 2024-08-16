"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  ListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {

  $isHeadingNode,

} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from "@lexical/selection";

import { $isTableNode, $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { Separator } from "@/components/ui/separator";
import { blockTypeToBlockName, rootTypeToRootName } from "./types";
import { IS_APPLE } from "../../shared/environment";
import {
  Redo,
  Undo,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrderedIcon,
  SquareCheck,
  Quote,
  SquareDashedBottomCode,
  Italic,
  Code2,
  Link2,
  BoldIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Trash,
  StepForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSelectedNode } from "@/components/editor/utils/getSelectedNode";
import ToolTip from "@/providers/ToolTip";
import { BlockFormatDropDown } from "./BlockFormatDropDown";
import { sanitizeUrl } from "../../utils/url";
import CodeLangSelect from "./Code-lang-select";
import FontDropDown from "./Font-DropDown";
import FontSize from "./fontSize";
import ToolButton from "@/components/ui/ToolButton";
import DropdownColorPicker from "../../ui/DropdownColorPicker";
import { useTheme } from "next-themes";
import ElementFormatDropdown from "./ElementFormatDropdown";
import BlcokInsertDropDown from "./BlcokInsertDropDown";
import { cn } from "@/lib/utils";

export function GetIcon({
  blockType,
}: {
  blockType: keyof typeof blockTypeToBlockName | string;
}) {

  
  switch (blockType) {
    case "paragraph":
      return <Pilcrow className="w-5 h-5" />;
    case "h1":
      return <Heading1 className="w-5 h-5" />;
    case "h2":
      return <Heading2 className="w-5 h-5" />;
    case "h3":
      return <Heading3 className="w-5 h-5" />;
    case "bullet":
      return <List className="w-5 h-5" />;
    case "list":
      return <List className="w-5 h-5" />;
    case "number":
      return <ListOrderedIcon className="w-5 h-5" />;
    case "check":
      return <SquareCheck className="w-5 h-5" />;
    case "quote":
      return <Quote className="w-5 h-5" />;
    case "code":
      return <SquareDashedBottomCode className="w-5 h-5" />;
    case "collapsible-container":
      return <StepForward className="w-5 h-5"/>
    default:
      return <StepForward className="w-5 h-5"/>
  }
}
export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: (val:boolean)=>void
}) {
  const { theme } = useTheme();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] =useState<keyof typeof rootTypeToRootName>("root");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null );

  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>(theme === "dark" ? "#e5e5e5" : "#000");
  const [bgColor, setBgColor] = useState<string>(theme === "dark" ? "#e5e5e5" : "#000" );
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("javascript");

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
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
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(
          selection,
          "color",
          theme === "dark" ? "#e5e5e5" : "#000"
        )
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          theme === "dark" ? "#e5e5e5" : "#000"
        )
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );
    }
  }, [activeEditor,theme]);
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [activeEditor,editor, $updateToolbar]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor,editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);
 

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);
  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [activeEditor]
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
  const IconStyle = "w-4 h-4 ";
  const CommandList = [
    {
      label: "Undo",
      command: () => activeEditor.dispatchCommand(UNDO_COMMAND, undefined),
      disabled: !canUndo || !isEditable,
      title: "Undo (Ctrl+Z)",
      Icon: <Undo />,
    },
    {
      label: "redo",
      command: () => activeEditor.dispatchCommand(REDO_COMMAND, undefined),
      disabled: !canRedo || !isEditable,
      title: "Redo (Ctrl+Z)",
      Icon: <Redo />,
    },
    {
      label: "BlockType",
      disabled: !isEditable,
      title: "Block Type",
    },
    {
      label: "code-language",
      disabled: !isEditable,
      title: "code-lang",
    },
    {
      label: "font-family",
      title: "font",
      render: (
        <FontDropDown
          editor={editor}
          disabled={!isEditable}
          value={fontFamily}
        />
      ),
    },
    {
      label: "font-size",
      title: "",
      render: (
        <FontSize
          selectionFontSize={fontSize.slice(0, -2)}
          editor={activeEditor}
          disabled={!isEditable}
        />
      ),
    },
    {
      label: "Bold",
      disabled: !isEditable,
      command: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
      title: IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)",
      icon: <BoldIcon className={IconStyle} />,
      active: isBold,
    },
    {
      label: "italic",
      disabled: !isEditable,
      command: () =>
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
      title: IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)",
      icon: <Italic className={IconStyle} />,
      active: isItalic,
    },
    {
      label: "Underline",
      disabled: !isEditable,
      command: () =>
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
      icon: <UnderlineIcon className={IconStyle} />,
      title: IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)",
      active: isUnderline,
    },
    {
      label:"Strikethrough",
      title:"Strikethrough",
      command:()=>{
        activeEditor.dispatchCommand(
          FORMAT_TEXT_COMMAND,
          'strikethrough',
        )
      },
      icon:<StrikethroughIcon className={IconStyle} />,
      active:isStrikethrough
    },  
    {
      label: "code",
      disabled: !isEditable,
      command: () => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
      icon: <Code2 className={IconStyle} />,
      title: "Insert code block",
      active: isCode,
    },
    {
      label: "Link",
      command: () => insertLink(),
      disabled: !isEditable,
      title: "Insert link",
      icon: <Link2 className={IconStyle} />,
      active: isLink,
    },
    {
      label: "color",
      title:"font color",
      render: (
        <DropdownColorPicker
          theme={theme!}
          disabled={!isEditable}
          buttonClassName="h-[32px] mt-[1px] px-1 "
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
          disabled={!isEditable}
          buttonClassName="h-[32px]  px-1 "
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
    {
      label: elementFormat,
      title: "text alignt",
      render: (
        <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={activeEditor}
        isRTL={isRTL}
      />
      ),
    },
    {
      label: "Insert",
      title: "Insert",
      render: (
        <BlcokInsertDropDown
          isEditable={!isEditable}
          activeEditor={activeEditor}
        
      />
      ),
    },
  ];

  
  return (
    <nav className={cn("sticky   bg-background/20  backdrop-blur-lg transition-all top-16 inset-0 z-10 py-2")}>
      <div className=" border-b p-2  mt-2 flex overflow-x-auto  space-x-1 items-center  flex-row">
        {CommandList.map((command, index) => {
          let content;

          switch (command.label) {
            case "Undo":
            case "redo":
              content = (
                <ToolTip key={index} label={command.title!}>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={command.disabled}
                    onClick={command.command}
                    title={command.title}
                    type="button"
                  >
                    {command.Icon}
                  </Button>
                </ToolTip>
              );
              break;

            case "BlockType":
              if (blockType in blockTypeToBlockName && activeEditor === editor) {
                content = (
                  <div  key={index} className="flex flex-row gap-x-2">
                    <Separator
                      orientation="vertical"
                      className="w-[1.5px]  h-[32px]"
                    />
                    <ToolTip label={command.title}>
                      <BlockFormatDropDown
                        ActiveBlockName={
                          blockTypeToBlockName[blockType] as string
                        }
                        ActiveBlockIcon={GetIcon({ blockType })}
                        blockType={blockType}
                        rootType={rootType}
                        disabled={command.disabled}
                        editor={editor}
                      />
                    </ToolTip>
                  </div>
                );
              }
              break;

            case "code-language":
              if (blockType === "code") {
                content = (
                  <ToolTip key={index} label={command.title}>
                    {blockType in blockTypeToBlockName &&
                      activeEditor === editor && (
                        <CodeLangSelect
                          isEditable={!command.disabled}
                          codeLanguage={codeLanguage}
                          onCodeLanguageSelect={onCodeLanguageSelect}
                        />
                      )}
                  </ToolTip>
                );
              }
              break;

            default:
              if (blockType === "code") break;
              if (command.render) {
                content = (
                  <div key={index} className="flex flex-row gap-x-2">
                    {index === 11 && (
                      <Separator
                        orientation="vertical"
                        className="w-[1px] ml-1 h-[32px]"
                      />
                    )}

                    {command.title === "" ? (
                      command.render
                    ) : (
                      <ToolTip label={command.title}>{command.render}</ToolTip>
                    )}
                  </div>
                );
              } else {
                
                content = (
                  <ToolTip side="top" sideOffset={4}  key={index} label={command.title}>
                    <ToolButton
                      onClick={command.command}
                      checked={command.active!}
                    >
                      {command.icon}
                    </ToolButton>
                  </ToolTip>
                );
              }
              break;
          }

          return content;
        })}
      </div>
    </nav>
  );
}
