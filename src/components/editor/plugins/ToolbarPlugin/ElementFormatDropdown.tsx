import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import { Separator } from "@/components/ui/separator";
import React, { forwardRef } from "react";
const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: React.ReactNode;
    iconRTL: React.ReactNode;
    name: string;
  };
} = {
  center: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 256 256"
      >
        <path
          fill="currentColor"
          d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m32 32a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16Zm152 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m-24 40H64a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 256 256"
      >
        <path
          fill="currentColor"
          d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m32 32a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16Zm152 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m-24 40H64a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16"
        />
      </svg>
    ),
    name: "Center Align",
  },
  end: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M5 6a1 1 0 0 1 1-1h15a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1m4 12a1 1 0 0 1 1-1h11a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1m-6-7a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M5 6a1 1 0 0 1 1-1h15a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1m4 12a1 1 0 0 1 1-1h11a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1m-6-7a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z"
        />
      </svg>
    ),
    name: "End Align",
  },
  justify: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M6 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6z"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M6 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6z"
        />
      </svg>
    ),
    name: "Justify Align",
  },
  left: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M3 21v-2h18v2zm0-4v-2h12v2zm0-4v-2h18v2zm0-4V7h12v2zm0-4V3h18v2z"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M3 21v-2h18v2zm0-4v-2h12v2zm0-4v-2h18v2zm0-4V7h12v2zm0-4V3h18v2z"
        />
      </svg>
    ),
    name: "Left Align",
  },
  right: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M3 5V3h18v2zm6 4V7h12v2zm-6 4v-2h18v2zm6 4v-2h12v2zm-6 4v-2h18v2z"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M3 5V3h18v2zm6 4V7h12v2zm-6 4v-2h18v2zm6 4v-2h12v2zm-6 4v-2h18v2z"
        />
      </svg>
    ),
    name: "Right Align",
  },
  start: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 14 14"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 1H5m8.5 3H.5m13 3H.5m9 6h-9m13-3H.5"
        />
      </svg>
    ),
    iconRTL: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 14 14"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 1H5m8.5 3H.5m13 3H.5m9 6h-9m13-3H.5"
        />
      </svg>
    ),
    name: "Start Align",
  },
};

















const ElementFormatDropdown = forwardRef(({ editor, value, isRTL, disabled = false }:{  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;}, ref) =>   {
  
  
  
    const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  return (
    <div className="flex flex-row items-center ">
      <Separator orientation={"horizontal"} className="h-[32px] mx-2 w-[1px]" />
      <DropDown
        disabled={disabled}
        buttonLabel={formatOption.name}
        buttonIconClassName={isRTL ? formatOption.iconRTL : formatOption.icon}
        buttonClassName={"h-[32px] gap-x-2   "}
      >
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M3 21v-2h18v2zm0-4v-2h12v2zm0-4v-2h18v2zm0-4V7h12v2zm0-4V3h18v2z"
            />
          </svg>
          <span className="text">Left Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m32 32a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16Zm152 40H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16m-24 40H64a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16"
            />
          </svg>
          <span className="text">Center Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M3 5V3h18v2zm6 4V7h12v2zm-6 4v-2h18v2zm6 4v-2h12v2zm-6 4v-2h18v2z"
            />
          </svg>
          <span className="text">Right Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 32 32"
          >
            <path
              fill="currentColor"
              d="M6 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6zm0 6h20v2H6z"
            />
          </svg>
          <span className="text">Justify Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 14 14"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13.5 1H5m8.5 3H.5m13 3H.5m9 6h-9m13-3H.5"
            />
          </svg>
          <span className="text">Start Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M5 6a1 1 0 0 1 1-1h15a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1m4 12a1 1 0 0 1 1-1h11a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1m-6-7a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2z"
            />
          </svg>
          <span className="text">End Align</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="M224 128a8 8 0 0 1-8 8H112a8 8 0 0 1 0-16h104a8 8 0 0 1 8 8M112 72h104a8 8 0 0 0 0-16H112a8 8 0 0 0 0 16m104 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16M72 144a8 8 0 0 0 5.66-13.66L43.31 96l34.35-34.34a8 8 0 0 0-11.32-11.32l-40 40a8 8 0 0 0 0 11.32l40 40A8 8 0 0 0 72 144"
            />
          </svg>
          <span className="text">Outdent</span>
        </DropDownItem>
        <DropDownItem
          onClick={() => {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
          }}
          className="item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 256 256"
          >
            <path
              fill="currentColor"
              d="M224 128a8 8 0 0 1-8 8H112a8 8 0 0 1 0-16h104a8 8 0 0 1 8 8M112 72h104a8 8 0 0 0 0-16H112a8 8 0 0 0 0 16m104 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16M34.34 141.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0 0-11.32l-40-40a8 8 0 0 0-11.32 11.32L68.69 96l-34.35 34.34a8 8 0 0 0 0 11.32"
            />
          </svg>
          <span className="text">Indent</span>
        </DropDownItem>
      </DropDown>
    
    </div>
  );
})
ElementFormatDropdown.displayName = "ElementFormatDropdown";

export default ElementFormatDropdown;



