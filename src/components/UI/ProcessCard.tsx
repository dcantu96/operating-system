import React from 'react'
import { Process, ProcessStatusTypes } from '../index.types'

interface ProcessCardProps {
  process: Process
  status: ProcessStatusTypes
}

export const ProcessCard = ({ process, status }: ProcessCardProps) => {

  const cardClasses = () => {
    switch (status) {
      case 'BLOCKED':
        return 'bg-red-600'
      case 'READY':
        return 'bg-indigo-900'
      case 'RUNNING':
        return 'bg-green-600'
      case 'FINISHED':
        return 'bg-gray-700'
      default:
        return 'bg-black'
    }
  }

  const headerClasses = () => {
    switch (status) {
      case 'BLOCKED':
        return 'bg-red-400'
      case 'READY':
        return 'bg-indigo-600'
      case 'RUNNING':
        return 'bg-green-400'
      case 'FINISHED':
        return 'bg-gray-400'
      default:
        return 'bg-white text-black'
    }
  }

  const ready = () => status === 'READY'
  const running = () => status === 'RUNNING'
  const finished = () => status === 'FINISHED'
  const blocked = () => status === 'BLOCKED'

  return (
    <div className={`${cardClasses()} m-2 pb-2 rounded shadow overflow-hidden`}>
      <h3 className={`${headerClasses()} text-white px-2 py-1 mb-2`}>{process.name}</h3>
      <p className='text-white px-2'>Arrival Time <b>{process.arrivalTime}</b></p>
      <p className='text-white px-2'>Time Remaining <b>{process.estimatedExecutionTime - process.assignedCpuTime}</b></p>
      <p className='text-white px-2'>Est Excecution Time <b>{process.estimatedExecutionTime}</b></p>
      <p className='text-white px-2'>Assigned CPU <b>{process.assignedCpuTime}</b></p>
    </div>
  )
}
