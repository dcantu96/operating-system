import React, { useState } from 'react'
import { MyMachineContext, ProcessStatusTypes, Process as IProcess, Page, Process } from './index.types'
import { EditPages } from './EditPages'
import { EditPagesList } from './EditPagesList'

interface ProcessProps {
  context: MyMachineContext
  send: (event: any, payload?: any) => any
	handleClose: () => void
}

export const ProcessMultiForm = ({ context, send, handleClose }: ProcessProps) => {
  const defaultNewPage: Page = {
		number: 0,
		accessAmount: 0,
		arrivalTime: 0,
		lastAccessTime: 0,
		residence: false,
		nur: {
			residence: false,
			modification: false
		}
	}
	const defaultNewProcess: IProcess = {
    name: '',
    status: 'READY',
    assignedCpuTime: 1,
    estimatedExecutionTime: 1,
    pages: [defaultNewPage],
    arrivalTime: context.currentTime
  }
  const [newProcessList, setNewProcessList] = useState<IProcess[]>([defaultNewProcess])
	
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) { 
		e.preventDefault() 
		send('NEW_PROCESS_LIST', { processList: newProcessList })
		handleClose()
	}

	function appendPage(process: IProcess) {
		setNewProcessList(
			newProcessList.map(item => item === process ? 
				{ ...item, pages: [...item.pages, {...defaultNewPage, number: item.pages.length}] } : item
		))
	}

	function removeLastPage(process: IProcess) {
		setNewProcessList(
			newProcessList.map(item => item === process ? 
				{ ...item, pages: process.pages.slice(0, -1) } : item
		))
	}

  return (
    <div className='z-10 bg-black bg-opacity-50 fixed top-0 left-0 w-screen min-h-screen flex items-center justify-center p-8 overflow-scroll'>
			<div className='bg-white rounded shadow-xl overflow-hidden'>
				<div className='text-center py-3 px-4 bg-gray-300 text-black mb-4 flex justify-between items-center'>
					<h1 className='text-xl'>Procesos</h1>
					<div>
						<button className='bg-green-600 text-white shadow rounded px-3 py-1 ml-4' onClick={() => setNewProcessList([...newProcessList, defaultNewProcess])}>Agregar +</button>
						<button className='bg-white text-black shadow rounded px-3 py-1 ml-4' onClick={handleClose}>Cerrar</button>
					</div>
				</div>
				<div className='flex px-4 items-center'>
					<h1 className='text-xl'>Marcos de Página <b>{context.marcos}</b></h1>
					<button className='bg-green-600 text-white shadow rounded px-3 py-1 ml-4' onClick={() => setNewProcessList([...newProcessList, defaultNewProcess])}>Change Marcos</button>
				</div>
				<div>
					<form onSubmit={e => handleSubmit(e)} className='divide-y-4 divide-gray-400 divide-solid'>
						{newProcessList.map((newProcess, key) => (
							<>
								<div className='grid grid-cols-4 md:grid-cols-10 gap-4 px-4 py-2' key={key}>
									<div className='flex flex-col py-1 col-span-4 md:col-span-3'>
										<label className='font-bold'>Nombre</label>
										<input type="text" required className='rounded py-1' value={newProcess.name} onChange={e => setNewProcessList(newProcessList.map(item => item === newProcess ? {...item, name: e.currentTarget.value} : item)) } />
									</div>
									<div className='flex flex-col py-1 col-span-2'>
										<label className='font-bold'>Tmp de llegada</label>
										<input type="number" required className='rounded py-1' value={newProcess.arrivalTime} onChange={e => setNewProcessList(newProcessList.map(item => item === newProcess ? {...item, arrivalTime: e.currentTarget.valueAsNumber} : item)) } />
									</div>
									<div className='flex flex-col py-1 col-span-2'>
										<label className='font-bold'>Tmp est ejec</label>
										<input type="number" required className='rounded py-1' value={newProcess.estimatedExecutionTime} onChange={e => setNewProcessList(newProcessList.map(item => item === newProcess ? {...item, estimatedExecutionTime: e.currentTarget.valueAsNumber} : item)) } />
									</div>
									<div className='flex flex-col py-1 col-span-2'>
										<label className='font-bold'>Estado</label>
										<select className='py-1 px-3 rounded shadow w-56' value={newProcess.status} onChange={e => setNewProcessList(newProcessList.map(item => item === newProcess ? {...item, status: e.currentTarget.value as ProcessStatusTypes} : item)) }>
											<option value={'BLOCKED' as ProcessStatusTypes}>Blocked</option>
											<option value={'RUNNING' as ProcessStatusTypes}>Running</option>
											<option value={'READY' as ProcessStatusTypes}>Ready</option>
											<option value={'FINISHED' as ProcessStatusTypes}>Finished</option>
										</select>
									</div>
									<div className='flex flex-col py-1'>
										<label className='font-bold'>Acciones</label>
										<button className='bg-red-600 text-white shadow rounded px-3 py-1 disabled:opacity-50' disabled={newProcessList.length === 1} onClick={() => setNewProcessList(newProcessList.filter((_, index) => newProcessList[index] !== newProcess))}>Eliminar</button>
									</div>
								</div>
								<div className='flex items-center py-3 pl-16'>
									<h4 className='text-lg'>Editar Paginas:</h4>
									<button className='bg-indigo-900 text-white shadow rounded px-3 py-1 mr-2 disabled:opacity-50' disabled={newProcess.pages.length <= 1} onClick={() => removeLastPage(newProcess)}>-</button>
									<h4 className='text-lg'>{newProcess.pages.length}</h4>
									<button className='bg-indigo-900 text-white shadow rounded px-3 py-1 ml-2' onClick={() => appendPage(newProcess)}>+</button>
								</div>
								<div className='pl-16'>
									{context.isPaginated && <EditPagesList context={context} newProcess={newProcess} newProcessList={newProcessList} setNewProcessList={setNewProcessList} key={key} />}
								</div>
							</>
						))}
						<div className='block pt-2'>
							<input type="submit" value="Crear" className='bg-indigo-900 cursor-pointer text-white shadow px-3 py-4 rounded-b w-full uppercase text-xl' />
						</div>
					</form>
				</div>
			</div>
    </div>
  )
}
