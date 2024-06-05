import classes from './index.module.sass'

interface MemoryRangeProps {
  value: any
  onChange: (e: any) => void
  limit: number
}

export const MemoryRange = ({ value, onChange, limit = 16384 }: MemoryRangeProps) => {
  return (
    <div>
      <div className={classes.wrapper}>
        <input
          className={classes.range}
          min={1024}
          max={limit}
          value={value ?? ''}
          step={256}
          onChange={onChange}
          type="range"
        />
        <div className={classes.label}>
          {[ ...Array(Math.floor(limit / 1024)) ].map((_: any, ix: number) => (
            <div key={ix} className={classes.dot} />
          ))}
        </div>

        <div className={classes.tips}>
          {[ ...Array(Math.floor(limit / 1024)) ].map((_: any, ix: number) => (
            <p key={ix} className={classes.gb}>
              {ix + 1}G
            </p>
          ))}
        </div>
      </div>

    </div>
  )
}