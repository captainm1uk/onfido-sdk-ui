import { h, Component } from 'preact'
import Webcam from 'react-webcam-onfido'
import { screenshot } from '~utils/camera'
import { mimeType } from '~utils/blob'
import { getInactiveError } from '~utils/inactiveError'
import { DocumentOverlay } from '../Overlay'
import { ToggleFullScreen } from '../FullScreen'
import { sendEvent } from '../../Tracker'
import Spinner from '../Spinner'
import Timeout from '../Timeout'
import Camera from '../Camera'
import CameraError from '../CameraError'
import style from './style.scss'

import type { LocalisedType } from 'locales'
import type { SdkMetadata } from '~types/commons'
import type { CapturePayload } from '~types/redux'
import type {
  HandleCaptureProp,
  RenderFallbackProp,
  TrackScreenProp,
} from '~types/routers'
import type { DocumentTypes } from '~types/steps'

type Props = {
  className?: string
  containerClassName: string
  documentType?: DocumentTypes
  isUploadFallbackDisabled: boolean
  onCapture: HandleCaptureProp
  renderFallback: RenderFallbackProp
  renderTitle: JSX.Element
  trackScreen: TrackScreenProp
} & LocalisedType

type State = {
  hasAllowedCameraAccess: boolean
  hasBecomeInactive: boolean
  hasCameraError: boolean
  isCapturing: boolean
}

const IDEAL_CAMERA_HEIGHT_IN_PX = 1080
const FALLBACK_HEIGHT_IN_PX = 720

export default class DocumentLiveCapture extends Component<Props, State> {
  private webcam?: Webcam = null

  state = {
    hasAllowedCameraAccess: false,
    hasBecomeInactive: false,
    hasCameraError: false,
    isCapturing: false,
  }

  handleUserMediaReady = (): void => {
    this.setState({ hasAllowedCameraAccess: true })
  }

  handleTimeout = (): void => this.setState({ hasBecomeInactive: true })

  handleCameraError = (): void => this.setState({ hasCameraError: true })

  captureDocument = (blob: Blob, sdkMetadata: SdkMetadata): void => {
    const documentCapture: CapturePayload = {
      blob,
      sdkMetadata,
      filename: `document_capture.${mimeType(blob)}`,
      isPreviewCropped: true,
    }
    this.props.onCapture(documentCapture)
    this.setState({ isCapturing: false })
  }

  captureDocumentPhoto = (): void => {
    this.setState({ isCapturing: true })
    sendEvent('Taking live photo of document')
    screenshot(this.webcam, this.captureDocument, 'image/jpeg')
  }

  componentWillUnmount(): void {
    this.setState({ isCapturing: false })
  }

  render(): JSX.Element {
    const {
      translate,
      trackScreen,
      renderFallback,
      isUploadFallbackDisabled,
      className,
      containerClassName,
      renderTitle,
      documentType,
    } = this.props

    const {
      hasAllowedCameraAccess,
      hasBecomeInactive,
      hasCameraError,
      isCapturing,
    } = this.state

    const id1SizeDocuments = new Set([
      'driving_licence',
      'national_identity_card',
    ])

    const documentSize = id1SizeDocuments.has(documentType)
      ? 'id1Card'
      : 'id3Card'

    return (
      <div className={style.container}>
        {this.state.isCapturing ? (
          <Spinner />
        ) : (
          <Camera
            facing={'environment'}
            idealCameraHeight={IDEAL_CAMERA_HEIGHT_IN_PX}
            className={className}
            containerClassName={containerClassName}
            renderTitle={renderTitle}
            translate={translate}
            webcamRef={(c: Webcam) => (this.webcam = c)}
            isUploadFallbackDisabled={isUploadFallbackDisabled}
            trackScreen={trackScreen}
            onUserMedia={this.handleUserMediaReady}
            onError={this.handleCameraError}
            renderFallback={renderFallback}
            renderError={
              hasBecomeInactive ? (
                <CameraError
                  {...{ trackScreen, renderFallback }}
                  error={getInactiveError(isUploadFallbackDisabled)}
                  isDismissible
                />
              ) : null
            }
            buttonType="photo"
            onButtonClick={this.captureDocumentPhoto}
            isButtonDisabled={hasCameraError || isCapturing}
            fallbackHeight={FALLBACK_HEIGHT_IN_PX}
          >
            {hasAllowedCameraAccess && !hasCameraError && (
              <Timeout seconds={10} onTimeout={this.handleTimeout} />
            )}
            <ToggleFullScreen />
            <DocumentOverlay documentSize={documentSize} />
          </Camera>
        )}
      </div>
    )
  }
}