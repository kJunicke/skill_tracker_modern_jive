<template>
  <div class="card bg-light">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="bi bi-lightbulb me-2"></i>
        Markdown Formatting Guide
      </h6>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <small class="d-block mb-1">
            <code>**bold text**</code> for <strong>emphasis</strong>
          </small>
          <small class="d-block mb-1">
            <code>*italic text*</code> for <em>italics</em>
          </small>
          <small class="d-block mb-1">
            <code>- item</code> for bullet lists
          </small>
          <small class="d-block">
            <code>1. item</code> for numbered lists
          </small>
        </div>
        <div class="col-md-6">
          <small class="d-block mb-1">
            <code># Heading</code> for section headers
          </small>
          <small class="d-block mb-1">
            <code>`code`</code> for inline code
          </small>
          <small class="d-block mb-1">
            <code>> quote</code> for important notes
          </small>
          <small class="d-block">
            <code>---</code> for horizontal separators
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or emits needed - this is a pure UI component
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

code {
  background-color: #f8f9fa;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style>