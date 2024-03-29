import { resolveID } from './resolve'

export const getHWID = async () => {
  const hwid = await resolveID()
  if (hwid === '') throw new Error('failed to find hwid')

  return hwid
}