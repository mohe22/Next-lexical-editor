import LexicalEditor from "@/components/editor/LexicalEditor";
import { ModeToggle } from "@/components/shared-components/ModeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mt-5 flex flex-col h-full">
      <h1 className="text-3xl text-center font-bold">Editor</h1>
      <ModeToggle/>
      <LexicalEditor SavelocalStorage={true} loadFromLocalStorge={true}/>
    </div>
  );
}
