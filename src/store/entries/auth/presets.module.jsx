import { Restore } from '@/store/utility/store-utility.module'

const options = {
  status: {
    unset: 'unset',
    trying: 'trying',
    failed: 'failed',
    succeeded: 'succeeded',
  },
}

const preset = Restore.restoreEntry('auth') || {
  jwt: null,
  status: options.status.unset,
}

export { options }
export { preset }

export default {
  options,
  preset,
}
