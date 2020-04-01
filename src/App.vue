<template>
  <router-view />
</template>

<style lang="scss">
.multiselect__tag {
  background: #7957d5 !important;
}

.multiselect__tag-icon:focus,
.multiselect__tag-icon:hover {
  background: #6145af !important;
}

.multiselect__tag-icon::after {
  color: #bca6f8 !important;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
