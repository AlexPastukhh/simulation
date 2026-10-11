import { useEffect, useState } from 'react'
import { WorkspaceShell } from './shell/WorkspaceShell.tsx'
import { useSimulatorProfile } from './profiles/architecture-simulator/SimulatorProfile.tsx'

const MODE_KEY='pt006-workspace-mode-v1'
export default function App() {
  const profile=useSimulatorProfile()
  const [mode,setMode]=useState<'legacy'|'contexts'>(()=>{try{return localStorage.getItem(MODE_KEY)==='contexts'?'contexts':'legacy'}catch{return 'legacy'}})
  useEffect(()=>{localStorage.setItem(MODE_KEY,mode)},[mode])
  const current=mode==='contexts'?profile.shared:profile
  return <WorkspaceShell key={mode} profile={{...current,
    renderHeader:()=> <>
      <button className="header-btn workspace-mode-switch" onClick={()=>setMode(mode==='contexts'?'legacy':'contexts')}>
        {mode==='contexts'?'← Отдельные A/B раскладки':'⊞ Общий Workspace'}
      </button>
      {current.renderHeader()}
    </>,
  }}/>
}
