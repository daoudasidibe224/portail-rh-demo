import { formatBytes } from '../format'
import { ATTACHMENT_LABEL, ATTACHMENT_TYPE, RULES } from '../rules'
import type { RequestDraft } from '../types'
import type { Add, ValidationContext } from './types'

/** Motif, commentaire et justificatif. */
export function validateDetails(draft: RequestDraft, add: Add) {
  if (!draft.reason) add('reason', 'Choisissez le motif de votre demande.')
  if (draft.reason === 'other' && !draft.comment.trim()) {
    add('comment', 'Précisez le motif dans le commentaire.')
  }
  if (!draft.attachment) return
  if (draft.attachment.type !== ATTACHMENT_TYPE) {
    add('attachment', `Le justificatif doit être au format ${ATTACHMENT_LABEL}.`)
  } else if (draft.attachment.size > RULES.attachmentMaxBytes) {
    add(
      'attachment',
      `Le justificatif pèse ${formatBytes(draft.attachment.size)} : la limite est de ${formatBytes(RULES.attachmentMaxBytes)}.`,
    )
  }
}

/** Charte (une fois par version) et attestation de connexion (à chaque demande). */
export function validateCommitments(draft: RequestDraft, ctx: ValidationContext, add: Add) {
  if (!ctx.charterAlreadyAccepted && !draft.charterAccepted) {
    add('charter', 'Acceptez la charte du télétravail pour envoyer la demande.')
  }
  if (!draft.connectionConfirmed) {
    add(
      'connection',
      'Confirmez que vous disposez d’une connexion internet stable à votre domicile.',
    )
  }
}
