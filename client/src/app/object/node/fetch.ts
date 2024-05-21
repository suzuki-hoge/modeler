import { Node } from 'reactflow'

import { NodeData } from '@/app/object/node/type'

export function getInitialNodes(): Node<NodeData>[] {
  return [
    {
      id: 'controller',
      type: 'class',
      position: { x: 50, y: -10 },
      data: { icon: 'C', name: 'ItemController', properties: [], methods: ['apply()'] },
    },
    {
      id: 'store',
      type: 'class',
      position: { x: -150, y: 160 },
      data: { icon: 'S', name: 'ItemStore', properties: [], methods: ['findAll(): List<Item>', 'save(item: Item)'] },
    },
    {
      id: 'item',
      type: 'class',
      position: { x: 175, y: 160 },
      data: {
        icon: 'DC',
        name: 'Item',
        properties: ['t: T'],
        methods: ['get(): T', 'set(t: T)'],
      },
    },
  ]
}
