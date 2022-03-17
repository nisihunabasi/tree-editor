import {Node, Tree} from "../src/models";


test("hoge test", () => {
    expect(1 + 2).toBe(3);
});

test("node test", () => {
    const node1 = new Node("hogehoge", true, true);
    expect(node1.toString()).toBe("hogehoge");
    const node2 = new Node("hugahuga");
    expect(node2.toString()).toBe("├ hugahuga");
    const node3 = new Node("hoga", true);
    node2.addLeaf(node3);
    node1.addLeaf(node2);
    expect(node1.toString()).toBe(`
hogehoge
├ hugahuga
   └ hoga
`);
});

test("null tree", () => {
    const testStr = "";
    const expectStr = "";
    const tr = new Tree(testStr, Tree.TREE_TYPE_SLIM);
    expect(tr.getResult()).toBe(expectStr.trim());
});

test("basic tree", () => {
    const testStr = "hoge\n\thuga";
    const expectStr =`
hoge
└ huga`
;
    const tr = new Tree(testStr, Tree.TREE_TYPE_SLIM);
    expect(tr.getResult()).toBe(expectStr.trim());
});

test("complex tree", () => {
    const testStr = "hoge\n\thoga\n\t\thogahoga\n\thuga\n\t\thugahuga\n\t\thugahu";
    const expectStr = `
hoge
├ hoga
│ └ hogahoga
└ huga
   ├ hugahuga
   └ hugahu
`;
    const tr = new Tree(testStr, Tree.TREE_TYPE_SLIM);
    expect(tr.getResult()).toBe(expectStr.trim());
});


test("super complex tree", () => {
    let testStr = "hoge\n\thoga\n\t\thogahoga\n\t\t\thogahogahoga\n\t\t\t\thoga2\n\t\t\t\thoga3\n\t\t\t\thoga4\n\t\thogahoga2\n\thuga\n\t\thugahuga\n\t\t\thug\n";
    testStr += "\t\thugahu\n\t\t\thugah\n\t\t\t\th\n\thage";
    const expectStr = `
hoge
├ hoga
│ ├ hogahoga
│ │ └ hogahogahoga
│ │    ├ hoga2
│ │    ├ hoga3
│ │    └ hoga4
│ └ hogahoga2
├ huga
│ ├ hugahuga
│ │ └ hug
│ └ hugahu
│    └ hugah
│       └ h
└ hage
`;
    const tr = new Tree(testStr, Tree.TREE_TYPE_SLIM);
    expect(tr.getResult()).toBe(expectStr.trim());
});

test("multi root trees", () => {
    const testStr = "hoge\n\thoga\n\t\thogahoga\n\thuga\n\t\thugahuga\n\t\thugahu\nhoge\n\thoga\n\thogahoga";
    const expectStr = `
hoge
├ hoga
│ └ hogahoga
└ huga
   ├ hugahuga
   └ hugahu
hoge
├ hoga
└ hogahoga
`;
    const tr = new Tree(testStr, Tree.TREE_TYPE_SLIM);
    expect(tr.getResult()).toBe(expectStr.trim());
});