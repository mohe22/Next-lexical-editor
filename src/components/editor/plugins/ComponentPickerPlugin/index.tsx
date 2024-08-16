  import { $createCodeNode } from "@lexical/code";
  import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
  } from "@lexical/list";
  import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
  import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
  import {
    LexicalTypeaheadMenuPlugin,
    MenuOption,
    useBasicTypeaheadTriggerMatch,
  } from "@lexical/react/LexicalTypeaheadMenuPlugin";
  import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
  import { $setBlocksType } from "@lexical/selection";
  import { INSERT_TABLE_COMMAND } from "@lexical/table";
  import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    LexicalEditor,
    TextNode,
  } from "lexical";
  import { useCallback, useMemo, useState } from "react";
  import * as React from "react";
  import * as ReactDOM from "react-dom";
  import {  Code2, Columns2, Columns3, Columns4, Image, ImageIcon, ListCheck, Pilcrow, Quote, QuoteIcon, StepForward } from "lucide-react";

  import {
    Heading1,
    Heading2,
    Heading3,
    Minus,
    List,
    ListOrdered,

    Table,
  } from "lucide-react";
  import { useModal } from "../../hooks/useModal";
  import CustomModal from "@/components/ui/custom-modal";
  import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
  import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
  import { INSERT_LAYOUT_COMMAND } from "../LayoutPlugin/LayoutPlugin";
  import { cn } from "@/lib/utils";
  import { BorderBeam } from "@/components/magicui/border-beam";
  import { InsertImageDialog } from "../ImagesPlugin";

  class ComponentPickerOption extends MenuOption {
    // What shows up in the editor
    title: string;
    // Icon for display
    icon?: JSX.Element;
    // For extra searching.
    keywords: Array<string>;
    // TBD
    keyboardShortcut?: string;
    // What happens when you select this option?
    onSelect: (queryString: string) => void;
    desc?: string;
    constructor(
      title: string,
      options: {
        icon?: JSX.Element;
        keywords?: Array<string>;
        keyboardShortcut?: string;
        onSelect: (queryString: string) => void;
        desc?: string;
      }
    ) {
      super(title);
      this.title = title;
      this.keywords = options.keywords || [];
      this.icon = options.icon;
      this.keyboardShortcut = options.keyboardShortcut;
      this.onSelect = options.onSelect.bind(this);
      this.desc = options.desc; // Add this line
    }
  }

  function ComponentPickerMenuItem({
    index,
    isSelected,
    onClick,
    onMouseEnter,
    option,
  }: {
    index: number;
    isSelected: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    option: ComponentPickerOption;
  }) {
    let className = "item";
    if (isSelected) {
      className += " selected";
    }
    
    return (
      <li
        key={option.key}
        tabIndex={-1}
        className={
          cn(
            "flex flex-row cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm m-1  p-1 space-x-2 transition-all  gap-x-1",
            isSelected && "bg-accent"
          )
        }
        ref={option.setRefElement}
        role="option"
        aria-selected={isSelected}
        id={"typeahead-item-" + index}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <div className="p-3 flex items-center justify-center  bg-accent rounded-sm">
          {option.icon}
        </div>
        <div className="flex flex-col ">
          <span>{option.title}</span>
          <span className="text-sm  text-muted-foreground">{option.desc}</span>
        </div>
      </li>
    );
  }

  function getDynamicOptions(editor: LexicalEditor, queryString: string) {
    const options: Array<ComponentPickerOption> = [];

    if (queryString == null) {
      return options;
    }

    const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

    if (tableMatch !== null) {
      const rows = tableMatch[1];
      const colOptions = tableMatch[2]
        ? [tableMatch[2]]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

      options.push(
        ...colOptions.map(
          (columns) =>
            new ComponentPickerOption(`${rows}x${columns} Table`, {
              icon: <i className="icon table" />,
              keywords: ["table"],
              onSelect: () =>
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
            })
        )
      );
    }

    return options;
  }

  type ShowModal = (
    modal: React.ReactNode,
    fetchData?: () => Promise<any>
  ) => void;
  type OnClose = () => void;
  function getBaseOptions(
    editor: LexicalEditor,
    showModal: ShowModal,
    onClose: OnClose
  ) {
    return [
      new ComponentPickerOption("Paragraph", {
        icon: <Pilcrow className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          }),
        desc: "Just start writing with plain text",
      }),
      ...([1, 2, 3] as const).map(
        (n) =>
          new ComponentPickerOption(`Heading ${n}`, {
            icon: n===1?<Heading1 className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>:n===2?<Heading2 className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>:<Heading3 className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>,
            keywords: ["heading", "header", `h${n}`],
            onSelect: () =>
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createHeadingNode(`h${n}`));
                }
              }),
            desc: `${
              n == 1
                ? "Big section heading"
                : n == 2
                ? "Meduim section heading."
                : "Small section heading"
            }`,
          })
      ),
      new ComponentPickerOption("Table", {
        icon: <Table className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
        desc: "Add simple table content to your blog.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: "4",
            columns: "4",
          }),
      }),
      new ComponentPickerOption("Numbered List", {
        icon: <ListOrdered className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>,
        keywords: ["numbered list", "ordered list", "ol"],
        desc: "Create list with number",
        onSelect: () =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Bulleted List", {
        icon: <List className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>,
        keywords: ["bulleted list", "unordered list", "ul"],
        desc: "Create list with Bulleted",
        onSelect: () =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Check List", {
        icon: <ListCheck className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>,
        keywords: ["check list", "todo list"],
        desc: "Track tasks with to-do list.",

        onSelect: () =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Quote", {
        icon: <QuoteIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["block quote"],
        desc: "Capture Quote",

        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          }),
      }),
      new ComponentPickerOption("Code", {
        icon: <Code2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["javascript", "python", "js", "codeblock"],
        desc: "Add block of code.",
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          }),
      }),
      new ComponentPickerOption("Divider", {
        icon: <Minus className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ["horizontal rule", "divider", "hr"],
        desc: "Visually divide blocks",
        onSelect: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      }),
      new ComponentPickerOption('Excalidraw', {
        icon:<svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 max-sm:h-5 max-sm:w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M23.943 19.806a.2.2 0 0 0-.168-.034c-1.26-1.855-2.873-3.61-4.419-5.315l-.252-.284c-.001-.073-.067-.12-.134-.15l-.084-.084c-.05-.1-.169-.167-.286-.1c-.47.234-.907.585-1.327.919c-.554.434-1.109.87-1.63 1.354a5 5 0 0 0-.588.618c-.084.117-.017.217.084.267c-.37.368-.74.736-1.109 1.12a.2.2 0 0 0-.05.134c0 .05.033.1.067.117l.655.502v.016c.924.92 2.554 2.173 4.285 3.527c.251.201.52.402.773.602c.117.134.234.285.335.418c.05.066.169.084.236.033c.033.034.084.067.118.1a.24.24 0 0 0 .1.034a.15.15 0 0 0 .135-.066a.24.24 0 0 0 .033-.1c.017 0 .017.016.034.016a.2.2 0 0 0 .134-.05l3.058-3.327c.12-.116.014-.267 0-.267m-7.628-.134l-1.546-1.17l-.15-.1c-.035-.017-.068-.05-.102-.067l-.117-.1c.66-.66 1.33-1.308 2-1.956c-.488.484-1.463 1.906-1.261 2.373c.002 0 .018.042.067.084zm4.1 3.126l-1.277-.97a27 27 0 0 0-1.58-1.504c.69.518 1.277.97 1.361 1.053c.673.585.638.485 1.093.87l.554.4c-.074.103-.151.148-.151.151m.336.25l-.034-.016a1 1 0 0 0 .152-.117zM.588 3.476c.033.217.084.435.117.636c.201 1.103.403 2.106.772 2.858l.152.568c.05.217.134.485.219.552a67 67 0 0 0 3.578 2.942a.18.18 0 0 0 .219 0s0 .016.016.016a.15.15 0 0 0 .118.05a.2.2 0 0 0 .134-.05c1.798-1.989 3.142-3.627 4.1-4.998c.068-.066.084-.167.084-.25c.067-.067.118-.151.185-.201c.067-.067.067-.184 0-.235l-.017-.016c0-.033-.017-.084-.05-.1c-.42-.401-.722-.685-1.042-.986a94 94 0 0 1-2.352-2.273c-.017-.017-.034-.034-.067-.034c-.336-.117-1.025-.234-1.882-.385c-1.277-.216-3.008-.517-4.57-.986c0 0-.101 0-.118.017l-.05.05C.05.714.022.707 0 .718c.017.1.017.167.05.284c0 .033.068.301.068.334zm7.19 4.78l-.033.034a.036.036 0 0 1 .033-.034M6.553 2.238c.101.1.521.502.622.585c-.437-.2-1.529-.702-2.034-.869c.505.1 1.194.201 1.412.284M.79 1.403c.252.434.454 1.939.655 3.41c-.118-.469-.201-.936-.302-1.372C.992 2.673.84 1.988.638 1.386c.124 0 .152.021.152.017m-.286-.369c0-.016 0-.033-.017-.033c.085 0 .135.017.202.05c0 .006-.145-.017-.185-.017m23.17-.217c.017-.066-.336-.367-.219-.384c.253-.017.253-.401 0-.401c-.335.017-.688.1-1.008.15c-.587.117-1.192.234-1.78.367a80 80 0 0 0-3.949.937c-.403.117-.857.2-1.243.401c-.135.067-.118.2-.05.284c-.034.017-.051.017-.085.034c-.117.017-.218.034-.335.05c-.102.017-.152.1-.135.2c0 .017.017.05.017.067c-.706.936-1.496 1.923-2.353 2.976c-.84.969-1.73 1.989-2.62 3.042c-2.84 3.31-6.05 7.07-9.594 10.38a.16.16 0 0 0 0 .234c.016.016.033.033.05.033c-.05.05-.101.085-.152.134q-.05.05-.05.1a.4.4 0 0 0-.067.084c-.067.067-.067.184.017.234c.067.066.185.066.235-.017c.017-.017.017-.033.033-.033a.265.265 0 0 1 .37 0c.202.217.404.435.588.618l-.42-.35c-.067-.067-.184-.05-.234.016c-.068.066-.051.184.016.234l4.469 3.727c.034.034.067.034.118.034a.15.15 0 0 0 .117-.05l.101-.1c.017.016.05.016.067.016c.05 0 .084-.016.118-.05c6.049-6.05 10.922-10.614 16.5-14.693c.05-.033.067-.1.067-.15c.067 0 .118-.05.15-.117c1.026-3.125 1.228-5.9 1.295-7.27c0-.059.016-.038.016-.068c.017-.033.017-.05.017-.05a.98.98 0 0 0-.067-.619m-10.82 4.915c.268-.301.537-.619.806-.903c-1.73 2.273-4.603 5.767-8.67 9.929c2.773-3.059 5.562-6.218 7.864-9.026M5.14 23.466c-.016-.017-.016-.017 0-.017zm2.504-2.156c.135-.15.27-.284.42-.434c0 0 0 .016.017.016c-.224.198-.433.418-.437.418m.69-.668c.099-.1.14-.173.284-.318c.992-1.02 2.017-2.04 3.059-3.076l.016-.016c.252-.2.555-.418.824-.619a228 228 0 0 0-4.184 4.029M14.852 3.91c-.554.719-1.176 1.671-1.697 2.423c-1.646 2.374-6.94 8.174-7.057 8.274a1190 1190 0 0 1-4.839 4.597l-.1.1c-.085-.1-.085-.25.016-.334C8.652 11.966 13.19 6.133 15.021 3.576c-.05.116-.084.216-.168.334zm2.906 3.427c-.671-.386-.99-.987-.806-1.572l.05-.2a.8.8 0 0 1 .085-.167a1.9 1.9 0 0 1 .756-.703c.016 0 .033 0 .05-.016c-.017-.034-.017-.084-.017-.134c.017-.1.085-.167.202-.167c.202 0 .824.184 1.059.384c.067.05.134.117.202.184c.084.1.218.268.285.401c.034.017.067.184.118.268c.033.134.067.284.05.418c-.017.016 0 .116-.017.116a1.6 1.6 0 0 1-.218.619c-.03.03.006.012-.05.067a1.2 1.2 0 0 1-.32.334a1.49 1.49 0 0 1-1.26.234a2 2 0 0 0-.169-.066m4.37 1.403c0 .017-.017.05 0 .067c-.034 0-.05.017-.085.034a110 110 0 0 0-3.915 3.025c1.11-.986 2.218-1.989 3.378-2.975c.336-.301.571-.686.638-1.12l.168-1.003v-.033c.085-.201.404-.118.353.1c-.004-.001-.173.795-.537 1.905"/></svg>,
        keywords: ['excalidraw', 'diagram', 'drawing'],
        desc:"Write some Shapes using Excalidraw",
        onSelect: () =>
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
      }),

      new ComponentPickerOption('Image', {
        icon: <ImageIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5"  />,
        keywords: ['image', 'photo', 'picture', 'file'],
        desc:"Upload or embed with a link",
        onSelect: () =>
          showModal(
            <InsertImageDialog activeEditor={editor} onClose={onClose} />

          )
      }),
      
      new ComponentPickerOption('Collapsible', {
        icon:<StepForward  className="w-9 h-9 max-sm:h-5 max-sm:w-5"/>,    
        keywords: ['collapse', 'collapsible', 'toggle'],
        desc:"Toggles can hide and show content inside.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
      }),
      new ComponentPickerOption('2 columns', {
        icon: <Columns2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ['columns',"flex","row", 'layout', 'grid'],
        desc:"Dvide your content into 2 container.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND,'1fr 1fr')
      }),
      new ComponentPickerOption('3 columns', {
        icon: <Columns3 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ['3columns',"3","flex","row",'layout', 'grid'],
        desc:"Dvide your content into 3 container.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND,'1fr 1fr 1fr')
      }),
      new ComponentPickerOption('4 columns', {
        icon: <Columns4 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
        keywords: ['4columns',"4","flex","row",'layout', 'grid'],
        desc:"Dvide your content into 4 container.",
        onSelect: () =>
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND,'1fr 1fr 1fr 1fr')
      }),
    ];
  }

  export default function ComponentPickerMenuPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const { isOpen, setClose, setOpen } = useModal();
    const [queryString, setQueryString] = useState<string | null>(null);

    const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
      minLength: 0,
    });

    const options = useMemo(() => {
      const baseOptions = getBaseOptions(editor, setOpen, setClose);

      if (!queryString) {
        return baseOptions;
      }

      const regex = new RegExp(queryString, "i");

      return [
        ...getDynamicOptions(editor, queryString),
        ...baseOptions.filter(
          (option) =>
            regex.test(option.title) ||
            option.keywords.some((keyword) => regex.test(keyword))
        ),
      ];
    }, [editor, queryString, setOpen,setClose]);

    const onSelectOption = useCallback(
      (
        selectedOption: ComponentPickerOption,
        nodeToRemove: TextNode | null,
        closeMenu: () => void,
        matchingString: string
      ) => {
        editor.update(() => {
          nodeToRemove?.remove();
          selectedOption.onSelect(matchingString);
          closeMenu();
        });
      },
      [editor]
    );

    return (
      <>
        <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
          onQueryChange={setQueryString}
          onSelectOption={onSelectOption}
          triggerFn={checkForTriggerMatch}
          options={options}
          menuRenderFn={(
            anchorElementRef,
            { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
          ) =>
            anchorElementRef.current && options.length
              ? ReactDOM.createPortal(
                  <div
                    className={`z-50 w-72  max-h-[550px] h-fit overflow-y-scroll rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in 
                    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 
                    data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 
                    data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
                    `}
                  >
                    <ul className=" relative rounded-lg">
                      {options.map((option, i: number) => (
                        <ComponentPickerMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          key={option.key}
                          option={option}
                        />
                      ))}
                    <BorderBeam size={400} duration={30} delay={2} />

                    </ul>

                  </div>,
                  anchorElementRef.current
                )
              : null
          }
        />
      </>
    );
  }
