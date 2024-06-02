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
