import { setErrorName } from 'error-class-utils'
import errorCustomClass from 'error-custom-class'

import { computePluginsOpts } from '../plugins/compute.js'
import { applyPluginsSet } from '../plugins/set.js'

import { normalizeConstructorArgs } from './args.js'
import { mergeCause } from './cause.js'
import { addAllInstanceMethods } from './instance.js'
import { normalize } from './normalize.js'
import { addAllStaticMethods } from './static.js'
import { validateClass } from './validate.js'

export const CoreError = errorCustomClass('CoreError')

// Base class for all error classes.
// This is not a global class since it is bound to call-specific plugins.
// Also used to wrap errors without changing their class.
// We encourage `instanceof` over `error.name` for checking since this:
//  - Prevents name collisions with other libraries
//  - Allows checking if any error came from a given library
//  - Includes error classes in the exported interface explicitly instead of
//    implicitly, so that users are mindful about breaking changes
//  - Bundles classes with TypeScript documentation, types and autocompletion
//  - Encourages documenting error types
// Checking class with `error.name` is still supported, but not documented
//  - Since it is widely used and can be better in specific cases
// We do not solve name collisions with the following alternatives:
//  - Namespacing all error names with a common prefix since this:
//     - Leads to verbose error names
//     - Requires either an additional option, or guessing ambiguously whether
//       error names are meant to include a namespace prefix
//     - Means special error classes (like `AnyError` or `UnknownError`) might
//       or not be namespaced which might be confusing
//  - Using a separate `namespace` property: this adds too much complexity and
//    is less standard than `instanceof`
export const createBaseError = function ({
  state,
  errorData,
  globalOpts,
  plugins,
}) {
  /* eslint-disable fp/no-this */
  class BaseError extends CoreError {
    constructor(message, opts) {
      const {
        KnownClasses,
        KnownClasses: { UnknownError },
        GlobalBaseError,
        AnyError,
      } = state
      const isAnyError = new.target === AnyError
      const optsA = normalizeConstructorArgs({
        opts,
        UnknownError,
        BaseError,
        isAnyError,
      })

      super(message, optsA)

      const { error, cause } = mergeCause(this, isAnyError)
      const ChildError = error.constructor
      validateClass({ ChildError, GlobalBaseError, KnownClasses, isAnyError })
      computePluginsOpts({
        error,
        ChildError,
        opts: optsA,
        isAnyError,
        errorData,
        plugins,
      })
      applyPluginsSet({
        error,
        AnyError,
        KnownClasses,
        errorData,
        cause,
        plugins,
      })
      /* c8 ignore start */
      // eslint-disable-next-line no-constructor-return
      return error
    }
    /* c8 ignore stop */

    static normalize = normalize.bind(undefined, state, BaseError)
  }
  /* eslint-enable fp/no-this */
  setErrorName(BaseError, 'BaseError')
  addAllInstanceMethods({ plugins, errorData, BaseError, state })
  addAllStaticMethods({ plugins, globalOpts, BaseError, state })
  return BaseError
}
