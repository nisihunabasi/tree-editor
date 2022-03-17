<template>
  <div class="app md:container mx-auto px-4">
    <div class="mx-auto lg:w-9/12">
      <h1 class="text-center text-3xl my-12">
        <!-- なんかアイコンを足したい。。。 -->
        Tree Editor
      </h1>
      <p class="my-6">
        テキストベースのフォルダツリーをイチから簡単に書けるエディタです。<br />
        タブ文字でインデントしたテキストを、ツリー文字列に変換します。（以下の入力フォームにはタブが打ち込めるようになっています。）
      </p>
      <div class="my-6 text-center relative flex flex-col md:flex-row max-w-4xl mx-auto text-center">
        <textarea
          class="p-4 ring-1 ring-gray-400 focus:ring-2 focus:ring-gray-800 focus:outline-none flex-1 h-80"
          @keydown="onPressIfTabkey"
          @input="onInputText"
          :value="refInput"
          placeholder="Please input your tree."
        ></textarea>
        <span class="arrow">
          <font-awesome-icon icon="chevron-right" />
        </span>
        <span class="sp-arrow">
          <font-awesome-icon icon="chevron-down" />
        </span>
        <div class="result-box">
          <pre>{{ refResult }}</pre>
          <button
            class="
              absolute border-b-2 border-l-2
              text-sm px-2 py-1 top-0 right-0 bg-indigo-900 text-white
              rounded-bl
            "
            type="button"
            @click="onClickCopyBtn"
          >
            Copy
          </button>
          <div class="copied-message" :class="refAnimateState">Copied!!</div>
        </div>
      </div>
      <div class="my-6">
        <h2 class="mt-6 mb-5 text-xl">テンプレート挿入</h2>
        <button class="btn-default" @click="onClickTmplBtn('foobar')">foo-bar</button>&nbsp;
        <button class="btn-default" @click="onClickTmplBtn('html')">HTML Project</button>&nbsp;
        <button class="btn-default" @click="onClickTmplBtn('vue')">Vue.js Project</button>&nbsp;
      </div>
      <div class="my-6 py-6 px-2 border-t border-gray-400">
        Repo: <a href="https://github.com/nisihunabasi/tree-editor" target="_blank" class="text-blue-500 underline">https://github.com/nisihunabasi/tree-editor</a><br>
        Author: <a href="https://twitter.com/nisihunabasi" target="_blank" class="text-blue-500 underline">@nisihunabasi</a>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import {Tree} from "./models";

export default {
  name: "App",
  components: {
    FontAwesomeIcon,
  },
  props: {},
  setup() {
    const refInput = ref(""); //Please input your tree.
    const refResult = ref("Result here.");
    const refAnimateState = ref("");

    const tree = new Tree("aaa", Tree.TREE_TYPE_SLIM);
    const onInputText = (e) => {
      refInput.value = e.target.value;
      tree.setText(refInput.value);
      refResult.value = tree.getResult();
    };

    const onPressIfTabkey = (e) => {
      if (e.keyCode != 9) return;
      e.preventDefault();
      //現在のカーソルの位置を基準にタブ文字を挿入する。
      let curPos = e.target.selectionStart;
      let curLeftStr = e.target.value.substr(0, curPos);
      let curRightStr = e.target.value.substr(curPos, e.target.value.length);

      e.target.value = curLeftStr + "\t" + curRightStr; //タブ挿入
      e.target.selectionEnd = curPos + 1;
      //無理やりイベントハンドラを実行して、結果を反映させる。
      onInputText(e);
    };

    const onClickTmplBtn = (type) => {
      //それらしいなんちゃってイベントオブジェクトを作ってInputイベントを走らせる。
      let e = {target: {}};
      if (type == "html") {
        e.target.value = `css/
	main.css
	normalize.css
img/
js/
	vendor/
	main.js
	plugins.js
favicon.ico
index.html
robots.txt
`;
      } else if (type == "vue") {
        e.target.value = `node_modules/
public/
	favicon.ico
	index.html
src/
	assets/
	components/
	App.vue
	main.js
babel.config.js
package.json
vue.config.js
`;
      } else if (type == "foobar") {
        e.target.value = `foo
	bar
		baz`;
      } else {
        e.target.value = " ";
      }

      onInputText(e);
    }
    const onClickCopyBtn = () => {
      //クリップボードにコピーする。
      navigator.clipboard.writeText(refResult.value)
        .then(() => {
          if (refAnimateState.value == "animate-fade-in") {
            return;
          }
          //コピー完了吹き出しを表示し、しばらくたったら消すように設定。
          refAnimateState.value = "animate-fade-in";
          setTimeout(() => {
            refAnimateState.value = "animate-fade-out";
          }, 4000);
        });
    };

    //expose to view
    return {
      onInputText,
      refResult,
      refInput,
      refAnimateState,
      onPressIfTabkey,
      onClickTmplBtn,
      onClickCopyBtn,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
.arrow {
  @apply m-auto px-8 hidden md:inline-block flex-initial items-center;
}
.sp-arrow {
  @apply my-8 text-center block md:hidden flex-initial;
}
.result-box {
  @apply p-4 ring-1 ring-gray-200 bg-gray-100 inline-block align-top text-left relative overflow-y-scroll flex-1 h-80;
}
.btn-default {
  @apply bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center focus:outline-none focus:ring-2 focus:ring-gray-900 my-2;
}
.copied-message {
  @apply absolute text-sm top-9 right-0 bg-black text-white px-2 py-1 rounded opacity-0;
}
.copied-message:before {
  content: "";
  position: absolute;
  top: -2.2rem;
  right: 0;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  margin: auto;
  border-style: solid;
  border-color: transparent transparent #000 transparent;
  border-width: 0 8px 8px 8px;
}
.animate-fade-in {
  animation: fadeIn 0.2s forwards;
  animation-iteration-count: 1;
}
.animate-fade-out {
  animation: fadeOut 0.2s forwards;
  animation-iteration-count: 1;
}

@keyframes fadeIn {
  0% {opacity: 0;}
  100% {opacity: 1;}
}
@keyframes fadeOut {
  0% {opacity: 1;}
  100% {opacity: 0;}
}
</style>
