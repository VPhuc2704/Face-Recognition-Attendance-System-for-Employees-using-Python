/**
 * Hệ thống quản lý sự kiện xác thực
 */

import { AuthEventPayload, AuthEventType } from '@/constants/type'

class AuthEventManager {
  /**
   * Phát ra một sự kiện xác thực
   */
  emit(eventType: AuthEventType, payload?: AuthEventPayload): void {
    window.dispatchEvent(
      new CustomEvent(eventType, {
        detail: payload || {}
      })
    )
  }

  /**
   * Đăng ký lắng nghe sự kiện xác thực
   * @returns Hàm để hủy đăng ký
   */
  on(eventType: AuthEventType, callback: (payload: AuthEventPayload) => void): () => void {
    const eventHandler = (event: Event): void => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail)
    }

    window.addEventListener(eventType, eventHandler)

    // Trả về hàm để hủy đăng ký
    return () => {
      window.removeEventListener(eventType, eventHandler)
    }
  }
}

export const authEvents = new AuthEventManager()
