<template>
    <v-app>
      <v-app-bar color="primary" elevation="1">
        <v-app-bar-title>カード検索サイト</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-magnify"></v-btn>
      </v-app-bar>
  
      <v-main class="bg-background">
        <slot />
      </v-main>

      <v-footer name="footer" app class="justify-center text-caption">
        &copy; {{ new Date().getFullYear() }} Card Search Project
      </v-footer>
    </v-app>
  </template>