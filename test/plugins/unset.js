import test from 'ava'
import { each } from 'test-each'

import { defineClassOpts, defineGlobalOpts } from '../helpers/main.js'

const { TestError, AnyError } = defineClassOpts()

test('Passes error to plugin.unset()', (t) => {
  const cause = new TestError('causeMessage')
  t.true(new TestError('test', { cause }).unset.error instanceof Error)
})

test('Passes previous instance options to plugin.unset()', (t) => {
  const cause = new TestError('causeMessage', { prop: false })
  t.false(new TestError('test', { cause, prop: true }).unset.options.prop)
})

each([defineClassOpts, defineGlobalOpts], ({ title }, defineOpts) => {
  test(`Passes previous class or global options to plugin.unset() | ${title}`, (t) => {
    const { TestError: OtherTestError } = defineOpts({ prop: false })
    t.false(
      new OtherTestError('test', {
        cause: new OtherTestError('causeMessage'),
        prop: true,
      }).unset.options.prop,
    )
  })
})

each(['options', 'allOptions'], ({ title }, propName) => {
  test(`plugin.unset() cannot modify "options" | ${title}`, (t) => {
    const innerCause = new TestError('innerCauseMessage', {
      prop: { one: true },
    })
    const cause = new TestError('causeMessage', {
      cause: innerCause,
      prop: { one: true },
    })
    // eslint-disable-next-line fp/no-mutation
    cause.unset[propName].prop.one = false
    t.true(
      new TestError('test', { cause, prop: true }).unset[propName].prop.one,
    )
  })
})

test('plugin.unset() has "full: true" with normalize()', (t) => {
  const cause = new TestError('causeMessage')
  t.true(new TestError('test', { cause }).unset.options.full)
})

test('Passes all plugins options to plugin.unset()', (t) => {
  t.deepEqual(
    new TestError('test', {
      cause: new TestError('causeMessage', { prop: true }),
    }).unset.allOptions,
    { prop: true },
  )
})

test('plugin.unset() is not called without a cause', (t) => {
  t.false('unset' in new TestError('test'))
})

test('plugin.unset() is not called without a cause with a known type', (t) => {
  t.false('unset' in new TestError('test', { cause: '' }))
})

test('plugin.unset() is called with a cause with a known type', (t) => {
  const cause = new TestError('causeMessage')
  t.true('unset' in new TestError('test', { cause }))
})

test('plugin.unset() is passed AnyError', (t) => {
  const cause = new TestError('causeMessage')
  t.is(new TestError('test', { cause }).unset.AnyError, AnyError)
})
