export function HomeIndicator({ color = '#ffffff' }: { color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center" aria-hidden>
      <div className="h-[5px] w-[134px] rounded-full" style={{ backgroundColor: color }} />
    </div>
  )
}
