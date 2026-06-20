<script setup lang="ts">

withDefaults(
  defineProps<{
    color:string
    opacity?:number
    textureSize?:number
  }>(),
  {
    opacity:1,
    textureSize:256
  }
)
</script>
  <template>
  <div
    class="card-texture-background"
    :style="{
      '--category-color':color,
      '--texture-opacity':opacity,
      '--texture-size':`${textureSize}px`
    }"
  />
</template>
<style scoped>
.card-texture-background{
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--category-color);
  background-image: url("/images/textures/card-background.png");
  background-repeat: repeat;
  background-size: var(--texture-size);
  background-position: center;
  background-blend-mode: screen;
  opacity: var(--texture-opacity);
}
</style>