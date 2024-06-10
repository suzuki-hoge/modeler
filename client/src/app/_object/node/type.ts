export interface NodeData {
  iconId: string
  name: string
  properties: string[]
  methods: string[]
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
