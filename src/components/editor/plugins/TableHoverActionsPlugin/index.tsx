

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {$findMatchingParent, mergeRegister} from '@lexical/utils';
import {$getNearestNodeFromDOMNode, NodeKey} from 'lexical';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';

import {useDebounce} from '../CodeActionMenuPlugin/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ToolTip from '@/providers/ToolTip';

const BUTTON_WIDTH_PX = 20;

function TableHoverActionsContainer({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isShownRow, setShownRow] = useState<boolean>(false);
  const [isShownColumn, setShownColumn] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState({});
  const codeSetRef = useRef<Set<NodeKey>>(new Set());
  const tableDOMNodeRef = useRef<HTMLElement | null>(null);
  const [isColumLimit,setIsColumLimit]=useState(false)
  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const {isOutside, tableDOMNode} = getMouseInfo(event);

      if (isOutside) {
        setShownRow(false);
        setShownColumn(false);
        return;
      }

      if (!tableDOMNode) {
        return;
      }

      tableDOMNodeRef.current = tableDOMNode;

      let hoveredRowNode: TableCellNode | null = null;
      let hoveredColumnNode: TableCellNode | null = null;
      let tableDOMElement: HTMLElement | null = null;

      editor.update(() => {
        const maybeTableCell = $getNearestNodeFromDOMNode(tableDOMNode);

        if ($isTableCellNode(maybeTableCell)) {
          const table = $findMatchingParent(maybeTableCell, (node) =>
            $isTableNode(node),
          );
          if (!$isTableNode(table)) {
            return;
          }

          tableDOMElement = editor.getElementByKey(table?.getKey());

          if (tableDOMElement) {
            const rowCount = table.getChildrenSize();
            const colCount = (
              (table as TableNode).getChildAtIndex(0) as TableRowNode
            )?.getChildrenSize();

            const rowIndex = $getTableRowIndexFromTableCellNode(maybeTableCell);
            const colIndex =
              $getTableColumnIndexFromTableCellNode(maybeTableCell);

            if (rowIndex === rowCount - 1) {
              hoveredRowNode = maybeTableCell;
            } else if (colIndex === colCount - 1) {
              hoveredColumnNode = maybeTableCell;
            }
          }
        }
      });

      if (tableDOMElement) {
        const {
          width: tableElemWidth,
          y: tableElemY,
          x: tableElemX,
          right: tableElemRight,
          bottom: tableElemBottom,
          height: tableElemHeight,
        } = (tableDOMElement as HTMLTableElement).getBoundingClientRect();

        const {y: editorElemY} = anchorElem.getBoundingClientRect();

        if (hoveredRowNode) {
          setShownColumn(false);
          setShownRow(true);
          setPosition({
            height: BUTTON_WIDTH_PX,
            left: tableElemX,
            top: tableElemBottom - editorElemY + 2,
            width: tableElemWidth,
          });
        } else if (hoveredColumnNode) {
          setShownColumn(true);
          setShownRow(false);
          setPosition({
            height: tableElemHeight,
            left: tableElemRight + 2,
            top: tableElemY - editorElemY  ,
            width: BUTTON_WIDTH_PX,
          });
        }
      }
    },
    50,
    250,
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    document.addEventListener('mousemove', debouncedOnMouseMove);

    return () => {
      setShownRow(false);
      setShownColumn(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener('mousemove', debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return mergeRegister(
      editor.registerMutationListener(
        TableNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            // @ts-ignore
            for (const [key, type] of mutations) {
              switch (type) {
                case 'created':
                  codeSetRef.current.add(key);
                  setShouldListenMouseMove(codeSetRef.current.size > 0);
                  break;

                case 'destroyed':
                  codeSetRef.current.delete(key);
                  setShouldListenMouseMove(codeSetRef.current.size > 0);
                  break;

                default:
                  break;
              }
            }
          });
        },
        {skipInitialization: false},
      ),
    );
  }, [editor]);

  const MAX_COLUMNS = 15;

  const insertAction = (insertRow: boolean) => {
   
    editor.update(() => {
      if (tableDOMNodeRef.current) {
        const maybeTableNode = $getNearestNodeFromDOMNode(tableDOMNodeRef.current);  
        if (maybeTableNode) {
          // @ts-ignore
          const colCount = (maybeTableNode.getChildAtIndex(0) as TableRowNode)?.getChildrenSize();
  
          
          // Check if column count is less than MAX_COLUMNS
          if (insertRow || colCount < MAX_COLUMNS) {
            maybeTableNode.selectEnd();
            if (insertRow) {
              $insertTableRow__EXPERIMENTAL();
              setShownRow(false);
            } else {
              $insertTableColumn__EXPERIMENTAL();
              setShownColumn(false);
            }
          } else {
            setIsColumLimit(true);
            console.log('Column limit reached:', isColumLimit);
          }
        }
      }
    });
  };
  
  
  
  

  return (
    <>
      {isShownRow && (
       <ToolTip 
        label={
          'Insert row'
        }
        side='bottom'
        
       >
          <Button
            size={"none"}
            className={"flex items-center  justify-center left-0 top-0 absolute  tableAddRows"}
            style={{...position}}
            onClick={() => insertAction(true)}
        
          >
            <Plus className='w-4 h-4'/>
          </Button>
       </ToolTip>
      )}
      {isShownColumn && (
        <ToolTip side='right' label={`${isColumLimit?" reached Columns limit":"insert Columns"}`}>
          <Button
            size={"none"}
            className={"flex items-center  justify-center left-0   top-0 absolute  tableColumns"}
            style={{...position}}
            onClick={() => insertAction(false)}
          >
            <Plus className='w-4 h-4  '/>
          </Button>
        </ToolTip>
      )}
    </>
  );
}

function getMouseInfo(event: MouseEvent): {
  tableDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  const target = event.target;

  if (target && target instanceof HTMLElement) {
    const tableDOMNode = target.closest<HTMLElement>(
      'td.PlaygroundEditorTheme__tableCell, th.PlaygroundEditorTheme__tableCell',
    );

    const isOutside = !(
      tableDOMNode ||
      target.closest<HTMLElement>(
        'button.tableAddRows',
      ) ||
      target.closest<HTMLElement>(
        'button.tableColumns',
      ) ||
      target.closest<HTMLElement>('div.TableCellResizer__resizer')
    );

    return {isOutside, tableDOMNode};
  } else {
    return {isOutside: true, tableDOMNode: null};
  }
}


export default function TableHoverActionsPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.ReactPortal | null {
  return createPortal(
    <TableHoverActionsContainer anchorElem={anchorElem} />,
    anchorElem,
  );
}
