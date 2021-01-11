import type { SupportedLanguages, LocaleConfig } from './locales'
import type { StepConfig, StepTypes } from './steps'
import type { EnterpriseFeatures } from './enterprise'

interface DocumentResponse {
  id: string
  side: string
  type: string
}

interface FaceResponse {
  id: string
  variant: string
}

export interface SdkResponse {
  document_front: DocumentResponse
  document_back?: DocumentResponse
  face: FaceResponse
}

export interface SdkError {
  type: 'exception' | 'expired_token'
  message: string
}

export type ServerRegions = 'US' | 'EU' | 'CA'

interface FunctionalConfigurations {
  disableAnalytics?: boolean
  mobileFlow?: boolean
  roomId?: string
  tearDown?: boolean
  useMemoryHistory?: boolean
}

export interface SdkOptions extends FunctionalConfigurations {
  // Callbacks
  onComplete?: (data: SdkResponse) => void
  onError?: (error: SdkError) => void
  onModalRequestClose?: () => void

  // Customization
  token?: string
  useModal?: boolean
  isModalOpen?: boolean
  shouldCloseOnOverlayClick?: boolean
  containerId?: string
  containerEl?: HTMLElement | null
  language?: SupportedLanguages | LocaleConfig
  region?: ServerRegions
  smsNumberCountryCode?: string
  userDetails?: {
    smsNumber?: string
  }
  steps?: Array<StepTypes | StepConfig>
  enterpriseFeatures?: EnterpriseFeatures
}

export interface SdkHandle {
  options: SdkOptions
  setOptions(options: SdkOptions): void
  tearDown(): void
}

export type SdkInitMethod = (options: SdkOptions) => SdkHandle