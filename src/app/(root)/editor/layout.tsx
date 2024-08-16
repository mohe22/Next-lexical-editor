
type Props = {
    children:React.ReactNode
}

export default function layout({children}: Props) {
  return (
    <div className=" container max-w-7xl mx-auto h-full max-sm:px-0  md:px-20 ">
        <div className="max-sm:px-2">
          
          {children}
        </div>
    </div>
  )
};