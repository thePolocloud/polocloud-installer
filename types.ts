export type InstallState = {
  acceptedTerms: boolean
  module?: 'cli' | 'node' | 'all'
  database?: {
    exists: boolean
    type?: 'sql' | 'nosql'
    credentials?: {
      host: string
      port: number
      username: string
      password: string
      database: string
    }
  }
}

export const state: InstallState = {
  acceptedTerms: false,
}