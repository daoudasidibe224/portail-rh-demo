import { fullName, type TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

// Nom de l'auteur d'une demande, pour l'affichage et pour le tri.
export function useTeamAuthors() {
  const portal = usePortalStore()

  const author = (r: TeleworkRequest) => portal.employeeById(r.employeeId)
  const authorName = (r: TeleworkRequest) => {
    const e = author(r)
    return e ? fullName(e) : 'Collaborateur inconnu'
  }
  const sortName = (r: TeleworkRequest) => {
    const e = author(r)
    return e ? `${e.lastName} ${e.firstName}` : ''
  }

  return { authorName, sortName }
}
