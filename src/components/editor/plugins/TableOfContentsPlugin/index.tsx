import type { TableOfContentsEntry } from "@lexical/react/LexicalTableOfContentsPlugin";
import type { HeadingTagType } from "@lexical/rich-text";
import type { NodeKey } from "lexical";

import "./index.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TableOfContentsPlugin as LexicalTableOfContentsPlugin } from "@lexical/react/LexicalTableOfContentsPlugin";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";

const MARGIN_ABOVE_EDITOR = 624;
const HEADING_WIDTH = 9;

function indent(tagName: HeadingTagType) {
  if (tagName === "h2") {
    return "heading2";
  } else if (tagName === "h3") {
    return "heading3";
  }
}

function isHeadingAtTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  return (
    elementYPosition >= MARGIN_ABOVE_EDITOR &&
    elementYPosition <= MARGIN_ABOVE_EDITOR + HEADING_WIDTH
  );
}
function isHeadingAboveViewport(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  return elementYPosition < MARGIN_ABOVE_EDITOR;
}
function isHeadingBelowTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0]?.y;
  return elementYPosition >= MARGIN_ABOVE_EDITOR + HEADING_WIDTH;
}

function TableOfContentsList({
  tableOfContents,
}: {
  tableOfContents: Array<TableOfContentsEntry>;
}): JSX.Element {
  const [selectedKey, setSelectedKey] = useState("");
  const selectedIndex = useRef(0);
  const [editor] = useLexicalComposerContext();
  const [showTable,setShowTable]=useState(false)
  function scrollToNode(key: NodeKey, currIndex: number) {
    editor.getEditorState().read(() => {
      const domElement = editor.getElementByKey(key);
      if (domElement !== null) {
        domElement.classList.add("ScrollToStyle");
        domElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setSelectedKey(key);
        selectedIndex.current = currIndex;
        setTimeout(() => {
          domElement.classList.remove("ScrollToStyle");
        }, 2000);
      }
    });
  }

  useEffect(() => {
    function scrollCallback() {
      if (
        tableOfContents.length > 0 &&
        selectedIndex.current < tableOfContents.length - 1
      ) {
        let currentHeading = editor.getElementByKey(
          tableOfContents[selectedIndex.current][0]
        );
        if (currentHeading !== null) {
          if (isHeadingBelowTheTopOfThePage(currentHeading)) {
            while (
              currentHeading !== null &&
              isHeadingBelowTheTopOfThePage(currentHeading) &&
              selectedIndex.current > 0
            ) {
              const prevHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current - 1][0]
              );
              if (
                prevHeading !== null &&
                (isHeadingAboveViewport(prevHeading) ||
                  isHeadingBelowTheTopOfThePage(prevHeading))
              ) {
                selectedIndex.current--;
              }
              currentHeading = prevHeading;
            }
            const prevHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(prevHeadingKey);
          } else if (isHeadingAboveViewport(currentHeading)) {
            while (
              currentHeading !== null &&
              isHeadingAboveViewport(currentHeading) &&
              selectedIndex.current < tableOfContents.length - 1
            ) {
              const nextHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current + 1][0]
              );
              if (
                nextHeading !== null &&
                (isHeadingAtTheTopOfThePage(nextHeading) ||
                  isHeadingAboveViewport(nextHeading))
              ) {
                selectedIndex.current++;
              }
              currentHeading = nextHeading;
            }
            const nextHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(nextHeadingKey);
          }
        }
      } else {
        selectedIndex.current = 0;
      }
    }

    let timerId: ReturnType<typeof setTimeout>;

    function debounceFunction(func: () => void, delay: number) {
      clearTimeout(timerId);
      timerId = setTimeout(func, delay);
    }

    function onScroll(): void {
      debounceFunction(scrollCallback, 10);
    }

    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, [tableOfContents, editor]);
  
  return (
    <div className="fixed top-[300px] right-3 group">
      <div 
        className={cn(
          "max-w-[300px] w-[300px] overflow-y-scroll gap-y-3 flex-col transition-all duration-700 cursor-pointer h-[350px] p-4",
          "hidden group-hover:flex rounded-lg border bg-popover text-popover-foreground shadow-md outline-none",
          showTable ?"block":"hidden"
        )}
        onMouseEnter={() => setShowTable(true)}
        onMouseLeave={() => setShowTable(false)}
      >
        {tableOfContents.map(([key, text, tag], index) => (
          <div 
            key={key}
            onClick={() => scrollToNode(key, index)}
            className={cn(
              "transition-colors duration-700 break-words",
              tag === "h1" ? "text-xl ml-1" : tag === "h2" ? "text-base ml-3" : "text-sm ml-9",
              selectedKey === key ? "text-blue-500":
              index === 0 ? "text-black dark:text-white" : "text-muted-foreground"
            )}
          >
            {text}
          </div>
        ))}
      </div>

      <div 
        className={cn(
          "flex flex-col justify-end items-end gap-y-3   transition-all duration-700",
          showTable ? " hidden " : "flex"
        )}
      >
        {tableOfContents.map(([key, text, tag], index) => (
          <div
            key={key}
            onClick={() => scrollToNode(key, index)}
            className={cn(
              "h-[5px] rounded-lg transition-colors duration-700 cursor-pointer",
              selectedKey === key ? "bg-[#32302C] dark:bg-[#e8e8e8] dark:shadow-2xl dark:shadow-white" : "bg-[#E3E2E0] dark:bg-[#5a5a5a]",
              tag === "h1" ? "w-[38px]" : tag === "h2" ? "w-[25px]" : "w-[15px]"
            )}
          />
        ))}
      </div>
    </div>
  );
}


export default function TableOfContentsPlugin() {
  return (
    <LexicalTableOfContentsPlugin>
      {(tableOfContents) => {
        return <TableOfContentsList tableOfContents={tableOfContents} />;
      }}
    </LexicalTableOfContentsPlugin>
  );
}







