import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnClickOutside } from 'usehooks-ts'

const buttonVariants = {
  initial: { gap: 0, paddingLeft: '.5rem', paddingRight: '.5rem' },
  animate: (isSelected) => ({
    gap: isSelected ? '.5rem' : 0,
    paddingLeft: isSelected ? '1rem' : '.5rem',
    paddingRight: isSelected ? '1rem' : '.5rem',
  }),
}

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
}

const transition = { delay: 0.1, type: 'spring', bounce: 0, duration: 0.6 }

export function ExpandableTabs({ tabs, activeColor = '#7F77DD', onChange, isGlobe = false }) {
  const [selected, setSelected] = React.useState(null)
  const outsideClickRef = React.useRef(null)

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null)
    onChange?.(null)
  })

  const handleSelect = (index) => {
    setSelected(index)
    onChange?.(index)
  }

  const Separator = () => (
    <div
      className="mx-1 h-6 w-px"
      style={{ backgroundColor: isGlobe ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }}
      aria-hidden="true"
    />
  )

  return (
    <div
      ref={outsideClickRef}
      className="flex flex-wrap items-center gap-1 rounded-2xl p-1"
      style={{
        background: isGlobe ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        border: isGlobe
          ? '1px solid rgba(255,255,255,0.15)'
          : '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {tabs.map((tab, index) => {
        if (tab.type === 'separator') {
          return <Separator key={`separator-${index}`} />
        }
        const Icon = tab.icon
        const isSelected = selected === index
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected}
            onClick={() => handleSelect(index)}
            transition={transition}
            className="relative flex items-center rounded-xl py-2 text-sm
              font-medium transition-colors duration-300"
            style={{
              backgroundColor: isSelected
                ? isGlobe ? 'rgba(255,255,255,0.15)' : `${activeColor}18`
                : 'transparent',
              color: isSelected
                ? isGlobe ? 'white' : activeColor
                : isGlobe ? 'rgba(255,255,255,0.6)' : '#6b7280',
            }}
          >
            <Icon size={18} />
            <AnimatePresence initial={false}>
              {isSelected && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap text-xs"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
