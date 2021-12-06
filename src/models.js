export default class Tree {
    constructor(text, treeType = Tree.TREE_TYPE_SLIM) {
        this.inputtedText = text;
        this.setType(treeType);
        this.setText(text);
    }
    setText(text) {
        this.inputtedText = text;
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
        //タブの数を見て罫線を入れる。
        //TODO 最大長を計測して処理に反映する。
        let tabNums = rows.map((row) => {
            let matched = row.match(/^\t+/);
            return (matched != null) ? matched[0].length : 0;
        });
        let treeTexts = [];
        while (tabNums.length > 0) {
            let start = tabNums.indexOf(0);
            let end = tabNums.indexOf(0, start + 1);
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

        let result = [];
        treeTexts.forEach(treeText => {
            let root = Node.parseFromTextLines(treeText, null);
            result.push(root.toString());
        });
        this.treeText = result.join("\n");
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


class Node {
    //TODO 罫線定義を外から注入できるようにしないといけない。
    constructor(body, isYoungest = false, isRoot = false) {
        this.leafs = [];
        this.body = body;
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

    /**
     * 入力テキストをパースしてNodeを生成する。
     * ルートに当たるテキストと同じレベルのタブが出現したらそこで処理を止めて返す。
     * @param {Array} lines 入力テキストを行ごとに配列化したもの。
     * @param {Node} parentNode 親ノード
     * @return {Node} 生成したNodeを返す。
     */
    static parseFromTextLines(lines, parentNode) {
        if (lines.length === 0) return null, [];
        let matched = lines[0].match(/^\t+/);
        let tabNum = (matched != null) ? matched[0].length : 0;
        let node = new Node(lines[0].replace(/^\t+/, ""), false);
        if (parentNode == null) {
            node.isRoot = true;
        }
        //次の要素が無い、もしくは同じ、または上のレベルだったらここで処理ストップする。
        if (lines[1] != undefined) {
            let i = 1;
            while (i < lines.length) {
                let m = lines[i].match(/^\t+/);
                let tnum = (m != null) ? m[0].length : 0;
                //自分と同じレベルだったらnodeを返して終わる。
                if (tabNum === tnum) {
                    return node;
                } else if (tnum - tabNum === 1) {
                    //自分よりひとつ下のレベルだったらaddLeafするためにここでNodeを生成する。
                    node.addLeaf(Node.parseFromTextLines(lines.slice(i), node));
                } else if (tabNum < tnum) {
                    //自分より2つ以上下だったら何もしないで次のテキストへ。
                    i++;
                    continue;
                } else {
                    //自分より上のレベルだったらここがこのレベルの末尾として返す。
                    node.isYoungest = true;
                    return node;
                }
                i++
            }

            //多分ここに到達したらこのレベルの末尾だと思う。。。
            node.isYoungest = true;
            return node;
        } else {
            node.isYoungest = true;
            return node;
        }
    }
}