export function HomeIndicator({ color = '#ffffff' }: { color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(8px+var(--ui-bottom,0px))] z-30 flex justify-center" aria-hidden>
      <div className="h-[5px] w-[134px] rounded-full" style={{ backgroundColor: color }} />
    </div>
  )
}
