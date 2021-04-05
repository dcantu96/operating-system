import React from 'react'
import { MyMachineContext } from './index.types'

interface PaginationProps {
  context: MyMachineContext
  handlePageAlgo: React.ChangeEventHandler<HTMLSelectElement>
  handleResetNURBits: React.MouseEventHandler<HTMLButtonElement>
}

export const Pagination = ({ context, handlePageAlgo, handleResetNURBits }: PaginationProps) => {
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
              <div>{page.number}</div>
              <div>{page.residence ? '1' : '0'}</div>
              <div>{page.arrivalTime}</div>
              <div>{page.lastAccessTime}</div>
              <div>{page.accessAmount}</div>
              <div>{page.nur.residence ? '1' : '0'} {page.nur.modification ? '1' : '0'}</div>
            </div>
          )) }
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Memory
          </div>
          <div className='p-2'>
            <select className='py-1 px-3 rounded shadow w-full mb-4' value={context.pageAlgorithm} onChange={handlePageAlgo}>
              <option value="FIFO">FIFO</option>
              <option value="LRU">LRU</option>
              <option value="LFU">LFU</option>
              <option value="NUR">NUR</option>
            </select>
            {context.pageAlgorithm === 'NUR' && <button onClick={handleResetNURBits}>Reset NUR Bits</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
