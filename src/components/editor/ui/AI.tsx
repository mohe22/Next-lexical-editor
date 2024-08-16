import ShinyButton from "@/components/magicui/shiny-button";
import { WriteAI } from "@/lib/AI";
import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";
import { MicVocal, Pencil, Sparkles, SpellCheck2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

type Props = {
  editor: LexicalEditor;
};

const types = [
  {
    key: "improve writing",
    icon: <Pencil className={"w-4 h-4 text-purple-500"} />,
    systemMessage: `
      System setting: You are a helpful AI embedded in a Blog text editor app. 
      The user is seeking assistance to enhance their writing. Provide clear, articulate, and
      well-structured suggestions to improve the quality of the text.
      Ensure that the response maintains the tone and style of the existing text while making it more polished and effective.
      Do not response with any thing more than the fixed word or paragraph

    `,
  },
  {
    key: "fix spelling",
    icon: <SpellCheck2 className={"w-4 h-4 text-purple-500"} />,
    systemMessage: `
      System setting: 
      You are a helpful AI embedded in a Blog text editor app. 
      The user is requesting assistance with spelling corrections.
      Provide accurate spelling fixes while keeping the overall tone and context of the text consistent.
      fixes the spelling in the context and response with the new fixed version
      Do not response with any thing more than the fixed word or paragraph

    `,
  },
  {
    key: "make shorter",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={"w-5 h-5 font-bold text-purple-500"}
        viewBox="0 0 24 24"
      >
        <path fill="currentColor" d="M5 14.5v-1h8v1zm0-4v-1h14v1z" />
      </svg>
    ),
    systemMessage: `
      System setting: You are a helpful AI embedded in a Blog text editor app. 
      The user wants to shorten the text. Provide concise and clear suggestions that reduce the length of the text while preserving its meaning and impact.
      Do not response with any thing more than the fixed word or paragraph

      `,
  },
  {
    key: "change tone",
    icon: <MicVocal
    className={"w-5 h-5 font-bold text-purple-500"}

    />,
    children: [
      {
        key: "Professional",
        systemMessage: `
          System setting: You are a helpful AI embedded in a Blog text editor app. 
          The user wants to change the tone of the text to Professional. Provide responses that match this tone. Ensure that the revised text aligns with the chosen tone while maintaining coherence and clarity.
          Do not respond with anything more than the fixed word or paragraph.
        `,
      },
      {
        key: "Casual",
        systemMessage: `
          System setting: You are a helpful AI embedded in a Blog text editor app. 
          The user wants to change the tone of the text to Casual. Provide responses that match this tone. Ensure that the revised text aligns with the chosen tone while maintaining coherence and clarity.
          Do not respond with anything more than the fixed word or paragraph.
        `,
      },
      {
        key: "Straightforward",
        systemMessage: `
          System setting: You are a helpful AI embedded in a Blog text editor app. 
          The user wants to change the tone of the text to Straightforward. Provide responses that match this tone. Ensure that the revised text aligns with the chosen tone while maintaining coherence and clarity.
          Do not respond with anything more than the fixed word or paragraph.
        `,
      },
      {
        key: "Confident",
        systemMessage: `
          System setting: You are a helpful AI embedded in a Blog text editor app. 
          The user wants to change the tone of the text to Confident. Provide responses that match this tone. Ensure that the revised text aligns with the chosen tone while maintaining coherence and clarity.
          Do not respond with anything more than the fixed word or paragraph.
        `,
      },
      {
        key: "Friendly",
        systemMessage: `
          System setting: You are a helpful AI embedded in a Blog text editor app. 
          The user wants to change the tone of the text to Friendly. Provide responses that match this tone. Ensure that the revised text aligns with the chosen tone while maintaining coherence and clarity.
          Do not respond with anything more than the fixed word or paragraph.
        `,
      },
    ],
  },
];

export default function AI({ editor }: Props) {
  const [isOpen,setIsOpen]=useState(false)
  const handleAskAI = async (systemMessage: string) => {
    try {
      let selectedText = "";

      editor.update(() => {
        const selection = $getSelection();
        if (selection && selection.isCollapsed()) {
          return;
        }

        if (selection) {
          selectedText = selection.getTextContent();
          return selectedText;
        }
      });

      
      

      await WriteAI(selectedText, systemMessage, (response) => {
        editor.update(() => {
          const selection = $getSelection();          
          if ($isRangeSelection(selection)) {     
                               
            selection.insertText(response);
          }
        });
      });
      setIsOpen(false)

    } catch (error) {
      console.error("Error sending content:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <ShinyButton
          className="h-[15px] gap-x-2 px-3 flex items-center justify-center flex-row"
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          Ask AI
        </ShinyButton>
      </PopoverTrigger>
      <PopoverContent className="mt-3 p-2 gap-y-1 w-full flex items-center flex-col justify-center">
        {types.map((e) => {
          if (e.key === "change tone" && e.children) {
            return (
              <Popover key={e.key} >
                <PopoverTrigger 
                    className="flex flex-row   px-4 py-2  hover:bg-accent hover:text-accent-foreground  rounded-md  text-sm font-medium   cursor-pointer w-full items-center justify-start gap-x-3 ">
                   {e.icon}
                  {e.key}
                </PopoverTrigger>
                <PopoverContent className="p-2 " side="right" sideOffset={15}>
                  {e.children.map((k) => (
                    <Button
                      onClick={() => handleAskAI(k.systemMessage)}
                      className="flex flex-row w-full items-center justify-start "
                      variant="ghost"
                      key={k.key}
                    >
                      {k.key}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            );
          } else {
            return (
              <React.Fragment key={e.key}>
                <Button
                  onClick={() => handleAskAI(e.systemMessage!)}
                  className="flex flex-row  w-full items-center justify-start gap-x-3"
                  variant={"ghost"}
                >
                  {e.icon}
                  {e.key}
                </Button>
              </React.Fragment>
            );
          }
        })}
      </PopoverContent>
    </Popover>
  );
}
