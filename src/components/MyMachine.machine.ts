import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { MyMachineContext, MyMachineStateSchema, MyMachineEvent, Stack, AlgorithmTypes } from './index.types'
import { choose } from "xstate/lib/actions";

const myMachine = Machine<MyMachineContext, MyMachineStateSchema, MyMachineEvent>(
  {
    initial: 'step',
    context: {
      quantumActive: true,
      quantumSize: 4,
      readyStack: undefined,
      runningProcess: undefined,
      blockedStack: undefined,
      finishedStack: undefined,
      currentTime: 0,
      quantum: 0,
      algorithm: 'FIFO',
      runType: 'step',
      estimatedExecutionTime: 0,
      name: '',
      processStatus: 'READY',
      blockedProcessCounter: 5
    },
    states: {
      step: {
        on: {
          NEW_PROCESS: {
            actions: ['setNewProcess','reorder'],
          },
          ADVANCE: {
            actions: ['updateTime','checkFinished','checkBlocked','checkQuantum','reorder','advance'],
          },
          CHANGE_NAME: {
            actions: 'setName',
          },
          CHANGE_EST_TIME: {
            actions: 'setEstimatedExecutionTime',
          },
          CHANGE_QUANTUM_ACTIVE: {
            actions: 'setQuantumActive',
          },
          CHANGE_PROCESS_STATUS: {
            actions: 'setProcessStatus',
          },
          CHANGE_ALGORITHM: {
            actions: ['checkAlgorithm','reorder'],
          },
          CHANGE_QUANTUM_SIZE: {
            actions: 'setQuantumSize',
          },
          REAL_TIME: {
            target: 'realTime'
          },
        },
      },
      realTime: {
        invoke: {
          src: () => send => {
            const interval = setInterval(() => {
              send('TICK')
            }, 1000 * 1)
  
            return () => {
              clearInterval(interval);
            };
          }
        },
        on: {
          TICK: {
            actions: ['updateTime','checkFinished','checkBlocked','checkQuantum','reorder','advance'],
          },
          STOP: {
            actions: 'stop',
            target: 'step',
          },
        }
      }
    },
  },
  {
    actions: {
      setNewProcess: choose([
        {
          actions: 'setNewReadyProcess',
          cond: (ctx, event) => ctx.processStatus === 'READY'
        },
        {
          actions: 'setNewBlockedProcess',
          cond: (ctx, event) => ctx.processStatus === 'BLOCKED'
        },
        {
          actions: 'setNewRunningProcess',
          cond: (ctx, event) => ctx.processStatus === 'RUNNING'
        },
        {
          actions: 'setNewFinishedProcess',
          cond: (ctx, event) => ctx.processStatus === 'FINISHED'
        },
      ]),
      checkAlgorithm: choose([
        {
          actions: ['setAlgorithm','setQuantumForMLFQ'],
          cond: (ctx, evt) => evt.algorithm === 'MLFQ'
        },
        {
          actions: 'setAlgorithm',
        }
      ]),
      setNewReadyProcess: assign({
        readyStack: (ctx, evt) => {
          if (!!ctx.readyStack && !!evt.process) {
            let newStack = ctx.readyStack
            newStack.push(evt.process)
            return newStack
          } else if (!!evt.process)
            return [evt.process]
        },
      }),
      reorder: assign({
        readyStack: (ctx, evt) => {
          if (!!ctx.readyStack)
            return orderByAlgorithm(ctx.algorithm, ctx.readyStack, ctx.currentTime)
        }
      }),
      setQuantumForMLFQ: assign({
        quantumSize: (ctx, _) => 10,
        quantum: (ctx, _) => 10,
      }),
      setNewBlockedProcess: assign({
        blockedStack: (ctx, evt) => {
          if (!!ctx.blockedStack && !!evt.process) {
            let newStack = ctx.blockedStack
            newStack.push(evt.process)
            return newStack
          } else if (!!evt.process)
            return [evt.process]
        },
      }),
      setNewRunningProcess: assign({
        runningProcess: (ctx, evt: MyMachineEvent) => {
          if (!!evt.process) { return evt.process }
        },
      }),
      setNewFinishedProcess: assign({
        finishedStack: (ctx, evt: MyMachineEvent) => {
          if (!!ctx.finishedStack && !!evt.process) {
            let newStack = ctx.finishedStack
            newStack.push(evt.process)
            return newStack
          } else if (!!evt.process)
            return [evt.process]
        },
      }),
      checkBlocked: choose([
        {
          cond: 'isblockedCounterExpired',
          actions: ['resetBlocked','updateBlockedStack'],
        },
        {
          cond: 'isblockedStackPopulated',
          actions: ['updateBlocked'],
        },
      ]),
      checkQuantum: choose([
        {
          cond: 'isQuantumExpired',
          actions: ['resetQuantum','sendToReadyQueue','clearRunning'],
        },
        {
          cond: 'isAlgoritmForQuantum',
          actions: ['tickQuantum'],
        },
      ]),
      advance: choose([
        {
          cond: (ctx, event) => !!ctx.runningProcess,
          actions: ['increaseCpuTime'],
        },
        {
          actions: ['fetchNewRunningProcess', 'increaseCpuTime'],
        },
      ]),

      checkFinished: choose([
        {
          cond: (ctx, event) => {
            const { runningProcess } = ctx
            return !!runningProcess && 
              (runningProcess.assignedCpuTime ===
              runningProcess.estimatedExecutionTime)
          },
          actions: ['transitionToFinished','clearRunning'],
        }
      ]),
      updateBlocked: assign({
        blockedProcessCounter: (ctx, _) => ctx.blockedProcessCounter -= 1,
      }),
      resetBlocked: assign({
        blockedProcessCounter: (ctx, _) => 5,
      }),
      updateBlockedStack: assign({
        readyStack: (ctx, evt) => {
          const { readyStack, blockedStack } = ctx
          if (!!readyStack && !!blockedStack) {
            let firstBlockedProcess = blockedStack[0]
            blockedStack.shift()
            let newReadyStack = readyStack
            newReadyStack.push(firstBlockedProcess)
            return newReadyStack
          } else if (!!blockedStack && blockedStack.length > 0) {
            let firstBlockedProcess = blockedStack[0]
            blockedStack.shift()
            return [firstBlockedProcess]
          }
        },
      }),
      increaseCpuTime: assign({
        runningProcess: (ctx, _) => {
          let { runningProcess } = ctx
          if (!runningProcess) return

          runningProcess.assignedCpuTime += 1
          return runningProcess
        },
      }),
      tickQuantum: assign({
        quantum: (ctx, evt) => ctx.quantum -= 1,
      }),
      updateTime: assign({
        currentTime: (ctx, evt) => ctx.currentTime += 1,
      }),
      resetBlockedCounter: assign({
        blockedProcessCounter: (ctx, _) => 5,
      }),
      transitionToFinished: assign({
        finishedStack: (ctx, _) => {
          const { finishedStack, runningProcess } = ctx
          if (!!finishedStack && !!runningProcess) {
            let newStack = finishedStack
            newStack.push(runningProcess)
            return newStack
          } else if (!!runningProcess)
            return [runningProcess]
        }
      }),
      clearRunning: assign({
        runningProcess: (ctx, _) => undefined,
      }),
      sendToReadyQueue: assign({
        readyStack: (ctx, evt) => {
          if (!!ctx.readyStack && !!ctx.runningProcess) {
            let newStack = ctx.readyStack
            newStack.push(ctx.runningProcess)
            return newStack
          } else if (!!ctx.runningProcess)
            return [ctx.runningProcess]
        }
      }),
      resetQuantum: assign({
        quantum: (ctx, evt) => ctx.quantumSize,
      }),
      fetchNewRunningProcess: assign({
        runningProcess: (ctx, evt) => {
          const { readyStack } = ctx
          if (!!readyStack) return readyStack.shift()
        },
      }),
      setName: assign({
        name: (ctx, evt) => evt.name,
      }),
      setEstimatedExecutionTime: assign({
        estimatedExecutionTime: (ctx, evt) => evt.estimatedExecutionTime,
      }),
      setProcessStatus: assign({
        processStatus: (ctx, evt) => evt.status,
      }),
      setAlgorithm: assign({
        algorithm: (ctx, evt) => evt.algorithm,
      }),
      setQuantumSize: assign({
        quantumSize: (ctx, evt) => evt.quantumSize,
        quantum: (ctx, evt) => evt.quantumSize,
      }),
      setQuantumActive: assign({
        quantumActive: (ctx, evt) => evt.quantumActive
      }),
    },
    guards: {
      isblockedCounterExpired: (ctx, evt) => ctx.blockedProcessCounter === 0,
      isblockedStackPopulated: (ctx, evt) => !!ctx.blockedStack && ctx.blockedStack.length > 0,
      isAlgoritmForQuantum: (ctx, evt) => ctx.algorithm === 'ROUND_ROBIN' || ctx.algorithm === 'MLFQ' || 
        (ctx.algorithm === 'HRRN' && ctx.quantumActive) || (ctx.algorithm === 'SJF' && ctx.quantumActive),
      isQuantumExpired: (ctx, event) => isAlgoForQtm(ctx.algorithm) && ctx.quantum === 1,
    },
  },
)

const isAlgoForQtm = (algorithm: AlgorithmTypes) => {
  return algorithm === 'MLFQ' || algorithm === 'ROUND_ROBIN' ||
         algorithm === 'SJF' || algorithm === 'HRRN'
}

const orderByAlgorithm = (algorithm: AlgorithmTypes, readyStack: Stack, currentTime: number) => {
  if (!!readyStack) {
    switch (algorithm) {
      case 'FIFO':
        return orderByFifo(readyStack)
      case 'SRT':
        return orderBySrt(readyStack)
      case 'HRRN':
        return orderByHrrn(readyStack, currentTime)
      case 'SJF':
        return orderBySjf(readyStack)
      case 'ROUND_ROBIN':
        return orderByFifo(readyStack)
    }
  } else return readyStack
}

const orderByFifo = (readyStack: Stack) => {
  return readyStack.sort((a, b) => (a.arrivalTime > b.arrivalTime) ? 1 : -1 )
}

const orderBySrt = (readyStack: Stack) => {
  return readyStack.sort((a, b) => (
    (a.estimatedExecutionTime - a.assignedCpuTime) > 
    (b.estimatedExecutionTime - b.assignedCpuTime)
  ) ? 1 : -1 )
}

const orderByHrrn = (readyStack: Stack, currentTime: number) => {
  return readyStack.sort((a, b) => (
    (currentTime - a.arrivalTime - a.assignedCpuTime + a.estimatedExecutionTime)/a.estimatedExecutionTime > 
    (currentTime - b.arrivalTime - b.assignedCpuTime + b.estimatedExecutionTime)/b.estimatedExecutionTime
  ) ? 1 : -1 )
}

const orderBySjf = (readyStack: Stack) => {
  return readyStack.sort((a, b) => (
    a.estimatedExecutionTime > b.estimatedExecutionTime
  ) ? 1 : -1 )
}

function useMyMachine() {
  const defaultContext: MyMachineContext = {
    quantumActive: true,
    quantumSize: 4,
    readyStack: undefined,
    runningProcess: undefined,
    blockedStack: undefined,
    finishedStack: undefined,
    currentTime: 0,
    quantum: 0,
    algorithm: 'FIFO',
    runType: 'step',
    estimatedExecutionTime: 0,
    name: '',
    processStatus: 'READY',
    blockedProcessCounter: 5
  }
  return useMachine(myMachine.withContext(defaultContext))
}

export { myMachine, useMyMachine }
