import { useState, type ReactNode } from 'react'
import { links } from '../../config/links'
import { settingsContent } from '../../content/settings'
import { openExternal, useToast } from '../../hooks/useToast'
import { StatusBar } from '../../phone/StatusBar'
import { Toast } from '../../phone/Toast'
import { clearState } from '../../state/storage'

type InfoSection = 'guide' | 'fanmade' | 'copyright'

// 아이폰 설정 앱 스타일 — 게임 초기화, 안내, 저작권, 문의/버그 제보
export function SettingsApp() {
  const c = settingsContent
  const [open, setOpen] = useState<InfoSection | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const { toast, showToast } = useToast()
  const toggle = (section: InfoSection) => setOpen((current) => (current === section ? null : section))

  function resetGame() {
    clearState()
    window.location.reload()
  }

  return (
    <div className="relative flex h-full flex-col bg-[#f2f2f7] text-black">
      <StatusBar color="#1c1c1e" />
      <div className="flex-1 overflow-y-auto px-4 pb-[calc(34px+var(--ui-bottom,0px))]">
        <h1 className="pt-2 pb-4 text-[30px] font-bold">{c.title}</h1>

        <Group title={c.sections.game}>
          <Row onPress={() => setConfirmReset(true)} danger>
            {c.reset.label}
          </Row>
        </Group>

        <Group title={c.sections.info}>
          {(['guide', 'fanmade', 'copyright'] as const).map((section) => (
            <Row key={section} onPress={() => toggle(section)} chevron={open === section ? 'down' : 'right'}>
              {c[section].label}
              {open === section && (
                <ul className="mt-2 space-y-1.5 pr-2 text-[13px] leading-relaxed text-black/55">
                  {c[section].body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </Row>
          ))}
        </Group>

        <Group title={c.sections.support}>
          {([
            [c.contact, links.contact],
            [c.bugReport, links.bugReport],
          ] as const).map(([item, link]) => (
            <Row key={item.label} onPress={() => openExternal(link, () => showToast(item.notReady))} chevron="right">
              {item.label}
              <span className="mt-0.5 block text-[12px] text-black/40">{item.detail}</span>
            </Row>
          ))}
        </Group>

        <p className="pt-2 pb-6 text-center text-[12px] text-black/35">{c.version}</p>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title={c.reset.confirmTitle}
          body={c.reset.confirmBody}
          cancelLabel={c.reset.cancel}
          confirmLabel={c.reset.confirm}
          onCancel={() => setConfirmReset(false)}
          onConfirm={resetGame}
        />
      )}
      <Toast {...toast} />
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="px-4 pb-1.5 text-[13px] text-black/45">{title}</h2>
      <div className="divide-y divide-black/5 overflow-hidden rounded-xl bg-white">{children}</div>
    </section>
  )
}

interface RowProps {
  onPress: () => void
  children: ReactNode
  chevron?: 'right' | 'down'
  danger?: boolean
}

function Row({ onPress, children, chevron, danger = false }: RowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex w-full items-start gap-2 px-4 py-3 text-left text-[15px] active:bg-black/5 ${danger ? 'text-[#ff3b30]' : ''}`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {chevron && (
        <svg
          width="8"
          height="13"
          viewBox="0 0 8 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`mt-1.5 shrink-0 text-black/25 transition-transform ${chevron === 'down' ? 'rotate-90' : ''}`}
          aria-hidden
        >
          <path d="m1.5 1.5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

interface ConfirmDialogProps {
  title: string
  body: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

/** 아이폰 알림창 스타일 확인 */
function ConfirmDialog({ title, body, cancelLabel, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 px-10" role="alertdialog" aria-label={title}>
      <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-white/95 text-center backdrop-blur-xl">
        <div className="px-4 pt-5 pb-4">
          <p className="text-[16px] font-semibold">{title}</p>
          <p className="mt-1.5 text-[13px] leading-snug text-black/60">{body}</p>
        </div>
        <div className="grid grid-cols-2 border-t border-black/10 text-[16px]">
          <button type="button" onClick={onCancel} className="border-r border-black/10 py-3 text-[#007aff] active:bg-black/5">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="py-3 font-semibold text-[#ff3b30] active:bg-black/5">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
