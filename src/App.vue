<template>
  <v-app>
    <v-main>
      <div class="app-shell">
        <section class="topbar">
          <div>
            <p class="eyebrow">Ab ins Beet</p>
            <h1>Spielestand</h1>
          </div>

          <div v-if="game" class="topbar-actions">
            <v-chip color="primary" variant="flat" prepend-icon="mdi-sprout">
              Durchgang {{ game.currentRound }} / 3
            </v-chip>
            <v-btn color="secondary" variant="tonal" prepend-icon="mdi-refresh" @click="resetGame">
              Neue Partie
            </v-btn>
          </div>
        </section>

        <section v-if="!game" class="setup-panel">
          <div class="setup-copy">
            <h2>Wer gärtnert heute?</h2>
            <p>Lege mindestens zwei Spieler an. Danach zählt die App alle drei Durchgänge mit.</p>
          </div>

          <v-form @submit.prevent="startGame">
            <div class="player-list">
              <v-text-field
                v-for="(_, index) in setupNames"
                :key="index"
                v-model="setupNames[index]"
                :label="`Spieler ${index + 1}`"
                variant="outlined"
                density="comfortable"
                hide-details
                prepend-inner-icon="mdi-account"
              >
                <template #append-inner>
                  <v-btn
                    v-if="setupNames.length > 2"
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    :aria-label="`Spieler ${index + 1} entfernen`"
                    @click="removeSetupPlayer(index)"
                  />
                </template>
              </v-text-field>
            </div>

            <div class="setup-actions">
              <v-btn variant="tonal" prepend-icon="mdi-account-plus" @click="addSetupPlayer">
                Spieler hinzufügen
              </v-btn>
              <v-btn color="primary" type="submit" prepend-icon="mdi-play" :disabled="!canStart">
                Partie starten
              </v-btn>
            </div>
          </v-form>
        </section>

        <template v-else>
          <section class="score-strip">
            <article
              v-for="standing in standings"
              :key="standing.player.id"
              class="standing-card"
              :class="{ leader: standing.isLeader }"
            >
              <div>
                <span class="standing-rank">{{ standing.rank }}.</span>
                <strong>{{ standing.player.name }}</strong>
              </div>
              <span>{{ standing.total }} P</span>
            </article>
          </section>

          <v-tabs v-model="selectedTab" class="round-tabs" color="primary" grow>
            <v-tab v-for="round in rounds" :key="round" :value="round - 1">
              Durchgang {{ round }}
            </v-tab>
            <v-tab :value="podiumTab" prepend-icon="mdi-trophy">
              Podest
            </v-tab>
          </v-tabs>

          <section v-if="!isPodiumTab" class="round-summary">
            <div>
              <p class="eyebrow">Aktuelle Wertung</p>
              <h2>Durchgang {{ selectedRoundIndex + 1 }}</h2>
            </div>
            <div class="round-actions">
              <v-btn
                v-if="game.currentRound < 3"
                color="primary"
                variant="flat"
                append-icon="mdi-arrow-right"
                @click="advanceRound"
              >
                Nächster Durchgang
              </v-btn>
              <v-btn v-else color="success" variant="flat" append-icon="mdi-trophy" @click="selectedTab = podiumTab">
                Zum Podest
              </v-btn>
            </div>
          </section>

          <section v-if="!isPodiumTab" class="player-grid">
            <v-card v-for="player in game.players" :key="player.id" class="player-card" elevation="0">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal">
                    {{ initials(player.name) }}
                  </v-avatar>
                </template>
                <v-card-title>{{ player.name }}</v-card-title>
                <v-card-subtitle>
                  Gesamt {{ gameTotals[player.id] }} Punkte
                </v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <div class="beet-list">
                  <article
                    v-for="(beet, beetIndex) in currentRoundScore(player.id).beets"
                    :key="beetIndex"
                    class="beet-editor"
                  >
                    <header>
                      <strong>Beet {{ beetIndex + 1 }}</strong>
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ scoreBeet(beet) }} P
                      </v-chip>
                    </header>

                    <v-btn-toggle
                      v-model="beet.colors"
                      color="primary"
                      density="comfortable"
                      divided
                      mandatory
                      class="color-toggle"
                    >
                      <v-btn :value="1">1 Farbe</v-btn>
                      <v-btn :value="2">2 Farben</v-btn>
                      <v-btn :value="3">3 Farben</v-btn>
                    </v-btn-toggle>

                    <div class="number-row">
                      <v-text-field
                        v-model.number="beet.wholeSalads"
                        label="Ganze Salate"
                        density="compact"
                        variant="outlined"
                        type="number"
                        :min="0"
                        :max="12"
                        hide-details
                      />
                      <v-text-field
                        v-model.number="beet.tomatoes"
                        label="Tomaten"
                        density="compact"
                        variant="outlined"
                        type="number"
                        :min="0"
                        :max="12"
                        hide-details
                      />
                      <v-text-field
                        v-model.number="beet.peppers"
                        label="Paprika"
                        density="compact"
                        variant="outlined"
                        type="number"
                        :min="0"
                        :max="12"
                        hide-details
                      />
                    </div>

                    <v-switch
                      v-model="beet.hasHalfSalads"
                      color="secondary"
                      density="compact"
                      hide-details
                      inset
                      label="Halbe Salate vorhanden"
                    />
                  </article>
                </div>

                <div class="manual-score">
                  <v-text-field
                    v-model.number="currentRoundScore(player.id).animalCardsFulfilled"
                    label="Erfüllte Tierkarten"
                    density="comfortable"
                    variant="outlined"
                    type="number"
                    :min="0"
                    :max="selectedRoundIndex + 1"
                    hide-details
                  />
                </div>

                <v-divider class="my-4" />

                <dl class="score-breakdown">
                  <div>
                    <dt>Beete</dt>
                    <dd>{{ roundTotalFor(player.id).beetPoints }}</dd>
                  </div>
                  <div>
                    <dt>Bonus</dt>
                    <dd>{{ roundTotalFor(player.id).bonusPoints }}</dd>
                  </div>
                  <div>
                    <dt>Tierkarten</dt>
                    <dd>{{ roundTotalFor(player.id).animalPoints }}</dd>
                  </div>
                  <div class="total">
                    <dt>Durchgang</dt>
                    <dd>{{ roundTotalFor(player.id).total }}</dd>
                  </div>
                </dl>
              </v-card-text>
            </v-card>
          </section>

          <section v-if="!isPodiumTab" class="final-panel">
            <div>
              <p class="eyebrow">{{ game.currentRound === 3 ? 'Endstand' : 'Zwischenstand' }}</p>
              <h2>{{ winnerLine }}</h2>
              <p>{{ tieBreakLine }}</p>
            </div>

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Spieler</th>
                  <th class="text-right">D1</th>
                  <th class="text-right">D2</th>
                  <th class="text-right">D3</th>
                  <th class="text-right">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="standing in standings" :key="standing.player.id">
                  <td>{{ standing.player.name }}</td>
                  <td class="text-right">{{ totalForRound(standing.player.id, 0) }}</td>
                  <td class="text-right">{{ totalForRound(standing.player.id, 1) }}</td>
                  <td class="text-right">{{ totalForRound(standing.player.id, 2) }}</td>
                  <td class="text-right"><strong>{{ standing.total }}</strong></td>
                </tr>
              </tbody>
            </v-table>
          </section>

          <section v-else class="podium-page">
            <div class="confetti" aria-hidden="true">
              <span v-for="piece in confettiPieces" :key="piece" :style="confettiStyle(piece)" />
            </div>

            <div class="podium-hero">
              <p class="eyebrow">Siegerehrung</p>
              <h2>{{ celebrationLine }}</h2>
              <p>{{ podiumTieLine }}</p>
            </div>

            <div class="podium-stage">
              <article
                v-for="entry in podiumEntries"
                :key="entry.player.id"
                class="podium-place"
                :class="`place-${entry.displayRank}`"
              >
                <v-avatar :color="entry.displayRank === 1 ? 'accent' : 'primary'" size="64" variant="flat">
                  {{ initials(entry.player.name) }}
                </v-avatar>
                <strong>{{ entry.player.name }}</strong>
                <span>{{ entry.total }} Punkte</span>
                <div class="podium-block">
                  <span>{{ entry.displayRank }}</span>
                </div>
              </article>
            </div>

            <v-table class="podium-table" density="comfortable">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Spieler</th>
                  <th class="text-right">Durchgang 3</th>
                  <th class="text-right">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in finalStandings" :key="entry.player.id">
                  <td>{{ entry.displayRank }}</td>
                  <td>{{ entry.player.name }}</td>
                  <td class="text-right">{{ totalForRound(entry.player.id, 2) }}</td>
                  <td class="text-right"><strong>{{ entry.total }}</strong></td>
                </tr>
              </tbody>
            </v-table>
          </section>
        </template>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  calculateGameTotals,
  calculateRoundTotals,
  createGame,
  Game,
  Player,
  PlayerRoundTotal,
  ROUND_COUNT,
  RoundScore,
  scoreBeet,
} from './scoring'

const STORAGE_KEY = 'ab-ins-beet-spielestand'

const setupNames = ref(['', ''])
const game = ref<Game | null>(loadGame())
const podiumTab = ROUND_COUNT
const selectedTab = ref<number>((game.value?.currentRound ?? 1) - 1)
const rounds = Array.from({ length: ROUND_COUNT }, (_, index) => index + 1)
const confettiPieces = Array.from({ length: 34 }, (_, index) => index)

const canStart = computed(() => setupNames.value.filter((name) => name.trim()).length >= 2)
const isPodiumTab = computed(() => selectedTab.value === podiumTab)
const selectedRoundIndex = computed(() => Math.min(selectedTab.value, ROUND_COUNT - 1))

const selectedRoundTotals = computed<PlayerRoundTotal[]>(() => {
  if (!game.value) {
    return []
  }

  return calculateRoundTotals(
    game.value.players,
    game.value.players.map((player) => game.value?.rounds[player.id][selectedRoundIndex.value] as RoundScore),
  )
})

const gameTotals = computed(() => (game.value ? calculateGameTotals(game.value) : {}))

const standings = computed(() => {
  if (!game.value) {
    return []
  }

  const sorted = game.value.players
    .map((player) => ({
      player,
      total: gameTotals.value[player.id] ?? 0,
    }))
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name))

  const leaderTotal = sorted[0]?.total ?? 0

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isLeader: entry.total === leaderTotal,
  }))
})

const finalStandings = computed(() => {
  if (!game.value) {
    return []
  }

  const ranked = game.value.players
    .map((player) => ({
      player,
      total: gameTotals.value[player.id] ?? 0,
      thirdRound: totalForRound(player.id, 2),
    }))
    .sort((a, b) => b.total - a.total || b.thirdRound - a.thirdRound || a.player.name.localeCompare(b.player.name))

  let previousTotal: number | null = null
  let previousThirdRound: number | null = null
  let displayRank = 0

  return ranked.map((entry, index) => {
    if (entry.total !== previousTotal || entry.thirdRound !== previousThirdRound) {
      displayRank = index + 1
      previousTotal = entry.total
      previousThirdRound = entry.thirdRound
    }

    return {
      ...entry,
      displayRank,
    }
  })
})

const podiumEntries = computed(() => finalStandings.value.filter((entry) => entry.displayRank <= 3).slice(0, 3))

const celebrationLine = computed(() => {
  const winners = finalStandings.value.filter((entry) => entry.displayRank === 1)

  if (winners.length === 0) {
    return 'Das Beet wartet auf seine Stars'
  }

  if (winners.length === 1) {
    return `${winners[0].player.name} gewinnt die Erntekrone`
  }

  return `${winners.map((entry) => entry.player.name).join(', ')} teilen sich den Sieg`
})

const podiumTieLine = computed(() => {
  const winners = finalStandings.value.filter((entry) => entry.displayRank === 1)

  if (winners.length <= 1) {
    return 'Konfetti raus, Gießkanne hoch: Das Gemüse ist gezählt.'
  }

  return 'Der Tie-Break im dritten Durchgang bleibt gleich, also gibt es mehrere Sieger.'
})

const winnerLine = computed(() => {
  const leaders = standings.value.filter((entry) => entry.isLeader)

  if (leaders.length === 0) {
    return 'Noch keine Partie gestartet'
  }

  if (leaders.length === 1) {
    return `${leaders[0].player.name} führt mit ${leaders[0].total} Punkten`
  }

  return `${leaders.map((entry) => entry.player.name).join(', ')} liegen gleichauf`
})

const tieBreakLine = computed(() => {
  if (!game.value || standings.value.length === 0) {
    return ''
  }

  const leaders = standings.value.filter((entry) => entry.isLeader)

  if (leaders.length <= 1) {
    return 'Bei Gleichstand entscheidet der dritte Durchgang, danach wird der Sieg geteilt.'
  }

  const thirdRoundScores = leaders.map((entry) => ({
    name: entry.player.name,
    total: totalForRound(entry.player.id, 2),
  }))
  const bestThirdRound = Math.max(...thirdRoundScores.map((entry) => entry.total))
  const tieBreakWinners = thirdRoundScores.filter((entry) => entry.total === bestThirdRound)

  if (tieBreakWinners.length === 1) {
    return `Tie-Break nach Durchgang 3: ${tieBreakWinners[0].name} liegt vorne.`
  }

  return 'Auch nach dem dritten Durchgang bleibt Gleichstand; der Sieg wird geteilt.'
})

watch(
  game,
  (value) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
  { deep: true },
)

watch(
  () => game.value?.currentRound,
  (round) => {
    if (round) {
      selectedTab.value = round - 1
    }
  },
)

function addSetupPlayer() {
  setupNames.value.push('')
}

function removeSetupPlayer(index: number) {
  setupNames.value.splice(index, 1)
}

function startGame() {
  if (!canStart.value) {
    return
  }

  game.value = createGame(setupNames.value)
  selectedTab.value = 0
}

function resetGame() {
  game.value = null
  setupNames.value = ['', '']
  selectedTab.value = 0
}

function advanceRound() {
  if (!game.value || game.value.currentRound >= 3) {
    return
  }

  game.value.currentRound = (game.value.currentRound + 1) as 1 | 2 | 3
}

function confettiStyle(index: number) {
  const colors = ['#e3b23c', '#b84f3b', '#28684b', '#386f8f', '#f7f3e8']

  return {
    left: `${(index * 29) % 100}%`,
    animationDelay: `${(index % 9) * 0.18}s`,
    animationDuration: `${2.4 + (index % 5) * 0.28}s`,
    background: colors[index % colors.length],
  }
}

function currentRoundScore(playerId: string): RoundScore {
  return game.value?.rounds[playerId][selectedRoundIndex.value] as RoundScore
}

function roundTotalFor(playerId: string): PlayerRoundTotal {
  return selectedRoundTotals.value.find((total) => total.playerId === playerId) as PlayerRoundTotal
}

function totalForRound(playerId: string, roundIndex: number): number {
  if (!game.value || roundIndex > game.value.currentRound - 1) {
    return 0
  }

  const roundScores = game.value.players.map((player) => game.value?.rounds[player.id][roundIndex] as RoundScore)

  return calculateRoundTotals(game.value.players, roundScores).find((entry) => entry.playerId === playerId)?.total ?? 0
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function loadGame(): Game | null {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    const parsed = JSON.parse(stored) as Game

    if (!Array.isArray(parsed.players) || parsed.players.length < 2 || !parsed.rounds) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}
</script>
