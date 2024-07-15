export interface ProjectNodeData {
  iconId: string
  name: string
  properties: string[]
  methods: string[]
}

// export type PageNodeData = Record<string, never>
export interface PageNodeData {
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
