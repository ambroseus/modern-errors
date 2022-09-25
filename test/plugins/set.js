import test from 'ava'
import { each } from 'test-each'

import { defineClassOpts, defineGlobalOpts } from '../helpers/main.js'
import { TEST_PLUGIN } from '../helpers/plugin.js'

const { TestError } = defineClassOpts()

test('Passes error to plugin.set()', (t) => {
  t.true(new TestError('test').set.error instanceof Error)
})

test('Passes instance options to plugin.set()', (t) => {
  t.true(new TestError('test', { prop: true }).set.options.prop)
})

each([defineClassOpts, defineGlobalOpts], ({ title }, defineOpts) => {
  test(`Passes class and global options to plugin.set() | ${title}`, (t) => {
    const { TestError: OtherTestError } = defineOpts({ prop: true })
    const error = new OtherTestError('test')
    t.true(error.set.options.prop)
  })

  test(`Object instance options are shallowly merged to class and global options | ${title}`, (t) => {
    const { TestError: OtherTestError } = defineOpts({
      prop: { one: false, two: { three: false }, five: false },
    })
    const error = new OtherTestError('test', {
      prop: { one: true, two: { three: true }, four: true },
    })
    t.deepEqual(error.set.options.prop, {
      one: true,
      two: { three: true },
      four: true,
      five: false,
    })
  })
})

test('plugin.set() cannot modify "options"', (t) => {
  const error = new TestError('causeMessage', { prop: { one: true } })
  error.set.options.prop.one = false
  t.true(error.getInstance().options.prop.one)
})

test('plugin.set() has "full: true" with getOptions()', (t) => {
  t.true(new TestError('test').set.options.full)
})

test('plugin.set() is optional', (t) => {
  const { TestError: OtherTestError } = defineClassOpts({}, {}, [
    { ...TEST_PLUGIN, set: undefined },
  ])
  t.false('set' in new OtherTestError('test'))
})
