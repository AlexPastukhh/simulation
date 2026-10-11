import { useEffect, useState } from 'react'
import { WorkspaceShell } from './shell/WorkspaceShell.tsx'
import { useSimulatorProfile } from './profiles/architecture-simulator/SimulatorProfile.tsx'
import { useMarkdownProfile } from './profiles/markdown-fixture/MarkdownProfile.tsx'

const MODE_KEY='pt006-workspace-mode-v1'
type AppMode='legacy'|'contexts'|'markdown'
export default function App() {
  const architecture=useSimulatorProfile()
  const markdown=useMarkdownProfile()
  const [mode,setMode]=useState<AppMode>(()=>{try {
    const saved=localStorage.getItem(MODE_KEY)
    return saved==='contexts'||saved==='markdown'?saved:'legacy'
  }catch{return 'legacy'}})
  useEffect(()=>{localStorage.setItem(MODE_KEY,mode)},[mode])
  const current=mode==='markdown'?markdown:mode==='contexts'?architecture.shared:architecture
  return <WorkspaceShell key={mode} profile={{...current,
    renderHeader:()=> <>
      {mode==='markdown'
        ?<button className="header-btn workspace-mode-switch" onClick={()=>setMode('contexts')}>← Architecture Workspace</button>
        :<button className="header-btn workspace-mode-switch" onClick={()=>setMode(mode==='contexts'?'legacy':'contexts')}>
          {mode==='contexts'?'← Отдельные A/B раскладки':'⊞ Общий Workspace'}
        </button>}
      <button className="header-btn markdown-profile-switch" onClick={()=>setMode(mode==='markdown'?'contexts':'markdown')}>
        {mode==='markdown'?'← Симулятор':'▤ Markdown Profile'}
      </button>
      {current.renderHeader()}
    </>,
  }}/>
}