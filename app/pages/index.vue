<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">仮ページ</h1>
          テストです！
        </v-col>
      </v-row>
  
      <v-row class="mt-8">
        <v-col v-for="n in 3" :key="n" cols="12" sm="4">
          <v-skeleton-loader type="card"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup lang="ts">
  // ここに検索ロジックを書いていきます
  </script>