<template>
  <div>
    <div class="title">title</div>
    <slot :title="title" />
  </div>
</template>

<script>
export default {
  name: "Title",
  props: {},
  data() {
    return {
      date: {}
    };
  }
};
</script>

<style lang="less" scoped>
.title {
  font-size: 30px;
}
</style>
