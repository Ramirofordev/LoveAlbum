import type { FormEvent } from 'react'
import styles from '../App.module.css'
import type { DatePlanStatus, PlanFormState } from '../types'

type PlanFormProps = {
  form: PlanFormState
  onChange: (form: PlanFormState) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PlanForm({ form, onChange, onSubmit }: PlanFormProps) {
  return (
    <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSubmit}>
      <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva cita</p>
      <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Planificar una cita</h2>

      <div className="mt-6 grid gap-4">
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Lugar
          <input
            className={`${styles.input} mt-2`}
            placeholder="Ej: Café con terraza"
            value={form.place}
            onChange={(event) => onChange({ ...form, place: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Link de ubicación
          <input
            className={`${styles.input} mt-2`}
            placeholder="https://maps.google.com/..."
            value={form.locationUrl}
            onChange={(event) => onChange({ ...form, locationUrl: event.target.value })}
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Fecha
          <input
            className={`${styles.input} mt-2`}
            type="date"
            value={form.date}
            onChange={(event) => onChange({ ...form, date: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Estado
          <select
            className={`${styles.input} mt-2`}
            value={form.status}
            onChange={(event) => onChange({ ...form, status: event.target.value as DatePlanStatus })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="hecha">Hecha</option>
            <option value="favorita">Favorita</option>
          </select>
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Resumen de la cita
          <textarea
            className={`${styles.input} mt-2`}
            placeholder="La idea general de la cita"
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Actividades
          <textarea
            className={`${styles.input} mt-2`}
            placeholder="Una actividad por línea"
            value={form.activities}
            onChange={(event) => onChange({ ...form, activities: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.softCard} ${styles.labelText} flex items-center gap-3 rounded-3xl p-4 text-sm font-semibold`}>
          <input
            className="h-5 w-5 accent-[var(--rose)]"
            type="checkbox"
            checked={form.showOnProfile}
            onChange={(event) => onChange({ ...form, showOnProfile: event.target.checked })}
          />
          Destacar esta cita en la portada
        </label>
        <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
          Guardar cita
        </button>
      </div>
    </form>
  )
}
