

import {LexicalEditor} from 'lexical';
import * as React from 'react';
import {useState} from 'react';

import DropDown, {DropDownItem} from '../../ui/DropDown';
import {INSERT_LAYOUT_COMMAND} from './LayoutPlugin';
import { Button } from '@/components/ui/button';
import { BetweenVerticalEnd, Columns2, Columns3, Columns4 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LAYOUTS = [
  {label: '2 columns (equal width)', value: '1fr 1fr',icon: <Columns2 className='w-5 h-5' />},
  {label: '2 columns (25% - 75%)', value: '1fr 3fr',icon:<BetweenVerticalEnd className='w-5 h-5'/>},
  {label: '3 columns (equal width)', value: '1fr 1fr 1fr',icon:<Columns3 className='w-5 h-5'/>},
  {label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr',icon:<Columns3 className='w-5 h-5'/>},
  {label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr',icon:<Columns4 className={"w-5 h-5"}/>},
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0].value);
  const buttonLabel = LAYOUTS.find((item) => item.value === layout)?.label;

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <div className='flex flex-col gap-y-2'>
       <div className='flex flex-col gap-2 items-start w-full'>
        {LAYOUTS.map(({label, value,icon}) => (
            <Button
            // bg-accent
              variant={"ghost"}
              key={value}
              className={
                cn(
                  "flex flex-row  justify-between transition-colors w-full",
                  layout ===value && "bg-accent"
                )
              }
              onClick={() => setLayout(value)}>
                {icon}
              <span className="text">{label}</span>
            </Button>
          ))}
       </div>
      <Button onClick={onClick}>Insert</Button>
    </div>
  );
}
