import { ComponentType } from 'react'

export interface BaseModalProps {
  onClose?: () => void
  width?: string
  height?: string
}

export interface CreateCoverProps extends BaseModalProps {
  type: string
  isCoverClose?: boolean
  render?: ComponentType<BaseModalProps>
}

export type PropsModal<T extends BaseModalProps> = Omit<T, 'type'>
