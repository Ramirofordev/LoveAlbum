import type { FormEvent } from 'react'
import styles from '../App.module.css'
import { statusLabels } from '../data'
import type { DatePlan, DatePlanStatus, PlanFilter, PlanFormState } from '../types'
import { PlanCard } from './PlanCard'
import { PlanForm } from './PlanForm'

type DatePlannerProps = {
  isPlanFormOpen: boolean
  planFilter: PlanFilter
  plans: DatePlan[]
  planForm: PlanFormState
  onToggleForm: () => void
  onFilterChange: (filter: PlanFilter) => void
  onFormChange: (form: PlanFormState) => void
  onAddPlan: (event: FormEvent<HTMLFormElement>) => void
  onUpdatePlan: (planId: string, updates: PlanFormState) => void
  onDeletePlan: (planId: string) => void
  onStatusChange: (planId: string, status: DatePlanStatus) => void
}

export function DatePlanner({
  isPlanFormOpen,
  planFilter,
  plans,
  planForm,
  onToggleForm,
  onFilterChange,
  onFormChange,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  onStatusChange,
}: DatePlannerProps) {
  return (
    <section className="mx-auto mt-8 grid max-w-7xl gap-8">
      <div className={`${styles.panel} flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Agenda romántica</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Gestionar citas</h2>
        </div>
        <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="button" onClick={onToggleForm}>
          {isPlanFormOpen ? 'Cerrar formulario' : 'Crear cita'}
        </button>
      </div>

      {isPlanFormOpen && <PlanForm form={planForm} onChange={onFormChange} onSubmit={onAddPlan} />}

      <div className={`${styles.panel} rounded-[2rem] p-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Agenda romántica</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Citas guardadas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['todas', 'pendiente', 'hecha', 'favorita'] as PlanFilter[]).map((filter) => (
              <button
                className={`${styles.navButton} ${planFilter === filter ? styles.navButtonActive : ''} px-4 py-2 text-sm font-semibold`}
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
              >
                {filter === 'todas' ? 'Todas' : statusLabels[filter]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onUpdate={onUpdatePlan}
              onDelete={onDeletePlan}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
