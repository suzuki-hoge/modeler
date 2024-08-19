/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| change text ( create )                 | create       | create                 |            |                        |
| change text ( select )                 |              | if not self && missing |            |                        |
| change text in reflect mode ( create ) | create       | create                 | add        | add                    |
| change text in reflect mode ( select ) |              | if not self && missing | if missing | if not self && missing |
| click pane ( create )                  | create       |                        | add        |                        |
| click pane ( select )                  |              |                        | if missing |                        |
| drag pane ( create )                   | create       | create                 | add        | add                    |
| drag pane ( select )                   |              | if not self && missing | if missing | if not self && missing |
 */

import { XYPosition, Node } from '@xyflow/react'

import { allocateEdgeId, createProjectEdge, extractPageEdge } from '@/app/_object/edge/function'
import { allocateNodeId, createProjectNode, expandToPageNode, extractPageNode } from '@/app/_object/node/function'
import { NodeHeader, ProjectNodeData } from '@/app/_object/node/type'
import { PageSocket } from '@/app/_socket/page-socket'
import { ProjectSocket } from '@/app/_socket/project-socket'
import { PageStore } from '@/app/_store/page-store'
import { ProjectStore } from '@/app/_store/project-store'

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| change text ( create )                 | create       | create                 |            |                        |
*/
export function changeTextOnCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  name: string,
  sourceNodeId: string,
): Node<ProjectNodeData> {
  // create project node
  const projectNode = createProjectNode(allocateNodeId(), name)
  projectStore.createNode(projectNode)
  projectSocket.createNode(projectNode)

  // create project edge
  const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, projectNode.id, 'simple', '1')
  projectStore.createEdge(projectEdge)
  projectSocket.createEdge(projectEdge)

  return projectNode
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| change text ( select )                 |              | if not self && missing |            |                        |
*/
export function changeTextOnSelect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  header: NodeHeader,
  sourceNodeId: string,
) {
  // create project edge ( if not self && missing )
  if (sourceNodeId !== header.id && !projectStore.findEdge(sourceNodeId, header.id)) {
    const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, header.id, 'simple', '1')
    projectStore.createEdge(projectEdge)
    projectSocket.createEdge(projectEdge)
  }
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| change text in reflect mode ( create ) | create       | create                 | add        | add                    |
*/
export function changeTextInReflectModeOnCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  name: string,
  sourceNodeId: string,
  position: XYPosition,
): Node<ProjectNodeData> {
  // create project node
  const projectNode = createProjectNode(allocateNodeId(), name)
  projectStore.createNode(projectNode)
  projectSocket.createNode(projectNode)

  // create project edge
  const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, projectNode.id, 'simple', '1')
  projectStore.createEdge(projectEdge)
  projectSocket.createEdge(projectEdge)

  // add page node
  const pageNode = extractPageNode(projectNode, position)
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)

  // add page edge
  const pageEdge = extractPageEdge(projectEdge)
  pageStore.addEdge(pageEdge)
  pageSocket.addEdge(pageEdge)

  return projectNode
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| change text in reflect mode ( select ) |              | if not self && missing | if missing | if not self && missing |
*/
export function changeTextInReflectModeOnSelect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  header: NodeHeader,
  sourceNodeId: string,
  position: XYPosition,
) {
  // create project edge ( if not self && missing )
  if (sourceNodeId !== header.id && !projectStore.findEdge(sourceNodeId, header.id)) {
    const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, header.id, 'simple', '1')
    projectStore.createEdge(projectEdge)
    projectSocket.createEdge(projectEdge)
  }

  // add page node ( if missing )
  if (!pageStore.isNodeExists(header.id)) {
    const pageNode = expandToPageNode(header, position)
    pageStore.addNode(pageNode)
    pageSocket.addNode(pageNode)
  }

  // add page edge ( if not self && missing )
  const projectEdge = projectStore.findEdge(sourceNodeId, header.id)
  if (projectEdge && sourceNodeId !== header.id && !pageStore.isEdgeExists(projectEdge.id)) {
    const pageEdge = extractPageEdge(projectEdge)
    pageStore.addEdge(pageEdge)
    pageSocket.addEdge(pageEdge)
  }
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| click pane ( create )                  | create       |                        | add        |                        |
*/
export function clickPaneOnCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  name: string,
  position: XYPosition,
) {
  // create project node
  const projectNode = createProjectNode(allocateNodeId(), name)
  projectStore.createNode(projectNode)
  projectSocket.createNode(projectNode)

  // add page node
  const pageNode = extractPageNode(projectNode, position)
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| click pane ( select )                  |              |                        | if missing |                        |
*/
export function clickPaneOnSelect(
  pageStore: PageStore,
  pageSocket: PageSocket,
  header: NodeHeader,
  position: XYPosition,
) {
  // add page node ( if missing )
  if (!pageStore.isNodeExists(header.id)) {
    const pageNode = expandToPageNode(header, position)
    pageStore.addNode(pageNode)
    pageSocket.addNode(pageNode)
  }
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| drag pane ( create )                   | create       | create                 | add        | add                    |
*/
export function dragPaneOnCreate(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  name: string,
  sourceNodeId: string,
  position: XYPosition,
) {
  // create project node
  const projectNode = createProjectNode(allocateNodeId(), name)
  projectStore.createNode(projectNode)
  projectSocket.createNode(projectNode)

  // create project edge
  const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, projectNode.id, 'simple', '1')
  projectStore.createEdge(projectEdge)
  projectSocket.createEdge(projectEdge)

  // add page node
  const pageNode = extractPageNode(projectNode, position)
  pageStore.addNode(pageNode)
  pageSocket.addNode(pageNode)

  // add page edge
  const pageEdge = extractPageEdge(projectEdge)
  pageStore.addEdge(pageEdge)
  pageSocket.addEdge(pageEdge)
}

/*
|                                        | project node | project edge           | page node  | page edge              |
|----------------------------------------|--------------|------------------------|------------|------------------------|
| drag pane ( select )                   |              | if not self && missing | if missing | if not self && missing |
*/
export function dragPaneOnSelect(
  projectStore: ProjectStore,
  projectSocket: ProjectSocket,
  pageStore: PageStore,
  pageSocket: PageSocket,
  header: NodeHeader,
  sourceNodeId: string,
  position: XYPosition,
) {
  // create project edge ( if not self && missing )
  if (sourceNodeId !== header.id && !projectStore.findEdge(sourceNodeId, header.id)) {
    const projectEdge = createProjectEdge(allocateEdgeId(), sourceNodeId, header.id, 'simple', '1')
    projectStore.createEdge(projectEdge)
    projectSocket.createEdge(projectEdge)
  }

  // add page node ( if missing )
  if (!pageStore.isNodeExists(header.id)) {
    const pageNode = expandToPageNode(header, position)
    pageStore.addNode(pageNode)
    pageSocket.addNode(pageNode)
  }

  // add page edge ( if not self && missing )
  const projectEdge = projectStore.findEdge(sourceNodeId, header.id)
  if (projectEdge && sourceNodeId !== header.id && !pageStore.isEdgeExists(projectEdge.id)) {
    const pageEdge = extractPageEdge(projectEdge)
    pageStore.addEdge(pageEdge)
    pageSocket.addEdge(pageEdge)
  }
}
