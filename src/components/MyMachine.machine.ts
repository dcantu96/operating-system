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
      blockedProcessCounter: 5,
      newProcessList: [],
      isPaginated: false,
      pageAlgorithm: 'FIFO',
      marcos: 5
    },
    states: {
      step: {
        on: {
          NEW_PROCESS_LIST: {
            actions: ['setNewProcessList','reorder'],
          },
          UPDATE_CURRENT_TIME: { actions: 'setCurrentTime' },
          UPDATE_MARCOS: { actions: 'setMarcos' },
          TOGGLE_PAGINATION: { actions: 'togglePagination' },
          ADVANCE: {
            actions: ['updateTime','checkFinished','checkBlocked','checkQuantum','reorder','advance'],
          },
          CHANGE_QUANTUM_ACTIVE: { actions: 'setQuantumActive' },
          CHANGE_ALGORITHM: {
            actions: ['checkAlgorithm','reorder'],
          },
          CHANGE_QUANTUM_SIZE: { actions: 'setQuantumSize' },
          CHANGE_PAGE_ALGORITHM: { actions: 'setPageAlgorithm' },
          RESET_NUR_BITS: { actions: 'resetNURBits' },
          REAL_TIME: { target: 'realTime' },
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
      setNewProcessList: assign((context, event) => {
        if (event.type !== 'NEW_PROCESS_LIST') 
          throw new Error("Not supposed to happen. Event type is: " + event)
        let newReadyStack = context.readyStack
        let newBlockedStack = context.blockedStack
        let newFinishedStack = context.finishedStack
        let newRunningProcess = context.runningProcess
        event.processList.forEach(newProcess => {
          if (newProcess.status === 'BLOCKED')
            newBlockedStack = !!newBlockedStack ?
              [...newBlockedStack, newProcess] :
              [newProcess]
          else if (newProcess.status === 'FINISHED')
            newFinishedStack = !!newFinishedStack ?
              [...newFinishedStack, newProcess] :
              [newProcess]
          else if (newProcess.status === 'READY')
            newReadyStack = !!newReadyStack ?
              [...newReadyStack, newProcess] :
              [newProcess]
          else
            newRunningProcess = newProcess
        })
        return {
          readyStack: newReadyStack,
          blockedStack: newBlockedStack,
          finishedStack: newFinishedStack,
          runningProcess: newRunningProcess
        }
      }),
      setCurrentTime: assign({
        currentTime: (_, evt) => {
          if (evt.type !== 'UPDATE_CURRENT_TIME') throw new Error("Error no current time event")
          return evt.currentTime 
        }
      }),
      setMarcos: assign({
        marcos: (_, evt) => {
          if (evt.type !== 'UPDATE_MARCOS') throw new Error("Error no marco event")
          return evt.marcos
        }
      }),
      togglePagination: assign({
        isPaginated: (ctx, __) => !ctx.isPaginated
      }),
      reorder: assign({
        readyStack: (ctx, _) => orderByAlgorithm(ctx)
      }),
      checkAlgorithm: choose([
        {
          actions: ['setAlgorithm','setQuantumForMLFQ'],
          cond: (_, evt) => evt.algorithm === 'MLFQ'
        },
        {
          actions: 'setAlgorithm',
        }
      ]),
      setQuantumForMLFQ: assign({
        quantumSize: (_, __) => 10,
        quantum: (_, __) => 10,
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
        blockedProcessCounter: (_, __) => 5,
      }),
      updateBlockedStack: assign({
        readyStack: (ctx, _) => {
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
        quantum: (ctx, _) => ctx.quantum -= 1,
      }),
      updateTime: assign({
        currentTime: (ctx, _) => ctx.currentTime += 1,
      }),
      resetBlockedCounter: assign({
        blockedProcessCounter: (_, __) => 5,
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
        runningProcess: (_, __) => undefined,
      }),
      sendToReadyQueue: assign({
        readyStack: (ctx, _) => {
          if (!!ctx.readyStack && !!ctx.runningProcess) {
            let newStack = ctx.readyStack
            newStack.push(ctx.runningProcess)
            return newStack
          } else if (!!ctx.runningProcess)
            return [ctx.runningProcess]
        }
      }),
      resetQuantum: assign({
        quantum: (ctx, _) => ctx.quantumSize,
      }),
      fetchNewRunningProcess: assign({
        runningProcess: (ctx, _) => {
          const { readyStack } = ctx
          if (!!readyStack) return readyStack.shift()
        },
      }),
      setAlgorithm: assign({
        algorithm: (_, evt) => evt.algorithm,
      }),
      setQuantumSize: assign({
        quantumSize: (_, evt) => evt.quantumSize,
        quantum: (_, evt) => evt.quantumSize,
      }),
      setQuantumActive: assign({
        quantumActive: (_, evt) => evt.quantumActive
      }),
    },
    guards: {
      isblockedCounterExpired: (ctx, _) => ctx.blockedProcessCounter === 0,
      isblockedStackPopulated: (ctx, _) => !!ctx.blockedStack && ctx.blockedStack.length > 0,
      isAlgoritmForQuantum: (ctx, _) => ctx.algorithm === 'ROUND_ROBIN' || ctx.algorithm === 'MLFQ' || 
        (ctx.algorithm === 'HRRN' && ctx.quantumActive) || (ctx.algorithm === 'SJF' && ctx.quantumActive),
      isQuantumExpired: (ctx, _) => isAlgoForQtm(ctx.algorithm) && ctx.quantum === 1,
    },
  },
)

const isAlgoForQtm = (algorithm: AlgorithmTypes) => {
  return algorithm === 'MLFQ' || algorithm === 'ROUND_ROBIN' ||
         algorithm === 'SJF' || algorithm === 'HRRN'
}

const orderByAlgorithm = (ctx: MyMachineContext) => {
  if (!ctx.readyStack) return
  switch (ctx.algorithm) {
    case 'FIFO':
      return orderByFifo(ctx.readyStack)
    case 'SRT':
      return orderBySrt(ctx.readyStack)
    case 'HRRN':
      return orderByHrrn(ctx.readyStack, ctx.currentTime)
    case 'SJF':
      return orderBySjf(ctx.readyStack)
    case 'ROUND_ROBIN':
      return orderByFifo(ctx.readyStack)
  }
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
    blockedProcessCounter: 5,
    newProcessList: [],
    isPaginated: false,
    pageAlgorithm: 'FIFO',
    marcos: 5
  }
  return useMachine(myMachine.withContext(defaultContext))
}

export { myMachine, useMyMachine }
