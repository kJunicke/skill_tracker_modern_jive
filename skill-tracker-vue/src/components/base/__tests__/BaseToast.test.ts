import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseToast from '../BaseToast.vue'
import BaseButton from '../BaseButton.vue'

// Mock setTimeout and clearInterval to control timing in tests
vi.useFakeTimers()

describe('BaseToast.vue', () => {
  const defaultProps = {
    id: 'test-toast-1',
    title: 'Test Toast',
    message: 'Test message',
    variant: 'info' as const,
    duration: 5000,
    visible: true,
    createdAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('renders with required props', () => {
    const wrapper = mount(BaseToast, {
      props: {
        id: 'test-toast',
        title: 'Test Title'
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.find('.toast-custom').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('Test Title')
    expect(wrapper.find('.bi-info-circle-fill').exists()).toBe(true)
  })

  it('renders message when provided', () => {
    const wrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        message: 'This is a test message'
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.find('.toast-body').text()).toBe('This is a test message')
  })

  it('does not render message section when message is not provided', () => {
    const wrapper = mount(BaseToast, {
      props: {
        id: 'test-toast',
        title: 'Test Title'
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.find('.toast-body').exists()).toBe(false)
  })

  it('applies correct variant classes and icons', () => {
    const variants = [
      { variant: 'success' as const, icon: 'bi-check-circle-fill', class: 'toast-success' },
      { variant: 'error' as const, icon: 'bi-exclamation-triangle-fill', class: 'toast-error' },
      { variant: 'warning' as const, icon: 'bi-exclamation-triangle-fill', class: 'toast-warning' },
      { variant: 'info' as const, icon: 'bi-info-circle-fill', class: 'toast-info' }
    ]

    variants.forEach(({ variant, icon, class: className }) => {
      const wrapper = mount(BaseToast, {
        props: {
          ...defaultProps,
          variant
        },
        global: {
          components: { BaseButton }
        }
      })

      expect(wrapper.find(`.${className}`).exists()).toBe(true)
      expect(wrapper.find(`.${icon}`).exists()).toBe(true)
    })
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(BaseToast, {
      props: defaultProps,
      global: {
        components: { BaseButton }
      }
    })

    await wrapper.findComponent(BaseButton).trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('auto-dismisses after specified duration', async () => {
    const wrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        duration: 1000
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.emitted('close')).toBeUndefined()
    
    // Fast forward time by 1000ms
    vi.advanceTimersByTime(1000)
    
    // Wait for next tick to allow setTimeout to execute
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not auto-dismiss when duration is 0', async () => {
    const wrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        duration: 0
      },
      global: {
        components: { BaseButton }
      }
    })

    vi.advanceTimersByTime(10000)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('shows correct time ago text', async () => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneHourAgo = new Date(now.getTime() - 3600000)

    // Recent toast (< 1 minute)
    const recentWrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        createdAt: now
      },
      global: {
        components: { BaseButton }
      }
    })
    await recentWrapper.vm.$nextTick()
    expect(recentWrapper.find('.text-muted').text()).toBe('now')

    // One minute ago
    const minuteWrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        createdAt: oneMinuteAgo
      },
      global: {
        components: { BaseButton }
      }
    })
    await minuteWrapper.vm.$nextTick()
    expect(minuteWrapper.find('.text-muted').text()).toBe('1m ago')

    // One hour ago
    const hourWrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        createdAt: oneHourAgo
      },
      global: {
        components: { BaseButton }
      }
    })
    await hourWrapper.vm.$nextTick()
    expect(hourWrapper.find('.text-muted').text()).toBe('1h ago')
  })

  it('is accessible with proper ARIA attributes', () => {
    const wrapper = mount(BaseToast, {
      props: defaultProps,
      global: {
        components: { BaseButton }
      }
    })

    const toast = wrapper.find('.toast')
    expect(toast.attributes('role')).toBe('alert')
    expect(toast.attributes('aria-live')).toBe('assertive')
    expect(toast.attributes('aria-atomic')).toBe('true')
    
    const closeButton = wrapper.findComponent(BaseButton)
    expect(closeButton.attributes('aria-label')).toBe('Close')
  })

  it('applies toast-with-message class when message is provided', () => {
    const wrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        message: 'Test message'
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.find('.toast-with-message').exists()).toBe(true)
  })

  it('does not apply toast-with-message class when message is not provided', () => {
    const wrapper = mount(BaseToast, {
      props: {
        id: 'test-toast',
        title: 'Test Title'
      },
      global: {
        components: { BaseButton }
      }
    })

    expect(wrapper.find('.toast-with-message').exists()).toBe(false)
  })

  it('handles visibility prop correctly', async () => {
    const wrapper = mount(BaseToast, {
      props: {
        ...defaultProps,
        visible: false
      },
      global: {
        components: { BaseButton }
      }
    })

    // Toast should not be visible
    expect(wrapper.find('.toast-custom').exists()).toBe(false)

    // Update visibility
    await wrapper.setProps({ visible: true })
    expect(wrapper.find('.toast-custom').exists()).toBe(true)
  })
})