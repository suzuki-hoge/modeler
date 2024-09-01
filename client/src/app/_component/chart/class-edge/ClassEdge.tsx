import { BaseEdge, ConnectionLineType, DefaultEdgeOptions, Edge, EdgeProps, EdgeTypes } from '@xyflow/react'
import { CSSProperties, memo, useCallback, useMemo } from 'react'
import { shallow } from 'zustand/shallow'

import { EdgeLabel } from '@/app/_component/chart/class-edge/EdgeLabel'
import { EdgePalette } from '@/app/_component/chart/class-edge/EdgePalette'
import { getInnerProps } from '@/app/_component/chart/class-edge/line'
import { updateProjectEdge } from '@/app/_flow/object/edge/function'
import { ArrowType, PageEdgeData } from '@/app/_flow/object/edge/type'
import { projectSocketSelector, useProjectSocket } from '@/app/_flow/socket/project-socket'
import { pageStoreSelector, usePageStore } from '@/app/_flow/store/page-store'
import { projectStoreSelector, useProjectStore } from '@/app/_flow/store/project-store'

export const ClassEdge = (props: EdgeProps<Edge<PageEdgeData>>) => {
  const projectStore = useProjectStore(projectStoreSelector, shallow)
  const pageStore = usePageStore(pageStoreSelector, shallow)
  const projectSocket = useProjectSocket(projectSocketSelector, shallow)

  const projectEdge = projectStore.getEdge(props.id)

  const sourcePageNode = pageStore.getNode(projectEdge.source)
  const targetPageNode = pageStore.getNode(projectEdge.target)

  const innerProps = useMemo(
    () =>
      getInnerProps(
        props.sourceX,
        props.sourceY,
        sourcePageNode.position.x,
        sourcePageNode.position.y,
        sourcePageNode.measured?.width,
        sourcePageNode.measured?.height,
        props.targetX,
        props.targetY,
        targetPageNode.position.x,
        targetPageNode.position.y,
        targetPageNode.measured?.width,
        targetPageNode.measured?.height,
      ),
    [
      props.sourceX,
      props.sourceY,
      sourcePageNode.position,
      sourcePageNode.measured,
      props.targetX,
      props.targetY,
      targetPageNode.position,
      targetPageNode.measured,
    ],
  )
  const onRotate = useCallback(
    () => {
      projectStore.updateEdge(props.id, (edge) => updateProjectEdge(edge, { source: edge.target, target: edge.source }))
      projectSocket.updateConnection(projectStore.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeToGeneralization = useCallback(
    () => {
      projectStore.updateEdge(props.id, (edge) => updateProjectEdge(edge, { arrowType: 'generalization' }))
      projectSocket.updateArrowType(projectStore.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeToSimple = useCallback(
    () => {
      projectStore.updateEdge(props.id, (edge) => updateProjectEdge(edge, { arrowType: 'simple' }))
      projectSocket.updateArrowType(projectStore.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeLabel = useCallback(
    (label: string) => {
      projectStore.updateEdge(props.id, (edge) => updateProjectEdge(edge, { label }))
      projectSocket.updateLabel(projectStore.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  if (innerProps) {
    return (
      <ClassEdgeInner
        id={props.id}
        arrowType={projectEdge.data!.arrowType}
        label={projectEdge.data!.label}
        selected={props.selected || false}
        edgePath={innerProps.edgePath}
        palettePointX={innerProps.palettePoint.x}
        palettePointY={innerProps.palettePoint.y}
        labelPointX={innerProps.labelPoint.x}
        labelPointY={innerProps.labelPoint.y}
        onRotate={onRotate}
        onChangeToGeneralization={onChangeToGeneralization}
        onChangeToSimple={onChangeToSimple}
        onChangeLabel={onChangeLabel}
      />
    )
  } else {
    return <></>
  }
}

interface InnerProps {
  id: string
  arrowType: ArrowType
  label: string
  selected: boolean
  edgePath: string
  palettePointX: number
  palettePointY: number
  labelPointX: number
  labelPointY: number
  onRotate: () => void
  onChangeToGeneralization: () => void
  onChangeToSimple: () => void
  onChangeLabel: (label: string) => void
}

export const ClassEdgeInner = memo(function _ClassEdgeInner(props: InnerProps) {
  return (
    <>
      <BaseEdge path={props.edgePath} markerEnd={`url('#${props.arrowType}')`} />
      {props.selected && (
        <EdgePalette
          id={props.id}
          arrowType={props.arrowType}
          label={props.label}
          x={props.palettePointX}
          y={props.palettePointY}
          onRotate={props.onRotate}
          onChangeToGeneralization={props.onChangeToGeneralization}
          onChangeToSimple={props.onChangeToSimple}
          onChangeLabel={props.onChangeLabel}
        />
      )}
      <EdgeLabel x={props.labelPointX} y={props.labelPointY} value={props.label} />
    </>
  )
})

export const edgeTypes: EdgeTypes = { class: ClassEdge }

export const connectionLineStyle: CSSProperties = { stroke: 'gray', strokeWidth: 1 }

export const defaultEdgeOptions: DefaultEdgeOptions = {
  style: connectionLineStyle,
  type: 'class',
}

export const connectionLineType = ConnectionLineType.Straight
