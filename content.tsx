import type { PlasmoCSConfig } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"
import { useEffect } from "react"
import hljs from "highlight.js"
import { Code2 } from "lucide-react"

import stackoverflowDark from "data-text:highlight.js/styles/stackoverflow-dark.css"
import stackoverflowLight from "data-text:highlight.js/styles/stackoverflow-light.css"
import githubDark from "data-text:highlight.js/styles/github-dark.css"
import githubLight from "data-text:highlight.js/styles/github.css"
import atomOneDark from "data-text:highlight.js/styles/atom-one-dark.css"

import tailwindCss from "data-text:./style.css"

const themeMap: Record<string, string> = {
  "stackoverflow-dark.css": stackoverflowDark,
  "stackoverflow-light.css": stackoverflowLight,
  "github-dark.css": githubDark,
  "github.css": githubLight,
  "atom-one-dark.css": atomOneDark
}

export const config: PlasmoCSConfig = {
  matches: ["https://v.flomoapp.com/*", "https://flomoapp.com/*"],
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = tailwindCss
  return style
}

function highlightCodeBlocks() {
  const memos = document.getElementsByClassName("richText")
  const memos_array = Array.from(memos)

  memos_array.forEach((memo) => {
    let children = memo.children
    const memo_p_array = Array.from(children)
    let languageFlag = false
    let codeContentArr: string[] = []
    let languageType = ""

    for (let i = 0; i < memo_p_array.length; i++) {
      const pNode = memo_p_array[i]
      const innerHTML = pNode.innerHTML

      if (innerHTML.startsWith("```") && innerHTML.substring(3) !== "") {
        languageType = "language-" + innerHTML.substring(3).trim()
        languageFlag = true
        if (memo.contains(pNode)) memo.removeChild(pNode)
        continue
      } else if (innerHTML.startsWith("```") && innerHTML.substring(3) === "") {
        languageFlag = false
        const codeForCopy = [...codeContentArr]

        let pre = document.createElement("pre")
        let code = document.createElement("code")
        code.innerHTML = codeContentArr.join("\n")
        if (languageType) code.className = languageType

        let wrapper = document.createElement("div")
        wrapper.style.position = "relative"
        wrapper.style.margin = "10px 0"
        wrapper.style.borderRadius = "8px"
        wrapper.style.overflow = "hidden"
        wrapper.style.border = "1px solid rgba(136, 148, 168, 0.2)"

        let copyBtn = document.createElement("button")
        copyBtn.innerHTML = "Copy"
        copyBtn.style.position = "absolute"
        copyBtn.style.top = "8px"
        copyBtn.style.right = "8px"
        copyBtn.style.fontSize = "12px"
        copyBtn.style.padding = "4px 8px"
        copyBtn.style.background = "#0f172a" // slate-900
        copyBtn.style.color = "#f8fafc" // slate-50
        copyBtn.style.border = "1px solid #334155" // slate-700
        copyBtn.style.borderRadius = "4px"
        copyBtn.style.cursor = "pointer"
        copyBtn.style.transition = "all 0.2s ease"

        // Handlers for hover effects to make it feel premium
        copyBtn.onmouseenter = () => {
          copyBtn.style.background = "#1e293b" // slate-800
        }
        copyBtn.onmouseleave = () => {
          copyBtn.style.background = "#0f172a"
        }

        copyBtn.addEventListener("click", function (e) {
          e.stopPropagation()
          const tempElement = document.createElement("div")
          let decodedContent = codeForCopy.map(c => {
            tempElement.innerHTML = c
            return tempElement.textContent || tempElement.innerText
          })
          navigator.clipboard.writeText(decodedContent.join("\n")).then(() => {
            copyBtn.innerHTML = "Copied!"
            copyBtn.style.color = "#34d399" // emerald-400
            setTimeout(() => { 
              copyBtn.innerHTML = "Copy" 
              copyBtn.style.color = "#f8fafc"
            }, 1500)
          })
        })

        pre.appendChild(code)
        wrapper.appendChild(pre)
        wrapper.appendChild(copyBtn)

        pNode.innerHTML = ""
        pNode.appendChild(wrapper)

        codeContentArr = []
        languageType = ""
        continue
      } else {
        if (languageFlag) {
          let content = innerHTML
          const tempDiv = document.createElement("div")
          tempDiv.innerHTML = content
          const links = tempDiv.querySelectorAll("a")
          links.forEach((link) => {
            const href = link.getAttribute("href")
            if (href) {
              const textNode = document.createTextNode(href)
              link.parentNode?.replaceChild(textNode, link)
            }
          })
          codeContentArr.push(tempDiv.innerHTML)
          if (memo.contains(pNode)) memo.removeChild(pNode)
        }
      }
    }
  })
  hljs.highlightAll()
}

export default function FlomoCodeOverlay() {
  const [theme] = useStorage("chooseTheme", "stackoverflow-dark.css")

  // Sync theme
  useEffect(() => {
    if (!theme) return
    const cssText = themeMap[theme] || themeMap["stackoverflow-dark.css"]
    let styleEl = document.getElementById("flomo-code-theme")
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "flomo-code-theme"
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = cssText
  }, [theme])

  // Listen for message from background layer & Initial Highlight
  useEffect(() => {
    setTimeout(() => {
      highlightCodeBlocks()
    }, 1000) // initial attempt

    const listener = (request: any, sender: any, sendResponse: any) => {
      if (request.action === "highlightCode") {
        setTimeout(highlightCodeBlocks, 300) // slight delay to ensure DOM is updated
        sendResponse({ status: "OK" })
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  return null
}
