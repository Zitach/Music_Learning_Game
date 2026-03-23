import type { QuestionDraft } from '../questionTypes'
import { EXTENDED_QUESTION_BANK } from '../../../data/questionBankExtended'

export const BOSS_QUESTIONS = (EXTENDED_QUESTION_BANK as unknown as QuestionDraft[]).filter(question => question.skillId.startsWith('boss-'))

