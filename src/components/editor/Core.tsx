import React, { useCallback, useState } from "react";
import { useSharedHistoryContext } from "../providers/SharedHistoryContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import PollPlugin from "./plugins/PollPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkWithMetaDataPlugin } from "./plugins/LinkWithMetaData";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import HintPlugin from "./nodes/Hint";
import { LexicalOnChangePlugin } from "./lexical-on-change";
import StepperPlugin from "./nodes/Stepper";
const SlashCommand = dynamic(
  () => import("@/components/editor/plugins/SlashCommand"),
  { ssr: false }
);
const ToolbarPlugin = dynamic(
  () => import("@/components/editor/plugins/ToolbarPlugin"),
  {
    ssr: false,
    loading: () => <Skeleton className=" h-9 w-full  mt-8" />,
  }
);
const FloatingLinkEditorPlugin = dynamic(
  () => import("@/components/editor/plugins/FloatingLinkEditorPlugin"),
  { ssr: false }
);
const TableCellActionMenuPlugin = dynamic(
  () => import("@/components/editor/plugins/TableCellActionMenuPlugin"),
  { ssr: false }
);
const TableHoverActionsPlugin = dynamic(
  () => import("@/components/editor/plugins/TableHoverActionsPlugin"),
  { ssr: false }
);
const CodeActionMenuPlugin = dynamic(
  () => import("@/components/editor/plugins/CodeActionMenuPlugin"),
  { ssr: false }
);
const FloatingTextFormatToolbarPlugin = dynamic(
  () => import("@/components/editor/plugins/FloatingTextFormatToolbarPlugin"),
  { ssr: false }
);
export default function Core() {
  const { historyState } = useSharedHistoryContext();
  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  return (
    <>
      {isEditable && (
        <ToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}

      <RichTextPlugin
        contentEditable={
          <div ref={onRef} className="relative">
            <ContentEditable
              id="lexical-editor"
              autoFocus
              className="-z-1 z-20 h-screen  p-1 mt-[80px] outline-none border-0 "
            />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <AutoFocusPlugin defaultSelection={"rootStart"} />
      <ClearEditorPlugin />
      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <LexicalOnChangePlugin />
      <LinkPlugin />
      <HorizontalRulePlugin />
      <TabFocusPlugin />
      <PollPlugin />
      <TableCellResizerPlugin />
      <LayoutPlugin />
      <CollapsiblePlugin />
      <CodeHighlightPlugin />
      <DragDropPaste />
      <TabIndentationPlugin maxIndent={7} />
      <LexicalAutoLinkPlugin />
      <LinkWithMetaDataPlugin />
      <ListPlugin />
      <LinkPlugin />
      <StepperPlugin />
      <TwitterPlugin />
      <CheckListPlugin />
      <ImagesPlugin />
      <AutoEmbedPlugin />
      <HintPlugin />
      <YouTubePlugin />
      <HistoryPlugin externalHistoryState={historyState} />
      <MarkdownShortcutPlugin />
      <ClickableLinkPlugin disabled={isEditable} />
      <TablePlugin
        hasCellMerge={true}
        hasCellBackgroundColor={true}
        hasHorizontalScroll={true}
      />

      {floatingAnchorElem && isEditable && (
        <>
          <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
          <FloatingTextFormatToolbarPlugin
            setIsLinkEditMode={setIsLinkEditMode}
            anchorElem={floatingAnchorElem}
          />
          <TableCellActionMenuPlugin
            anchorElem={floatingAnchorElem}
            cellMerge={true}
          />
          <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />

          <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
        </>
      )}

      {isEditable && <SlashCommand />}
    </>
  );
}
