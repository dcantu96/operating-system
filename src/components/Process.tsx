import React, { useState } from 'react'
import { EditPages } from './EditPages'
import { MyMachineContext, ProcessStatusTypes, Process as IProcess, Page } from './index.types'
import { ProcessMultiForm } from './ProcessMultiForm'
import { ProcessCard } from './UI'

interface ProcessProps {
  context: MyMachineContext
  send: (event: any, payload?: any) => any
}

export const Process = ({ context, send }: ProcessProps) => {
  const defaultNewPage: Page = {
		number: 0,
		accessAmount: 0,
		arrivalTime: 0,
		lastAccessTime: 0,
		residence: false,
		nur: {
			read: false,
			write: false,
			readCounts: 0
		}
	}
  const defaultNewProcess: IProcess = {
    name: '',
    status: 'READY',
    assignedCpuTime: 0,
    estimatedExecutionTime: 0,
    pages: [defaultNewPage],
    arrivalTime: context.currentTime,
    blockedTime: 5
  }
  const [newProcess, setNewProcess] = useState<IProcess>(defaultNewProcess)
  const [multiForm, toggleMultiForm] = useState(false)
  const [editPages, toggleEditPages] = useState(false)
  return (
    <div className='grid grid-cols-6 py-4 px-6 bg-gray-300 shadow rounded'>
      <div className='font-bold uppercase'>Procesos</div>
      <div className='col-span-5 grid gap-4 grid-cols-5'>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            New
            <button className='bg-white text-black shadow rounded px-3 py-1 ml-4' onClick={() => toggleMultiForm(!multiForm)}>Multi</button>
          </div>
          {multiForm && <ProcessMultiForm context={context} send={send} handleClose={() => toggleMultiForm(!multiForm)} />}
          {editPages && <EditPages marcos={context.marcos} newProcess={newProcess} setNewProcess={setNewProcess} handleClose={() => toggleEditPages(!editPages)} />}
          <form onSubmit={(e) => { e.preventDefault(); send('NEW_PROCESS_LIST', {
            processList: [{...newProcess, arrivalTime: context.currentTime}]
          })}}>
            <div className='flex items-center px-2 py-1 justify-between'>
              <label className='font-bold'>Nombre</label>
              <input type="text" required className='rounded w-20 py-1' value={newProcess.name} onChange={e => setNewProcess({...newProcess, name: e.currentTarget.value})} />
            </div>
            { context.isPaginated ?
              <>
                
                <div className='flex items-center px-2 py-1 justify-between'>
                  <label className='font-bold'>Cant. de Paginas</label>
                  <div className='flex items-center'>
                    <button type="button" className='bg-indigo-900 text-white shadow rounded px-3 py-1 mr-2 disabled:opacity-50' disabled={newProcess.pages.length <= 1} onClick={() => setNewProcess({...newProcess, pages: newProcess.pages.slice(0, -1)})}>-</button>
                    <span>{newProcess.pages.length}</span>
                    <button type="button" className='bg-indigo-900 text-white shadow rounded px-3 py-1 ml-2' onClick={() => setNewProcess({...newProcess, pages: [...newProcess.pages, {...defaultNewPage, number: newProcess.pages.length}]})}>+</button>
                    <button type="button" className='bg-yellow-600 text-white shadow rounded px-3 py-1 ml-2' onClick={() => toggleEditPages(!editPages)}>ED</button>
                  </div>
                </div>
                <div className='flex items-center px-2 py-1 justify-between'>
                  <label className='font-bold'>Ejecución total</label>
                  <input type="number" required className='rounded w-20 py-1' value={newProcess.estimatedExecutionTime} onChange={e => setNewProcess({...newProcess, estimatedExecutionTime: e.currentTarget.valueAsNumber})}  />
                </div>
              </>
              :
              <>
                <div className='flex items-center px-2 py-1 justify-between'>
                  <label className='font-bold'>Tiempo Est. Ejecución</label>
                  <input type="number" required className='rounded w-20 py-1' value={newProcess.estimatedExecutionTime} onChange={e => setNewProcess({...newProcess, estimatedExecutionTime: e.currentTarget.valueAsNumber})}  />
                </div>
              </>
            }
            <div className='flex items-center px-2 py-1 justify-between'>
              <label className='font-bold'>Estado de Proceso</label>
              <select className='py-1 px-3 rounded shadow w-56' value={newProcess.status} onChange={e => setNewProcess({...newProcess, status: e.currentTarget.value as ProcessStatusTypes})}>
                <option value={'BLOCKED' as ProcessStatusTypes}>Blocked</option>
                <option value={'RUNNING' as ProcessStatusTypes}>Running</option>
                <option value={'READY' as ProcessStatusTypes}>Ready</option>
                <option value={'FINISHED' as ProcessStatusTypes}>Finished</option>
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
          {context?.readyStack?.map((process, key) => (
            <ProcessCard key={key} process={process} status='READY' />
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
          {context?.blockedStack?.map((process, key) => (
            <ProcessCard key={key} process={process} status='BLOCKED' />
          ))}
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Finished
          </div>
          {context?.finishedStack?.map((process, key) => (
            <ProcessCard key={key} process={process} status='FINISHED' />
          ))}
        </div>
      </div>
    </div>
  )
}
