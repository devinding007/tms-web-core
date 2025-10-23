import { defineStore } from 'pinia';

const KEY = 'ui.pref';

export const useUiStore = defineStore('ui', {
  state: () => ({
    pinned: false, // true=固定（常時展開） / false=rail+hover
    drawerOpen: true, // ドロワー開閉
  }),
  actions: {
    load() {
      try {
        const s = localStorage.getItem(KEY);
        if (s) {
          const { pinned, drawerOpen } = JSON.parse(s);
          this.pinned = !!pinned;
          this.drawerOpen = drawerOpen ?? true;
        }
      } catch {}
    },
    save() {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ pinned: this.pinned, drawerOpen: this.drawerOpen })
        );
      } catch {}
    },
    togglePin() {
      this.pinned = !this.pinned;
      if (this.pinned) this.drawerOpen = true; // 固定時は開いておく
      this.save();
    },
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
      this.save();
    },
    setDrawer(v: boolean) {
      this.drawerOpen = v;
      this.save();
    },
  },
});
