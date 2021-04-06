interface NUR {
  readCounts: number
  read: boolean
  write: boolean
}

export interface Page {
  number: number
  residence: boolean
  arrivalTime: number
  lastAccessTime: number
  accessAmount: number
  nur: NUR
}

export interface Process {
  name: string
  estimatedExecutionTime: number
  arrivalTime: number
  assignedCpuTime: number
  status: ProcessStatusTypes
  pages: Page[]
  blockedTime: number
}


type Stack = Process[]

type ProcessStatusTypes =
  | 'BLOCKED'
  | 'RUNNING'
  | 'READY'
  | 'FINISHED'

type AlgorithmTypes =
  | 'ROUND_ROBIN'
  | 'MLFQ'
  | 'SRT'
  | 'HRRN'
  | 'FIFO'
  | 'SJF'

type PageAlgorithmTypes =
  | 'FIFO'
  | 'LRU'
  | 'LFU'
  | 'NUR'

type RunTypes =
  | 'real_time'
  | 'step'

interface MyMachineContext {
  isPaginated: boolean
  newProcessList: Stack
  quantumSize: number
  quantumActive: boolean
  runningProcess: Process | undefined
  readyStack: Stack | undefined
  blockedStack: Stack | undefined
  finishedStack: Stack | undefined
  currentTime: number
  quantum: number
  algorithm: AlgorithmTypes
  runType: RunTypes
  blockedProcessCounter: number
  pageAlgorithm: PageAlgorithmTypes
  marcos: number
  pageNumberToRun?: number
}

interface RegularAdvanceContext extends MyMachineContext {
  runningProcess: Process
  readyStack: Stack
}

interface MyMachineStateSchema {
  states: {
    pagination: {
      states: {
        idle: {}
        paginationAdvance: {} // is page loaded? -> load data also increment assigned cpu time & tick quantum WHEN NECESARRY // page NOT loaded... set running process to blocked
      }
    }
    step: {}
    realTime: {}
    advance: {
      states: {
        advanceTime: {}
        tickQuantum: {}
        tickBlockedStack: {}
        updateRunningProcessStatus: {} // if quantum -> validate also with quantum, else just validate with time remaining for process. Guard clause: CHECK IF PROCESS NOT BLOCKED
        updateReadyStackStatus: {} // set first item of array to running only when runnning process is NOT RUNNING
        updateBlockedStackStatus: {} // set items to ready only if quantumCounter  == 0
        transitRunningProcess: {} // only move if status != running
        transitReadyStack: {} // only move if first item == running && filter
        transitBlockedStack: {} // only move items with 'ready' to ready && filter
        orderReadyStackByAlgo: {}
      }
    }
  }
}

interface MyMachineBaseEvent {
  algorithm: AlgorithmTypes
  quantum: number
  quantumSize: number
  quantumActive: boolean
}

interface NewProcessListEvent extends MyMachineBaseEvent {
  type: 'NEW_PROCESS_LIST'
  processList: Process[]
}

interface AdvanceEvent extends MyMachineBaseEvent {
  type: 'ADVANCE'
}

interface BackEvent extends MyMachineBaseEvent {
  type: 'BACK'
}

interface RealTimeEvent extends MyMachineBaseEvent {
  type: 'REAL_TIME'
}

interface StopEvent extends MyMachineBaseEvent {
  type: 'STOP'
}

interface TickEvent extends MyMachineBaseEvent {
  type: 'TICK'
}

interface ChangeAlgorithmEvent extends MyMachineBaseEvent {
  type: 'CHANGE_ALGORITHM'
  algorithm: AlgorithmTypes
}

interface ChangeQuantumSizeEvent extends MyMachineBaseEvent {
  type: 'CHANGE_QUANTUM_SIZE'
  quantum: number
}

interface ChangeQuantumActiveEvent extends MyMachineBaseEvent {
  type: 'CHANGE_QUANTUM_ACTIVE'
  quantumActive: boolean
}

interface UpdateCurrentTimeEvent extends MyMachineBaseEvent {
  type: 'UPDATE_CURRENT_TIME'
  currentTime: number
}

interface TogglePaginationEvent extends MyMachineBaseEvent {
  type: 'TOGGLE_PAGINATION'
}

interface ChangePageAlgorithmEvent extends MyMachineBaseEvent {
  type: 'CHANGE_PAGE_ALGORITHM'
  pageAlgorithm: PageAlgorithmTypes
}

interface UpdateMarcosEvent extends MyMachineBaseEvent {
  type: 'UPDATE_MARCOS'
  marcos: number
}

interface ResetNURBitsEvent extends MyMachineBaseEvent {
  type: 'RESET_NUR_BITS'
}

interface RunPageEvent extends MyMachineBaseEvent {
  type: 'RUN_PAGE'
  number: number
}

type MyMachineEvent =
  | NewProcessListEvent
  | UpdateCurrentTimeEvent
  | UpdateMarcosEvent
  | RunPageEvent
  | ResetNURBitsEvent
  | ChangePageAlgorithmEvent
  | TogglePaginationEvent
  | AdvanceEvent
  | BackEvent
  | RealTimeEvent
  | StopEvent
  | ChangeAlgorithmEvent
  | ChangeQuantumSizeEvent
  | ChangeQuantumActiveEvent
  | TickEvent

export type { 
  Stack,
  MyMachineEvent,
  MyMachineContext,
  MyMachineStateSchema,
  NewProcessListEvent,
  ProcessStatusTypes,
  RegularAdvanceContext,
  AlgorithmTypes
}
