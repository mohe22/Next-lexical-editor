import { $patchStyleText } from "@lexical/selection";
import { $getSelection, LexicalEditor } from "lexical";
import { useCallback } from "react";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import { Separator } from "@/components/ui/separator";

type Props = {
    editor: LexicalEditor;
    value: string;
    style?: "font-family";
    disabled?: boolean;
}

const FONT_FAMILY_OPTIONS: [string, string][] = [
    ['Arial', 'Arial'],
    ['Courier New', 'Courier New'],
    ['Georgia', 'Georgia'],
    ['Times New Roman', 'Times New Roman'],
    ['Trebuchet MS', 'Trebuchet MS'],
    ['Verdana', 'Verdana'],
    ['Roboto', 'Roboto'],         
    ['Lobster', 'Lobster'],       
    ['Open Sans', 'Open Sans'],   
  ];
  
const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],

];
  


export default function FontDropDown({ editor,value,style="font-family",disabled = false,}: Props) {
  const handleClick = useCallback(
      (option: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, {
              [style]: option,
            });
          }
        });
      },
      [editor, style],
  );
    
      
  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

          
      return (
        <div className="flex flex-row items-center ">
          <Separator
            orientation="vertical"
            className="w-[1px]  h-[30px] mx-2"
          />
          <DropDown
          
            disabled={disabled}
            buttonClassName="flex flex-row  gap-x-3  items-center h-[32px]"
            buttonLabel={value}          
            LabeClassName={
              style === 'font-family' ? 'icon block-type max-sm:hidden  font-family' : 'max-sm:hidden'
            }

            buttonIconClassName={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" ><path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479L12.258 3z"/></svg>
            }
            buttonAriaLabel={buttonAriaLabel}>
            {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
              ([option, text]) => (
                <DropDownItem
                
                  onClick={() => handleClick(option)}
                  key={option}>
                  <span style={{ fontFamily: option }}>{option}</span>
                </DropDownItem>
              ),
            )}
          </DropDown>
          <Separator
            orientation="vertical"
            className="w-[1px]  h-[32px] mx-2"
          />
        </div>
      );
};
