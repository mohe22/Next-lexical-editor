import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from "lexical";
import { blockTypeToBlockName, rootTypeToRootName } from "./types";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";

import DropdownMenu, { DropDownItem } from "../../ui/DropDown";
import DropDown from "../../ui/DropDown";
import { Code2, Heading1, Heading2, Heading3, List, ListOrderedIcon, Pilcrow, Quote, Redo, SquareCheck, SquareDashedBottomCode, StepForward, Undo } from 'lucide-react';
import { Coda } from "next/font/google";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";

export function BlockFormatDropDown({
  editor,
  blockType,
  ActiveBlockIcon,
  ActiveBlockName,
  rootType,
  disabled = false,
  style,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  ActiveBlockIcon:React.ReactNode,
  ActiveBlockName:keyof typeof blockTypeToBlockName | string
  disabled?: boolean;
  style?: string;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  const insertListToggle = ()=>{
    editor.dispatchCommand(
      INSERT_COLLAPSIBLE_COMMAND,
      undefined,
    )
  }
  return (
    <DropDown
      disabled={disabled}
      buttonClassName="flex flex-row  gap-x-3  items-center h-[32px]"
      buttonIconClassName={ActiveBlockIcon}
      buttonLabel={ActiveBlockName}
    >
      <DropDownItem className={"item "} onClick={formatParagraph}>
        <Pilcrow className="w-4 h-4"/>
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem onClick={() => formatHeading("h1")}>
        <Heading1 className="h-4 w-4" />
        <span className="text">Heading 1</span>
      </DropDownItem>
      <DropDownItem onClick={() => formatHeading("h2")}>
        <Heading2 className="w-4 h-4"/>
        <span className="text">Heading 2</span>
      </DropDownItem>
      <DropDownItem onClick={() => formatHeading("h3")}>
        <Heading3 className="w-4 h-4"/>
        <span className="text">Heading 3</span>
      </DropDownItem>
      <DropDownItem onClick={formatBulletList}>
        <List className="w-4 h-4"/>
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem onClick={formatNumberedList}>
        <ListOrderedIcon className="w-4 h-4"/>
        <span className="text">Numbered List</span>
      </DropDownItem>
      <DropDownItem onClick={formatCheckList}>
        <SquareCheck className="w-4 h-4" />
        <span className="text">Check List</span>
      </DropDownItem>
      <DropDownItem onClick={formatQuote}>
        <Quote className="w-4 h-4"/>
        <span className="text">Quote</span>
      </DropDownItem>
      <DropDownItem onClick={formatCode}>
        <Code2 className="w-4 h-4"/>
        <span className="text">Code Block</span>
      </DropDownItem>
      <DropDownItem
          onClick={insertListToggle}
        >
          <StepForward className="w-4 h-4"/>
          <span className="text">Toggle list</span>
      </DropDownItem>
    </DropDown>
  );
}
