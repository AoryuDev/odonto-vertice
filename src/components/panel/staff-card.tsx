import { signOut } from '@/app/[locale]/painel/actions'
import { LocaleField } from '@/components/site/locale-field'
import { getStaffSession } from '@/modules/admin/session'

export async function StaffCard() {
  const session = await getStaffSession()
  if (!session) return null
  const { staff } = session
  return (
    <div className="flex items-center gap-3 lg:flex-col lg:items-start">
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-ink">{staff.fullName}</p>
        <p className="text-xs text-ink-soft">
          {staff.role === 'reception' ? 'Recepção · todas as agendas' : 'Dentista · sua agenda'}
        </p>
      </div>
      <form action={signOut}>
        <LocaleField />
        <button
          type="submit"
          className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-ink"
        >
          Sair
        </button>
      </form>
    </div>
  )
}
