import React from 'react'
import { send } from 'xstate/lib/actionTypes'
import { MyMachineContext } from './index.types'

interface PaginationProps {
  context: MyMachineContext
  send: (event: any, payload?: any) => any
}

export const Pagination = ({ context, send }: PaginationProps) => {
  return (
    <div className='grid grid-cols-6 py-4 px-6 bg-green-400 shadow rounded'>
      <div className='font-bold uppercase'>Memory</div>
      <div className='col-span-5 grid gap-20 grid-cols-3'>
        <div className='shadow bg-white rounded border border-black col-span-2'>
          <div className='grid grid-cols-6 text-center px-2 py-2 bg-gray-700 text-white uppercase border-b border-black'>
            <div>Page</div>
            <div>R</div>
            <div>Arrival</div>
            <div>Last Access</div>
            <div>Access Times</div>
            <div>NUR</div>
          </div>
          { context.runningProcess?.pages.map(page => (
            <div className='grid grid-cols-6 text-center px-2 py-2 border-b border-black'>
              <div>
                <button 
                  className='bg-indigo-900 text-white shadow rounded px-3 py-1 mr-2'
                  onClick={() => send('RUN_PAGE', { number: page.number })}
                  >
                  RUN
                </button>
                <b>{page.number}</b>
              </div>
              <div>{page.residence ? '1' : '0'}</div>
              <div>{page.arrivalTime}</div>
              <div>{page.lastAccessTime}</div>
              <div>{page.accessAmount}</div>
              <div>{page.nur.read ? '1' : '0'} {page.nur.write ? '1' : '0'}</div>
            </div>
          )) }
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Memory
          </div>
          <div className='p-2'>
            <select className='py-1 px-3 rounded shadow w-full mb-4' value={context.pageAlgorithm} onChange={(e) => { send('CHANGE_PAGE_ALGORITHM', { pageAlgorithm: e.target.value }) }}>
              <option value="FIFO">FIFO</option>
              <option value="LRU">LRU</option>
              <option value="LFU">LFU</option>
              <option value="NUR">NUR</option>
            </select>
            {context.pageAlgorithm === 'NUR' && <button className='bg-indigo-900 text-white shadow rounded px-3 py-1' onClick={() => { send('RESET_NUR_BITS') }}>Reset NUR Bits</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
