export interface NodeData {
  icon: string
  name: string
  properties: string[]
  methods: string[]
}

export interface NodeHeader {
  id: string
  icon: string
  name: string
}

export type NodeNames = { [id: string]: string }

export interface ClassIconDef {
  name: string
  desc: string
  color: string
}

export interface NodeData2 {
  header: NodeHeader2
  properties: string[]
  methods: string[]
}

export interface NodeHeader2 {
  id: string
  icon: NodeIcon2
  name: string
}

export interface NodeIcon2 {
  preview: string
  desc: string
  color: string
}
