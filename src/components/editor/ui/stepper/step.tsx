import React, { useCallback, useEffect, useRef, useState } from "react";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import ImagesPlugin from "../../plugins/ImagesPlugin";
import { Plus } from "lucide-react";
import { Reorder } from "framer-motion";
import { StepType } from "../../nodes/Stepper";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useSharedHistoryContext } from "@/components/providers/SharedHistoryContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { nestedNodes } from "../../nodes";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import LexicalAutoLinkPlugin from "../../plugins/AutoLinkPlugin";
import { LinkWithMetaDataPlugin } from "../../plugins/LinkWithMetaData";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import CodeHighlightPlugin from "../../plugins/CodeHighlightPlugin";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import FloatingTextFormatToolbarPlugin from "../../plugins/FloatingTextFormatToolbarPlugin";
import SlashCommand from "../../plugins/SlashCommand";
import CodeActionMenuPlugin from "../../plugins/CodeActionMenuPlugin";
import FloatingLinkEditorPlugin from "../../plugins/FloatingLinkEditorPlugin";

interface Props {
  item: StepType;
  numberd: number;
  insertAt: (index: number) => void;
  remove: (numberd: number) => void;
  updateTitle: (index: number, title: string) => void;
}

export default function Step({
  item,
  numberd,
  insertAt,
  remove,
  updateTitle,
}: Props) {
  const titleRef = React.useRef<HTMLDivElement>(null);
  const [isLinkEditMode, setIsLinkEditMode] = React.useState<boolean>(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const { historyState } = useSharedHistoryContext();
  const activeEditorRef = useRef<LexicalEditor | null>(null);

  const handleTitleBlur = () => {
    if (titleRef.current) {
      updateTitle(item.id, titleRef.current.textContent!);
    }
  };

  // fix the delete
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      const currentText = titleRef.current?.textContent || "";
      if (currentText === "") {
        e.preventDefault();
        remove(item.id);
      }
    }
  };

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement | null) => {
    setFloatingAnchorElem(_floatingAnchorElem);
  }, []);

  useEffect(() => {
    const unregister = mergeRegister(
      item.content.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
    return () => {
      unregister();
    };
  }, []);

  return (
    <Reorder.Item
      value={item}
      id={item.id.toString()}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      className="relative group my-2 flex w-full flex-row gap-x-6 select-none"
    >
      <div className="h-7 w-7 absolute max-sm:w-5 max-sm:h-5 max-sm:text-xs rounded-full z-50 bg-muted cursor-grab flex items-center justify-center">
        {numberd + 1}
      </div>

      <div className="flex flex-col ml-10 w-full">
        <div
          contentEditable
          suppressContentEditableWarning
          ref={titleRef}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="scroll-m-20 border-none outline-none cursor-text break-words max-sm:text-lg text-2xl font-semibold tracking-tight"
        >
          {item.title}
        </div>
        <LexicalNestedComposer
          initialEditor={item.content}
          initialNodes={[...nestedNodes]}
        >
          <HistoryPlugin externalHistoryState={historyState} />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ImagesPlugin />
          <HorizontalRulePlugin />
          <LexicalAutoLinkPlugin />
          <LinkWithMetaDataPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <LinkWithMetaDataPlugin />
          <TabIndentationPlugin maxIndent={7} />
          <CodeHighlightPlugin />
          <LinkPlugin />
          <RichTextPlugin
            contentEditable={
              <div ref={onRef} className="relative">
                <ContentEditable
                  className="h-fit w-full resize-none cursor-text relative outline-none select-text whitespace-pre-wrap break-words"
                  aria-placeholder="Write hint caption"
                  placeholder={
                    <div className="text-base font-medium text-[#999] overflow-hidden absolute top-[2px] left-[2px]  text-nowrap inline-block text-ellipsis pointer-events-none">
                      Step content
                    </div>
                  }
                />
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {floatingAnchorElem && (
            <>
              <FloatingTextFormatToolbarPlugin
                setIsLinkEditMode={setIsLinkEditMode}
                anchorElem={floatingAnchorElem}
              />
              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            </>
          )}
          {item.content.isEditable() && <SlashCommand />}
        </LexicalNestedComposer>
      </div>

      <div
        onClick={() => insertAt(numberd + 1)}
        className="absolute max-sm:left-[2px] left-[4px] top-[35px] z-40 max-sm:w-4 max-sm:h-4 w-[20px] h-[20px] flex items-center justify-center ring-1 ring-gray-700 bg-gray-800 rounded-full cursor-pointer transition-opacity opacity-0 duration-500 group-hover:opacity-100"
      >
        <Plus className="size-[12px]" />
      </div>
    </Reorder.Item>
  );
}
