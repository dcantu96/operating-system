interface Process {
  name: string
  estimatedExecutionTime: number
  arrivalTime: number
  assignedCpuTime: number
  level: number
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

type RunTypes =
  | 'real_time'
  | 'step'

interface MyMachineContext {
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
  name: string
  estimatedExecutionTime: number
  blockedProcessCounter: number
  processStatus: ProcessStatusTypes
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
  process: Process
  status: ProcessStatusTypes
  estimatedExecutionTime: number
  name: string
  algorithm: AlgorithmTypes
  quantum: number
  quantumSize: number
  quantumActive: boolean
}

interface NewProcessEvent extends MyMachineBaseEvent {
  type: 'NEW_PROCESS'
  process: Process
  status: ProcessStatusTypes
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

interface ChangeNameEvent extends MyMachineBaseEvent {
  type: 'CHANGE_NAME'
  name: string
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


interface ChangeEstimatedExecutionTimeEvent extends MyMachineBaseEvent {
  type: 'CHANGE_EST_TIME'
  estimatedExecutionTime: number
}

interface ChangeProcessStatusEvent extends MyMachineBaseEvent {
  type: 'CHANGE_PROCESS_STATUS'
  status: ProcessStatusTypes
}

type MyMachineEvent =
  | NewProcessEvent
  | AdvanceEvent
  | BackEvent
  | RealTimeEvent
  | StopEvent
  | ChangeNameEvent
  | ChangeEstimatedExecutionTimeEvent
  | ChangeProcessStatusEvent
  | ChangeAlgorithmEvent
  | ChangeQuantumSizeEvent
  | ChangeQuantumActiveEvent
  | TickEvent

export type { 
  Process,
  Stack,
  MyMachineEvent,
  MyMachineContext,
  MyMachineStateSchema,
  NewProcessEvent,
  ProcessStatusTypes,
  RegularAdvanceContext,
  AlgorithmTypes
}
