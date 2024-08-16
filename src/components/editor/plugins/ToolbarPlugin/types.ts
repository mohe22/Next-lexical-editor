



import { FC } from 'react';
import { Redo,Undo,Heading1,Heading2,Heading3,Pilcrow} from 'lucide-react';


type EventType = typeof eventType[keyof typeof eventType];

interface Plugin {
  id: number;
  Icon: FC;
  event: EventType;
}


export const eventType={
    redo:"redo",
    undo:"undow",
    h1:"Heading 1",
    h2:"Heading 2",
    h3:"Heading 3",
    paragraph:"paragraph",

}

const rootTypeToRootName = {
    root: 'Root',
    table: 'Table',
  };

const blockTypeToBlockName = {
    bullet: 'Bulleted List',
    list:'Bulleted List', // same as bullet
    check: 'Check List',
    code: 'Code Block',
    h1: 'Heading 1',
    "collapsible-container":"Toggle list",
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    number: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
};




export {
    rootTypeToRootName,blockTypeToBlockName,

}