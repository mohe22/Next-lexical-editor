"use client"
import { useTheme } from "next-themes"

type Props = {
    style?:string
}

export default function Loder({style}: Props) {
    const { theme} = useTheme()
    
  return (
    <div>
    <div className={
        
        `${theme!=="dark"?"container_0123":"container_0123-dark"}`
    }>
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
        </div>
        <svg width={0} height={0} className="svg">
            <defs>
            <filter id="uib-jelly-ooze">
                <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="ooze" />
                <feBlend in="SourceGraphic" in2="ooze" />
            </filter>
            </defs>
        </svg>
    </div>

  )
};