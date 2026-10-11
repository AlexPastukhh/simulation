import { WorkspaceShell } from './shell/WorkspaceShell.tsx'
import { useSimulatorProfile } from './profiles/architecture-simulator/SimulatorProfile.tsx'

export default function App() {
  const profile = useSimulatorProfile()
  return <WorkspaceShell profile={profile}/>
}
