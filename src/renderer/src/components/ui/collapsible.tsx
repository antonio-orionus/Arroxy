import type {ReactNode} from 'react'
import {Collapsible as CollapsiblePrimitive} from '@base-ui/react/collapsible'

function Collapsible({...props}: CollapsiblePrimitive.Root.Props): ReactNode {
	return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({...props}: CollapsiblePrimitive.Trigger.Props): ReactNode {
	return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({...props}: CollapsiblePrimitive.Panel.Props): ReactNode {
	return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
}

export {Collapsible, CollapsibleTrigger, CollapsibleContent}
