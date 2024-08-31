export interface Page {
  pageId: string
  projectId: string // fixme: remove
  name: string
}

export interface Page2 {
  pageId: string
  name: string
}

export interface ProjectPage {
  projectId: string
  projectName: string
  pageId: string
  pageName: string
}
