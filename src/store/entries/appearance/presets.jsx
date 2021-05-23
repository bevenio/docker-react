import { restore } from '@/store/utility/store.utility'

const options = {
  themes: ['light', 'dark'],
}

const preset = restore.restoreEntry('appearance') || {
  title: 'Docker React',
  languageID: 'en',
  theme: options.themes[0],
  lettersize: 'medium',
}

export { options }
export { preset }

export default {
  options,
  preset,
}
