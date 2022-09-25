// eslint-disable-next-line filenames/match-exported
import isPlainObj from 'is-plain-obj'

// Error properties can be set using the `props` option
const getOptions = function ({ options: props = {} }) {
  if (!isPlainObj(props)) {
    throw new TypeError(`"props" option must be a plain object: ${props}`)
  }

  // eslint-disable-next-line no-unused-vars
  const { message, ...propsA } = props
  return propsA
}

// Set `props` option as error properties
const set = function ({ options }) {
  return options
}

const unset = function ({ options }) {
  return Object.assign({}, ...Reflect.ownKeys(options).map(getUnsetProp))
}

const getUnsetProp = function (key) {
  return { [key]: undefined }
}

const PROPS_PLUGIN = { name: 'props', getOptions, set, unset }

// eslint-disable-next-line import/no-default-export
export default PROPS_PLUGIN
