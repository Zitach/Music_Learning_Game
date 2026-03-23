import { validateQuestionBank } from '../src/domain/questions/validation'

const errors = validateQuestionBank()
if (errors.length > 0) {
  console.error('Question bank validation failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Question bank validation passed.')
