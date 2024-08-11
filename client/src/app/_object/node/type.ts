export interface ProjectNodeData extends Record<string, unknown> {
  iconId: string
  name: string
  properties: string[]
  methods: string[]
}

export interface PageNodeData extends Record<string, unknown> {
  modified: string
}

export interface NodeHeader {
  id: string
  iconId: string
  name: string
}

export interface NodeIcon {
  id: string
  preview: string
  desc: string
  color: string
}
