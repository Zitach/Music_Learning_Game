interface LivesDisplayProps {
  lives: number
  maxLives?: number
}

export function LivesDisplay({ lives, maxLives = 5 }: LivesDisplayProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {Array.from({ length: maxLives }, (_, index) => {
        const isFilled = index < lives
        return (
          <span key={index} className={`heart${isFilled ? '' : ' is-empty'}`}>
            {isFilled ? '❤️' : '🖤'}
          </span>
        )
      })}
    </div>
  )
}

export default LivesDisplay
