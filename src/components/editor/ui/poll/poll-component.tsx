import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from "lexical";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useMutation } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  $isPollNode,
  createPollOption,
  Option,
  Options,
  PollNode,
} from "../../nodes/PollNode";

function getTotalVotes(options: Options): number {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length;
  }, 0);
}

function PollOptionComponent({
  option,
  index,
  options,
  totalVotes,
  withPollNode,
  isEditable,
}: {
  index: number;
  option: Option;
  options: Options;
  totalVotes: number;
  withPollNode: (
    cb: (pollNode: PollNode) => void,
    onSelect?: () => void
  ) => void;
  isEditable: boolean;
}): React.JSX.Element {
  const userId = "1212312"; // change it with user ID
  const checkboxRef = useRef(null);
  const votesArray = option.votes;
  const checkedIndex = votesArray.indexOf(userId!);
  const checked = checkedIndex !== -1;
  const votes = votesArray.length;
  const text = option.text;
  const [editor] = useLexicalComposerContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await new Promise<void>((resolve) => {
          withPollNode((node) => {
            node.toggleVote(option, userId!);
          }, resolve);
        });
        return;
        // const currentState = editor.getEditorState();
        // await updateContent(id, currentState.toJSON(), true);
      } catch (error) {
        await new Promise<void>((resolve) => {
          withPollNode((node) => {
            node.toggleVote(option, userId!);
          }, resolve);
        });
        throw error;
      }
    },
  });

  return (
    <div className="flex  flex-row items-center justify-center gap-x-2">
      <div>
        <Checkbox
          disabled={!userId}
          ref={checkboxRef}
          onCheckedChange={() => {
            mutate();
          }}
          checked={checked}
        />
      </div>
      <div className="flex  relative  overflow-hidden">
        <div
          className="h-9 overflow-hidden bg-blue-500/30 dark:bg-blue-300/50 rounded-md  absolute top-0 left-0 w-full py-2  transition-all  duration-1000"
          style={{ width: `${votes === 0 ? 0 : (votes / totalVotes) * 100}%` }}
        />
        <span className=" absolute text-xs font-bold right-2 top-1">
          {votes > 0 && (votes === 1 ? "1 vote" : `${votes} votes`)}
        </span>
        <Input
          className=" overflow-hidden ring-0 outline-none bg-transparent"
          value={text}
          disabled={!isEditable}
          onChange={(e) => {
            const target = e.target;
            const value = target.value;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            withPollNode(
              (node) => {
                node.setOptionText(option, value);
              },
              () => {
                target.selectionStart = selectionStart;
                target.selectionEnd = selectionEnd;
              }
            );
          }}
          placeholder={`Option ${index + 1}`}
        />
      </div>
      {isEditable && (
        <Button
          size={"sm"}
          variant={"ghost"}
          disabled={options.length < 3 || !isEditable || isPending}
          aria-label="Remove"
          className="mx-1"
          onClick={() => {
            withPollNode((node) => {
              node.deleteOption(option);
            });
          }}
        >
          <X />
        </Button>
      )}
    </div>
  );
}

export default function PollComponent({
  question,
  options,
  nodeKey,
}: {
  nodeKey: NodeKey;
  options: Options;
  question: string;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [internalOptions, setInternalOptions] = useState(options);
  const [version, setVersion] = useState(0);
  const totalVotes = useMemo(() => getTotalVotes(options), [options, version]);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const ref = useRef(null);
  const isEditable = useLexicalEditable();

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection();
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        deleteSelection.getNodes().forEach((node) => {
          if ($isPollNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [isSelected]
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isPollNode(node)) {
          setInternalOptions([...node.__options]);
          setVersion((v) => v + 1);
        }
      });
    });
  }, [editor, nodeKey]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, setSelected]);
  const withPollNode = (
    cb: (node: PollNode) => void,
    onUpdate?: () => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey);
          if ($isPollNode(node)) {
            cb(node);
            node.markDirty();
          }
        },
        {
          onUpdate: () => {
            onUpdate?.();
            resolve();
          },
          tag: "history-merge",
        }
      );
    });
  };

  const addOption = () => {
    withPollNode((node) => {
      node.addOption(createPollOption());
    });
  };

  const handleQuestionChange = useCallback(
    (event: any) => {
      const newQuestion = event.target.value || "";
      withPollNode((node) => {
        node.setQuestion(newQuestion);
      });
    },
    [withPollNode]
  );
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle
          suppressContentEditableWarning
          onChange={handleQuestionChange}
          contentEditable={isEditable}
        >
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className=" space-y-2">
        {options.map((option, index) => {
          const key = `${option.uid}-${option.votes.length}`;
          return (
            <PollOptionComponent
              key={key}
              withPollNode={withPollNode}
              option={option}
              index={index}
              options={options}
              totalVotes={totalVotes}
              isEditable={isEditable}
            />
          );
        })}
      </CardContent>
      {isEditable && (
        <CardFooter className="flex items-center justify-center">
          <Button disabled={!isEditable} onClick={addOption}>
            Add Option
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
