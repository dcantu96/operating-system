import React, { Fragment } from 'react';
import { TopActions, Process, Cpu } from '.'
import { useMyMachine } from './MyMachine.machine'

function App() {
  const [myMachine, send] = useMyMachine()


  return (
    <Fragment>
      <main className="min-w-screen min-h-screen p-2">
        <section className='container mx-auto space-y-4'>
          <header>
            <p>My Little SSO developed and designed by David Cantú</p>
            <p>Stack: React, xState, tailwindcss, typescript</p>
          </header>
          <TopActions
            context={myMachine.context}
            state={myMachine.value}
            realTime={() => send('REAL_TIME')}
            stop={() => send('STOP')}
            advance={() => send('ADVANCE')} />
          <Process 
            context={myMachine.context}
            handleName={(e) => { send('CHANGE_NAME', { name: e.target.value }) }}
            handleEstimatedExecutionTime={(e) => { send('CHANGE_EST_TIME', { estimatedExecutionTime: parseInt(e.target.value) || 0 }) }}
            handleProcessStatus={(e) => { send('CHANGE_PROCESS_STATUS', { status: e.target.value }) }}
            newProcess={(e) => { e.preventDefault(); send('NEW_PROCESS', { 
              status: myMachine.context.processStatus,
              process: {
                name: myMachine.context.name,
                estimatedExecutionTime: myMachine.context.estimatedExecutionTime,
                arrivalTime: myMachine.context.currentTime,
                assignedCpuTime: 0,
              }  
            })}}
            />
          <Cpu 
            context={myMachine.context}
            handleAlgorithm={(e) => { send('CHANGE_ALGORITHM', { algorithm: e.target.value }) }} 
            handleQuantum={(e) => { send('CHANGE_QUANTUM_SIZE', { quantumSize: parseInt(e.target.value) || 0 }) }} 
            handleQuantumActive={(e) => { send('CHANGE_QUANTUM_ACTIVE', { quantumActive: e.target.checked }) }} 
            />
        </section>
      </main>
    </Fragment>
  );
}

export default App;
