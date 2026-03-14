import { useStorage } from "@plasmohq/storage/hook"
import { useEffect, useRef } from "react"
import hljs from "highlight.js"
import "./style.css"

import stackoverflowDark from "data-text:highlight.js/styles/stackoverflow-dark.css"
import stackoverflowLight from "data-text:highlight.js/styles/stackoverflow-light.css"
import githubDark from "data-text:highlight.js/styles/github-dark.css"
import githubLight from "data-text:highlight.js/styles/github.css"
import atomOneDark from "data-text:highlight.js/styles/atom-one-dark.css"

const themeMap: Record<string, string> = {
  "stackoverflow-dark.css": stackoverflowDark,
  "stackoverflow-light.css": stackoverflowLight,
  "github-dark.css": githubDark,
  "github.css": githubLight,
  "atom-one-dark.css": atomOneDark
}

function IndexPopup() {
  const [theme, setTheme] = useStorage("chooseTheme", "stackoverflow-dark.css")
  const codeRef = useRef<HTMLElement>(null)

  // Inject chosen theme into popup style
  useEffect(() => {
    if (!theme) return
    const cssText = themeMap[theme] || themeMap["stackoverflow-dark.css"]
    let styleEl = document.getElementById("flomo-code-theme-popup")
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = "flomo-code-theme-popup"
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = cssText
  }, [theme])

  // Apply highlight to the preview block on render
  useEffect(() => {
    if (codeRef.current) {
      // We must reset the DOM in case highlight.js already ran
      codeRef.current.removeAttribute("data-highlighted")
      codeRef.current.className = "language-javascript"
      hljs.highlightElement(codeRef.current)
    }
  }, [theme])

  return (
    <div className="w-80 p-5 bg-slate-900 text-slate-100 font-sans shadow-2xl flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <img src="../assets/icon.png" className="w-8 h-8 rounded-lg shadow-sm" alt="Flomo Code Logo" />
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Flomo Code
          </h1>
          <p className="text-xs text-slate-400">Syntax Highlight for Flomo</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-300">Theme Preference</label>
        <select 
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
        >
          <option value="stackoverflow-dark.css">StackOverflow Dark</option>
          <option value="stackoverflow-light.css">StackOverflow Light</option>
          <option value="github-dark.css">GitHub Dark</option>
          <option value="github.css">GitHub Light</option>
          <option value="atom-one-dark.css">Atom One Dark</option>
        </select>
      </div>

      <div className="mt-2 p-3 bg-slate-800 rounded border border-slate-700 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-xs text-slate-400 mb-2">Code Preview:</p>
        {/* Do not hardcode bg, let highlight.js theme dictate it by rendering simply <pre><code/></pre> */}
        <pre className="text-xs font-mono rounded overflow-hidden">
          <code ref={codeRef} className="language-javascript">
{`// Your Flomo code here
function helloFlomo() {
  console.log("Syntax is highlighted!");
  return true;
}`}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default IndexPopup
