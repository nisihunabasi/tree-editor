<template>
  <div class="app lg:container mx-auto px-8">
    <h1 class="text-center text-3xl my-12">
      <!-- なんかアイコンを足したい。。。 -->
      Tree Editor
    </h1>
    <p class="my-6 mx-4">テキストベースのフォルダツリーをイチから簡単に書けるエディタです。</p>
    <div class="my-6 text-center">
      <textarea cols="30" rows="10" class="p-4 ring-1 ring-gray-400 focus:ring-2 focus:ring-gray-800 focus:outline-none" @keydown="onPressIfTabkey" @input="onInputText"></textarea>
      <span class="align-middle">=></span>
      <textarea cols="30" rows="10" disabled :value="result"></textarea>
    </div>
  </div>
  <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
</template>

<script>
import { ref } from "vue";
import Tree from "./models.js";

export default {
  name: 'App',
  components: {
  },
  props: {
  },
  setup() {
    const result = ref("hogehoge");
    //TODO デフォルト値入れる。
    //const inputtedText = ref("");

    const tree = new Tree("aaa", Tree.TREE_TYPE_WINDOWS);
    const onInputText = (val) => {
      tree.setText(val.target.value);
      result.value = tree.getResult();
    };

    const onPressIfTabkey = (e) => {
      if (e.keyCode != 9) return;
      e.preventDefault();
      console.log(e.target.selectionStart);
      let curPos = e.target.selectionStart;
      let curLeftStr = e.target.value.substr(0, curPos);
      let curRightStr = e.target.value.substr(curPos, e.target.value.length);

      e.target.value = curLeftStr + "\t" + curRightStr;
      //inputtedText.value = curLeftStr + "\t" + curRightStr;
      e.target.selectionEnd = curPos + 1;
      //無理やりイベントハンドラを実行して、結果を反映させる。
      onInputText(e);
    };

    //expose to view
    return {
      onInputText,
      result,
      onPressIfTabkey,
    };
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  margin-top: 60px;
}
</style>
