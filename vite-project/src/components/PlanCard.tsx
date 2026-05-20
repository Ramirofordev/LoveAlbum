import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from '../App.module.css'
import { statusLabels } from '../data'
import type { DatePlan, DatePlanStatus, PlanFormState } from '../types'

type PlanCardProps = {
  plan: DatePlan
  displayDate: string
  onUpdate: (planId: string, updates: PlanFormState) => void
  onDelete: (planId: string) => void
  onStatusChange: (planId: string, status: DatePlanStatus) => void
}

export function PlanCard({ plan, displayDate, onUpdate, onDelete, onStatusChange }: PlanCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<PlanFormState>({
    place: plan.place,
    locationUrl: plan.locationUrl,
    description: plan.description,
    date: plan.date,
    status: plan.status,
    showOnProfile: plan.showOnProfile,
    activities: plan.activities.join('\n'),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onUpdate(plan.id, draft)
    setIsEditing(false)
  }

  const refreshDraft = () => {
    setDraft({
      place: plan.place,
      locationUrl: plan.locationUrl,
      description: plan.description,
      date: plan.date,
      status: plan.status,
      showOnProfile: plan.showOnProfile,
      activities: plan.activities.join('\n'),
    })
  }

  const handleStartEditing = () => {
    refreshDraft()
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    refreshDraft()
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('¿Seguro que quieres borrar esta cita? Esta acción no se puede deshacer.')) {
      onDelete(plan.id)
    }
  }

  return (
    <article className={`${styles.softCard} rounded-[1.5rem] p-5 shadow-sm`}>
      {isEditing ? (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className={styles.input} aria-label="Lugar de la cita" value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })} required />
          <input className={styles.input} aria-label="Link de ubicación" value={draft.locationUrl} onChange={(event) => setDraft({ ...draft, locationUrl: event.target.value })} />
          <input className={styles.input} aria-label="Fecha de la cita" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} required />
          <select
            className={styles.input}
            aria-label="Estado de la cita"
            value={draft.status}
            onChange={(event) => setDraft({ ...draft, status: event.target.value as DatePlanStatus })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="hecha">Hecha</option>
            <option value="favorita">Favorita</option>
          </select>
          <textarea className={styles.input} aria-label="Resumen de la cita" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
          <textarea className={styles.input} aria-label="Actividades de la cita" value={draft.activities} onChange={(event) => setDraft({ ...draft, activities: event.target.value })} required />
          <label className={`${styles.labelText} flex items-center gap-2 text-sm font-semibold`}>
            <input
              className="h-5 w-5 accent-[var(--rose)]"
              type="checkbox"
              checked={draft.showOnProfile}
              onChange={(event) => setDraft({ ...draft, showOnProfile: event.target.checked })}
            />
            Destacar en la portada
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={`${styles.buttonPrimary} px-4 py-2 text-sm font-semibold`} type="submit">
              Guardar
            </button>
            <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleCancelEditing}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className={`${styles.heading} text-xl font-bold`}>{plan.place}</h3>
              <p className={`${styles.muted} mt-1 text-sm`}>{displayDate}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <select
                className={`${styles.input} max-w-40 py-2 text-sm`}
                value={plan.status}
                onChange={(event) => onStatusChange(plan.id, event.target.value as DatePlanStatus)}
                aria-label="Cambiar estado de la cita"
              >
                <option value="pendiente">Pendiente</option>
                <option value="hecha">Hecha</option>
                <option value="favorita">Favorita</option>
              </select>
              <span className={`${styles.statusPill} ${styles.labelText} rounded-full px-4 py-2 text-sm`}>
                {statusLabels[plan.status]}
              </span>
            </div>
          </div>
          <p className={`${styles.bodyText} mt-4`}>{plan.description}</p>
          {plan.showOnProfile && <p className={`${styles.eyebrow} mt-2 text-xs font-semibold`}>Destacada en la portada</p>}
          <ul className={`${styles.labelText} mt-4 grid gap-2 text-sm`}>
            {plan.activities.map((activity, activityIndex) => (
              <li className={`${styles.activityItem} rounded-2xl px-4 py-2`} key={`${activity}-${activityIndex}`}>
                ♡ {activity}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {plan.locationUrl && (
              <a
                className={`${styles.eyebrow} inline-flex text-sm font-semibold underline-offset-4 hover:underline`}
                href={plan.locationUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ver ubicación
              </a>
            )}
            <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleStartEditing}>
              Editar
            </button>
            <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleDelete}>
              Borrar
            </button>
          </div>
        </>
      )}
    </article>
  )
}
