import React, { useState } from 'react'
import { StateValue } from 'xstate'
import { MyMachineContext } from './index.types'

interface TopActionsProps {
  context: MyMachineContext
  state: StateValue
  advance: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  executePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  realTime: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  stop: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  send: (event: any, payload?: any) => any
}

export const TopActions = ({ context, state, advance, executePage, realTime, stop, send }: TopActionsProps) => {
  const [newCurrentTime, setNewCurrentTime] = useState<number>(context.currentTime)
  const [newMarcos, setNewMarcos] = useState<number>(context.marcos)
  const [timeInput, toggleTimeInput] = useState<boolean>(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) { 
		e.preventDefault()
		send('UPDATE_CURRENT_TIME', { currentTime: newCurrentTime })
	}

  function handleSubmitMarco(e: React.FormEvent<HTMLFormElement>) { 
		e.preventDefault()
		send('UPDATE_MARCOS', { marcos: newMarcos })
	}

  if (context.isPaginated) {
    return (
      <div className='flex justify-between items-center px-6'>
        <div className='flex space-x-4 items-center'>
          <button onClick={() => toggleTimeInput(!timeInput)} className='bg-red-500 text-white shadow rounded px-3 py-1'>
            {timeInput ? 'Close' : 'Change Current Time'}
          </button>
          <button onClick={() => send('ADVANCE')} className='bg-yellow-500 text-white shadow rounded px-3 py-1'>
            Advance
          </button>
          { timeInput &&
            <form onSubmit={e => handleSubmit(e)} className='flex space-x-4'>
              <input type="number" required placeholder='Nuevo tiempo' className='rounded py-1' value={newCurrentTime} onChange={e => setNewCurrentTime(e.currentTarget.valueAsNumber)} />
              <input type="submit" value="Actualizar" className='bg-indigo-900 text-white shadow rounded px-3 py-1' />
            </form>
          }
          <button onClick={() => send('TOGGLE_PAGINATION')} className='bg-indigo-500 text-white shadow rounded px-3 py-1'>
            {context.isPaginated ? 'Change to Basic' : 'Change to Pagination'}
          </button>
          <form onSubmit={e => handleSubmitMarco(e)} className='flex space-x-4'>
            <input type="number" required placeholder='Nuevo marco' className='rounded py-1 w-24' value={newMarcos} onChange={e => setNewMarcos(e.currentTarget.valueAsNumber)} />
            <input type="submit" value="Update Marcos" className='bg-indigo-900 text-white shadow rounded px-3 py-1' />
          </form>
        </div>
        <div className='space-x-2'>
          <label className='font-bold'>Interrupción</label>
          <select className='py-1 px-3 rounded shadow w-56'>
            <option value="volvo">SVC Quantum Expirado</option>
          </select>
        </div>
      </div>
    )
  } else {
    return (
      <div className='flex justify-between items-center px-6'>
        <div className='flex space-x-4 items-center'>
          <button onClick={() => toggleTimeInput(!timeInput)} className='bg-red-500 text-white shadow rounded px-3 py-1'>
            {timeInput ? 'Close' : 'Change Current Time'}
          </button>
          { timeInput &&
            <form onSubmit={e => handleSubmit(e)} className='flex space-x-4'>
              <input type="number" required placeholder='Nuevo tiempo' className='rounded py-1' value={newCurrentTime} onChange={e => setNewCurrentTime(e.currentTarget.valueAsNumber)} />
              <input type="submit" value="Actualizar" className='bg-indigo-900 text-white shadow rounded px-3 py-1' />
            </form>
          }
          <button onClick={() => send('TOGGLE_PAGINATION')} className='bg-indigo-500 text-white shadow rounded px-3 py-1'>
            {context.isPaginated ? 'Change to Basic' : 'Change to Pagination'}
          </button>
          <button onClick={advance} className='bg-indigo-900 text-white shadow rounded px-3 py-1'>
            Avanzar
          </button>
          { state === 'realTime' ?
            <button onClick={stop} className='bg-red-600 text-white uppercase shadow rounded px-3 py-1'>
              Stop
            </button>
            :
            <button onClick={realTime} className='bg-yellow-500 text-white shadow rounded px-3 py-1'>
              Real Time
            </button>
          }
        </div>
        <div className='space-x-2'>
          <label className='font-bold'>Interrupción</label>
          <select className='py-1 px-3 rounded shadow w-56'>
            <option value="volvo">SVC Quantum Expirado</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className='flex justify-between items-center px-6'>
      <div className='flex space-x-4 items-center'>
        <button onClick={() => toggleTimeInput(!timeInput)} className='bg-red-500 text-white shadow rounded px-3 py-1'>
          {timeInput ? 'Close' : 'Change Current Time'}
        </button>
        { timeInput &&
          <form onSubmit={e => handleSubmit(e)} className='flex space-x-4'>
            <input type="number" required placeholder='Nuevo tiempo' className='rounded py-1' value={newCurrentTime} onChange={e => setNewCurrentTime(e.currentTarget.valueAsNumber)} />
            <input type="submit" value="Actualizar" className='bg-indigo-900 text-white shadow rounded px-3 py-1' />
          </form>
        }
        <button onClick={() => send('TOGGLE_PAGINATION')} className='bg-indigo-500 text-white shadow rounded px-3 py-1'>
          {context.isPaginated ? 'Change to Basic' : 'Change to Pagination'}
        </button>
        { context.isPaginated ?
          <>
            <form onSubmit={e => handleSubmitMarco(e)} className='flex space-x-4'>
              <input type="number" required placeholder='Nuevo marco' className='rounded py-1 w-24' value={newMarcos} onChange={e => setNewMarcos(e.currentTarget.valueAsNumber)} />
              <input type="submit" value="Update Marcos" className='bg-indigo-900 text-white shadow rounded px-3 py-1' />
            </form>
            <button onClick={executePage} className='bg-indigo-900 text-white shadow rounded px-3 py-1'>
              Ejecutar Página
            </button>
          </>
          :
          <>
            <button onClick={advance} className='bg-indigo-900 text-white shadow rounded px-3 py-1'>
              Avanzar
            </button>
            { state === 'realTime' ?
              <button onClick={stop} className='bg-red-600 text-white uppercase shadow rounded px-3 py-1'>
                Stop
              </button>
              :
              <button onClick={realTime} className='bg-yellow-500 text-white shadow rounded px-3 py-1'>
                Real Time
              </button>
            }
              </>
        }
      </div>
      <div className='space-x-2'>
        <label className='font-bold'>Interrupción</label>
        <select className='py-1 px-3 rounded shadow w-56'>
          <option value="volvo">SVC Quantum Expirado</option>
        </select>
      </div>
    </div>
  )
}
