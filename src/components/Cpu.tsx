import React from 'react'
import { MyMachineContext } from './index.types'

interface CpuProps {
  context: MyMachineContext
  handleAlgorithm: (event: React.ChangeEvent<HTMLSelectElement>) => void
  handleQuantum: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleQuantumActive: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Cpu = ({ context, handleAlgorithm, handleQuantum, handleQuantumActive }: CpuProps) => {

  const isAlgorithmForQuantum = () => {
    const { algorithm } = context
    return algorithm === 'MLFQ' ||
           algorithm === 'ROUND_ROBIN' ||
           algorithm === 'SJF' ||
           algorithm === 'HRRN'
  }

  const isQuantumToggleable = () => {
    return context.algorithm === 'SJF' || context.algorithm === 'HRRN'
  }

  return (
    <div className='grid grid-cols-6 py-4 px-6 bg-yellow-400 shadow rounded'>
      <div className='font-bold uppercase'>Cpu</div>
      <div className='col-span-5 grid gap-20 grid-cols-3'>
        <div className='shadow bg-white rounded border border-black col-span-2'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Scheduling
          </div>
          <div className='p-2'>
            <div className='grid grid-cols-3'>
              <p className='font-bold'>Nombre</p> 
              <p>{context.runningProcess?.name}</p>
            </div>
            <div className='grid grid-cols-3'>
              <p className='font-bold'>Tiempo de Llegada</p>
              <p>{context.runningProcess?.arrivalTime}</p>
            </div>
            <div className='grid grid-cols-3'>
              <p className='font-bold'>QUANTUM</p>
              <p>{context.quantum}</p>
            </div>
          </div>
        </div>
        <div className='shadow bg-white rounded border border-black'>
          <div className='text-center pt-2 px-2 pb-1 bg-gray-700 text-white uppercase border-b border-black mb-4'>
            Cpu
          </div>
          <div className='p-2'>
            <select className='py-1 px-3 rounded shadow w-full mb-4' name="cars" value={context.algorithm} onChange={handleAlgorithm}>
              <option value="FIFO">Fifo</option>
              <option value="ROUND_ROBIN">Round Robin</option>
              <option value="MLFQ">Multi Level</option>
              <option value="SRT">Shortest Remaining Time</option>
              <option value="HRRN">HRRN</option>
              <option value="SJF">Shortest Job First</option>
            </select>
            {isAlgorithmForQuantum() &&
              <div className='grid grid-cols-2 px-2 py-1'>
                {isQuantumToggleable() ?
                  <>
                    <div>
                      <label className='font-bold'>¿Quantum Activo?</label>
                      <input type="checkbox" className='rounded' checked={context.quantumActive} onChange={handleQuantumActive} />
                    </div>
                    {context.quantumActive &&
                      <div>
                        <label className='font-bold'>Tam Quantum</label>
                        <input type="number" className='rounded w-20 py-1' value={context.quantumSize} onChange={handleQuantum} />
                      </div>
                    }
                  </>
                :
                  <>
                    {context.algorithm === 'MLFQ' ? 
                    <>
                      <h3>Quantums</h3>
                      <div>
                        <label className='font-bold'>Level 1</label>
                        <p>{context.quantum}</p>
                      </div>
                      <div>
                        <label className='font-bold'>Level 2</label>
                        <p>{context.quantum * 2}</p>
                      </div>
                      <div>
                        <label className='font-bold'>Level 3</label>
                        <p>{context.quantum * 3}</p>
                      </div>
                      <div>
                        <label className='font-bold'>Level 4</label>
                        <p>{context.quantum * 4}</p>
                      </div>
                    </>
                    :
                    <div>
                      <label className='font-bold'>Tam Quantum</label>
                      <input type="number" className='rounded w-20 py-1' value={context.quantumSize} onChange={handleQuantum} />
                    </div>
                    }
                  </>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
