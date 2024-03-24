import { exec } from '../exec'
import type { ResolverFn } from '../resolve'

export const darwinHWID: ResolverFn = async () => {
  const { stdout } = await exec('ioreg -rd1 -c IOPlatformExpertDevice')
  const uuid = stdout
    .trim()
    .split('\n')
    .find(line => line.includes('IOPlatformUUID'))
    ?.replaceAll(/=|\s+|"/gi, '')
    .replaceAll('IOPlatformUUID', '')

  if (!uuid) throw new Error('failed to find hwid')
  return uuid
}