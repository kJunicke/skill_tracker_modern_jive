import type { SkillData } from './skill'
import type { SkillStatus } from '@/utils/constants'

// Modal identifiers - ensures type safety for modal element IDs
export type ModalId = 
  | 'skillModal'
  | 'practiceRatingModal'
  | 'progressionTimelineModal'
  | 'statusEditorModal'
  | 'tagsEditorModal'
  | 'notesEditorModal'
  | 'trainingLogModal'
  | 'statusTransitionModal'

// Generic modal state interface
export interface ModalState<T = SkillData> {
  isVisible: boolean
  selectedSkill: T | null
}

// Specific modal states - using type aliases instead of empty interfaces
export type SkillModalState = ModalState<SkillData>
export type PracticeModalState = ModalState<SkillData>
export type TimelineModalState = ModalState<SkillData>
export type StatusModalState = ModalState<SkillData>
export type TagsModalState = ModalState<SkillData>
export type NotesModalState = ModalState<SkillData>

export interface TrainingLogModalState {
  isVisible: boolean
}

export interface TrainingScheduleModalState {
  isVisible: boolean
}

export interface StatusTransitionModalState {
  isVisible: boolean
  selectedSkill: SkillData | null
  suggestedStatus?: SkillStatus
  reason: string
}

// Combined modal states interface
export interface AllModalStates {
  skill: SkillModalState
  practice: PracticeModalState
  timeline: TimelineModalState
  status: StatusModalState
  tags: TagsModalState
  notes: NotesModalState
  trainingLog: TrainingLogModalState
  trainingSchedule: TrainingScheduleModalState
  statusTransition: StatusTransitionModalState
}

// Modal event handlers
export interface ModalEventHandlers {
  onSaveSkill: (skillData: Partial<SkillData>) => void
  onPracticeComplete: (skillId: string, quality: number, notes: string, isLevelUp?: boolean, levelUpComment?: string) => void
  onStatusChanged: (skillId: string, newStatus: string) => void
  onTagsChanged: (skillId: string, newTags: string[]) => void
  onNotesChanged: (skillId: string, newNotes: string) => void
  onStatusTransitionConfirm: (skillId: string, newStatus: SkillStatus) => void
}