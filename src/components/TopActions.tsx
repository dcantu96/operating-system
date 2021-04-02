import React from 'react'
import { StateValue } from 'xstate'
import { MyMachineContext } from './index.types'

interface TopActionsProps {
  context: MyMachineContext
  state: StateValue
  advance: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  realTime: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  stop: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const TopActions = ({ context, state, advance, realTime, stop }: TopActionsProps) => {
  return (
    <div className='flex justify-between items-center px-6'>
      <div className='flex space-x-4 items-center'>
        <div>
          <label className='font-bold'>Tiempo Actual</label>
          <span className='ml-2 px-2 py-1 border border-black rounded shadow'>{context.currentTime}</span>
        </div>
        <button onClick={advance} className='bg-indigo-900 text-white shadow rounded px-3 py-1'>
          Avanzar
        </button>
        <button onClick={realTime} className='bg-yellow-500 text-white shadow rounded px-3 py-1'>
          Real Time
        </button>
        { state === 'realTime' &&
          <button onClick={stop} className='bg-red-600 text-white uppercase shadow rounded px-3 py-1'>
            Stop
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
