import {WorkspaceShell} from './shell/WorkspaceShell.tsx'
import {useSingleArchitectureProfile} from './profiles/single-architecture/SingleArchitectureProfile.tsx'
export default function App(){
  const profile=useSingleArchitectureProfile()
  return <WorkspaceShell profile={profile}/>
}
