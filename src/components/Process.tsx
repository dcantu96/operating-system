import React from 'react'
import { MyMachineContext } from './index.types'
import { ProcessCard } from './UI'

interface ProcessProps {
  context: MyMachineContext
  handleName: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleEstimatedExecutionTime: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleProcessStatus: (event: React.ChangeEvent<HTMLSelectElement>) => void
  newProcess: (event: React.FormEvent<HTMLFormElement>) => void
}

export const Process = ({ context, newProcess, handleEstimatedExecutionTime, handleName, handleProcessStatus }: ProcessProps) => {
  return (
    <div className='grid grid-cols-6 py-4 px-6 bg-gray-300 shadow rounded'>
      <div className='font-bold uppercase'>Procesos</div>
      <div className='col-span-5 grid gap-4 grid-cols-5'>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            New
          </div>
          <form onSubmit={newProcess} >
            <div className='flex items-center px-2 py-1 justify-between'>
              <label className='font-bold'>Nombre</label>
              <input type="text" required className='rounded w-20 py-1' value={context.name} onChange={handleName} />
            </div>
            <div className='flex items-center px-2 py-1 justify-between'>
              <label className='font-bold'>Tiempo Est. Ejecución</label>
              <input type="number" required className='rounded w-20 py-1' value={context.estimatedExecutionTime} onChange={handleEstimatedExecutionTime} />
            </div>
            <div className='flex items-center px-2 py-1 justify-between'>
              <label className='font-bold'>Estado de Proceso</label>
              <select className='py-1 px-3 rounded shadow w-56' value={context.processStatus} onChange={handleProcessStatus}>
                <option value="BLOCKED">Blocked</option>
                <option value="RUNNING">Running</option>
                <option value="READY">Ready</option>
                <option value="FINISHED">Finished</option>
              </select>
            </div>
            <div className='px-2 pt-1 pb-3 block'>
              <input type="submit" value="+" className='bg-indigo-900 text-white shadow rounded px-3 py-1 w-full' />
            </div>
          </form>
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Ready
          </div>
          {context?.readyStack?.map((process, index) => (
            <ProcessCard key={index} process={process} status='READY' />
          ))}
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Running
          </div>
          {context?.runningProcess && (
            <ProcessCard process={context.runningProcess} status='RUNNING' />
          )}
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Blocked
          </div>
          {context?.blockedStack?.map((process, index) => (
            <ProcessCard key={index} process={process} status='BLOCKED' />
          ))}
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Finished
          </div>
          {context?.finishedStack?.map((process, index) => (
            <ProcessCard key={index} process={process} status='FINISHED' />
          ))}
        </div>
      </div>
    </div>
  )
}
