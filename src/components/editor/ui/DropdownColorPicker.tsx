
import * as React from 'react';

import DropDown, { DropDownItem } from './DropDown';
import { backgroundColors, fontColors } from './ColorsHex';

type Props = {
  disabled?: boolean;
  buttonAriaLabel?: string;
  buttonClassName: string;
  buttonIconClassName?: React.ReactNode;
  buttonLabel?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color:string
  Onchange: (color: string, skipHistoryStack: boolean) => void;
  theme:string
};



export default function DropdownColorPicker({
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  Onchange,
  title,
  theme,
  ...rest
}: Props) {
  const Colors = title!=="font color"?backgroundColors:fontColors

  return (
    <DropDown
      {...rest}
      
      disabled={disabled}
      stopCloseOnClickSelf={stopCloseOnClickSelf}>
        <span className=' text-muted-foreground text-xs'>{title}</span>
         {Colors.map((basicColor) => (
          <DropDownItem   className=' cursor-pointer flex flex-row  my-1  px-1 py-2  justify-between' key={basicColor.name}  onClick={() => {Onchange(basicColor.var,true)}}  >
            <button
              style={{ background:`var(${basicColor.var})`,borderRadius:"10px",width: "25px", height: "25px" }}
              
            />
            <span 
              style={
                theme=="white" && title ==="font color"?{ color:`var(${basicColor.var})`}:{color:basicColor.name}
              }
              >
               {basicColor.name}
              </span>
          </DropDownItem>
          ))}
    </DropDown>
    
  );
}
