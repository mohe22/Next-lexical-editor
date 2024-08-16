
import LexicalEditor from "@/components/editor/LexicalEditor"
import { ModeToggle } from "@/components/shared-components/ModeToggle"


type Props = {
  params: {
    id: string
  }
}

export default async function page({ params }: Props) {


  return (
    <div className="mt-5 flex flex-col h-full">
      <h1 className="text-3xl text-center font-bold">Editor</h1>
      <ModeToggle/>
      <LexicalEditor SavelocalStorage={true} loadFromLocalStorge={true}/>
    </div>
  )
};