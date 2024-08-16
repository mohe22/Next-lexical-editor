"use client"

import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ModeToggle({showLabel}:{showLabel?:boolean}) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const [isClient, setIsClient] = React.useState(false)
 
  React.useEffect(() => {
    setIsClient(true)
  }, [])


  if(!isClient) return null
 

  return (
    // text-3xl 
      <div onClick={toggleTheme} className={
        cn("select-none cursor-pointer ml-2 flex items-center justify-between w-full",showLabel?"text-2xl ml-0":"text-3xl")
      }>
        {
          showLabel&& showLabel &&(
            <span className="text-base dark:text-white text-black">
              {theme === "light"?"light":"dark"}
            </span>
          )
        }
        {theme === "light" ? (
          <div  role="img" aria-label="sun">
            🌞
          </div>
        ) : (
          <div role="img" aria-label="moon">
            🌚
          </div>
        )}
      </div>
  );
}