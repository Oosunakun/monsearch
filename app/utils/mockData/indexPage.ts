export const mockExpansionHeaders = [
  { title: 'セットコード', key: 'setCode', sortable: false },
  { title: 'タイトル', key: 'title', sortable: false },
  { title: 'ブロック', key: 'block', sortable: false },
  { title: '備考', key: 'note', sortable: false },
  { title: '発売日', key: 'releaseDate', sortable: false }
]

export const mockExpansionSources = [
  {
    sectionTitle: '第六極神紀ブロック',
    rows: [
      { id: '6d', setCode: '6D', title: '悠久のハルシオン', block: '第六極神紀', note: '最終セット', releaseDate: '2014-03-14' },
      { id: '6c', setCode: '6C', title: 'アゾールの黒い旋風', block: '第六極神紀', note: '再録強化', releaseDate: '2013-11-22' },
      { id: '6b', setCode: '6B', title: '紅河の戦慄', block: '第六極神紀', note: '英雄点導入', releaseDate: '2013-07-19' }
    ]
  },
  {
    sectionTitle: '第五聖竜帝国ブロック',
    rows: [
      { id: '5d', setCode: '5D', title: '魔海神の魔壺', block: '第五聖竜帝国', note: '大型環境', releaseDate: '2012-12-14' },
      { id: '5c', setCode: '5C', title: '剣姫', block: '第五聖竜帝国', note: '構築人気', releaseDate: '2012-09-28' }
    ]
  },
  {
    sectionTitle: '第四風神雷神ブロック',
    rows: [
      { id: '4d', setCode: '4D', title: '天空の覇者', block: '第四風神雷神', note: '属性推し', releaseDate: '2011-12-09' },
      { id: '4c', setCode: '4C', title: '神霊獣の咆哮', block: '第四風神雷神', note: '耐性環境', releaseDate: '2011-08-26' },
      { id: '4b', setCode: '4B', title: '雷鳴の舞姫', block: '第四風神雷神', note: '先攻重視', releaseDate: '2011-05-13' }
    ]
  }
]
