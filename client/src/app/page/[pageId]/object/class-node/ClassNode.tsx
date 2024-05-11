import { AiOutlineDelete } from 'react-icons/ai'
import { MdAddCircleOutline } from 'react-icons/md'

import styles from './class-node.module.scss'

interface Data {
  data: {
    icon: string
    name: string
    properties: string[]
    methods: string[]
  }
}

export const ClassNode = ({ data }: Data) => {
  return (
    <div className={styles.component}>
      <div className={styles.header}>
        <span className={styles.icon}>{data.icon}</span>
        <span className={styles.name}>{data.name}</span>
      </div>

      <hr />

      {data.properties.length !== 0 ? (
        <div className={styles.properties}>
          {data.properties.map((property, i) => (
            <Property key={i} property={property} />
          ))}
        </div>
      ) : (
        <Empty />
      )}

      <hr />

      {data.methods.length !== 0 ? (
        <div className={styles.methods}>
          {data.methods.map((method, i) => (
            <Method key={i} method={method} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  )
}

const Property = (props: { property: string }) => {
  return (
    <div className={styles.line}>
      <span>{props.property}</span>
      <div>
        <DeleteIcon />
        <AddIcon />
      </div>
    </div>
  )
}

const Method = (props: { method: string }) => {
  return (
    <div className={styles.line}>
      <span>{props.method}</span>
      <div>
        <DeleteIcon />
        <AddIcon />
      </div>
    </div>
  )
}

const Empty = () => {
  return (
    <div className={styles.line}>
      <div></div>
      <AddIcon />
    </div>
  )
}

const AddIcon = () => {
  return <MdAddCircleOutline className={styles.icon} />
}

const DeleteIcon = () => {
  return <AiOutlineDelete className={styles.icon} />
}
