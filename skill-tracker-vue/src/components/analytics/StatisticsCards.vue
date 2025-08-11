<template>
  <div class="row mt-4">
    <div class="col-md-3">
      <div class="card bg-primary text-white">
        <div class="card-body text-center">
          <h4>{{ stats.totalSkills }}</h4>
          <small>Total Skills</small>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-success text-white">
        <div class="card-body text-center">
          <h4>{{ stats.activeSkills }}</h4>
          <small>Active Skills</small>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-info text-white">
        <div class="card-body text-center">
          <h4>{{ stats.totalPracticeSessions }}</h4>
          <small>Practice Sessions</small>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card bg-warning text-white">
        <div class="card-body text-center">
          <h4>{{ stats.averageLevel.toFixed(1) }}</h4>
          <small>Average Level</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stats: {
    totalSkills: number
    activeSkills: number
    totalPracticeSessions: number
    averageLevel: number
  }
}

defineProps<Props>()
</script>