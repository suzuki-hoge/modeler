import { Node } from 'reactflow'

import { ProjectNodeData } from '@/app/_object/node/type'

export function getInitialNodes(): Node<ProjectNodeData>[] {
  return [
    {
      id: 'controller',
      type: 'class',
      position: { x: 50, y: -180 },
      data: {
        iconId: 'controller',
        name: 'ItemController',
        properties: [],
        methods: ['apply()'],
      },
    },
    {
      id: 'usecase',
      type: 'class',
      position: { x: 50, y: -10 },
      data: {
        iconId: 'usecase',
        name: 'ItemUseCase',
        properties: [],
        methods: ['create(): ref#item#'],
      },
    },
    {
      id: 'store',
      type: 'class',
      position: { x: -150, y: 160 },
      data: {
        iconId: 'store',
        name: 'ItemStore',
        properties: [],
        methods: ['findAll(): List<ref#item#>', 'save(item: ref#item#)'],
      },
    },
    {
      id: 'item',
      type: 'class',
      position: { x: 175, y: 160 },
      data: {
        iconId: 'data',
        name: 'Item',
        properties: ['t: T'],
        methods: ['get(): T', 'set(t: T)'],
      },
    },
  ]
}
