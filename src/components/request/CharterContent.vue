<script setup lang="ts">
import { RULES } from '@/domain/rules'
</script>

<template>
  <ul class="list-disc space-y-2 pl-5 text-ink-900">
    <li>Vous restez joignable sur vos horaires habituels.</li>
    <li>Vous travaillez depuis votre domicile déclaré, avec une connexion stable.</li>
    <li>
      Le télétravail occasionnel est plafonné à {{ RULES.occasionalAllowancePerYear }} jours par an.
    </li>
    <li>Votre manager peut demander votre présence pour une réunion ou une formation.</li>
    <li>
      Vous protégez les données de l’entreprise (VPN, écran verrouillé, pas de poste partagé).
    </li>
  </ul>
</template>
