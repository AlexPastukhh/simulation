import type {MechanicDefinition} from '../../../../../../../shell/mechanics/contracts.ts'
export const EXPLORER_SELECTION: MechanicDefinition = {
 id:'single-architecture.explorer-selection',kind:'scope',title:'Explorer → выбранный объект',
 description:'Локальный выбор одного объекта и его связей. В каждом окне собственный state; при смене вида state сбрасывается.',
 level:'view',effects:['view.local-filter'],
 sources:[{module:'src/profiles/single-architecture/MaterialViews.tsx',symbol:'MaterialView'}],
 bindings:[{module:'src/profiles/single-architecture/MaterialViews.tsx',calls:['setTarget']}],
}
