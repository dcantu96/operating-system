import React, { Fragment } from 'react';
import { TopActions, Process, Cpu, Pagination } from '.'
import { useMyMachine } from './MyMachine.machine'

function App() {
  const [myMachine, send] = useMyMachine()
  return (
    <Fragment>
      <main className="min-w-screen min-h-screen p-2">
        <section className='container mx-auto space-y-4'>
          <header className='flex justify-between px-4'>
            <div>
              <p>My Little SSO developed and designed by David Cantú</p>
              <p>Stack: React, xState, tailwindcss, typescript</p>
            </div>
            <div className='text-right'>
              <div className='mb-3'>
                <label className='font-bold'>Current Time</label>
                <span className='ml-2 px-2 py-1 border border-black rounded shadow'>{myMachine.context.currentTime}</span>
              </div>
              <div className='flex mb-3'>
                <div>
                  <label className='font-bold'>Procesing Type</label>
                  <span className='ml-2 px-2 py-1 border border-black rounded shadow'>{myMachine.context.isPaginated ? 'Paginated' : 'Normal'}</span>
                </div>
                { myMachine.context.isPaginated &&
                  <div className='ml-4'>
                    <label className='font-bold'>Marcos</label>
                    <span className='ml-2 px-2 py-1 border border-black rounded shadow'>{myMachine.context.marcos}</span>
                  </div>
                }
              </div>
            </div>
          </header>
          <TopActions
            executePage={() => send('ADVANCE')}
            send={send}
            context={myMachine.context}
            state={myMachine.value}
            realTime={() => send('REAL_TIME')}
            stop={() => send('STOP')}
            advance={() => send('ADVANCE')} />
          <Process context={myMachine.context} send={send} />
          <Cpu 
            context={myMachine.context}
            handleAlgorithm={(e) => { send('CHANGE_ALGORITHM', { algorithm: e.target.value }) }} 
            handleQuantum={(e) => { send('CHANGE_QUANTUM_SIZE', { quantumSize: parseInt(e.target.value) || 0 }) }} 
            handleQuantumActive={(e) => { send('CHANGE_QUANTUM_ACTIVE', { quantumActive: e.target.checked }) }} 
            />
          {myMachine.context.isPaginated && <Pagination send={send} context={myMachine.context} />}
        </section>
      </main>
    </Fragment>
  );
}

export default App;
