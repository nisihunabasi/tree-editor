/**
 * フォルダツリーのオブジェクト表現。
 * ツリー形式データ構造への変換と、それに対応した文字列表現の吐き出しの責務を持つ。
 * 文法の整合性確認の責務も。
 */
export class Tree {
    constructor(text, treeType = Tree.TREE_TYPE_SLIM) {
        this.inputtedText = text;
        this.setType(treeType);
        this.setText(text);
    }
    setText(text) {
        //4スペもタブとみなす。
        //\sがタブ文字も1文字としてみなしてしまうみたい。スペースだけを捕捉するようにする。
        //ブレーキングスペース、ノンブレーキングスペース
        //全角スペースはbuild時にwebpackが弾いてくるのでしかたなく外すことにする。
        this.inputtedText = text.replace(/^[  ]{4}/mg, "\t");
        this.parseTree();
    }
    setType(type) {
        this.treeType = type;
    }
    /**
     * ツリーにパースする。
     * もし文法エラーがあったらこの時点で指摘する。
     */
    parseTree() {
        let rows = this.inputtedText.split("\n");
        let treeTexts = this.splitChunksOfTree(rows, 0);

        let result = [];
        treeTexts.forEach(treeText => {
            //Root生成
            let root = new Node(treeText[0], false, true);
            treeText.splice(0, 1);
            //root = Node.parseFromTextLines(treeText, root);
            root = this.parseFromLines(treeText, root);
            result.push(root.toString());
        });
        this.treeText = result.join("\n");
    }
    /**
     * ツリーごとに分割する。
     * トップに同レベルのノードが複数あったら、それぞれを一つのルートとしたツリーとみなし、配列のいち要素にして分ける。
     * @param {Array} rows 
     * @param {Number} levelOfRoot ルートとみなすインデントレベル。タブの数を数えてレベルとする。デフォルトは0。
     * @return {Array}
     */
    splitChunksOfTree(rows, levelOfRoot = 0) {
        if (rows.length == 0) {
            return [];
        }
        //タブの数を見て罫線を入れる。
        //TODO 最大長を計測して処理に反映する。コメントを入力できるようにするため。
        let tabNums = rows.map((row) => {
            let matched = row.match(/^\t+/);
            return (matched != null) ? matched[0].length : 0;
        });
        //先頭行が指定したレベルではなかったら例外を吐く。
        if (tabNums[0] != levelOfRoot) {
            throw new Error("エラーが発生しました。テキストの先頭行が、指定したルートのレベルと一致しません。");
        }

        let treeTexts = [];
        //ルートに当たる行の位置を調べ、それを基準にツリーになるブロックに分割する。
        //インデントなしの行をルートとし、それにぶら下がっている行をまとめ、1要素とする。
        while (tabNums.length > 0) {
            let start = tabNums.indexOf(levelOfRoot);
            let end = tabNums.indexOf(levelOfRoot, start + 1);
            if (end == -1) {
                //他のツリールートが見つからなかったら、その時点の配列すべてを一つの塊とみなす。
                treeTexts.push(rows);
                tabNums = [];
            } else {
                let tree = rows.splice(start, end - start);
                tabNums.splice(start, end - start);
                treeTexts.push(tree);
            }
        }

        return treeTexts;
    }
    /**
     * 入力テキストをパースしてNodeを生成する。
     * ルートに当たるテキストと同じレベルのタブが出現したらそこで処理を止めて返す。
     * @param {Array} lines 入力テキストを行ごとに配列化したもの。1行目は必ずルートに当たる行である必要がある。
     * @param {Node} parentNode 親ノード。
     * @return {Node} 生成したNodeを返す。
     */
    parseFromLines(lines, parentNode) {
        //空文字列だった場合はParentNodeをそのまま返す。
        if (lines.length === 0) return parentNode;
        //以降、Nodeを生成した行はlinesから削除する。

        //1行目と同じインデントレベルを持つ行をルートとして、分割する。
        const matched = lines[0].match(/^\t+/);
        const tabCount = (matched != null) ? matched[0].length : 0;
        let chunksOfTree = this.splitChunksOfTree(lines, tabCount);
        chunksOfTree.forEach((chunk, i) => {
            let isYoungest = false;
            if (i + 1 == chunksOfTree.length) {
                isYoungest = true;
            }
            if (chunk.length == 0) {
                //no-op
            } else if (chunk.length == 1) {
                parentNode.addLeaf(new Node(chunk[0], isYoungest));
                //return new Node(chunk[0]);
            } else {
                let childRoot = new Node(chunk[0], isYoungest);
                chunk.splice(0, 1);
                parentNode.addLeaf(this.parseFromLines(chunk, childRoot));
            }
        });

        return parentNode;
        //ひとつ下のインデントレベルの行を、直前のひとつ上のインデントレベルを持つNodeにaddLeafする。
    }
    getResult() {
        return this.treeText;
    }

    static get TREE_TYPE_WINDOWS() {
        return "win";
    }
    static get TREE_TYPE_SLIM() {
        return "slim";
    }
}


export class Node {
    //TODO 罫線定義を外から注入できるようにしないといけない。
    constructor(body, isYoungest = false, isRoot = false) {
        this.leafs = [];
        this.body = body.replace(/^\t+/, "");   //邪魔な文字を削除する。
        this.isYoungest = isYoungest;
        this.isRoot = isRoot
    }
    addLeaf(leaf) {
        this.leafs.push(leaf);
    }
    /**
     * 文字列表現を返す。
     * @param {Node} parent 
     * @returns {String}
     */
    toString(prefix = "") {
        //まず自分を描画
        let result;
        if (this.isRoot) {
            result = this.body;
        } else {
            result = (this.isYoungest) ? prefix + "└ " + this.body : prefix + "├ " + this.body;
        }

        //葉っぱがなければ末尾として返却する。
        if (this.leafs.length === 0) {
            return result;
        }
        //葉っぱがあればそちらも描画
        result += this.leafs.reduce((prev, cur) => {
            //親自身が末尾だったら改行しか加えない。
            let newPrefix;
            if (this.isRoot) {
                newPrefix = "";
            } else if (this.isYoungest) {
                newPrefix = prefix + "   ";
            } else {
                newPrefix = prefix + "│ ";
            }
            return prev + "\n" + cur.toString(newPrefix);
        }, "");

        return result;
    }

}