import React, { useState } from 'react'
import { MyMachineContext, ProcessStatusTypes, Process as IProcess, Page, Process } from './index.types'
import { ProcessCard } from './UI'

interface EditPagesProps {
  newProcess: Process
  setNewProcess: React.Dispatch<React.SetStateAction<Process>>
	handleClose: () => void
}

export const EditPages = ({ newProcess, setNewProcess, handleClose }: EditPagesProps) => {
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

	function handleNumericValues(page: Page, e: React.ChangeEvent<HTMLInputElement>, key: string) {
		setNewProcess({
			...newProcess,
			pages: newProcess.pages.map(pageM => pageM === page ?
				{...pageM, [key]: e.currentTarget.valueAsNumber } : pageM )
		})
	}

	function handleCheckboxValues(page: Page, key: 'residence') {
		setNewProcess({
			...newProcess,
			pages: newProcess.pages.map(pageM => pageM === page ?
				{...pageM, [key]: !page[key] } : pageM )
		})
	}

	function handleNestedCheckboxValues(page: Page, key: 'nur', nestedKey: 'residence' | 'modification') {
		setNewProcess({
			...newProcess,
			pages: newProcess.pages.map(pageM => pageM === page ?
				{...pageM, [key]: { ...pageM[key], [nestedKey]: !pageM[key][nestedKey] } } : pageM )
		})
	}

  return (
    <div className='z-10 bg-black bg-opacity-50 fixed top-0 left-0 w-screen h-screen flex items-center justify-center p-8'>
			<div className='bg-white rounded shadow-xl overflow-hidden'>
				<div className='text-center py-3 px-4 bg-gray-300 text-black mb-4 flex justify-between items-center'>
					<h1 className='text-xl'>Paginas de Proceso <b>{newProcess.name}</b></h1>
					<div>
						<button className='bg-green-600 text-white shadow rounded px-3 py-1 ml-4' onClick={() => setNewProcess({...newProcess, pages: [...newProcess.pages, {...defaultNewPage, number: newProcess.pages.length}] })}>+</button>
						<button className='bg-white text-black shadow rounded px-3 py-1 ml-4' onClick={handleClose}>Cerrar</button>
					</div>
				</div>
				<div className='divide-y-4 divide-gray-400 divide-dashed'>
					{newProcess.pages.map((page, key) => (
						<div className='grid grid-cols-6 gap-4 px-4 py-2' key={key}>
							<div className='flex flex-col'>
								<label className='font-bold'>Number</label>
								{page.number}
							</div>
							<div className='flex flex-col'>
								<label className='font-bold flex flex-col'>Res
									<input type="checkbox" 
												 className='rounded h-8 w-8' 
												 checked={page.residence} 
												 onChange={() => handleCheckboxValues(page, 'residence')} />
								</label>
							</div>
							<div className='flex flex-col'>
								<label className='font-bold'>Arrival Time</label>
								<input type="number" required 
											 className='rounded py-1' 
											 value={page.arrivalTime} 
											 onChange={e => handleNumericValues(page, e, 'arrivalTime')} />
							</div>
							<div className='flex flex-col'>
								<label className='font-bold'>Last Access Time</label>
								<input type="number" required 
											 className='rounded py-1' 
											 value={page.lastAccessTime} 
											 onChange={e => handleNumericValues(page, e, 'lastAccessTime')} />
							</div>
							<div className='flex flex-col'>
								<label className='font-bold'>Access Amount</label>
								<input type="number" required 
											 className='rounded py-1' 
											 value={page.accessAmount} 
											 onChange={e => handleNumericValues(page, e, 'accessAmount')} />
							</div>
							<div>
								<label className='font-bold'>NUR</label>
								<div className='grid grid-cols-2'>
									<label className='text-xl select-none'>R
										<input type="checkbox" 
												 className='rounded h-8 w-8' 
												 checked={page.nur.residence} 
												 onChange={() => handleNestedCheckboxValues(page, 'nur', 'residence')} />
									</label>
									<label className='text-xl select-none'>M
										<input type="checkbox" 
												 className='rounded h-8 w-8' 
												 checked={page.nur.modification} 
												 onChange={() => handleNestedCheckboxValues(page, 'nur', 'modification')} />
									</label>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
    </div>
  )
}

