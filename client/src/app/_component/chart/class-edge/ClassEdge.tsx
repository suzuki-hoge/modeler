import { CSSProperties, memo, useCallback, useContext, useMemo } from 'react'
import { BaseEdge, ConnectionLineType, DefaultEdgeOptions, EdgeProps, EdgeTypes } from 'reactflow'
import { shallow } from 'zustand/shallow'

import { EdgeLabel } from '@/app/_component/chart/class-edge/EdgeLabel'
import { EdgePalette } from '@/app/_component/chart/class-edge/EdgePalette'
import { getInnerProps } from '@/app/_component/chart/class-edge/line'
import { updateEdge } from '@/app/_object/edge/function'
import { ArrowType, EdgeData } from '@/app/_object/edge/type'
import { SocketContext } from '@/app/_socket/socket'
import { selector, useStore } from '@/app/_store/store'

export const ClassEdge = (props: EdgeProps<EdgeData>) => {
  const store = useStore(selector, shallow)
  const socket = useContext(SocketContext)!

  const sourceNode = store.getNode(props.source)
  const targetNode = store.getNode(props.target)

  const innerProps = useMemo(
    () =>
      getInnerProps(
        props.sourceX,
        props.sourceY,
        sourceNode.position.x,
        sourceNode.position.y,
        sourceNode.width!,
        sourceNode.height!,
        props.targetX,
        props.targetY,
        targetNode.position.x,
        targetNode.position.y,
        targetNode.width!,
        targetNode.height!,
      ),
    [
      props.sourceX,
      props.sourceY,
      sourceNode.position.x,
      sourceNode.position.y,
      sourceNode.width,
      sourceNode.height,
      props.targetX,
      props.targetY,
      targetNode.position.x,
      targetNode.position.y,
      targetNode.width,
      targetNode.height,
    ],
  )
  const onRotate = useCallback(
    () => {
      store.updateEdge(props.id, (edge) => updateEdge(edge, { src: edge.target, dst: edge.source }))
      socket.updateEdge(store.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeToGeneralization = useCallback(
    () => {
      store.updateEdge(props.id, (edge) => updateEdge(edge, { arrowType: 'generalization' }))
      socket.updateEdge(store.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeToSimple = useCallback(
    () => {
      store.updateEdge(props.id, (edge) => updateEdge(edge, { arrowType: 'simple' }))
      socket.updateEdge(store.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onChangeLabel = useCallback(
    (label: string) => {
      store.updateEdge(props.id, (edge) => updateEdge(edge, { label }))
      socket.updateEdge(store.getEdge(props.id))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  if (innerProps) {
    return (
      <ClassEdgeInner
        id={props.id}
        arrowType={props.data!.arrowType}
        label={props.data!.label}
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
