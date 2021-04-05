import React, { useState } from 'react'
import { MyMachineContext, Process as IProcess, Page } from './index.types'

interface EditPagesProps {
  newProcess: IProcess
	newProcessList: IProcess[]
  setNewProcessList: React.Dispatch<React.SetStateAction<IProcess[]>>
	context: MyMachineContext
}

export const EditPagesList = ({ newProcess, newProcessList, setNewProcessList, context }: EditPagesProps) => {
	function handleNumericValues(page: Page, e: React.ChangeEvent<HTMLInputElement>, key: string) {
		setNewProcessList(
			newProcessList.map(item => item === newProcess ? 
				{
					...item,
					pages: newProcess.pages.map(pageM => pageM === page ?
						{...pageM, [key]: e.currentTarget.valueAsNumber } : pageM )
				} : item
		))
	}

	function handleCheckboxValues(page: Page, key: 'residence') {
		setNewProcessList(
			newProcessList.map(item => item === newProcess ? 
				{
					...item,
					pages: newProcess.pages.map(pageM => pageM === page ?
						{...pageM, [key]: !page[key] } : pageM )
				} : item
		))
	}

	function handleNestedCheckboxValues(page: Page, key: 'nur', nestedKey: 'residence' | 'modification') {
		setNewProcessList(
			newProcessList.map(item => item === newProcess ? 
				{
					...item,
					pages: newProcess.pages.map(pageM => pageM === page ?
						{...pageM, [key]: { ...pageM[key], [nestedKey]: !pageM[key][nestedKey] } } : pageM )
				} : item
		))
	}

  return (
		<div className='divide-y-2 divide-gray-400 divide-dashed'>
			<div className='grid grid-cols-6 gap-4 px-4 py-2'>
				<div className='flex flex-col'>
					<label className='font-bold'>Number</label>
				</div>
				<div className='flex flex-col'>
					<label className='font-bold'>Res</label>
				</div>
				<div className='flex flex-col'>
					<label className='font-bold'>Arrival Time</label>
				</div>
				<div className='flex flex-col'>
					<label className='font-bold'>Last Access Time</label>
				</div>
				<div className='flex flex-col'>
					<label className='font-bold'>Access Amount</label>
				</div>
				<div>
					<label className='font-bold'>NUR</label>
				</div>
			</div>
			{newProcess.pages.map((page, key) => (
				<div className='grid grid-cols-6 gap-4 px-4 py-2' key={key}>
					<div className='flex flex-col font-bold'>
						{page.number}
					</div>
					<div className='flex flex-col'>
						<input type="checkbox" className='rounded h-8 w-8 disabled:opacity-50' disabled={!page.residence && context.marcos <= newProcess.pages.filter(p => p.residence).length} checked={page.residence} onChange={() => handleCheckboxValues(page, 'residence')} />
					</div>
					<div className='flex flex-col'>
						<input type="number" required className='rounded py-1' value={page.arrivalTime} onChange={e => handleNumericValues(page, e, 'arrivalTime')} />
					</div>
					<div className='flex flex-col'>
						<input type="number" required className='rounded py-1' value={page.lastAccessTime} onChange={e => handleNumericValues(page, e, 'lastAccessTime')} />
					</div>
					<div className='flex flex-col'>
						<input type="number" required className='rounded py-1' value={page.accessAmount} onChange={e => handleNumericValues(page, e, 'accessAmount')} />
					</div>
					<div className='flex flex-col'>
						<div className='grid grid-cols-2'>
							<label className='text-xl select-none'>R
								<input type="checkbox" id={`res-${key}`} className='rounded ml-2 h-5 w-5 mb-1' checked={page.nur.residence} onChange={() => handleNestedCheckboxValues(page, 'nur', 'residence')}  />
							</label>
							<label className='text-xl select-none'>M
								<input type="checkbox" id={`mod-${key}`} className='rounded ml-2 h-5 w-5 mb-1' checked={page.nur.modification} onChange={() => handleNestedCheckboxValues(page, 'nur', 'modification')}  />
							</label>
						</div>
					</div>
				</div>
			))}
		</div>
  )
}
