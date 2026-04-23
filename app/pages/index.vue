<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card variant="flat" class="pa-4">
            <h2 class="text-h5 mb-4" :style="{ color: '#333333' }">
              デザイン反映チェック
            </h2>
            
            <v-row>
              <v-col cols="auto">
                <v-btn color="primary">Primary Color (#7EBA03)</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn color="accent">Accent Color (#009DA5)</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-chip color="primary-light" variant="flat">Primary Light</v-chip>
              </v-col>
            </v-row>
  
            <v-divider class="my-6"></v-divider>
  
            <p class="text-body-1">
              フォントが <strong>Noto Sans JP</strong> になっていますか？<br>
              このエリアがヘッダーとフッターに挟まれていれば、Layout と Page の紐付けは成功です。
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>