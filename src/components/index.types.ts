interface NUR {
  residence: boolean
  modification: boolean
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
}

type Stack =
  Process[]

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
  newProcessList: Process[]
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
  isPaginated: boolean
  pageAlgorithm: PageAlgorithmTypes
  marcos: number
}

interface RegularAdvanceContext extends MyMachineContext{
  runningProcess: Process
  readyStack: Stack
}

interface MyMachineStateSchema {
  states: {
    step: {}
    realTime: {}
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

type MyMachineEvent =
  | NewProcessListEvent
  | UpdateCurrentTimeEvent
  | UpdateMarcosEvent
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
