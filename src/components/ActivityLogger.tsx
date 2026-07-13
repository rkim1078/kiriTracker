import { useMemo } from 'react'
import type { HeatmapWeeks } from '../preferences'
import {
  type ActivityEntry,
  generateDateRange,
  getActivitiesByDate,
  getGreenLevel,
} from '../types'

interface ActivityLoggerProps {
  activities: ActivityEntry[]
  weeks: HeatmapWeeks
}

export function ActivityLogger({ activities, weeks: weekCount }: ActivityLoggerProps) {
  const dates = useMemo(() => generateDateRange(weekCount), [weekCount])
  const byDate = useMemo(() => getActivitiesByDate(activities), [activities])
  const maxCount = useMemo(() => {
    let max = 0
    for (const count of byDate.values()) {
      if (count > max) max = count
    }
    return Math.max(max, 1)
  }, [byDate])

  const weeks = useMemo(() => {
    const result: string[][] = []
    for (let w = 0; w < weekCount; w++) {
      result.push(dates.slice(w * 7, w * 7 + 7))
    }
    return result
  }, [dates, weekCount])

  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = []
    let lastMonth = -1
    weeks.forEach((week, weekIdx) => {
      const firstDate = new Date(week[0] + 'T00:00:00')
      const month = firstDate.getMonth()
      if (month !== lastMonth) {
        labels.push({
          week: weekIdx,
          label: firstDate.toLocaleString('default', { month: 'short' }),
        })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  const totalActions = activities.length
  const activeDays = byDate.size
  const rangeLabel =
    weekCount === 13 ? '3 months' : weekCount === 26 ? '6 months' : '12 months'

  return (
    <section className="activity-logger" aria-label="Activity heatmap">
      <div className="activity-header">
        <h2>Activity</h2>
        <p>
          {totalActions} action{totalActions !== 1 ? 's' : ''} logged across{' '}
          {activeDays} day{activeDays !== 1 ? 's' : ''} · last {rangeLabel}
        </p>
      </div>

      <div className="activity-chart">
        <div
          className="activity-months"
          style={{ gridTemplateColumns: `28px repeat(${weekCount}, 1fr)` }}
        >
          {monthLabels.map(({ week, label }) => (
            <span
              key={`${week}-${label}`}
              className="activity-month-label"
              style={{ gridColumn: week + 2 }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="activity-body">
          <div className="activity-days-labels">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
              <span key={i} className="activity-day-label">
                {day}
              </span>
            ))}
          </div>

          <div className="activity-grid" role="grid" aria-label={`Activity over ${rangeLabel}`}>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="activity-week" role="row">
                {week.map((date) => {
                  const count = byDate.get(date) ?? 0
                  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(
                    undefined,
                    { weekday: 'short', month: 'short', day: 'numeric' },
                  )
                  return (
                    <div
                      key={date}
                      className="activity-cell"
                      role="gridcell"
                      tabIndex={0}
                      style={{ backgroundColor: getGreenLevel(count, maxCount) }}
                      title={`${formatted}: ${count} action${count !== 1 ? 's' : ''}`}
                      aria-label={`${formatted}: ${count} action${count !== 1 ? 's' : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="activity-legend">
          <span className="legend-label">Less</span>
          <div className="legend-swatch" style={{ backgroundColor: 'var(--activity-none)' }} />
          <div className="legend-swatch" style={{ backgroundColor: 'var(--activity-1)' }} />
          <div className="legend-swatch" style={{ backgroundColor: 'var(--activity-2)' }} />
          <div className="legend-swatch" style={{ backgroundColor: 'var(--activity-3)' }} />
          <div className="legend-swatch" style={{ backgroundColor: 'var(--activity-4)' }} />
          <span className="legend-label">More</span>
        </div>
      </div>
    </section>
  )
}
