<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '~~/types/cards/finderCards'
import CategoryLabel from '~~/app/components/cards/shared/CategoryLabel.vue'
import ElementIcon from '~~/app/components/common/icons/ElementIcon.vue'
import SummonerIcon from '~~/app/components/common/icons/SummonerIcon.vue'
import ItemConsumeIcon from '~~/app/components/common/icons/ItemConsumeIcon.vue'
import ItemBulletIcon from '~~/app/components/common/icons/ItemBulletIcon.vue'
import ItemEquipIcon from '~~/app/components/common/icons/ItemEquipIcon.vue'
import { createCardDesign } from '~~/app/utils/cardDesign'
import { darkenColor } from '~~/app/utils/hexColor'

const props = defineProps<{
  card: Card
}>()

// ユニットまたは戦闘スペルから属性を取得するロジックをここに集約
const displayElements = computed(() => {
  if (props.card.unit?.elements) return props.card.unit.elements
  if (props.card.spell?.elements) return props.card.spell.elements
  return []
})

const design = createCardDesign(props.card)

const headerGradientFrom = computed(() => {
  return design.headerGradientFrom()
})
const headerGradientTo = computed(() => {
  return design.headerGradientTo()
})

const elementIconColor = computed(() => {
  return design.elementIconColor()
})

const categoryLabelGradientFrom = computed(() => {
  return design.categoryLabelColor()
})
const categoryLabelGradientTo = computed(() => {
  return darkenColor(design.categoryLabelColor(), 20)
})
</script>
<template>
  <div 
    :class="['header-status-line header-background mb-1 d-flex align-center']"
  >
    <div class="status-left-container d-flex align-center flex-grow-1">
      <template v-if="card.unit">
        <span 
          v-for="elem in displayElements" 
          :key="elem.element_code"
        >
          <ElementIcon
            class="element-icon"
            :text="elem.element_name"
            :base-color="elementIconColor"
            :size="30"
          />
        </span>

        <span class="level-circle" :class="{ 'is-instant': card.unit.is_instant_summon }">
          <span class="text-offset">
            {{ card.unit.level }}
          </span>
        </span>
        
        <div class="hero-zone d-inline-flex align-center justify-center">
          <span v-if="card.unit.is_hero" class="hero-overlay-badge">
            <v-icon size="1.8rem" color="amber-darken-4">mdi-crown</v-icon>
            <span class="hero-overlay-number">{{ card.unit.hero_point }}</span>
          </span>
        </div>
        <div class="combat-stats-badge">
          <span 
            class="stat-unit-value atk text-offset" 
            :class="{ 'is-two-digits': String(card.unit.attack).length === 2 }"
          >
            {{ card.unit.attack }}
          </span>
          
          <span class="stat-separator text-offset">/</span>
          
          <span 
            class="stat-unit-value def text-offset" 
            :class="{ 'is-two-digits': String(card.unit.defense).length === 2 }"
          >
            {{ card.unit.defense }}
          </span>
        </div>
        <span class="move-type-badge font-weight-bold">
          <span class="text-offset">
            {{ card.unit.move_type_name }}
          </span>
        </span>
      </template>
      <template v-else-if="card.spell">
        <span 
          v-for="elem in displayElements" 
          :key="elem.element_code"
        >
          <ElementIcon
            class="element-icon"
            :text="elem.element_name"
            :base-color="elementIconColor"
            :size="30"
          />
        </span>
      </template>
      <template v-else-if="card.item">
        <template v-if="card.item.consume">
          <ItemConsumeIcon 
            class="item-category-icon"
            :size="34"
          />
          <span class="item-category-badge font-weight-bold">
            <span class="text-offset">
              {{ card.item.item_category_name }}
            </span>
          </span>
        </template>
        <template v-else-if="card.item.equip">
          <ItemEquipIcon 
            class="item-category-icon"
            :size="34"
          />
          <span class="item-category-badge font-weight-bold">
            <span class="text-offset">
              {{ card.item.item_category_name }}
            </span>
          </span>

          <div class="equip-left-spacer"></div>

          <div class="combat-stats-badge">
            <span 
              class="stat-item-value atk text-offset" 
            >
              +{{ card.item.equip.attack }}
            </span>
            
            <span class="stat-separator text-offset">/</span>
            
            <span 
              class="stat-item-value def text-offset" 
            >
              +{{ card.item.equip.defense }}
            </span>
          </div>
        </template>
        <template v-else-if="card.item.bullet">
          <ItemBulletIcon 
            class="item-category-icon"
            :size="34"
          />
          <span class="item-category-badge font-weight-bold">
            <span class="text-offset">
              {{ card.item.item_category_name }}
            </span>
          </span>
        </template>
      </template>
      <template v-else-if="card.land">
        <span class="limit-badge">
          <span class="text-offset">
            {{ card.land.land_limit }}
          </span>
        </span>
      </template>
      <template v-else-if="card.ritual">
        
      </template>
      <template v-else-if="card.summoner">
        <SummonerIcon 
          class="summoner-icon"
          :size="30"
        />
        <span class="arcana-label">
          {{ card.summoner.arcana }}
        </span>
      </template>
    </div>

    <CategoryLabel
      class="ml-auto"
      style="margin-top: 2px;"
      :gradient-from="categoryLabelGradientFrom"
      :gradient-to="categoryLabelGradientTo"
      :text="card.card_category_name"
    />
  </div>
</template>

<style scoped>
/* 共通 */
.status-left-container {
  min-width: 0;
  padding-left: 4px; /* 必要に応じて左余白の微調整 */
}

.header-status-line {
  line-height: 1;
  height: 2.1rem;
  white-space: nowrap;
  width: 100%;
  border-radius: 6px;
  /* 💡 修正：デバッグ用の黄緑ベタ塗りを削除し、共通の境界線エッジを設定 */
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: background 0.2s ease;
  backdrop-filter:blur(3px);
  padding-right: 3px;
}
.header-background {
  background: linear-gradient(
    to bottom,
    v-bind(headerGradientFrom),
    v-bind(headerGradientTo)
  );
}

.element-icon {
  margin-right: 4px;
  transform: translateX(-2px);
}
.element-badge {
  font-size: 1.0rem;
  font-weight: bold;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  color: #fff;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0px;
  margin-right: 4px;
  /* 💡 追加：属性バッジ自体もヘッダー上で立体的に際立つようシャドウを付与 */
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.element-badge .text-offset{
  transform: translateY(-1px);
}
.card-category-tag {
  font-size: 0.8rem;
  background-color: #e0e0e0;
  padding: 2px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-right: 4px;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
}

.element-Fire { background-color: #f44336; }
.element-Water { background-color: #2196f3; }
.element-Earth { background-color: #3ee082; }
.element-Air { background-color: #cd48da; }
.element-Holy { background-color: #ffb300; color: #000; }
.element-Curse { background-color: #553a09; }

/* ユニット */
.level-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1.5px solid #212121;
  background-color: #ffffff;
  color: #212121;
  font-size: 1.0rem;
  font-weight: 900;
  flex-shrink: 0;
  margin-right: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.level-circle.is-instant {
  border: 1.5px solid #ffffff;
  background-color: #212121;
  color: #ffffff;
}
.level-circle .text-offset{
  transform: translateY(-0.5px);
}
.hero-zone {
  width: 1.6rem;
  height: 1.6rem;
  height: 100%;
  flex-shrink: 0;
  margin-right: 4px;

}
.hero-overlay-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  flex-shrink: 0;
    text-shadow: 
      -1px -1px 0 #ffffff60,  1px -1px 0 #ffffff60,
      -1px  1px 0 #ffffff60,  1px  1px 0 #ffffff60,
      -1px  0px 0 #ffffff60,  1px  0px 0 #ffffff60,
       0px -1px 0 #ffffff60,  0px  1px 0 #ffffff60,
     0px  1px 2px rgba(0,0,0,0.6);

}
.hero-overlay-number {
  position: absolute;
  font-size: 1.0rem;
  font-weight: 900;
  color: #000;
  text-shadow: 
    -1px -1px 0 #fff,   
     1px -1px 0 #fff,
    -1px  1px 0 #fff,
     1px  1px 0 #fff,
     0px  2px 3px rgba(0,0,0,0.6);
  bottom: 1px;
}

.combat-stats-badge {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  
  width: 3.4rem;
  height: 1.5rem;
  background-color: #ffffff;
  color: #212121;
  border-radius: 4px;
  font-weight: 900;
  font-size: 1.0rem;
  flex-shrink: 0;
  margin-right: 4px;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.stat-separator {
  padding: 0 1px;
  color: #212121;
  text-align: center;
}
.stat-separator.text-offset{
  transform: translateY(-1px);
}
/* --- ATK（左側）の制御 --- */
.stat-unit-value.atk {
  text-align: right;
  padding-right: 2px;
  letter-spacing: 0.025rem; 
}
/* ATKが2桁の時 */
.stat-unit-value.atk.is-two-digits {
  letter-spacing: -0.1rem;
  padding-right: 1px;
}

/* --- DEF（右側）の制御 --- */
.stat-unit-value.def {
  text-align: left;
  padding-left: 2px;
  letter-spacing: 0.025rem;
}
/* DEFが2桁の時 */
.stat-unit-value.def.is-two-digits {
  letter-spacing: -0.1rem;
  padding-left: 0px;
}
.stat-unit-value.text-offset{
  transform: translateY(-1px);
}

.combat-stats {
  font-size: 1.0rem;
  letter-spacing: 0.025rem;
  flex-shrink: 0;
  margin-right: 8px;
  text-align: center;
}

.move-type-badge {
  font-size: 0.8rem;
  padding: 1px 6px;
  background-color: rgba(255, 255, 255, 0.75);
  color: #212121;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  flex-shrink: 0;
}
.move-type-badge .text-offset {
  transform: translateY(-0.5px);
}
/* アイテム */
.item-category-icon {
  margin-right: 4px;
}
.equip-left-spacer {
  width: calc( 6px); 
  flex-shrink: 0;
}
.item-category-badge {
  font-size: 0.8rem;
  padding: 1px 6px;
  background-color: rgba(255, 255, 255, 0.75);
  color: #212121;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  flex-shrink: 0;
}
.item-category-badge .text-offset {
  transform: translateY(-0.5px);
}
/* --- ATK（左側）の制御 --- */
.stat-item-value.atk {
  text-align: right;
  padding-right: 0px;
  letter-spacing: 0.025rem; 
}
/* --- DEF（右側）の制御 --- */
.stat-item-value.def {
  text-align: left;
  padding-left: 1px;
  letter-spacing: 0.025rem;
}
.stat-item-value.text-offset{
  transform: translateY(-1px);
}

/* 地形 */
.limit-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
  background-color: #212121;
  color: #ffffff;
  font-size: 1.0rem;
  font-weight: 900;
  flex-shrink: 0;
  margin-right: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.limit-badge .text-offset{
  transform: translateY(-1px);
}

/* 召喚術師 */
.summoner-badge {
  font-size: 1.0rem;
  font-weight: bold;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  color: #fff;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0px;
  margin-right: 4px;
  background-color: #ffb300; color: #000;
}

.summoner-icon {
  margin-right: 4px;
  transform: translateX(-2px);
}
.arcana-label {
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.01rem;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  height: 1.5rem;

  text-shadow: 
    -1px -1px 0 rgba(0,0,0,0.4),  
     1px -1px 0 rgba(0,0,0,0.4),
    -1px  1px 0 rgba(0,0,0,0.4),
     1px  1px 0 rgba(0,0,0,0.4),
     0px  1px 2px rgba(0, 0, 0, 0.6);
}
</style>