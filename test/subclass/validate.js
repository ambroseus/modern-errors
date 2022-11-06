import test from 'ava'
import { each } from 'test-each'

import { KnownErrorClasses, ModernError } from '../helpers/known.js'

each(KnownErrorClasses, ({ title }, ErrorClass) => {
  test(`Cannot extend without subclass() | ${title}`, (t) => {
    class ChildError extends ErrorClass {}
    // eslint-disable-next-line max-nested-callbacks
    t.throws(() => new ChildError('test'))
  })

  test(`Can extend with subclass() | ${title}`, (t) => {
    const ChildError = ErrorClass.subclass('ChildError')
    t.is(new ChildError('test').name, 'ChildError')
  })
})

test('Can instantiate ModernError without any subclass', (t) => {
  t.true(new ModernError('') instanceof ModernError)
})
