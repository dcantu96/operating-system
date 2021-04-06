import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { MyMachineContext, MyMachineStateSchema, MyMachineEvent, Stack } from './index.types'
import { choose } from "xstate/lib/actions";

const myMachine = Machine<MyMachineContext, MyMachineStateSchema, MyMachineEvent>(
  {
    key: 'main',
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
      marcos: 5,
      pageNumberToRun: undefined
    },
    states: {
      pagination: {
        key: 'pagination',
        initial: 'idle',
        states: {
          idle: {
            on: {
              TOGGLE_PAGINATION: {
                target: '#main.step',
                actions: 'togglePagination',
              },
              RUN_PAGE: { 
                target: 'paginationAdvance',
                actions: 'setPageNumberToRun'
              },
              ADVANCE: '#main.advance',
              NEW_PROCESS_LIST: { actions: ['setNewProcessList'] },
              UPDATE_CURRENT_TIME: { actions: 'setCurrentTime' },
              CHANGE_QUANTUM_ACTIVE: { actions: 'setQuantumActive' },
              CHANGE_ALGORITHM: { actions: ['updateAlgorithm'] },
              CHANGE_QUANTUM_SIZE: { actions: 'setQuantumSize' },
              CHANGE_PAGE_ALGORITHM: { actions: 'setPageAlgorithm' },
              RESET_NUR_BITS: { actions: 'resetNURBits' },
              UPDATE_MARCOS: { actions: 'setMarcos' },
            }
          },
          paginationAdvance: {
            always: [
              { 
                target: '#main.advance',
                actions: ['updatePageValues'],
                cond: 'isPageLoaded',
              },
              { 
                target: '#main.advance',
                actions: 'activatePageAndBlock',
                cond: 'marcosAvailable'
              },
              { 
                target: '#main.advance',
                actions: ['deactivatePageByAlgo','activatePageAndBlock']
              }
            ]
          },
        },
      },
      step: {
        on: {
          TOGGLE_PAGINATION: {
            target: 'pagination',
            actions: 'togglePagination'
          },
          ADVANCE: 'advance',
          NEW_PROCESS_LIST: { actions: ['setNewProcessList'] },
          UPDATE_CURRENT_TIME: { actions: 'setCurrentTime' },
          CHANGE_QUANTUM_ACTIVE: { actions: 'setQuantumActive' },
          CHANGE_ALGORITHM: { actions: ['updateAlgorithm'] },
          CHANGE_QUANTUM_SIZE: { actions: 'setQuantumSize' },
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
            actions: ['updateTime','checkFinished','checkBlocked','checkQuantum','advance'],
          },
          STOP: {
            actions: 'stop',
            target: 'step',
          },
        }
      },
      advance: {
        key: 'advance',
        initial: 'advanceTime',
        states: {
          advanceTime: {
            always: {
              target: 'tickQuantum',
              actions: 'advanceTime'
            }
          },
          tickQuantum: {
            always: [
              { 
                target: 'tickBlockedStack',
                actions: 'tickQuantum',
                cond: 'isAlgoForQuantum'
              },
              { target: 'tickBlockedStack' }
            ]
          },
          tickBlockedStack: {
            always: {
              target: 'updateRunningProcessStatus',
              actions: 'tickBlockedStack'
            }
          },
          updateRunningProcessStatus: {
            always: [
              { 
                target: 'updateReadyStackStatus',
                cond: 'isProcessBlocked'
              },
              { 
                target: 'updateReadyStackStatus',
                actions: 'updateRunningProcessStatus', // if quantum -> validate also with quantum
              }
            ]
          },
          updateReadyStackStatus: {
            always: [
              { 
                target: 'updateBlockedStackStatus',
                actions: 'prepareFirstReadyProcess',
                cond: 'hasRunningProcessStatusChanged'
              },
              { target: 'updateBlockedStackStatus' }
            ]
          },
          updateBlockedStackStatus: {
            always: { 
              target: 'transitRunningProcess',
              actions: 'prepareBlockedStack',
            }
          },
          transitRunningProcess: {
            always: { 
              target: 'transitReadyStack',
              actions: 'transitRunningProcess',
            }
          },
          transitReadyStack: {
            always: { 
              target: 'transitBlockedStack',
              actions: 'transitAndFilterReadyStack',
            }
          },
          transitBlockedStack: {
            always: { 
              target: 'orderReadyStackByAlgo',
              actions: ['transitAndFilterBlockedStack'],
            }
          },
          orderReadyStackByAlgo: {
            always: { 
              target: '#main.pagination',
              actions: 'orderReadyStackByAlgo',
            }
          }
        }
      },
    },
  },
  {
    actions: {
      setNewProcessList: assign((ctx, evt) => {
        if (evt.type !== 'NEW_PROCESS_LIST') throw new Error("Not supposed to happen. evt type is: " + evt)
        let newReadyStack = ctx.readyStack
        let newBlockedStack = ctx.blockedStack
        let newFinishedStack = ctx.finishedStack
        let newRunningProcess = ctx.runningProcess
        evt.processList.forEach(newProcess => {
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
      updatePageValues: assign((ctx, _) => {
        console.log('updatePageValues', ctx.runningProcess)
        if (ctx.pageNumberToRun === undefined) throw new Error("Page to run not assigned")
        if (!ctx.runningProcess) throw new Error("No running Process on 'updatePageValues' action")
        let newRunningProcess = ctx.runningProcess
        newRunningProcess.assignedCpuTime += 1
        newRunningProcess.pages = newRunningProcess.pages.map(page => (
          page.number === ctx.pageNumberToRun ?
            { 
              ...page, 
              arrivalTime: page.arrivalTime === 0 && ctx.currentTime !== 0 ? ctx.currentTime : page.arrivalTime,
              accessAmount: page.accessAmount + 1,
              lastAccessTime: ctx.currentTime,
              nur: {
                ...page.nur,
                read: true,
                write: page.nur.readCounts === 5,
                readCounts: page.nur.readCounts === 5 ? 0 : page.nur.readCounts + 1
              }
            }
            : page
        ))
        return { runningProcess: newRunningProcess }
      }),
      activatePageAndBlock: assign((ctx, _) => {
        console.log('activatePageAndBlock', ctx.runningProcess)
        if (ctx.pageNumberToRun === undefined) throw new Error("Page to run not assigned")
        if (!ctx.runningProcess) throw new Error("No running Process on 'activatePageAndBlock' action")
        let newRunningProcess = ctx.runningProcess
        newRunningProcess.status = 'BLOCKED'
        newRunningProcess.pages = newRunningProcess.pages.map(page => (
          page.number === ctx.pageNumberToRun ?
            { ...page, residence: true } : page
        ))
        return { runningProcess: newRunningProcess }
      }),
      deactivatePageByAlgo: assign((ctx, _) => {
        console.log('deactivatePageByAlgo', ctx.runningProcess)
        if (ctx.pageNumberToRun === undefined) throw new Error("Page to run not assigned")
        if (!ctx.runningProcess) throw new Error("No running Process on 'deactivatePageByAlgo' action")
        let newRunningProcess = ctx.runningProcess
        if (ctx.pageAlgorithm === 'FIFO') {
          let fifoSort = newRunningProcess.pages
            .sort((a, b) => a.arrivalTime - b.arrivalTime) // Fifo sort
          const foundIndex = fifoSort.findIndex(page => page.residence)
          fifoSort[foundIndex].residence = false // deactivate
          newRunningProcess.pages = fifoSort
        } else if (ctx.pageAlgorithm === 'LFU') {
          let lfuSort = newRunningProcess.pages
            .sort((a, b) => a.accessAmount - b.accessAmount) // LFU sort
          const foundIndex = lfuSort.findIndex(page => page.residence)
          lfuSort[foundIndex].residence = false // deactivate
          newRunningProcess.pages = lfuSort
        } else if (ctx.pageAlgorithm === 'LRU') {
          let lruSort = newRunningProcess.pages
            .sort((a, b) => a.lastAccessTime - b.lastAccessTime) // lru sort
          const foundIndex = lruSort.findIndex(page => page.residence)
          lruSort[foundIndex].residence = false // deactivate
          newRunningProcess.pages = lruSort
        } else { // NUR
          let nurSort = newRunningProcess.pages // nur sort
          const foundIndex1 = nurSort.findIndex(page => !page.nur.read && !page.nur.write)
          const foundIndex2 = nurSort.findIndex(page => page.nur.read && !page.nur.write)
          const foundIndex3 = nurSort.findIndex(page => !page.nur.read && page.nur.write)
          const foundIndex4 = nurSort.findIndex(page => page.nur.read && page.nur.write)
          if (foundIndex1 !== -1) 
            nurSort[foundIndex1].residence = false
          else if (foundIndex2 !== -1) 
            nurSort[foundIndex2].residence = false
          else if (foundIndex3 !== -1) 
            nurSort[foundIndex3].residence = false
          else if (foundIndex4 !== -1) 
            nurSort[foundIndex4].residence = false
          newRunningProcess.pages = nurSort
        }
        newRunningProcess.pages.sort((a, b) => a.number - b.number)
        return { runningProcess: newRunningProcess }
      }),
      advanceTime: assign({
        currentTime: (ctx, _) => ctx.currentTime + 1
      }),
      tickBlockedStack: assign({
        blockedStack: (ctx, _) => ctx.blockedStack?.map(proc => (
          {...proc, blockedTime: proc.blockedTime - 1}
        ))
      }),
      updateRunningProcessStatus: assign((ctx, _) => {
        console.log('updateRunningProcessStatus', ctx.runningProcess)
        if (!ctx.runningProcess) return {}
        if (ctx.runningProcess.assignedCpuTime === ctx.runningProcess.estimatedExecutionTime)
          return { 
            runningProcess: {...ctx.runningProcess, status: 'FINISHED'},
            quantum: ctx.quantumSize // todo: check if this happens
          }
        else if (isAlgoForQtm(ctx)) {
          if (ctx.quantum > 0) return { runningProcess: ctx.runningProcess }
          else return { 
            runningProcess: {...ctx.runningProcess, status: 'READY'},
            quantum: ctx.quantumSize
          }
        } else return { runningProcess: ctx.runningProcess } // last case
      }),
      prepareFirstReadyProcess: assign({
        readyStack: (ctx, _) => ctx.readyStack?.map((proc, i) => (
          i === 0 ? {...proc, status: 'RUNNING'} : proc
        ))
      }),
      prepareBlockedStack: assign({
        blockedStack: (ctx, _) => ctx.blockedStack?.map(proc => (
          {
            ...proc, 
            status: proc.blockedTime === 0 ? 'READY' : 'BLOCKED',
            blockedTime: proc.blockedTime === 0 ? 5 : proc.blockedTime
          }
        ))
      }),
      transitRunningProcess: assign((ctx, _) => {
        console.log('transitRunningProcess', ctx.runningProcess)
        if (!ctx.runningProcess) return {}
        if (ctx.runningProcess.status === 'READY') {
          if (!ctx.readyStack) return { readyStack: [ctx.runningProcess], runningProcess: undefined }
          return { readyStack: [...ctx.readyStack, ctx.runningProcess], runningProcess: undefined }
        } else if (ctx.runningProcess.status === 'BLOCKED') {
          if (!ctx.blockedStack) return { blockedStack: [ctx.runningProcess], runningProcess: undefined }
          return { blockedStack: [...ctx.blockedStack, ctx.runningProcess], runningProcess: undefined }
        } else if (ctx.runningProcess.status === 'FINISHED') {
          if (!ctx.finishedStack) return { finishedStack: [ctx.runningProcess], runningProcess: undefined }
          return { finishedStack: [...ctx.finishedStack, ctx.runningProcess], runningProcess: undefined }
        } else {
          return { runningProcess: ctx.runningProcess }
        }
      }),
      transitAndFilterReadyStack: assign((ctx, _) => {
        console.log('transitAndFilterReadyStack', ctx.runningProcess)
        if (!ctx.readyStack) return { readyStack: undefined }
        const newRunningProcess = ctx.readyStack.find(proc => proc.status === 'RUNNING')
        return { 
          runningProcess: newRunningProcess || ctx.runningProcess,
          readyStack: ctx.readyStack.filter(proc => proc.status === 'READY') 
        }
      }),
      transitAndFilterBlockedStack: assign((ctx, _) => {
        console.log('transitAndFilterBlockedStack', ctx.runningProcess)
        if (!ctx.blockedStack) return { blockedStack: undefined }
        if (!ctx.readyStack) 
          return { 
            readyStack: ctx.blockedStack.filter(proc => proc.status === 'READY'),
            blockedStack: ctx.blockedStack.filter(proc => proc.status === 'BLOCKED') 
          }
        else
          return { 
            readyStack: [...ctx.readyStack, ...ctx.blockedStack.filter(proc => proc.status === 'READY')],
            blockedStack: ctx.blockedStack.filter(proc => proc.status === 'BLOCKED')
          }
      }),
      orderReadyStackByAlgo: assign({
        readyStack: (ctx, _) => orderByAlgorithm(ctx)
      }),
      setPageNumberToRun: assign({
        pageNumberToRun: (_, evt) => evt.type === 'RUN_PAGE' ? evt.number : undefined
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
      setPageAlgorithm: assign({
        pageAlgorithm: (_, evt) => {
          console.log(evt)
          if (evt.type !== 'CHANGE_PAGE_ALGORITHM') throw new Error("Error no PAGE ALGO event")
          return evt.pageAlgorithm
        }
      }),
      togglePagination: assign({
        isPaginated: (ctx, __) => !ctx.isPaginated
      }),
      updateAlgorithm: choose([
        {
          actions: ['setAlgorithm','setQuantumForMLFQ'],
          cond: (_, evt) => evt.type === 'CHANGE_ALGORITHM' && evt.algorithm === 'MLFQ'
        },
        {
          actions: 'setAlgorithm',
        }
      ]),
      setQuantumForMLFQ: assign({
        quantumSize: (_, __) => 10,
        quantum: (_, __) => 10,
      }),
      tickQuantum: assign({
        quantum: (ctx, _) => ctx.quantum -= 1,
      }),
      updateTime: assign({
        currentTime: (ctx, _) => ctx.currentTime += 1,
      }),
      transitRunningToReady: assign({
        readyStack: (ctx, _) => {
          if (!ctx.runningProcess) throw new Error("No running proccess");
          if (!!ctx.readyStack) return [...ctx.readyStack, ctx.runningProcess]
          else return [ctx.runningProcess]
        }
      }),
      resetQuantum: assign({
        quantum: (ctx, _) => ctx.quantumSize,
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
      marcosAvailable: (ctx, _) => {
        if (ctx.pageNumberToRun === undefined) throw new Error("Page to run not available")
        if (!ctx.runningProcess) throw new Error("No error on is loaded guard")
        return ctx.runningProcess.pages.filter(page => page.residence).length < ctx.marcos
      },
      isPageLoaded: (ctx, _) => {
        if (ctx.pageNumberToRun === undefined) throw new Error("Page to run not available")
        if (!ctx.runningProcess) throw new Error("No error on is loaded guard")
        return !!ctx.runningProcess.pages.find(page => page.number === ctx.pageNumberToRun)?.residence
      },
      hasRunningProcessStatusChanged: (ctx, _) => ctx.runningProcess?.status !== 'RUNNING',
      isProcessBlocked: (ctx, _) => ctx.runningProcess?.status === 'BLOCKED',
      isblockedCounterExpired: (ctx, _) => ctx.blockedProcessCounter === 0,
      isblockedStackPopulated: (ctx, _) => !!ctx.blockedStack && ctx.blockedStack.length > 0,
      isAlgoForQuantum: (ctx, _) => isAlgoForQtm(ctx),
      isProccessFinished: (ctx, _) => !!ctx.runningProcess && 
            ctx.runningProcess.assignedCpuTime ===
            ctx.runningProcess.estimatedExecutionTime,
    },
  },
)

const isAlgoForQtm = (ctx: MyMachineContext) => {
  return ctx.algorithm === 'ROUND_ROBIN' || ctx.algorithm === 'MLFQ' || 
  (ctx.algorithm === 'HRRN' && ctx.quantumActive) || (ctx.algorithm === 'SJF' && ctx.quantumActive)
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
    marcos: 5,
    pageNumberToRun: undefined
  }
  return useMachine(myMachine.withContext(defaultContext))
}

export { myMachine, useMyMachine }
