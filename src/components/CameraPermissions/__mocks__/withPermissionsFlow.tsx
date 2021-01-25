import { h, FunctionComponent, ComponentType } from 'preact'
import type { WebcamProps } from 'react-webcam-onfido'

import type { CameraProps } from '~types/camera'
import type { WithTrackingProps } from '~types/hocs'

type Props = CameraProps & WebcamProps & WithTrackingProps

export const mockedOnUserMedia = jest.fn()
export const mockedOnFailure = jest.fn().mockImplementation((error) => error)

export default <P extends Props>(
  WrappedCamera: ComponentType<P>
): ComponentType<P> => {
  const WithPermissionFlow: FunctionComponent<P> = (props) => (
    <WrappedCamera
      {...props}
      hasGrantedPermission
      onFailure={mockedOnFailure}
      onUserMedia={mockedOnUserMedia}
    />
  )

  return WithPermissionFlow
}